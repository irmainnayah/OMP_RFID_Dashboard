import { getBays, calculateBaySummary } from '@/services/bayService';
import { Header } from '@/components/dashboard/Header';
import { SummaryBar } from '@/components/dashboard/SummaryBar';
import { BayGrid } from '@/components/dashboard/BayGrid';

// Render on every request. Bay data comes from a live API, so the page must
// not be prerendered at build time.
export const dynamic = 'force-dynamic';

/**
 * Main entry page for the SMMS Workshop Service Monitoring Dashboard.
 *
 * Designed for 16:9 wallboard displays:
 * - Full-screen landscape layout
 * - No vertical scrolling on large displays
 * - 4-column bay monitoring layout
 * - Subtle deep-navy to mist-blue atmospheric background
 */
export default async function HomePage() {
  const bays = await getBays();
  const summary = calculateBaySummary(bays);

  return (
    <div
      className="
        relative
        flex
        min-h-screen
        flex-col
        overflow-hidden

        bg-gradient-to-b
        from-[#081A2D]
        via-[#173650]
        to-[#DCE7F1]

        lg:h-screen
      "
    >
      <div
        className="
          relative
          z-10
          flex
          min-h-0
          flex-1
          flex-col
        "
      >
        <Header />
        <SummaryBar summary={summary} bays={bays} />
        <BayGrid bays={bays} />
      </div>
    </div>
  );
}