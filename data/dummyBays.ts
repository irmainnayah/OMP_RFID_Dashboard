import { BayData } from '@/types/bay';

/**
 * Initial mock dataset for the workshop service bays.
 * Includes Parkiran Dalam (BAY 01, 02, 07, 08) and Parkiran Luar (BAY 01, 02, 07, 08).
 * This file is isolated so future RFID/API/database integrations can swap in
 * live data without modifying any UI presentation components.
 *
 * Numeric time fields (elapsedMinutes, targetMinutes, leadTimeMinutes) are the
 * source-of-truth for calculations. Formatted string equivalents are kept for display.
 */
export const DUMMY_BAYS: BayData[] = [
  // PARKIRAN DALAM
  {
    id: 'dalam-bay-01',
    bayNumber: 'BAY 01',
    section: 'PARKIRAN DALAM',
    equipmentId: 'HD785-014',
    equipmentModel: 'HD785 Series Rigid Dump Truck',
    equipmentVisualUrl: '/images/komatsu-hd785-front.png',
    status: 'IN_SERVICE',
    progressPercent: 65,
    mechanic: 'Andi Saputra',
    startService: '07:30',
    targetFinish: '08:00',
    leadTime: '06h 00m',
    leadTimeMinutes: 360,
    timing: {
      elapsed: '03h 45m',
      target: '06h 00m',
      elapsedMinutes: 225,
      targetMinutes: 360,
      isOverdue: false,
    },
  },
  {
    id: 'dalam-bay-02',
    bayNumber: 'BAY 02',
    section: 'PARKIRAN DALAM',
    equipmentId: 'HD785-027',
    equipmentModel: 'HD785 Series Rigid Dump Truck',
    equipmentVisualUrl: '/images/komatsu-hd785-front.png',
    status: 'IN_SERVICE',
    progressPercent: 92,
    mechanic: 'Budi Santoso',
    startService: '06:00',
    targetFinish: '12:00',
    leadTime: '06h 00m',
    leadTimeMinutes: 360,
    timing: {
      elapsed: '07h 15m',
      target: '06h 00m',
      elapsedMinutes: 435,
      targetMinutes: 360,
      isOverdue: true,
    },
  },
  {
    id: 'dalam-bay-07',
    bayNumber: 'BAY 07',
    section: 'PARKIRAN DALAM',
    equipmentId: 'HD785-032',
    equipmentModel: 'HD785 Series Rigid Dump Truck',
    equipmentVisualUrl: '/images/komatsu-hd785-front.png',
    status: 'IN_SERVICE',
    progressPercent: 28,
    mechanic: 'Cahyo Wibowo',
    startService: '10:00',
    targetFinish: '16:00',
    leadTime: '06h 00m',
    leadTimeMinutes: 360,
    timing: {
      elapsed: '01h 20m',
      target: '06h 00m',
      elapsedMinutes: 80,
      targetMinutes: 360,
      isOverdue: false,
    },
  },
  {
    id: 'dalam-bay-08',
    bayNumber: 'BAY 08',
    section: 'PARKIRAN DALAM',
    status: null,
  },

  // PARKIRAN LUAR (Temporary Placeholders)
  {
    id: 'luar-bay-01',
    bayNumber: 'BAY 01',
    section: 'PARKIRAN LUAR',
    status: null,
  },
  {
    id: 'luar-bay-02',
    bayNumber: 'BAY 02',
    section: 'PARKIRAN LUAR',
    status: null,
  },
  {
    id: 'luar-bay-07',
    bayNumber: 'BAY 07',
    section: 'PARKIRAN LUAR',
    status: null,
  },
  {
    id: 'luar-bay-08',
    bayNumber: 'BAY 08',
    section: 'PARKIRAN LUAR',
    status: null,
  },
];
