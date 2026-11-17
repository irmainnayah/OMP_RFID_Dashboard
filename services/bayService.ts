import { BayData, BaySummary } from '@/types/bay';
import { DUMMY_BAYS } from '@/data/dummyBays';
import { mapApiToBays, type ApiBayItem } from '@/services/bayMapping';

/**
 * Service adapter providing workshop bay monitoring data.
 * Acts as the boundary between the data source and UI presentation components.
 *
 * When backend REST endpoints, WebSocket streams, or live RFID hardware feeds
 * are integrated in future phases, update this service without altering UI components.
 */

/**
 * Formats a total-minutes integer into a "HHh MMm" display string.
 * e.g. 323 → "05h 23m", 94 → "01h 34m", 0 → "00h 00m"
 */
export function formatMinutes(totalMinutes: number): string {
  const clamped = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;

  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
}

export async function getBays(): Promise<BayData[]> {
  try {
    const res = await fetch('http://10.60.3.113:3000/api_omp_rfid/WS_PLAN/SMMS', {
      headers: {
        'x-api-key': process.env.API_KEY || '',
      },
      cache: 'no-store', // fetch fresh data
    });

    if (!res.ok) {
      console.error('Failed to fetch bay data', res.statusText);
      return DUMMY_BAYS;
    }

    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) {
      return DUMMY_BAYS;
    }

    const { bays, issues } = mapApiToBays(json.data as ApiBayItem[]);
    if (issues.length > 0) {
      const unrecognized = issues.filter((i) => i.type === 'UNRECOGNIZED').length;
      const duplicate = issues.filter((i) => i.type === 'DUPLICATE').length;
      console.warn(
        `Bay mapping issues: ${unrecognized} unrecognized, ${duplicate} duplicate`
      );
    }
    return bays;
  } catch (error) {
    console.error('Error fetching bay data:', error);
    return DUMMY_BAYS;
  }
}

/**
 * Dynamically computes aggregate summary metrics from a collection of bays.
 *
 * IN_SERVICE — bay currently has an active service.
 * OVERDUE    — bay service has exceeded its target time.
 * EMPTY      — bay has no active service (status === null).
 */
export function calculateBaySummary(bays: BayData[]): BaySummary {
  const summary: BaySummary = {
    totalBays: bays.length,
    inServiceCount: 0,
    overdueCount: 0,
    emptyCount: 0,
    avgLeadTimeMinutes: 0,
    avgRemainingTimeMinutes: 0,
  };

  let totalLeadTime = 0;
  let leadTimeCount = 0;
  let totalRemaining = 0;
  let remainingCount = 0;

  for (const bay of bays) {
    switch (bay.status) {
      case 'IN_SERVICE':
        summary.inServiceCount += 1;
        break;

      case 'OVERDUE':
        summary.overdueCount += 1;
        break;

      case null:
        summary.emptyCount += 1;
        break;
    }

    if (bay.leadTimeMinutes !== undefined) {
      totalLeadTime += bay.leadTimeMinutes;
      leadTimeCount++;
    }

    if (bay.timing) {
      // Overdue bays have negative remaining time,
      // so clamp the value to 0 for the average.
      const remaining = Math.max(
        0,
        bay.timing.targetMinutes - bay.timing.elapsedMinutes
      );

      totalRemaining += remaining;
      remainingCount++;
    }
  }

  summary.avgLeadTimeMinutes =
    leadTimeCount > 0
      ? Math.round(totalLeadTime / leadTimeCount)
      : 0;

  summary.avgRemainingTimeMinutes =
    remainingCount > 0
      ? Math.round(totalRemaining / remainingCount)
      : 0;

  return summary;
}