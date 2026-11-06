// The study area on the home screen. Three states:
//   running → big live timer circle + Stop (see RunningSession)
//   locked  → he turned on "require a supporter" and none is linked yet (no Start button)
//   idle    → subject chips + big round "Start Studying" button + Normal/Pomodoro switch
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

const LAST_SUBJECT_KEY = 'studybuddy:lastSubject';
const MODES = [
  { value: 'normal', label: 'Normal timer' },
  { value: 'pomodoro', label: 'Pomodoro', soon: true }, // Phase 2
];

// localStorage can throw (private mode, blocked storage) — it's only a convenience, so ignore errors.
function readLastSubject() {
  try {
    return localStorage.getItem(LAST_SUBJECT_KEY) || '';
  } catch {
    return '';
  }
}
function saveLastSubject(name) {
  try {
    localStorage.setItem(LAST_SUBJECT_KEY, name);
  } catch {
    /* ignore */
  }
}

export default function StudyPanel({ study, subjects, locked, onEditSubjects }) {
  const [chosen, setChosen] = useState(readLastSubject);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null); // result of the last Stop

  // If the remembered subject was renamed/deleted, fall back to the first subject.
  const selectedSubject = subjects.some((s) => s.name === chosen) ? chosen : (subjects[0]?.name ?? '');

  async function handleStart() {
    setError('');
    setSummary(null);
    try {
      await study.start(selectedSubject);
      saveLastSubject(selectedSubject);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

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
        onStop={handleStop}
        stopping={study.busy}
        onLimitReached={study.refresh}
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

        <SegmentedControl label="Timer mode" options={MODES} value="normal" size="sm" className="mx-auto max-w-xs" />
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
