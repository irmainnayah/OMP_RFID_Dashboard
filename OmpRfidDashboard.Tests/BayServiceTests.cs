using System.Net;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using OmpRfidDashboard.Data;
using OmpRfidDashboard.Models;
using OmpRfidDashboard.Services;

namespace OmpRfidDashboard.Tests;

/// <summary>Service tests use a fake handler: no real network request is ever made.</summary>
public class BayServiceTests
{
    private sealed class FakeHandler(Func<HttpRequestMessage, HttpResponseMessage> respond) : HttpMessageHandler
    {
        public HttpRequestMessage? LastRequest { get; private set; }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
        {
            LastRequest = request;
            return Task.FromResult(respond(request));
        }
    }

    private static HttpResponseMessage Json(string body, HttpStatusCode code = HttpStatusCode.OK) =>
        new(code) { Content = new StringContent(body) };

    private static (BayService Service, FakeHandler Handler) Create(Func<HttpRequestMessage, HttpResponseMessage> respond)
    {
        var handler = new FakeHandler(respond);
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["BayApi:Url"] = "http://fake.invalid/api",
                ["API_KEY"] = "test-key",
            })
            .Build();

        return (new BayService(new HttpClient(handler), config, NullLogger<BayService>.Instance), handler);
    }

    [Fact]
    public async Task ValidResponse_IsMapped_AndApiKeyHeaderIsSent()
    {
        var (service, handler) = Create(_ => Json("""
            {"success":true,"data":[
              {"location_bays":"BAY 01 LUAR","unit_number":"L01","assigned_mechanics":"M","plan_start_time":"07:30:00","estimade_rfu":"2099-01-01 13:30:00"}
            ]}
            """));

        var bays = await service.GetBaysAsync();

        Assert.Equal(8, bays.Count);
        Assert.Equal("L01", bays.Single(b => b.Id == "luar-bay-01").EquipmentId);
        Assert.Equal(7, bays.Count(b => b.Status is null));
        Assert.Equal("test-key", handler.LastRequest!.Headers.GetValues("x-api-key").Single());
    }

    [Theory]
    [InlineData("""{"success":false,"data":[]}""")]
    [InlineData("""{"success":true}""")]
    [InlineData("""{"success":true,"data":{}}""")]
    [InlineData("""[]""")]
    [InlineData("not json")]
    public async Task InvalidResponse_FallsBackToDummy(string body)
    {
        var (service, _) = Create(_ => Json(body));

        Assert.Same(DummyBays.All, await service.GetBaysAsync());
    }

    [Fact]
    public async Task HttpError_FallsBackToDummy()
    {
        var (service, _) = Create(_ => Json("{}", HttpStatusCode.InternalServerError));

        Assert.Same(DummyBays.All, await service.GetBaysAsync());
    }

    [Fact]
    public async Task Exception_FallsBackToDummy()
    {
        var (service, _) = Create(_ => throw new HttpRequestException("boom"));

        Assert.Same(DummyBays.All, await service.GetBaysAsync());
    }

    [Fact]
    public async Task NonStringFields_AreTreatedAsUnrecognized_NotACrash()
    {
        var (service, _) = Create(_ => Json("""{"success":true,"data":[{"location_bays":5,"unit_number":7}, null]}"""));

        var bays = await service.GetBaysAsync();

        Assert.Equal(8, bays.Count);
        Assert.All(bays, b => Assert.Null(b.Status));
    }
}

public class SummaryAndViewModelTests
{
    [Fact]
    public void Summary_CountsStatuses_AndAverages()
    {
        var summary = BaySummaryCalculator.Calculate(DummyBays.All.ToList());

        Assert.Equal(8, summary.TotalBays);
        Assert.Equal(3, summary.InServiceCount);
        Assert.Equal(0, summary.OverdueCount);
        Assert.Equal(5, summary.EmptyCount);
        Assert.Equal(360, summary.AvgLeadTimeMinutes);
        // remaining: 135, 0 (clamped), 280 -> avg 138.33 -> 138
        Assert.Equal(138, summary.AvgRemainingTimeMinutes);
    }

    [Fact]
    public void Summary_OfEmptyList_IsZero()
    {
        var summary = BaySummaryCalculator.Calculate([]);

        Assert.Equal(0, summary.TotalBays);
        Assert.Equal(0, summary.AvgLeadTimeMinutes);
        Assert.Equal(0, summary.AvgRemainingTimeMinutes);
    }

    [Fact]
    public void ViewModel_SplitsFourIndoorAndFourOutdoor()
    {
        var vm = DashboardViewModel.Create(DummyBays.All, BaySummaryCalculator.Calculate(DummyBays.All.ToList()));

        Assert.Equal(4, vm.IndoorBays.Count);
        Assert.Equal(4, vm.OutdoorBays.Count);
        Assert.All(vm.IndoorBays, b => Assert.Equal(BaySection.Dalam, b.Section));
        Assert.All(vm.OutdoorBays, b => Assert.Equal(BaySection.Luar, b.Section));
    }
}
