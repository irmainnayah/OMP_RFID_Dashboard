'use client';

import { useEffect, useState } from 'react';
import { BayData, BaySummary } from '@/types/bay';

interface SummaryBarProps {
  /** Dynamic summary metrics calculated from the active bays dataset */
  summary: BaySummary;
  bays: BayData[];
}

/**
 * Workshop status summary.
 *
 * Displays the current state of all monitored bays:
 * - Total Bays
 * - In Service
 * - Overdue
 * - Empty
 *
 * The animated wave is intentionally slow and subtle so it adds
 * movement to the wallboard without distracting from the data.
 */
export function SummaryBar({ summary, bays }: SummaryBarProps) {

  const [liveSummary, setLiveSummary] = useState<BaySummary>(summary);

  useEffect(() => {
    const updateSummary = () => {
      let inServiceCount = 0;
      let overdueCount = 0;
      let emptyCount = 0;

      for (const bay of bays) {
        if (bay.status === null) {
          emptyCount++;
          continue;
        }

        let isOverdue = bay.status === 'OVERDUE';

        if (bay.status === 'IN_SERVICE' && bay.targetFinish) {
          // Same source as BayCard: prefer the full ISO date so the summary
          // and the card countdown agree, including across midnight.
          const isoTarget = bay.targetFinishDate?.includes('T')
            ? new Date(bay.targetFinishDate).getTime()
            : NaN;
          const match = bay.targetFinish.match(/^(\d{1,2}):(\d{2})$/);

          if (!isNaN(isoTarget)) {
            isOverdue = isoTarget < Date.now();
          } else if (match) {
            const hours = Number(match[1]);
            const minutes = Number(match[2]);

            const target = new Date();
            target.setHours(hours, minutes, 0, 0);

            isOverdue = target.getTime() <= Date.now();
          }
        }

        if (isOverdue) {
          overdueCount++;
        } else {
          inServiceCount++;
        }
      }

      setLiveSummary({
        ...summary,
        inServiceCount,
        overdueCount,
        emptyCount,
      });
    };

    updateSummary();

    const timer = setInterval(updateSummary, 1000);

    return () => clearInterval(timer);
  }, [bays, summary]);

  return (
    <section
      aria-label="Workshop Status Summary"
      className="
        w-full
        max-w-[1720px]
        mx-auto
        px-5
        sm:px-6
        lg:px-7
        pb-1
        shrink-0
      "
    >
      <div
        className="
          relative
          overflow-hidden
          rounded-[12px]
          border
          border-[#C9D9E7]
          bg-[#F2F6FB]
          shadow-[0_2px_10px_rgba(10,27,46,0.05)]
        "
      >
        {/* =========================================================
            SUBTLE ANIMATED WAVE
            Decorative only — does not affect the content layout.
        ========================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            bottom-0
            h-[42%]
            overflow-hidden
          "
          aria-hidden="true"
        >
          {/* Back wave */}
          <svg
            className="
              absolute
              -bottom-1
              -left-[4%]
              h-full
              w-[108%]
              animate-summary-wave-slow
            "
            viewBox="0 0 1200 180"
            preserveAspectRatio="none"
          >
            <path
              d="
                M0,100
                C120,72 220,72 340,102
                C470,134 555,136 675,104
                C800,70 900,62 1020,94
                C1100,116 1150,116 1200,100
                L1200,180
                L0,180
                Z
              "
              fill="#C7E2F4"
              fillOpacity="0.9"
            />
          </svg>

          {/* Front wave */}
          <svg
            className="
              absolute
              -bottom-1
              -left-[2%]
              h-[82%]
              w-[104%]
              animate-summary-wave
            "
            viewBox="0 0 1200 150"
            preserveAspectRatio="none"
          >
            <path
              d="
                M0,88
                C130,60 230,62 350,88
                C470,114 560,116 680,88
                C810,58 900,52 1025,78
                C1110,96 1155,96 1200,84
                L1200,150
                L0,150
                Z
              "
              fill="#EAF4FB"
              fillOpacity="0.78"
            />
          </svg>
        </div>

        {/* =========================================================
            SUMMARY CONTENT
        ========================================================= */}

        <div
          className="
            relative
            z-10
            grid
            grid-cols-2
            lg:grid-cols-4
          "
        >
          {/* Total Bays */}
          <div
            className="
              flex
              items-center
              px-4
              py-1.5
              lg:border-r
              lg:border-[#D3E0EC]
              lg:px-5
              lg:py-2
            "
          >
            <div>
              <p
                className="
                  text-[8px]
                  font-medium
                  uppercase
                  tracking-[0.14em]
                  text-[#6F88A3]
                  sm:text-[9px]
                "
              >
                Total Bays
              </p>

              <p
                className="
                  text-lg
                  font-semibold
                  leading-tight
                  tracking-[-0.02em]
                  tabular-nums
                  text-[#0A1B2E]
                  sm:text-xl
                  lg:text-2xl
                "
              >
                {String(summary.totalBays).padStart(2, '0')}
              </p>
            </div>
          </div>

          {/* In Service */}
          <div
            className="
              flex
              items-center
              border-l
              border-b
              border-[#D3E0EC]
              px-4
              py-1.5
              lg:border-l-0
              lg:border-b-0
              lg:border-r
              lg:px-5
              lg:py-2
            "
          >
            <div>
              <p
                className="
                  text-[8px]
                  font-medium
                  uppercase
                  tracking-[0.14em]
                  text-[#6F88A3]
                  sm:text-[9px]
                "
              >
                In Service
              </p>

              <p
                className="
                  text-lg
                  font-semibold
                  leading-tight
                  tracking-[-0.02em]
                  tabular-nums
                  text-[#167A70]
                  sm:text-xl
                  lg:text-2xl
                "
              >
                {String(liveSummary.inServiceCount).padStart(2, '0')}
              </p>
            </div>
          </div>

          {/* Overdue */}
          <div
            className="
              flex
              items-center
              border-t
              border-[#D3E0EC]
              px-4
              py-1.5
              lg:border-t-0
              lg:border-r
              lg:px-5
              lg:py-2
            "
          >
            <div>
              <p
                className="
                  text-[8px]
                  font-medium
                  uppercase
                  tracking-[0.14em]
                  text-[#6F88A3]
                  sm:text-[9px]
                "
              >
                Overdue
              </p>

              <p
                className="
                  text-lg
                  font-semibold
                  leading-tight
                  tracking-[-0.02em]
                  tabular-nums
                  text-[#C83D4A]
                  sm:text-xl
                  lg:text-2xl
                "
              >
                {String(liveSummary.overdueCount).padStart(2, '0')}
              </p>
            </div>
          </div>

          {/* Empty */}
          <div
            className="
              flex
              items-center
              border-l
              border-t
              border-[#D3E0EC]
              px-4
              py-1.5
              lg:border-l-0
              lg:border-t-0
              lg:px-5
              lg:py-2
            "
          >
            <div>
              <p
                className="
                  text-[8px]
                  font-medium
                  uppercase
                  tracking-[0.14em]
                  text-[#6F88A3]
                  sm:text-[9px]
                "
              >
                Empty
              </p>

              <p
                className="
                  text-lg
                  font-semibold
                  leading-tight
                  tracking-[-0.02em]
                  tabular-nums
                  text-[#5D7893]
                  sm:text-xl
                  lg:text-2xl
                "
              >
                {String(liveSummary.emptyCount).padStart(2, '0')}
              </p>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}

