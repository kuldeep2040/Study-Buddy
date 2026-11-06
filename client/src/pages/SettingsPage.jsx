// Student settings: supporters (+ requests), invite, exam & goal, study rule, subjects, what's shared.
// Links re-check every 15s, so a new request appears here by itself.
import { listMyLinks } from '../api/links.js';
import { getSettings } from '../api/settings.js';
import { getErrorMessage } from '../api/client.js';
import { usePolledData } from '../hooks/usePolledData.js';
import { useSubjects } from '../hooks/useSubjects.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import LinkNotices from '../components/links/LinkNotices.jsx';
import LinkedSupportersList from '../components/settings/LinkedSupportersList.jsx';
import InviteCodeCard from '../components/settings/InviteCodeCard.jsx';
import ExamGoalCard from '../components/settings/ExamGoalCard.jsx';
import StudyRulesCard from '../components/settings/StudyRulesCard.jsx';
import SharingInfoCard from '../components/settings/SharingInfoCard.jsx';
import SubjectEditor from '../components/study/SubjectEditor.jsx';

export default function SettingsPage() {
  const links = usePolledData(listMyLinks, { intervalMs: 15000 });
  const settings = usePolledData(getSettings, { intervalMs: 300000 });
  const subjectsState = useSubjects();

  if (links.status === 'loading' || settings.status === 'loading') {
    return (
      <Card className="flex items-center justify-center gap-3 py-10 text-slate-600">
        <Spinner className="h-5 w-5 text-indigo-600" /> Loading…
      </Card>
    );
  }
  if (links.status === 'error' || settings.status === 'error') {
    return (
      <Card className="space-y-3 text-center">
        <p className="text-slate-700">{getErrorMessage(links.error || settings.error)}</p>
        <Button
          onClick={() => {
            links.refresh();
            settings.refresh();
          }}
        >
          Try again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      <LinkNotices
        role="student"
        notices={links.data.notices}
        onDismissed={(id) => links.setData((d) => ({ ...d, notices: d.notices.filter((n) => n.linkId !== id) }))}
      />
      <LinkedSupportersList supporters={links.data.supporters} requests={links.data.requests} onChanged={links.refresh} />

      <Card>
        <h2 className="font-semibold text-slate-900">Invite a supporter</h2>
        <p className="mt-1 mb-3 text-sm text-slate-600">
          They sign up as a <strong>supporter</strong> and enter your code. You then accept their request.
        </p>
        <InviteCodeCard
          pendingInvite={links.data.pendingInvite}
          examName={settings.data.examName}
          onInviteChange={(invite) => links.setData((d) => ({ ...d, pendingInvite: invite }))}
        />
      </Card>

      <SharingInfoCard />
      <ExamGoalCard settings={settings.data} onSaved={settings.setData} />
      <StudyRulesCard settings={settings.data} onSaved={settings.setData} />
      {subjectsState.status === 'ready' && <SubjectEditor subjectsState={subjectsState} />}
    </div>
  );
}
