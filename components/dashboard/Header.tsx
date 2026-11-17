'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export function Header() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      setCurrentTime(
        now.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );

      setCurrentDate(
        now.toLocaleDateString('en-GB', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      );
    };

    updateDateTime();

    const timer = setInterval(updateDateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header
      className="
        w-full
        shrink-0
        border-b
        border-slate-700/60
        bg-[#0a1b2e]
        px-6
        py-2
        sm:px-7
        sm:py-2.5
      "
    >
      <div className="flex w-full items-center justify-between gap-6">

        {/* =========================================================
            LEFT SIDE
            PAMA LOGO + DASHBOARD TITLE
        ========================================================= */}
        <div className="flex min-w-0 items-center gap-3">

          {/* PAMA Logo */}
          <div
            className="
              relative
              h-12
              w-14
              shrink-0
              rounded-[9px]
              bg-slate-50
              sm:h-13
              sm:w-16
            "
          >
            <Image
              src="/images/pama-logo.png"
              alt="PAMA Logo"
              fill
              priority
              sizes="64px"
              className="object-contain p-1"
            />
          </div>

          {/* Divider */}
          <div
            className="h-8 w-px shrink-0 bg-slate-400/30"
            aria-hidden="true"
          />

          {/* Dashboard Title */}
          <div className="min-w-0">
            <p
              className="
                mb-0.5
                text-[10px]
                font-medium
                uppercase
                tracking-[0.18em]
                leading-none
                text-slate-300
                sm:text-[11px]
              "
            >
              SMMS WORKSHOP
            </p>

            <h1
              className="
                truncate
                text-base
                font-semibold
                leading-tight
                tracking-tight
                text-white
                sm:text-lg
                lg:text-xl
              "
            >
              SERVICE MONITORING DASHBOARD
            </h1>
          </div>
        </div>

        {/* =========================================================
            RIGHT SIDE
            DATE + CLOCK
        ========================================================= */}
        <div className="shrink-0 text-right">

          <div
            className="
              text-[10px]
              font-medium
              uppercase
              tracking-[0.12em]
              text-slate-300
              sm:text-[11px]
            "
          >
            {currentDate || 'Loading...'}
          </div>

          <div
            className="
              font-mono
              text-base
              font-semibold
              leading-tight
              tracking-wider
              tabular-nums
              text-white
              sm:text-lg
            "
          >
            {currentTime || '--:--:--'}
          </div>

        </div>
      </div>
    </header>
  );
}