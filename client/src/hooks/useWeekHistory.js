// Loads this week + last week (14 days ending next Monday) from a history endpoint — the
// student's own or a linked student's — and re-checks every 2 minutes while the page is open.
import { useCallback } from 'react';
import { usePolledData } from './usePolledData.js';
import { addDays, mondayOf } from '../utils/week.js';
import { todayIst } from '../utils/format.js';

export function useWeekHistory(fetchHistory) {
  const fetcher = useCallback(
    ({ signal }) => fetchHistory({ days: 14, before: addDays(mondayOf(todayIst()), 7), signal }),
    [fetchHistory],
  );
  return usePolledData(fetcher, { intervalMs: 120000 });
}
