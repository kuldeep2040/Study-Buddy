// The study area on the home screen. Three states:
//   running → live timer ring + Pause/Resume/End + full screen (see RunningSession)
//   locked  → he turned on "require a supporter" and none is linked yet (no Start button)
//   idle    → subject chips + big round "Start Studying" button + Normal/Pomodoro switch
//             (the chosen mode is remembered on this device)
// After Stop, a summary card shows the session, today's total and % of the daily goal.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client.js';
import Card from '../ui/Card.jsx';
import Alert from '../ui/Alert.jsx';
import Spinner from '../ui/Spinner.jsx';
import SegmentedControl from '../ui/SegmentedControl.jsx';
import SubjectPicker from './SubjectPicker.jsx';
import RunningSession from './RunningSession.jsx';
import SessionSummaryCard from './SessionSummaryCard.jsx';
import { askNotificationPermission, unlockSound } from '../../utils/alerts.js';

const LAST_SUBJECT_KEY = 'studybuddy:lastSubject';
const LAST_MODE_KEY = 'studybuddy:lastMode';
const MODES = [
  { value: 'normal', label: 'Normal timer' },
  { value: 'pomodoro', label: 'Pomodoro' },
];

// localStorage can throw (private mode, blocked storage) — it's only a convenience, so ignore errors.
function readSaved(key) {
  try {
    return localStorage.getItem(key) || '';
  } catch {
    return '';
  }
}
function save(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

/** `settings` = the student's settings (Pomodoro lengths + sound), or null while loading. */
export default function StudyPanel({ study, subjects, settings, locked, onEditSubjects }) {
  const [chosen, setChosen] = useState(() => readSaved(LAST_SUBJECT_KEY));
  const [mode, setMode] = useState(() => (readSaved(LAST_MODE_KEY) === 'pomodoro' ? 'pomodoro' : 'normal'));
  const pomodoro = settings?.pomodoro;
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null); // result of the last Stop

  // If the remembered subject was renamed/deleted, fall back to the first subject.
  const selectedSubject = subjects.some((s) => s.name === chosen) ? chosen : (subjects[0]?.name ?? '');

  async function handleStart() {
    setError('');
    setSummary(null);
    // Taps are the only moment browsers allow us to enable sound / ask about notifications.
    unlockSound();
    if (mode === 'pomodoro') askNotificationPermission();
    try {
      await study.start(selectedSubject, mode);
      save(LAST_SUBJECT_KEY, selectedSubject);
      save(LAST_MODE_KEY, mode);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  // Pause / Resume / "Start next round": errors (e.g. auto-stopped meanwhile) show above the timer.
  const run = (action) => async () => {
    setError('');
    try {
      await action();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  async function handleStop() {
    setError('');
    try {
      setSummary(await study.stop()); // { session, todayTotalMinutes, dailyGoalMinutes }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  let body;
  if (study.activeSession) {
    body = (
      <RunningSession
        session={study.activeSession}
        clockOffsetMs={study.clockOffsetMs}
        busy={study.busy}
        soundEnabled={settings?.soundEnabled ?? true}
        onPause={run(study.pause)}
        onResume={run(study.resume)}
        onStop={handleStop}
        onServerCheck={study.refresh}
      />
    );
  } else if (locked) {
    body = (
      <Card className="space-y-3 text-center" data-testid="study-locked">
        <p className="text-3xl">🔒</p>
        <p className="font-semibold text-ink">Link a supporter to start studying</p>
        <p className="text-sm text-muted">
          You turned on <strong>&ldquo;Require a supporter before studying&rdquo;</strong>. Invite someone, or turn it off
          in Settings.
        </p>
        <Link to="/settings" className="inline-flex min-h-11 items-center rounded-2xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-strong">
          Go to Settings
        </Link>
      </Card>
    );
  } else {
    body = (
      <div className="space-y-4">
        <SubjectPicker subjects={subjects} value={selectedSubject} onChange={setChosen} onEdit={onEditSubjects} disabled={study.busy} />

        {/* The big round button, with a soft halo around it like the design. */}
        <div className="flex justify-center">
          <div className="rounded-full bg-accent-soft/30 p-2.5">
            <button
              type="button"
              onClick={handleStart}
              disabled={!selectedSubject || study.busy}
              className="flex h-36 w-36 flex-col items-center justify-center gap-1 rounded-full bg-brand text-white shadow-lg shadow-brand/30 transition hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand active:scale-[0.98] disabled:opacity-60"
            >
              {study.busy ? (
                <Spinner className="h-7 w-7" />
              ) : (
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden="true">
                  <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                </svg>
              )}
              <span className="text-lg leading-tight font-bold">
                Start
                <br />
                Studying
              </span>
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <SegmentedControl label="Timer mode" options={MODES} value={mode} onChange={setMode} size="sm" className="mx-auto max-w-xs" />
          {mode === 'pomodoro' && pomodoro && (
            <p className="text-center text-xs text-muted">
              {pomodoro.focusMinutes} min focus · {pomodoro.shortBreakMinutes} min break · long break every {pomodoro.roundsBeforeLongBreak} rounds ·{' '}
              <Link to="/settings" className="font-semibold text-accent">
                change
              </Link>
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {summary && !study.activeSession && <SessionSummaryCard summary={summary} onClose={() => setSummary(null)} />}
      <Alert tone="error">{error}</Alert>
      {body}
    </div>
  );
}
