// Student home (matches the design): greeting + streak/exam chips → link messages → solo banner →
// daily-goal ring → subjects + big Start button → today's sessions → what's shared.
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useStudySession } from '../hooks/useStudySession.js';
import { useSubjects } from '../hooks/useSubjects.js';
import { usePolledData } from '../hooks/usePolledData.js';
import { useTodayTotal } from '../hooks/useTodayTotal.js';
import { listMyLinks } from '../api/links.js';
import { getSettings } from '../api/settings.js';
import { greetingForNow } from '../utils/format.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import StudyPanel from '../components/study/StudyPanel.jsx';
import SubjectEditor from '../components/study/SubjectEditor.jsx';
import TodayCard from '../components/study/TodayCard.jsx';
import TransparencyNote from '../components/TransparencyNote.jsx';
import ExamCountdown from '../components/home/ExamCountdown.jsx';
import StreakChip from '../components/home/StreakChip.jsx';
import GoalCard from '../components/home/GoalCard.jsx';
import SoloBanner from '../components/home/SoloBanner.jsx';
import LinkNotices from '../components/links/LinkNotices.jsx';

export default function HomePage() {
  const { user } = useAuth();
  const study = useStudySession();
  const subjectsState = useSubjects();
  // Links re-check every 20s, so a newly linked supporter appears without a refresh.
  const links = usePolledData(listMyLinks, { intervalMs: 20000 });
  const settings = usePolledData(getSettings, { intervalMs: 300000 });
  const [editingSubjects, setEditingSubjects] = useState(false);
  const today = useTodayTotal(study.todaySessions, study.clockOffsetMs);

  const firstName = user.name.split(' ')[0];
  const loading = study.status === 'loading' || subjectsState.status === 'loading' || !settings.data;
  const failed = study.status === 'error' || subjectsState.status === 'error' || settings.status === 'error';

  const supporters = links.data?.supporters ?? null;
  const hasSupporter = Boolean(supporters?.length);
  const locked = Boolean(settings.data?.requireSupporterBeforeStudy) && !hasSupporter;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          {greetingForNow()}, {firstName}
        </h1>
        <div className="flex flex-wrap gap-2">
          <StreakChip />
          {settings.data && <ExamCountdown examName={settings.data.examName} examDate={settings.data.examDate} />}
        </div>
      </div>

      {links.data && (
        <LinkNotices
          role="student"
          notices={links.data.notices}
          onDismissed={(id) => links.setData((d) => ({ ...d, notices: d.notices.filter((n) => n.linkId !== id) }))}
        />
      )}
      {supporters && !hasSupporter && !locked && <SoloBanner />}

      {loading ? (
        <Card className="flex items-center justify-center gap-3 py-12 text-muted">
          <Spinner className="h-5 w-5 text-accent" /> Loading your day…
        </Card>
      ) : failed ? (
        <Card className="space-y-3 text-center">
          <p className="text-ink-soft">{study.error || subjectsState.error || 'Could not load your settings.'}</p>
          <Button
            onClick={() => {
              if (study.status === 'error') study.retry();
              if (subjectsState.status === 'error') subjectsState.retry();
              settings.refresh();
            }}
          >
            Try again
          </Button>
        </Card>
      ) : (
        <>
          <GoalCard totalMinutes={today.totalMinutes} goalMinutes={settings.data.dailyGoalMinutes} />
          <StudyPanel study={study} subjects={subjectsState.subjects} locked={locked} onEditSubjects={() => setEditingSubjects(true)} />
          {editingSubjects && !study.activeSession && (
            <SubjectEditor subjectsState={subjectsState} onClose={() => setEditingSubjects(false)} />
          )}
          <TodayCard sessions={study.todaySessions} now={today.now} />
        </>
      )}

      <TransparencyNote supporters={supporters} />
    </div>
  );
}
