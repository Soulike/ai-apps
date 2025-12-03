import {getReportFilenames, parseReportTimestamp} from './report-utils.js';

/**
 * Calculate the fetch start timestamp based on:
 * 1. Latest report filename timestamp (if available)
 * 2. Fall back to maxFetchHours ago
 * 3. Cap at maxFetchHours to prevent excessively long lookbacks
 */
export async function calculateFetchSinceTimestamp(
  maxFetchHours: number,
): Promise<string> {
  const now = new Date();
  const maxLookback = new Date(now.getTime() - maxFetchHours * 60 * 60 * 1000);

  const reports = await getReportFilenames();

  if (reports.length > 0) {
    // Try to parse timestamp from the most recent report filename
    for (const filename of reports) {
      const timestamp = parseReportTimestamp(filename);
      if (timestamp) {
        // Cap at maxFetchHours to prevent overwhelming fetches
        return timestamp > maxLookback
          ? timestamp.toISOString()
          : maxLookback.toISOString();
      }
    }
  }

  // No reports or no valid timestamps found, use maxFetchHours
  return maxLookback.toISOString();
}
