using System.Globalization;
using System.Text.RegularExpressions;
using OmpRfidDashboard.Models;

namespace OmpRfidDashboard.Services;

/// <summary>One API record. Values that are not strings in the response are null.</summary>
public sealed record ApiBayItem(
    string? LocationBays,
    string? UnitNumber,
    string? AssignedMechanics,
    string? PlanStartTime,
    string? EstimadeRfu);

public abstract record BayMappingIssue
{
    public sealed record Unrecognized : BayMappingIssue;

    public sealed record Duplicate(string BayKey, IReadOnlyList<string?> UnitNumbers) : BayMappingIssue;
}

public sealed record BayMappingResult(IReadOnlyList<BayData> Bays, IReadOnlyList<BayMappingIssue> Issues);

/// <summary>
/// Pure mapping from API records to the fixed set of 8 bay cards
/// (DALAM 01/02/07/08, LUAR 01/02/07/08). No I/O, so it is easy to test.
/// </summary>
public static class BayMapper
{
    private static readonly string[] BayNumbers = ["01", "02", "07", "08"];
    private static readonly BaySection[] Sections = [BaySection.Dalam, BaySection.Luar];

    private static readonly Regex DigitsRegex = new(@"\d+", RegexOptions.Compiled);
    private static readonly Regex LocationRegex = new(@"\b(DALAM|LUAR)\b", RegexOptions.Compiled);

    private static string SectionKey(BaySection s) => s == BaySection.Dalam ? "dalam" : "luar";

    private static List<BayData> CreateDefaultBays()
    {
        var bays = new List<BayData>();
        foreach (var section in Sections)
        {
            foreach (var num in BayNumbers)
            {
                bays.Add(new BayData
                {
                    Id = $"{SectionKey(section)}-bay-{num}",
                    BayNumber = $"BAY {num}",
                    Section = section,
                });
            }
        }

        return bays;
    }

    /// <summary>
    /// Parses "BAY 01 DALAM" / "BAYS 2 LUAR" into a card id such as "dalam-bay-01".
    /// Both the bay number and the location must be present, recognised and
    /// unambiguous; otherwise returns null so a record never lands on a wrong card.
    /// </summary>
    public static string? ParseLocationBays(string? raw)
    {
        if (raw is null)
        {
            return null;
        }

        var numbers = DigitsRegex.Matches(raw);
        var locations = LocationRegex.Matches(raw.ToUpperInvariant());
        if (numbers.Count != 1 || locations.Count != 1)
        {
            return null;
        }

        var num = numbers[0].Value.PadLeft(2, '0');
        if (!BayNumbers.Contains(num))
        {
            return null;
        }

        return $"{locations[0].Value.ToLowerInvariant()}-bay-{num}";
    }

    private static BayData ApplyApiItem(BayData defaultBay, ApiBayItem api, DateTime now)
    {
        // "HH:MM:SS" -> "HH:MM"
        var startService = "--:--";
        if (!string.IsNullOrEmpty(api.PlanStartTime))
        {
            var parts = api.PlanStartTime.Split(':');
            if (parts.Length >= 2)
            {
                startService = $"{parts[0].PadLeft(2, '0')}:{parts[1].PadLeft(2, '0')}";
            }
        }

        // estimade_rfu "YYYY-MM-DD HH:mm:ss" (server local time)
        var targetFinish = "--:--";
        var targetFinishDate = string.IsNullOrEmpty(api.EstimadeRfu) ? null : api.EstimadeRfu;
        var estimade = now;

        if (!string.IsNullOrEmpty(api.EstimadeRfu)
            && DateTime.TryParse(
                api.EstimadeRfu.Replace(' ', 'T'),
                CultureInfo.InvariantCulture,
                DateTimeStyles.AssumeLocal,
                out var parsed))
        {
            estimade = parsed;
            targetFinish = parsed.ToString("HH:mm", CultureInfo.InvariantCulture);
            targetFinishDate = parsed.ToUniversalTime()
                .ToString("yyyy-MM-dd'T'HH:mm:ss.fff'Z'", CultureInfo.InvariantCulture);
        }
        // Unparseable value: the raw string is kept as the date, status falls back to
        // IN_SERVICE and the countdown shows --:--:--.

        return defaultBay with
        {
            EquipmentId = api.UnitNumber,
            EquipmentVisualUrl = "/images/komatsu-hd785-front.png",
            Status = now > estimade ? ServiceStatus.Overdue : ServiceStatus.InService,
            Mechanic = api.AssignedMechanics,
            StartService = startService,
            TargetFinish = targetFinish,
            TargetFinishDate = targetFinishDate,
        };
    }

    /// <summary>
    /// Maps API records onto exactly 8 cards.
    /// - Unrecognised records are skipped and reported as Unrecognized.
    /// - If several records target the same card, none is chosen: the card stays
    ///   empty and a Duplicate issue is reported.
    /// - Cards without a record keep their empty default.
    /// </summary>
    public static BayMappingResult Map(IEnumerable<ApiBayItem> items, DateTime now)
    {
        var defaults = CreateDefaultBays();
        var issues = new List<BayMappingIssue>();
        var grouped = new Dictionary<string, List<ApiBayItem>>();

        foreach (var item in items)
        {
            var key = ParseLocationBays(item.LocationBays);
            if (key is null)
            {
                issues.Add(new BayMappingIssue.Unrecognized());
                continue;
            }

            if (!grouped.TryGetValue(key, out var list))
            {
                grouped[key] = list = [];
            }

            list.Add(item);
        }

        var bays = new List<BayData>(defaults.Count);
        foreach (var defaultBay in defaults)
        {
            if (!grouped.TryGetValue(defaultBay.Id, out var matches))
            {
                bays.Add(defaultBay);
                continue;
            }

            if (matches.Count > 1)
            {
                issues.Add(new BayMappingIssue.Duplicate(
                    defaultBay.Id, matches.Select(m => m.UnitNumber).ToList()));
                bays.Add(defaultBay);
                continue;
            }

            bays.Add(ApplyApiItem(defaultBay, matches[0], now));
        }

        return new BayMappingResult(bays, issues);
    }
}
