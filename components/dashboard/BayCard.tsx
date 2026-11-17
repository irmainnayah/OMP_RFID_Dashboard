'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

import { BayData } from '@/types/bay';
import { StatusBadge } from './StatusBadge';
import { EquipmentVisual } from './EquipmentVisual';

interface BayCardProps {
  /** Telemetry and equipment status data for this bay */
  bay: BayData;
}

const emptySubscribe = () => () => { };

function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

/**
 * Individual workshop bay monitoring card.
 *
 * Visual direction:
 * - Light blue / white operational surface
 * - Subtle flowing wave background
 * - Restrained border and shadow
 * - Clean IBM Plex Sans typography
 * - Equipment remains the primary visual focus
 *
 * Layout:
 *   HEADER    — Bay number + Status
 *   EQUIPMENT — Equipment ID + image
 *   SERVICE   — Mechanic, Target Finish, Lead Time
 *   COUNTDOWN — Remaining time / Overdue
 */

/**
 * Format countdown:
 * HH:MM:SS
 * -HH:MM:SS when target time has passed.
 */
function formatCountdown(totalSeconds: number): string {
  const isNegative = totalSeconds < 0;
  const absoluteSeconds = Math.abs(totalSeconds);

  const hours = Math.floor(absoluteSeconds / 3600);
  const minutes = Math.floor((absoluteSeconds % 3600) / 60);
  const seconds = absoluteSeconds % 60;

  const formatted = [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
  ].join(':');

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Convert target finish time (HH:mm) or ISO date string
 * into a timestamp.
 */
function getTargetTimestamp(targetFinish: string): number | null {
  const date = new Date(targetFinish);
  if (!isNaN(date.getTime()) && targetFinish.includes('T')) {
    return date.getTime();
  }

  const match = targetFinish.match(/^(\d{1,2}):(\d{2})$/);

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  const target = new Date();

  target.setHours(hours, minutes, 0, 0);

  return target.getTime();
}

export function BayCard({ bay }: BayCardProps) {
  const isMounted = useIsMounted();
  const targetFinish = bay.targetFinishDate || bay.targetFinish;

  const [countdown, setCountdown] = useState<string>('--:--:--');
  const [isCountdownNegative, setIsCountdownNegative] = useState<boolean>(false);

  const isEmpty = bay.status === null;
  const isOverdue = bay.status === 'OVERDUE' || (isMounted && isCountdownNegative);

  /*
   * OVERDUE is treated as an active service condition.
   * The primary status badge remains IN SERVICE,
   * while OVERDUE is shown below the countdown.
   */

  useEffect(() => {
    if (!targetFinish || isEmpty) {
      return;
    }

    const updateCountdown = () => {
      const targetTimestamp = getTargetTimestamp(targetFinish);

      if (targetTimestamp === null) {
        setCountdown('--:--:--');
        setIsCountdownNegative(false);
        return;
      }

      const now = Date.now();

      const differenceInSeconds = Math.floor(
        (targetTimestamp - now) / 1000
      );

      setCountdown(formatCountdown(differenceInSeconds));
      setIsCountdownNegative(differenceInSeconds < 0);
    };

    updateCountdown();

    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [targetFinish, isEmpty]);

  return (
    <article
      className={`
        relative
        flex
        h-auto
        w-full
        flex-col
        overflow-hidden
        rounded-[12px]          
        ${isOverdue
          ? 'border-[3px] border-[#FF334F] shadow-[0_0_0_2px_rgba(255,51,79,0.35),0_0_12px_rgba(255,51,79,0.45),0_0_28px_rgba(255,51,79,0.35)] animate-overdue-glow'
          : 'border border-[#D3E0EC]'
        }


        bg-[#F2F6FB]
        shadow-[0_2px_10px_rgba(10,27,46,0.06)]
        lg:h-full
      `}

      aria-label={`Bay ${bay.bayNumber}`}
    >
      {/* =========================================================
          ORGANIC BLUE WAVE BACKGROUND

          Final refinement:
          - asymmetric flowing shape
          - concentrated in the upper section
          - no lower decoration
          - purely decorative
      ========================================================= */}

      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* Main flowing wave */}
        <svg
          className="absolute -left-[8%] -top-[5%] h-[30%] w-[116%]"
          viewBox="0 0 1200 300"
          preserveAspectRatio="none"
        >
          <path
            d="
              M0,82
              C120,42 210,42 320,82
              C430,122 500,158 620,132
              C760,102 820,48 955,62
              C1065,74 1120,112 1200,96
              L1200,0
              L0,0
              Z
            "
            fill="#DDECF8"
            fillOpacity="0.92"
          />

          <path
            d="
              M0,112
              C125,72 215,72 330,112
              C450,154 520,184 635,158
              C770,128 835,82 960,94
              C1070,104 1130,140 1200,122
              L1200,0
              L0,0
              Z
            "
            fill="#EAF4FB"
            fillOpacity="0.94"
          />
        </svg>

        {/* Very soft secondary layer */}
        <svg
          className="absolute -left-[6%] top-[0%] h-[25%] w-[112%]"
          viewBox="0 0 1200 250"
          preserveAspectRatio="none"
        >
          <path
            d="
              M0,92
              C135,130 235,132 350,92
              C470,50 560,48 680,86
              C805,126 900,142 1010,108
              C1100,80 1150,78 1200,92
              L1200,250
              L0,250
              Z
            "
            fill="#D2E6F5"
            fillOpacity="0.24"
          />
        </svg>
      </div>

      {/* =========================================================
          HEADER (TIDAK DIBAGI - MEMBENTANG SEPANJANG LEBAR CARD)
      ========================================================= */}

      <div
        className="
          relative
          z-10
          shrink-0
          border-b
          border-[#D3E0EC]
          px-3
          py-1.5
          xl:px-3.5
          xl:py-2
        "
      >
        <div className="flex items-center justify-between gap-2">

          {/* Bay Number */}
          <h2
            className="
              text-sm
              font-bold
              leading-tight
              tracking-[-0.01em]
              text-[#0A1B2E]
              sm:text-base
              xl:text-lg
            "
          >
            {bay.bayNumber}
          </h2>

          {/* Status Badge */}
          <div className="shrink-0">
            {!isEmpty && (
              <StatusBadge
                status={isOverdue ? 'OVERDUE' : 'IN_SERVICE'}
                size="sm"
              />
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          CONTENT CARD (DIBAGI MENJADI DUA KOLOM)
      ========================================================= */}

      {isEmpty ? (
        <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center p-3">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6F88A3] sm:text-sm">
              EMPTY
            </p>
            <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.12em] text-[#9AAEC1] sm:text-[10px]">
              No Active Service
            </p>
          </div>
        </div>
      ) : (
        <div
          className="
            relative
            z-10
            flex
            min-h-0
            flex-1
            gap-2
            p-2.5
            xl:gap-3
            xl:p-3
          "
        >
          {/* =======================================================
              KOLOM KIRI — INFORMATION PANEL
          ======================================================= */}
          <div className="flex min-w-0 flex-1 flex-col justify-between">
            {/* 1. Equipment ID */}
            <div className="shrink-0">
              <p className="text-[7.5px] font-medium uppercase tracking-[0.12em] text-[#6F88A3] sm:text-[8px]">
                Equipment ID
              </p>
              <p className="truncate text-sm font-bold leading-tight tracking-tight text-[#0A1B2E] sm:text-base xl:text-lg">
                {bay.equipmentId}
              </p>
            </div>

            {/* 2. Start Time & Estimated Finish Time */}
            <div className="my-1 grid grid-cols-2 gap-2 shrink-0">
              {bay.startService && (
                <div>
                  <p className="text-[7.5px] font-medium uppercase tracking-[0.1em] text-[#6F88A3] sm:text-[8px]">
                    Start Time
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-plex-sans-condensed), var(--font-plex-sans), sans-serif',
                      transform: 'scaleY(1.18)',
                      transformOrigin: 'bottom left',
                    }}
                    className="inline-block text-xl font-bold tabular-nums tracking-normal text-[#0A1B2E] leading-tight sm:text-2xl xl:text-3xl"
                  >
                    {bay.startService}
                  </p>
                </div>
              )}

              {bay.targetFinish && (
                <div>
                  <p className="text-[7.5px] font-medium uppercase tracking-[0.1em] text-[#6F88A3] sm:text-[8px]">
                    Estimate
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-plex-sans-condensed), var(--font-plex-sans), sans-serif',
                      transform: 'scaleY(1.18)',
                      transformOrigin: 'bottom left',
                    }}
                    className="inline-block text-xl font-bold tabular-nums tracking-normal text-[#0A1B2E] leading-tight sm:text-2xl xl:text-3xl"
                  >
                    {bay.targetFinish}
                  </p>
                </div>
              )}
            </div>

            {/* 3. Mechanic */}
            {bay.mechanic && (
              <div className="shrink-0">
                <p className="text-[7px] font-medium uppercase tracking-[0.1em] text-[#6F88A3] sm:text-[7.5px]">
                  Mechanic
                </p>
                <p className="truncate text-[10px] font-semibold text-[#294663] sm:text-xs">
                  {bay.mechanic}
                </p>
              </div>
            )}

            {/* 4. Countdown */}
            <div className="mt-0.5 shrink-0 border-t border-[#D3E0EC]/80 pt-0.5">
              <span className="text-[7px] font-medium uppercase tracking-[0.12em] text-[#6F88A3] sm:text-[7.5px]">
                Countdown
              </span>
              <p
                className={`
                  text-sm
                  font-bold
                  leading-none
                  tracking-[-0.02em]
                  tabular-nums
                  sm:text-base
                  xl:text-lg
                  ${isCountdownNegative
                    ? 'text-[#C83D4A]'
                    : isOverdue
                      ? 'text-[#1B6FB8]'
                      : 'text-[#0A1B2E]'
                  }
                `}
              >
                {countdown}
              </p>
            </div>
          </div>

          {/* =======================================================
              KOLOM KANAN — EQUIPMENT IMAGE PANEL
          ======================================================= */}
          <div
            className="
              flex
              w-[38%]
              xl:w-[40%]
              shrink-0
              flex-col
              justify-center
              overflow-hidden
            "
          >
            <div className="h-full w-full [&>*]:h-full [&>*]:w-full">
              <EquipmentVisual
                src={bay.equipmentVisualUrl}
                alt={`Equipment ${bay.equipmentId}`}
              />
            </div>
          </div>
        </div>
      )}
    </article>
  );
}