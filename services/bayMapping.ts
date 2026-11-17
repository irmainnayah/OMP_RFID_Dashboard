import type { BayData } from '../types/bay';

/**
 * Pure mapping from API records to the fixed set of 8 bay cards.
 * Kept free of fetch/env/alias imports so it can be tested in isolation.
 */

export interface ApiBayItem {
  location_bays: string;
  unit_number: string;
  assigned_mechanics?: string;
  plan_start_time?: string;
  estimade_rfu?: string;
}

export type BayLocation = 'DALAM' | 'LUAR';

export type BayMappingIssue =
  | { type: 'UNRECOGNIZED'; locationBays: unknown; unitNumber?: string }
  | { type: 'DUPLICATE'; bayKey: string; unitNumbers: (string | undefined)[] };

export interface BayMappingResult {
  bays: BayData[];
  issues: BayMappingIssue[];
}

const BAY_NUMBERS = ['01', '02', '07', '08'] as const;
const LOCATIONS: BayLocation[] = ['DALAM', 'LUAR'];

function createDefaultBays(): BayData[] {
  const bays: BayData[] = [];
  for (const location of LOCATIONS) {
    for (const num of BAY_NUMBERS) {
      bays.push({
        id: `${location.toLowerCase()}-bay-${num}`,
        bayNumber: `BAY ${num}` as BayData['bayNumber'],
        section: location === 'DALAM' ? 'PARKIRAN DALAM' : 'PARKIRAN LUAR',
        status: null,
      });
    }
  }
  return bays;
}

/**
 * Parses "BAY 01 DALAM" / "BAYS 2 LUAR" into a card id like "dalam-bay-01".
 * Both the bay number and the location must be present and recognised;
 * otherwise returns null so the record is never placed on a wrong card.
 */
export function parseLocationBays(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;

  const numbers = raw.match(/\d+/g);
  const locations = raw.toUpperCase().match(/\b(DALAM|LUAR)\b/g);
  // Exactly one number and one location, otherwise the value is ambiguous.
  if (!numbers || numbers.length !== 1 || !locations || locations.length !== 1) {
    return null;
  }

  const num = numbers[0].padStart(2, '0');
  if (!(BAY_NUMBERS as readonly string[]).includes(num)) return null;

  return `${locations[0].toLowerCase()}-bay-${num}`;
}

function applyApiItem(defaultBay: BayData, apiBay: ApiBayItem, now: Date): BayData {
  // Extract hours and minutes directly from "HH:MM:SS"
  let startServiceStr = '--:--';
  if (apiBay.plan_start_time) {
    const timeParts = apiBay.plan_start_time.split(':');
    if (timeParts.length >= 2) {
      startServiceStr = `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}`;
    }
  }

  // target finish from estimade_rfu "YYYY-MM-DD HH:mm:ss"
  let targetFinishStr = '--:--';
  let targetFinishDateIso = apiBay.estimade_rfu;
  let estimadeRfuDate = new Date(now.getTime());

  if (apiBay.estimade_rfu) {
    // Convert "YYYY-MM-DD HH:mm:ss" to ISO "YYYY-MM-DDTHH:mm:ss" for reliable parsing
    estimadeRfuDate = new Date(apiBay.estimade_rfu.replace(' ', 'T'));

    if (!isNaN(estimadeRfuDate.getTime())) {
      targetFinishStr = `${String(estimadeRfuDate.getHours()).padStart(2, '0')}:${String(estimadeRfuDate.getMinutes()).padStart(2, '0')}`;
      targetFinishDateIso = estimadeRfuDate.toISOString();
    }
  }

  return {
    ...defaultBay,
    equipmentId: apiBay.unit_number,
    equipmentVisualUrl: '/images/komatsu-hd785-front.png',
    status: now > estimadeRfuDate ? 'OVERDUE' : 'IN_SERVICE',
    mechanic: apiBay.assigned_mechanics,
    startService: startServiceStr,
    targetFinish: targetFinishStr,
    targetFinishDate: targetFinishDateIso,
  };
}

/**
 * Maps API records onto exactly 8 cards (DALAM 01/02/07/08, LUAR 01/02/07/08).
 *
 * - Unrecognised records are skipped and reported as UNRECOGNIZED.
 * - If several records target the same card, none is chosen: the card stays
 *   empty and a DUPLICATE issue is reported.
 * - Cards without a record keep their empty default.
 */
export function mapApiToBays(items: ApiBayItem[], now: Date = new Date()): BayMappingResult {
  const defaults = createDefaultBays();
  const issues: BayMappingIssue[] = [];
  const grouped = new Map<string, ApiBayItem[]>();

  for (const item of items) {
    const key = parseLocationBays(item?.location_bays);
    if (!key) {
      issues.push({
        type: 'UNRECOGNIZED',
        locationBays: item?.location_bays,
        unitNumber: item?.unit_number,
      });
      continue;
    }
    const list = grouped.get(key);
    if (list) list.push(item);
    else grouped.set(key, [item]);
  }

  const bays = defaults.map((defaultBay) => {
    const matches = grouped.get(defaultBay.id);
    if (!matches) return defaultBay;

    if (matches.length > 1) {
      issues.push({
        type: 'DUPLICATE',
        bayKey: defaultBay.id,
        unitNumbers: matches.map((m) => m.unit_number),
      });
      return defaultBay;
    }

    return applyApiItem(defaultBay, matches[0], now);
  });

  return { bays, issues };
}
