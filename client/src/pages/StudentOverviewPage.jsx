// Supporter's READ-ONLY view of one student (matches the design): live status, today vs goal,
// last session, this week, Telegram, "Send a boost" (coming soon) and the full history.
// If the link ended (e.g. stopped following on another device), the server answers 404 and we show a friendly message.
import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getStudentHistory, getStudentOverview } from '../api/supporter.js';
import { endLink } from '../api/links.js';
import { getErrorMessage } from '../api/client.js';
import { usePolledData } from '../hooks/usePolledData.js';
import { useWeekHistory } from '../hooks/useWeekHistory.js';
import { buildWeekStats } from '../utils/week.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Icon from '../components/ui/Icon.jsx';
import HistoryList from '../components/history/HistoryList.jsx';
import StudentHeader from '../components/supporter/StudentHeader.jsx';
import TodayProgressCard from '../components/supporter/TodayProgressCard.jsx';
import WeekCard from '../components/supporter/WeekCard.jsx';
import TelegramUpdatesCard from '../components/supporter/TelegramUpdatesCard.jsx';
import SendBoostCard from '../components/supporter/SendBoostCard.jsx';

export default function StudentOverviewPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const fetchOverview = useCallback((options) => getStudentOverview(studentId, options), [studentId]);
  const fetchHistory = useCallback((options) => getStudentHistory(studentId, options), [studentId]);
  const { data, receivedAt, status, error, refresh } = usePolledData(fetchOverview, { intervalMs: 20000 });
  const weekHistory = useWeekHistory(fetchHistory);
  const [removing, setRemoving] = useState(false);

  const student = data?.student;
  const week = useMemo(
    () => (weekHistory.data && student ? buildWeekStats(weekHistory.data.days, { today: student.date, goalMinutes: student.dailyGoalMinutes }) : null),
    [weekHistory.data, student],
  );

  async function stopFollowing() {
    if (!window.confirm(`Stop following ${student.name}? You'll need a new invite code to link again.`)) return;
    setRemoving(true);
    try {
      await endLink(student.linkId);
      navigate('/supporter', { replace: true });
    } catch (err) {
      setRemoving(false);
      window.alert(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-4">
      <Link to="/supporter" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-accent">
        <Icon name="back" className="h-4 w-4" /> Students
      </Link>

      {status === 'loading' && (
        <Card className="flex items-center justify-center gap-3 py-10 text-muted">
          <Spinner className="h-5 w-5 text-accent" /> Loading…
        </Card>
      )}

      {status === 'error' && (
        <Card className="space-y-3 text-center">
          {error?.response?.status === 404 ? (
            <p className="text-ink-soft">This student isn&apos;t available. The link may have ended.</p>
          ) : (
            <>
              <p className="text-ink-soft">{getErrorMessage(error)}</p>
              <Button onClick={refresh}>Try again</Button>
            </>
          )}
        </Card>
      )}

      {status === 'ready' && (
        <>
          <StudentHeader student={student} serverTime={data.serverTime} receivedAt={receivedAt} />
          <TodayProgressCard student={student} serverTime={data.serverTime} receivedAt={receivedAt} />
          {week ? (
            <WeekCard week={week} goalMinutes={student.dailyGoalMinutes} />
          ) : (
            weekHistory.status === 'loading' && (
              <Card className="flex items-center justify-center gap-3 py-8 text-muted">
                <Spinner className="h-5 w-5 text-accent" /> Loading the week…
              </Card>
            )
          )}
          <TelegramUpdatesCard linkId={student.linkId} connected={student.telegramConnected} onChange={refresh} />
          <SendBoostCard studentName={student.name} />

          <section className="space-y-3 pt-2" aria-label="History">
            <h2 className="px-1 text-lg font-bold text-ink">History</h2>
            <HistoryList fetchPage={fetchHistory} emptyText={`${student.name} hasn't recorded any sessions yet.`} />
          </section>

          <p className="flex gap-2 px-1 text-sm text-muted">
            <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              You only see study time, subjects and goal progress, read-only. {student.name} shared their invite code with
              you, and you can stop following any time.
            </span>
          </p>
          <div className="text-center">
            <Button variant="ghost" onClick={stopFollowing} loading={removing}>
              Stop following {student.name}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
