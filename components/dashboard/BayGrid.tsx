'use client';

import { BayData } from '@/types/bay';
import { BayCard } from './BayCard';

interface BayGridProps {
  /** Array of active monitored bays (8 bays across PARKIRAN DALAM & PARKIRAN LUAR) */
  bays: BayData[];
}

/**
 * VERSION 2: Single-screen 8-card responsive monitoring layout.
 * 
 * Grid structure:
 * - 4 columns × 2 rows visible simultaneously on one screen without scroll.
 * - ROW 1: PARKIRAN DALAM (BAY 01, BAY 02, BAY 07, BAY 08)
 * - ROW 2: PARKIRAN LUAR  (BAY 01, BAY 02, BAY 07, BAY 08)
 * 
 * Auto-slide is removed. All 8 cards run real-time countdowns simultaneously.
 */
export function BayGrid({ bays }: BayGridProps) {
  const indoorBays = bays
    .filter((b) => b.section === 'PARKIRAN DALAM' || !b.section)
    .slice(0, 4);

  const outdoorBays = bays
    .filter((b) => b.section === 'PARKIRAN LUAR')
    .slice(0, 4);

  const finalIndoorBays =
    indoorBays.length === 4 ? indoorBays : bays.slice(0, 4);
  const finalOutdoorBays =
    outdoorBays.length === 4 ? outdoorBays : bays.slice(4, 8);

  return (
    <main
      aria-label="Workshop Bay Monitoring Grid"
      className="
        w-full
        max-w-[1720px]
        mx-auto
        px-4
        sm:px-6
        lg:px-7
        py-1.5
        lg:py-2
        flex-1
        min-h-0
        flex
        flex-col
        justify-between
        gap-1.5
        lg:gap-2
      "
    >
      {/* =========================================================
          BARIS PERTAMA: SECTION INDOOR BAYS
      ========================================================= */}
      <section
        aria-label="Section Indoor Bays"
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="mb-1 flex shrink-0 items-center gap-2">
          <span
            className="h-4 w-1.5 rounded-full bg-gradient-to-b from-[#1B6FB8] to-[#19C5D8]"
            aria-hidden="true"
          />
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-300 sm:text-base">
            INDOOR BAYS
          </h2>
        </div>

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-4
            gap-2
            sm:gap-2.5
            xl:gap-3
            flex-1
            min-h-0
            items-stretch
          "
        >
          {finalIndoorBays.map((bay) => (
            <BayCard key={bay.id} bay={bay} />
          ))}
        </div>
      </section>

      {/* =========================================================
          BARIS KEDUA: SECTION OUTDOOR BAYS
      ========================================================= */}
      <section
        aria-label="Section Outdoor Bays"
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="mb-1 flex shrink-0 items-center gap-2">
          <span
            className="h-4 w-1.5 rounded-full bg-gradient-to-b from-[#F59E0B] to-[#FBBF24]"
            aria-hidden="true"
          />
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-amber-400 sm:text-base">
            OUTDOOR BAYS
          </h2>
        </div>

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-4
            gap-2
            sm:gap-2.5
            xl:gap-3
            flex-1
            min-h-0
            items-stretch
          "
        >
          {finalOutdoorBays.map((bay) => (
            <BayCard key={bay.id} bay={bay} />
          ))}
        </div>
      </section>
    </main>
  );
}