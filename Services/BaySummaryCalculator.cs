using OmpRfidDashboard.Models;

namespace OmpRfidDashboard.Services;

public static class BaySummaryCalculator
{
    /// <summary>
    /// InService: active service. Overdue: past target time. Empty: Status == null.
    /// </summary>
    public static BaySummary Calculate(IReadOnlyCollection<BayData> bays)
    {
        int inService = 0, overdue = 0, empty = 0;
        int totalLead = 0, leadCount = 0, totalRemaining = 0, remainingCount = 0;

        foreach (var bay in bays)
        {
            switch (bay.Status)
            {
                case ServiceStatus.InService: inService++; break;
                case ServiceStatus.Overdue: overdue++; break;
                case null: empty++; break;
            }

            if (bay.LeadTimeMinutes is { } lead)
            {
                totalLead += lead;
                leadCount++;
            }

            if (bay.Timing is { } timing)
            {
                // Overdue bays have negative remaining time; clamp to 0 for the average.
                totalRemaining += Math.Max(0, timing.TargetMinutes - timing.ElapsedMinutes);
                remainingCount++;
            }
        }

        return new BaySummary
        {
            TotalBays = bays.Count,
            InServiceCount = inService,
            OverdueCount = overdue,
            EmptyCount = empty,
            AvgLeadTimeMinutes = leadCount > 0 ? RoundHalfUp((double)totalLead / leadCount) : 0,
            AvgRemainingTimeMinutes = remainingCount > 0 ? RoundHalfUp((double)totalRemaining / remainingCount) : 0,
        };
    }

    private static int RoundHalfUp(double value) => (int)Math.Round(value, MidpointRounding.AwayFromZero);
}
