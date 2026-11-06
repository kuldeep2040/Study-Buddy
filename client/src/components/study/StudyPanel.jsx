// The main card on the home screen. Three states:
//   running → live timer + Stop (see RunningSession)
//   locked  → he turned on "require a supporter" and none is linked yet (no Start button)
//   idle    → pick a subject + big "Start Studying" button
// After Stop, a summary card shows the session, today's total and % of the daily goal.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client.js';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Alert from '../ui/Alert.jsx';
import SubjectPicker from './SubjectPicker.jsx';
import RunningSession from './RunningSession.jsx';
import SessionSummaryCard from './SessionSummaryCard.jsx';

const LAST_SUBJECT_KEY = 'studybuddy:lastSubject';

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
      <div className="space-y-3 text-center" data-testid="study-locked">
        <p className="text-3xl">🔒</p>
        <p className="font-semibold text-slate-900">Link a supporter to start studying</p>
        <p className="text-sm text-slate-600">
          You turned on <strong>&ldquo;Require a supporter before studying&rdquo;</strong>. Invite someone, or turn it off
          in Settings.
        </p>
        <Link to="/settings" className="inline-flex min-h-11 items-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-700">
          Go to Settings
        </Link>
      </div>
    );
  } else {
    body = (
      <>
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-semibold text-slate-900">What are you studying?</h2>
          <button type="button" onClick={onEditSubjects} className="text-sm font-medium text-indigo-600 hover:underline">
            Edit subjects
          </button>
        </div>
        <SubjectPicker subjects={subjects} value={selectedSubject} onChange={setChosen} disabled={study.busy} />
        <Button size="lg" className="min-h-16 w-full text-lg" loading={study.busy} disabled={!selectedSubject} onClick={handleStart}>
          ▶ Start Studying
        </Button>
      </>
    );
  }

  return (
    <>
      {summary && !study.activeSession && <SessionSummaryCard summary={summary} onClose={() => setSummary(null)} />}
      <Card className="space-y-4">
        <Alert tone="error">{error}</Alert>
        {body}
      </Card>
    </>
  );
}
