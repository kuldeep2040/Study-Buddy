// Student settings. "Your supporters" is always visible (transparency); everything else is a
// collapsible section with a one-line summary, so the page stays short. Log out is in the top bar.
// Links re-check every 15s, so a newly linked supporter appears here by itself.
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { listMyLinks } from '../api/links.js';
import { getSettings } from '../api/settings.js';
import { getErrorMessage } from '../api/client.js';
import { usePolledData } from '../hooks/usePolledData.js';
import { useSubjects } from '../hooks/useSubjects.js';
import { useTheme } from '../hooks/useTheme.js';
import { daysUntil, formatDuration } from '../utils/format.js';
import { prettyCode } from '../utils/share.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import CollapsibleCard from '../components/ui/CollapsibleCard.jsx';
import LinkNotices from '../components/links/LinkNotices.jsx';
import LinkedSupportersList from '../components/settings/LinkedSupportersList.jsx';
import InviteCodeCard from '../components/settings/InviteCodeCard.jsx';
import ExamGoalSettings from '../components/settings/ExamGoalSettings.jsx';
import StudyRulesSettings from '../components/settings/StudyRulesSettings.jsx';
import SharingInfo from '../components/settings/SharingInfo.jsx';
import AppearanceSettings from '../components/settings/AppearanceSettings.jsx';
import SubjectEditor from '../components/study/SubjectEditor.jsx';

const THEME_LABEL = { auto: 'Auto (follows your device)', light: 'Light', dark: 'Dark' };

function examSummary({ examName, examDate, dailyGoalMinutes }) {
  const days = examDate ? daysUntil(examDate) : null;
  const when = days === null ? 'no date' : days > 0 ? `${days} days left` : days === 0 ? 'today' : 'date passed';
  return `${examName || 'No exam set'} · ${when} · ${formatDuration(dailyGoalMinutes)} a day`;
}

export default function SettingsPage() {
  const links = usePolledData(listMyLinks, { intervalMs: 15000 });
  const settings = usePolledData(getSettings, { intervalMs: 300000 });
  const subjectsState = useSubjects();
  const { preference } = useTheme();
  const location = useLocation();
  // Came from the profile menu's "Invite a supporter": open that section and scroll to it.
  const openInvite = location.state?.open === 'invite';
  const ready = links.status === 'ready' && settings.status === 'ready';

  useEffect(() => {
    if (openInvite && ready) document.getElementById('invite')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [openInvite, ready, location.key]);

  if (links.status === 'loading' || settings.status === 'loading') {
    return (
      <Card className="flex items-center justify-center gap-3 py-10 text-muted">
        <Spinner className="h-5 w-5 text-accent" /> Loading…
      </Card>
    );
  }
  if (links.status === 'error' || settings.status === 'error') {
    return (
      <Card className="space-y-3 text-center">
        <p className="text-ink-soft">{getErrorMessage(links.error || settings.error)}</p>
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

  const { supporters, pendingInvite } = links.data;
  const subjects = subjectsState.subjects ?? [];

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold tracking-tight text-ink">Settings</h1>

      <LinkNotices
        role="student"
        notices={links.data.notices}
        onDismissed={(id) => links.setData((d) => ({ ...d, notices: d.notices.filter((n) => n.linkId !== id) }))}
      />
      <LinkedSupportersList supporters={supporters} />

      <CollapsibleCard
        id="invite"
        key={`invite-${location.key}`} // a fresh visit from the menu re-opens it, even if you were already here
        className="scroll-mt-20"
        title="Invite a supporter"
        summary={pendingInvite ? `Code ${prettyCode(pendingInvite.code)} is ready to share` : 'Create a one-time code'}
        defaultOpen={supporters.length === 0 || openInvite}
      >
        <p className="mb-3 text-sm text-muted">
          They sign up as a <strong>supporter</strong> and enter your code. They&apos;re linked right away.
        </p>
        <InviteCodeCard
          pendingInvite={pendingInvite}
          examName={settings.data.examName}
          onInviteChange={(invite) => links.setData((d) => ({ ...d, pendingInvite: invite }))}
          autoCreate={openInvite}
        />
      </CollapsibleCard>

      <CollapsibleCard title="What your supporters can see" summary="Study time, goal progress and history · read-only">
        <SharingInfo />
      </CollapsibleCard>

      <CollapsibleCard title="Exam & daily goal" summary={examSummary(settings.data)}>
        <ExamGoalSettings settings={settings.data} onSaved={settings.setData} />
      </CollapsibleCard>

      <CollapsibleCard title="Study rules" summary={`Require a supporter before studying: ${settings.data.requireSupporterBeforeStudy ? 'on' : 'off'}`}>
        <StudyRulesSettings settings={settings.data} onSaved={settings.setData} />
      </CollapsibleCard>

      <CollapsibleCard title="Your subjects" summary={subjects.length ? `${subjects.length} · ${subjects.map((s) => s.name).join(', ')}` : 'Loading…'}>
        {subjectsState.status === 'ready' && <SubjectEditor subjectsState={subjectsState} bare />}
      </CollapsibleCard>

      <CollapsibleCard title="Appearance" summary={THEME_LABEL[preference]}>
        <AppearanceSettings />
      </CollapsibleCard>
    </div>
  );
}
