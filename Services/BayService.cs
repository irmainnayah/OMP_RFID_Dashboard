using System.Text.Json;
using OmpRfidDashboard.Data;
using OmpRfidDashboard.Models;

namespace OmpRfidDashboard.Services;

public interface IBayService
{
    Task<IReadOnlyList<BayData>> GetBaysAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Fetches bay data from the upstream API and maps it to the 8 bay cards.
/// Falls back to <see cref="DummyBays"/> when the request fails or the response is invalid.
/// </summary>
public sealed class BayService(
    HttpClient http,
    IConfiguration configuration,
    ILogger<BayService> logger) : IBayService
{
    public async Task<IReadOnlyList<BayData>> GetBaysAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, configuration["BayApi:Url"]);

            // Read from the API_KEY environment variable / configuration. Never logged.
            request.Headers.TryAddWithoutValidation("x-api-key", configuration["API_KEY"] ?? string.Empty);

            using var response = await http.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogError("Failed to fetch bay data: {Status}", response.ReasonPhrase);
                return DummyBays.All;
            }

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);

            var root = doc.RootElement;
            if (root.ValueKind != JsonValueKind.Object
                || !root.TryGetProperty("success", out var success) || !IsTruthy(success)
                || !root.TryGetProperty("data", out var data) || data.ValueKind != JsonValueKind.Array)
            {
                return DummyBays.All;
            }

            var items = data.EnumerateArray().Select(ToApiItem).ToList();
            var result = BayMapper.Map(items, DateTime.Now);

            if (result.Issues.Count > 0)
            {
                var unrecognized = result.Issues.OfType<BayMappingIssue.Unrecognized>().Count();
                var duplicate = result.Issues.OfType<BayMappingIssue.Duplicate>().Count();
                logger.LogWarning(
                    "Bay mapping issues: {Unrecognized} unrecognized, {Duplicate} duplicate",
                    unrecognized,
                    duplicate);
            }

            return result.Bays;
        }
        catch (Exception ex)
        {
            // Log only the exception type: messages may contain host details.
            logger.LogError("Error fetching bay data: {ExceptionType}", ex.GetType().Name);
            return DummyBays.All;
        }
    }

    private static ApiBayItem ToApiItem(JsonElement e) => new(
        Str(e, "location_bays"),
        Str(e, "unit_number"),
        Str(e, "assigned_mechanics"),
        Str(e, "plan_start_time"),
        Str(e, "estimade_rfu"));

    private static string? Str(JsonElement e, string name) =>
        e.ValueKind == JsonValueKind.Object
        && e.TryGetProperty(name, out var p)
        && p.ValueKind == JsonValueKind.String
            ? p.GetString()
            : null;

    // Mirrors JavaScript truthiness for the "success" flag.
    private static bool IsTruthy(JsonElement e) => e.ValueKind switch
    {
        JsonValueKind.True => true,
        JsonValueKind.Number => e.TryGetDouble(out var d) && d != 0,
        JsonValueKind.String => !string.IsNullOrEmpty(e.GetString()),
        JsonValueKind.Object or JsonValueKind.Array => true,
        _ => false,
    };
}
