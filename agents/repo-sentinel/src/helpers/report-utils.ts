import {readdir} from 'fs/promises';
import {getReportDir} from './env-helpers.js';

/**
 * Parse timestamp from report filename.
 * Expected format: YYYY-MM-DD-HH-MM-<rest>.md
 * Returns null if parsing fails.
 */
export function parseReportTimestamp(filename: string): Date | null {
  const match = filename.match(/^(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})-/);
  if (!match) return null;

  const year = match[1]!;
  const month = match[2]!;
  const day = match[3]!;
  const hour = match[4]!;
  const minute = match[5]!;

  const date = new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1, // months are 0-indexed
    parseInt(day, 10),
    parseInt(hour, 10),
    parseInt(minute, 10),
  );

  return isNaN(date.getTime()) ? null : date;
}

/**
 * Get report filenames sorted by timestamp in filename (most recent first).
 */
export async function getReportFilenames(): Promise<string[]> {
  const reportDir = getReportDir();

  let files: string[];
  try {
    files = await readdir(reportDir);
  } catch {
    return [];
  }

  const mdFiles = files.filter((f) => f.endsWith('.md'));

  // Sort by parsed timestamp from filename (most recent first)
  return mdFiles.sort((a, b) => {
    const dateA = parseReportTimestamp(a);
    const dateB = parseReportTimestamp(b);
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return dateB.getTime() - dateA.getTime();
  });
}
