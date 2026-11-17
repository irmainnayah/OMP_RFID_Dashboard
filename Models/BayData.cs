namespace OmpRfidDashboard.Models;

public enum ServiceStatus
{
    InService,
    Overdue,
}

public enum BaySection
{
    Dalam,
    Luar,
}

public sealed record ServiceTiming(
    string Elapsed,
    string Target,
    int ElapsedMinutes,
    int TargetMinutes,
    bool IsOverdue);

/// <summary>
/// One bay card. Status == null means the bay is empty (no active service).
/// </summary>
public sealed record BayData
{
    public required string Id { get; init; }

    /// <summary>"BAY 01", "BAY 02", "BAY 07" or "BAY 08".</summary>
    public required string BayNumber { get; init; }

    public BaySection? Section { get; init; }

    public string? EquipmentId { get; init; }
    public string? EquipmentModel { get; init; }
    public string? EquipmentVisualUrl { get; init; }

    public ServiceStatus? Status { get; init; }

    public int? ProgressPercent { get; init; }
    public ServiceTiming? Timing { get; init; }

    public string? Mechanic { get; init; }
    public string? StartService { get; init; }

    /// <summary>Display string "HH:mm".</summary>
    public string? TargetFinish { get; init; }

    /// <summary>ISO date string used for the accurate countdown.</summary>
    public string? TargetFinishDate { get; init; }

    public string? LeadTime { get; init; }
    public int? LeadTimeMinutes { get; init; }
}

public sealed record BaySummary
{
    public int TotalBays { get; init; }
    public int InServiceCount { get; init; }
    public int OverdueCount { get; init; }
    public int EmptyCount { get; init; }
    public int AvgLeadTimeMinutes { get; init; }
    public int AvgRemainingTimeMinutes { get; init; }
}
