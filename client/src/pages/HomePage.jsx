// Student home: greeting + exam countdown → link messages/requests → solo banner →
// study card → today → what's shared.
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useStudySession } from '../hooks/useStudySession.js';
import { useSubjects } from '../hooks/useSubjects.js';
import { usePolledData } from '../hooks/usePolledData.js';
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
import SoloBanner from '../components/home/SoloBanner.jsx';
import LinkRequestCard from '../components/links/LinkRequestCard.jsx';
import LinkNotices from '../components/links/LinkNotices.jsx';

export default function HomePage() {
  const { user } = useAuth();
  const study = useStudySession();
  const subjectsState = useSubjects();
  // Links re-check every 20s, so a new supporter request appears without a refresh.
  const links = usePolledData(listMyLinks, { intervalMs: 20000 });
  const settings = usePolledData(getSettings, { intervalMs: 300000 });
  const [editingSubjects, setEditingSubjects] = useState(false);

  const firstName = user.name.split(' ')[0];
  const loading = study.status === 'loading' || subjectsState.status === 'loading' || !settings.data;
  const failed = study.status === 'error' || subjectsState.status === 'error' || settings.status === 'error';

  const supporters = links.data?.supporters ?? null;
  const requests = links.data?.requests ?? [];
  const hasSupporter = Boolean(supporters?.length);
  const locked = Boolean(settings.data?.requireSupporterBeforeStudy) && !hasSupporter;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          {greetingForNow()}, {firstName} 👋
        </h1>
        {settings.data && <ExamCountdown examName={settings.data.examName} examDate={settings.data.examDate} />}
      </div>

      {links.data && (
        <LinkNotices
          role="student"
          notices={links.data.notices}
          onDismissed={(id) => links.setData((d) => ({ ...d, notices: d.notices.filter((n) => n.linkId !== id) }))}
        />
      )}
      {requests.map((request) => (
        <LinkRequestCard key={request.linkId} request={request} onDone={links.refresh} />
      ))}
      {supporters && !hasSupporter && requests.length === 0 && !locked && <SoloBanner />}

      {loading ? (
        <Card className="flex items-center justify-center gap-3 py-12 text-slate-600">
          <Spinner className="h-5 w-5 text-indigo-600" /> Loading your day…
        </Card>
      ) : failed ? (
        <Card className="space-y-3 text-center">
          <p className="text-slate-700">{study.error || subjectsState.error || 'Could not load your settings.'}</p>
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
          <StudyPanel study={study} subjects={subjectsState.subjects} locked={locked} onEditSubjects={() => setEditingSubjects(true)} />
          {editingSubjects && !study.activeSession && (
            <SubjectEditor subjectsState={subjectsState} onClose={() => setEditingSubjects(false)} />
          )}
          <TodayCard sessions={study.todaySessions} clockOffsetMs={study.clockOffsetMs} />
        </>
      )}

      <TransparencyNote supporters={supporters} />
    </div>
  );
}
