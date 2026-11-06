// Day-by-day study history, newest first, with "Show older days".
// `fetchPage({ before, signal })` loads one page — the student's own or a linked student's,
// so both sides always see exactly the same thing.
import { useEffect, useState } from 'react';
import { getErrorMessage } from '../../api/client.js';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Spinner from '../ui/Spinner.jsx';
import HistoryDay from './HistoryDay.jsx';

export default function HistoryList({ fetchPage, emptyText = 'No study sessions yet.' }) {
  const [days, setDays] = useState([]);
  const [nextBefore, setNextBefore] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [error, setError] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);

  // First page
  useEffect(() => {
    const controller = new AbortController();
    fetchPage({ signal: controller.signal })
      .then((page) => {
        if (controller.signal.aborted) return;
        setDays(page.days);
        setNextBefore(page.nextBefore);
        setStatus('ready');
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(getErrorMessage(err));
        setStatus('error');
      });
    return () => controller.abort();
  }, [fetchPage]);

  async function loadOlder() {
    setLoadingMore(true);
    try {
      const page = await fetchPage({ before: nextBefore });
      setDays((current) => [...current, ...page.days]);
      setNextBefore(page.nextBefore);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  }

  if (status === 'loading') {
    return (
      <Card className="flex items-center justify-center gap-3 py-10 text-muted">
        <Spinner className="h-5 w-5 text-accent" /> Loading history…
      </Card>
    );
  }
  if (status === 'error') return <Card className="text-center text-ink-soft">{error}</Card>;

  return (
    <div className="space-y-3">
      {days.length === 0 && !nextBefore && <Card className="text-center text-muted">{emptyText}</Card>}
      {days.length === 0 && nextBefore && <p className="text-sm text-muted">No sessions in the last 2 weeks.</p>}
      {days.map((day) => (
        <HistoryDay key={day.date} day={day} />
      ))}
      {nextBefore && (
        <Button variant="secondary" className="w-full" loading={loadingMore} onClick={loadOlder}>
          Show older days
        </Button>
      )}
      {error && status === 'ready' && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
