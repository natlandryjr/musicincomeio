/**
 * Central export for all application constants
 */

export * from "./plans";
export * from "./sources";
export * from "./routes";

/**
 * General app constants
 */
export const APP_NAME = "MusicIncome.io";
export const APP_DESCRIPTION = "Track all your music income in one place";
export const SUPPORT_EMAIL = "support@musicincome.io";

/**
 * Date/time constants
 */
export const DATE_FORMAT = "MMM dd, yyyy";
export const DATETIME_FORMAT = "MMM dd, yyyy HH:mm";
export const SYNC_INTERVAL_DAYS = 1; // Nightly sync frequency

/**
 * Limits and thresholds
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_CSV_ROWS = 10000;
export const GMAIL_SEARCH_DAYS = 90;
export const RECENT_ENTRIES_LIMIT = 5;

/**
 * Distributor options
 */
export const DISTRIBUTORS = [
  { id: "distrokid", label: "DistroKid" },
  { id: "tunecore", label: "TuneCore" },
  { id: "cdbaby", label: "CD Baby" },
  { id: "other", label: "Other" },
] as const;

export type DistributorId = (typeof DISTRIBUTORS)[number]["id"];
