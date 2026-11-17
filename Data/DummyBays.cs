using OmpRfidDashboard.Models;

namespace OmpRfidDashboard.Data;

/// <summary>
/// Fallback dataset used when the API request fails or returns an invalid response.
/// </summary>
public static class DummyBays
{
    private const string Truck = "/images/komatsu-hd785-front.png";
    private const string Model = "HD785 Series Rigid Dump Truck";

    public static IReadOnlyList<BayData> All { get; } = new List<BayData>
    {
        // PARKIRAN DALAM
        new()
        {
            Id = "dalam-bay-01", BayNumber = "BAY 01", Section = BaySection.Dalam,
            EquipmentId = "HD785-014", EquipmentModel = Model, EquipmentVisualUrl = Truck,
            Status = ServiceStatus.InService, ProgressPercent = 65, Mechanic = "Andi Saputra",
            StartService = "07:30", TargetFinish = "08:00", LeadTime = "06h 00m", LeadTimeMinutes = 360,
            Timing = new ServiceTiming("03h 45m", "06h 00m", 225, 360, false),
        },
        new()
        {
            Id = "dalam-bay-02", BayNumber = "BAY 02", Section = BaySection.Dalam,
            EquipmentId = "HD785-027", EquipmentModel = Model, EquipmentVisualUrl = Truck,
            Status = ServiceStatus.InService, ProgressPercent = 92, Mechanic = "Budi Santoso",
            StartService = "06:00", TargetFinish = "12:00", LeadTime = "06h 00m", LeadTimeMinutes = 360,
            Timing = new ServiceTiming("07h 15m", "06h 00m", 435, 360, true),
        },
        new()
        {
            Id = "dalam-bay-07", BayNumber = "BAY 07", Section = BaySection.Dalam,
            EquipmentId = "HD785-032", EquipmentModel = Model, EquipmentVisualUrl = Truck,
            Status = ServiceStatus.InService, ProgressPercent = 28, Mechanic = "Cahyo Wibowo",
            StartService = "10:00", TargetFinish = "16:00", LeadTime = "06h 00m", LeadTimeMinutes = 360,
            Timing = new ServiceTiming("01h 20m", "06h 00m", 80, 360, false),
        },
        new() { Id = "dalam-bay-08", BayNumber = "BAY 08", Section = BaySection.Dalam },

        // PARKIRAN LUAR (placeholders)
        new() { Id = "luar-bay-01", BayNumber = "BAY 01", Section = BaySection.Luar },
        new() { Id = "luar-bay-02", BayNumber = "BAY 02", Section = BaySection.Luar },
        new() { Id = "luar-bay-07", BayNumber = "BAY 07", Section = BaySection.Luar },
        new() { Id = "luar-bay-08", BayNumber = "BAY 08", Section = BaySection.Luar },
    };
}
