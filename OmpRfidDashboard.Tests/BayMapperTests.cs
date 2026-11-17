using OmpRfidDashboard.Models;
using OmpRfidDashboard.Services;

namespace OmpRfidDashboard.Tests;

public class BayMapperTests
{
    private static readonly DateTime Now = new(2026, 1, 1, 10, 0, 0, DateTimeKind.Local);

    private static ApiBayItem Mk(string? loc, string unit, string? estimade = "2026-01-01 13:30:00") =>
        new(loc, unit, $"Mek {unit}", "07:30:00", estimade);

    private static readonly ApiBayItem[] All =
    [
        Mk("BAY 01 DALAM", "D01"), Mk("BAY 02 DALAM", "D02"), Mk("BAY 07 DALAM", "D07"), Mk("BAY 08 DALAM", "D08"),
        Mk("BAY 01 LUAR", "L01"), Mk("BAY 02 LUAR", "L02"), Mk("BAY 07 LUAR", "L07"), Mk("BAY 08 LUAR", "L08"),
    ];

    private static BayData ById(IEnumerable<BayData> bays, string id) => bays.Single(b => b.Id == id);

    [Fact]
    public void FourDalamAndFourLuar_ProduceEightCardsWithCorrectLocation()
    {
        var result = BayMapper.Map(All, Now);

        Assert.Equal(8, result.Bays.Count);
        Assert.Empty(result.Issues);
        foreach (var b in result.Bays)
        {
            var prefix = b.Section == BaySection.Dalam ? "D" : "L";
            Assert.Equal($"{prefix}{b.BayNumber[4..]}", b.EquipmentId);
        }
    }

    [Fact]
    public void SameNumberOnDifferentLocations_IsNotSwapped()
    {
        var bays = BayMapper.Map([Mk("BAY 01 LUAR", "L01"), Mk("BAY 01 DALAM", "D01")], Now).Bays;

        Assert.Equal("D01", ById(bays, "dalam-bay-01").EquipmentId);
        Assert.Equal("L01", ById(bays, "luar-bay-01").EquipmentId);
    }

    [Fact]
    public void RecordOrder_DoesNotMatter()
    {
        var a = BayMapper.Map(All, Now).Bays;
        var b = BayMapper.Map(All.Reverse(), Now).Bays;

        Assert.Equal(a, b);
    }

    [Fact]
    public void BayWithoutData_StaysEmpty_AndFieldsAreMapped()
    {
        var bays = BayMapper.Map([Mk("BAY 02 LUAR", "L02")], Now).Bays;

        Assert.Equal(8, bays.Count);
        Assert.Equal(7, bays.Count(b => b.Status is null));

        var b = ById(bays, "luar-bay-02");
        Assert.Equal(ServiceStatus.InService, b.Status);
        Assert.Equal("Mek L02", b.Mechanic);
        Assert.Equal("07:30", b.StartService);
        Assert.Equal("13:30", b.TargetFinish);
        Assert.Equal(
            new DateTime(2026, 1, 1, 13, 30, 0, DateTimeKind.Local).ToUniversalTime()
                .ToString("yyyy-MM-dd'T'HH:mm:ss.fff'Z'"),
            b.TargetFinishDate);
    }

    [Fact]
    public void PastEstimade_IsOverdue()
    {
        var bays = BayMapper.Map([Mk("BAY 01 DALAM", "D01", "2026-01-01 08:00:00")], Now).Bays;

        Assert.Equal(ServiceStatus.Overdue, ById(bays, "dalam-bay-01").Status);
    }

    [Fact]
    public void MissingOrInvalidEstimade_IsInService_WithPlaceholderFinish()
    {
        var bays = BayMapper.Map(
            [Mk("BAY 01 DALAM", "D01", null), Mk("BAY 02 DALAM", "D02", "not a date")], Now).Bays;

        var missing = ById(bays, "dalam-bay-01");
        Assert.Equal(ServiceStatus.InService, missing.Status);
        Assert.Equal("--:--", missing.TargetFinish);
        Assert.Null(missing.TargetFinishDate);

        var invalid = ById(bays, "dalam-bay-02");
        Assert.Equal(ServiceStatus.InService, invalid.Status);
        Assert.Equal("--:--", invalid.TargetFinish);
        Assert.Equal("not a date", invalid.TargetFinishDate);
    }

    [Fact]
    public void UnknownNumberOrLocation_IsSkippedAndReported()
    {
        ApiBayItem[] bad =
        [
            Mk("BAY 03 DALAM", "X1"), Mk("BAY 01", "X2"), Mk("BAY DALAM", "X3"),
            Mk("BAY 01 TENGAH", "X4"), Mk("BAY 01 DALAM LUAR", "X5"), Mk("", "X6"),
            Mk(null, "X7"),
        ];

        var result = BayMapper.Map(bad, Now);

        Assert.Equal(8, result.Bays.Count);
        Assert.All(result.Bays, b => Assert.Null(b.Status));
        Assert.Equal(7, result.Issues.Count);
        Assert.All(result.Issues, i => Assert.IsType<BayMappingIssue.Unrecognized>(i));
    }

    [Fact]
    public void Duplicates_AreNotPickedSilently()
    {
        var result = BayMapper.Map(
            [Mk("BAY 07 LUAR", "A"), Mk("BAY 07 LUAR", "B"), Mk("BAY 07 DALAM", "C")], Now);

        Assert.Equal(8, result.Bays.Count);
        Assert.Null(ById(result.Bays, "luar-bay-07").Status);
        Assert.Equal("C", ById(result.Bays, "dalam-bay-07").EquipmentId);

        var issue = Assert.IsType<BayMappingIssue.Duplicate>(Assert.Single(result.Issues));
        Assert.Equal("luar-bay-07", issue.BayKey);
        Assert.Equal(["A", "B"], issue.UnitNumbers);
    }

    [Theory]
    [InlineData("bays 2 dalam", "dalam-bay-02")]
    [InlineData("BAY 08 LUAR", "luar-bay-08")]
    [InlineData(null, null)]
    [InlineData("BAY 01 DALAM 2", null)]
    public void ParseLocationBays_Variants(string? raw, string? expected) =>
        Assert.Equal(expected, BayMapper.ParseLocationBays(raw));
}
