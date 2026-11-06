// Supporter's READ-ONLY view of one student: live status, today, Telegram for this student, history.
// If the student removes the link, the server answers 404 and we show a friendly message.
import { useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getStudentHistory, getStudentOverview } from '../api/supporter.js';
import { endLink } from '../api/links.js';
import { getErrorMessage } from '../api/client.js';
import { usePolledData } from '../hooks/usePolledData.js';
import { useLiveStudentStats } from '../hooks/useLiveStudentStats.js';
import { formatClock, formatDuration, formatTime } from '../utils/format.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import TelegramConnect from '../components/supporter/TelegramConnect.jsx';
import HistoryList from '../components/history/HistoryList.jsx';

function LiveStatus({ student, serverTime, receivedAt }) {
  const { elapsedMs, totalMinutes } = useLiveStudentStats(student, serverTime, receivedAt);
  const active = student.activeSession;
  return (
    <>
      <Card className="text-center">
        {active ? (
          <>
            <p className="text-sm font-medium text-emerald-700">
              <span className="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" aria-hidden="true" />
              Studying {active.subject} now
            </p>
            <p className="mt-2 text-6xl font-bold tracking-tight text-slate-900 tabular-nums" role="timer">
              {formatClock(elapsedMs)}
            </p>
            <p className="mt-1 text-sm text-slate-500">Started at {formatTime(active.startTime)}</p>
          </>
        ) : (
          <p className="py-6 text-slate-600">Not studying right now</p>
        )}
      </Card>
      <Card>
        <p className="text-sm font-medium text-slate-500">Today</p>
        <p className="mt-1 text-4xl font-bold tracking-tight text-slate-900 tabular-nums">{formatDuration(totalMinutes)}</p>
      </Card>
    </>
  );
}

export default function StudentOverviewPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const fetchOverview = useCallback((options) => getStudentOverview(studentId, options), [studentId]);
  const fetchHistory = useCallback((options) => getStudentHistory(studentId, options), [studentId]);
  const { data, receivedAt, status, error, refresh } = usePolledData(fetchOverview, { intervalMs: 20000 });
  const [removing, setRemoving] = useState(false);

  async function stopFollowing() {
    if (!window.confirm(`Stop following ${data.student.name}? You'll need a new invite code to link again.`)) return;
    setRemoving(true);
    try {
      await endLink(data.student.linkId);
      navigate('/supporter', { replace: true });
    } catch (err) {
      setRemoving(false);
      window.alert(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-4">
      <Link to="/supporter" className="inline-block text-sm font-medium text-indigo-600 hover:underline">
        ← My students
      </Link>

      {status === 'loading' && (
        <Card className="flex items-center justify-center gap-3 py-10 text-slate-600">
          <Spinner className="h-5 w-5 text-indigo-600" /> Loading…
        </Card>
      )}

      {status === 'error' && (
        <Card className="space-y-3 text-center">
          {error?.response?.status === 404 ? (
            <p className="text-slate-700">This student isn&apos;t available. The link may have been removed.</p>
          ) : (
            <>
              <p className="text-slate-700">{getErrorMessage(error)}</p>
              <Button onClick={refresh}>Try again</Button>
            </>
          )}
        </Card>
      )}

      {status === 'ready' && (
        <>
          <div className="flex items-center gap-2">
            <h1 className="truncate text-2xl font-bold tracking-tight">{data.student.name}</h1>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">Read-only</span>
          </div>
          <LiveStatus student={data.student} serverTime={data.serverTime} receivedAt={receivedAt} />

          <Card>
            <h2 className="mb-3 font-semibold text-slate-900">Telegram updates</h2>
            <TelegramConnect linkId={data.student.linkId} connected={data.student.telegramConnected} onChange={refresh} />
          </Card>

          <section className="space-y-3">
            <h2 className="font-semibold text-slate-900">History</h2>
            <HistoryList fetchPage={fetchHistory} emptyText={`${data.student.name} hasn't recorded any sessions yet.`} />
          </section>

          <p className="text-center text-xs text-slate-500">
            You can see this because {data.student.name} shared it with you. They can remove the link at any time.
          </p>
          <div className="text-center">
            <Button variant="ghost" onClick={stopFollowing} loading={removing}>
              Stop following {data.student.name}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
