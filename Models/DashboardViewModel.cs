namespace OmpRfidDashboard.Models;

public sealed class DashboardViewModel
{
    public required IReadOnlyList<BayData> IndoorBays { get; init; }
    public required IReadOnlyList<BayData> OutdoorBays { get; init; }
    public required BaySummary Summary { get; init; }

    /// <summary>
    /// Splits the bays into the two display rows (4 DALAM + 4 LUAR).
    /// Mirrors the original BayGrid fallback: if a section does not have exactly
    /// four bays, the first four / next four bays are used.
    /// </summary>
    public static DashboardViewModel Create(IReadOnlyList<BayData> bays, BaySummary summary)
    {
        var indoor = bays
            .Where(b => b.Section is BaySection.Dalam or null)
            .Take(4)
            .ToList();
        var outdoor = bays
            .Where(b => b.Section == BaySection.Luar)
            .Take(4)
            .ToList();

        return new DashboardViewModel
        {
            IndoorBays = indoor.Count == 4 ? indoor : bays.Take(4).ToList(),
            OutdoorBays = outdoor.Count == 4 ? outdoor : bays.Skip(4).Take(4).ToList(),
            Summary = summary,
        };
    }
}
