/**
 * Domain types for the Workshop Service Monitoring Dashboard.
 * Defines the core contract for bay telemetry, service statuses, and aggregate summary metrics.
 */

export type ServiceStatus = 'IN_SERVICE' | 'OVERDUE';

export interface ServiceTiming {
  /** Elapsed service duration string (e.g. "03h 45m") — for display */
  elapsed: string;

  /** Scheduled or target duration string (e.g. "06h 00m") — for display */
  target: string;

  /** Elapsed duration in minutes — for calculation */
  elapsedMinutes: number;

  /** Target duration in minutes — for calculation */
  targetMinutes: number;

  /** Whether service duration has exceeded target threshold */
  isOverdue?: boolean;
}

export interface BayData {
  /** Unique bay identifier key */
  id: string;

  /** Display bay number */
  bayNumber: 'BAY 01' | 'BAY 02' | 'BAY 07' | 'BAY 08';

  /** Parking section category */
  section?: 'PARKIRAN DALAM' | 'PARKIRAN LUAR';

  /** Heavy equipment identifier */
  equipmentId?: string;

  /** Heavy equipment model context */
  equipmentModel?: string;

  /** Path to equipment visual asset */
  equipmentVisualUrl?: string;

  /**
   * Current operational service status.
   * null means the bay is currently empty / has no active service.
   */
  status: ServiceStatus | null;

  /** Service completion progress percentage (0 - 100), when available */
  progressPercent?: number;

  /** Service timing metrics, when available */
  timing?: ServiceTiming;

  /** Assigned mechanic full name */
  mechanic?: string;

  /** Service start time display string (e.g. "07:30") */
  startService?: string;

  /** Target finish time display string (e.g. "13:30") */
  targetFinish?: string;

  /** Target finish date ISO string for accurate countdown */
  targetFinishDate?: string;

  /** Lead time formatted display string */
  leadTime?: string;

  /** Lead time in minutes — for calculation */
  leadTimeMinutes?: number;
}

export interface BaySummary {
  /** Total monitored bays */
  totalBays: number;

  /** Count of bays currently with IN_SERVICE status */
  inServiceCount: number;

  /** Count of bays currently with OVERDUE status */
  overdueCount: number;

  /** Count of bays with no active service */
  emptyCount: number;

  /** Average lead time in minutes across all bays with lead time data */
  avgLeadTimeMinutes: number;

  /** Average remaining time in minutes across all bays with timing data */
  avgRemainingTimeMinutes: number;
}