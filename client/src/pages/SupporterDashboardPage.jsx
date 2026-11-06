// Supporter home: messages ("X declined / removed you") → requests still waiting → linked students
// (live) → link another student. Re-checks every 20s and whenever the tab becomes visible.
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { usePolledData } from '../hooks/usePolledData.js';
import { getSupporterDashboard } from '../api/supporter.js';
import { getErrorMessage } from '../api/client.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Alert from '../components/ui/Alert.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import LinkNotices from '../components/links/LinkNotices.jsx';
import LinkStudentForm from '../components/supporter/LinkStudentForm.jsx';
import StudentCard from '../components/supporter/StudentCard.jsx';
import WaitingCard from '../components/supporter/WaitingCard.jsx';

export default function SupporterDashboardPage() {
  const { user } = useAuth();
  const { data, receivedAt, status, error, refresh, setData } = usePolledData(getSupporterDashboard, { intervalMs: 20000 });
  const [requestSent, setRequestSent] = useState('');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hi {user.name.split(' ')[0]} 🤝</h1>
        <p className="mt-1 text-slate-600">Cheer on your students. You see what they choose to share.</p>
      </div>

      {status === 'loading' && (
        <Card className="flex items-center justify-center gap-3 py-10 text-slate-600">
          <Spinner className="h-5 w-5 text-indigo-600" /> Loading…
        </Card>
      )}

      {status === 'error' && (
        <Card className="space-y-3 text-center">
          <p className="text-slate-700">{getErrorMessage(error)}</p>
          <Button onClick={refresh}>Try again</Button>
        </Card>
      )}

      {status === 'ready' && (
        <>
          <LinkNotices
            role="supporter"
            notices={data.notices}
            onDismissed={(id) => setData((d) => ({ ...d, notices: d.notices.filter((n) => n.linkId !== id) }))}
          />
          {data.waiting.map((request) => (
            <WaitingCard key={request.linkId} request={request} onChanged={refresh} />
          ))}
          <section aria-label="My students" className="space-y-3">
            {data.students.length === 0 && data.waiting.length === 0 && (
              <Card>
                <p className="font-medium text-slate-900">No students linked yet</p>
                <p className="mt-1 text-sm text-slate-600">Enter a student&apos;s invite code below to send them a request.</p>
              </Card>
            )}
            {data.students.map((student) => (
              <StudentCard key={student.linkId} student={student} serverTime={data.serverTime} receivedAt={receivedAt} />
            ))}
          </section>
        </>
      )}

      <Card>
        <h2 className="font-semibold text-slate-900">{data?.students.length ? 'Link another student' : 'Link a student'}</h2>
        <p className="mt-1 mb-3 text-sm text-slate-600">
          Ask them to open <strong>Settings → Invite a supporter</strong> in their app and send you the code.
        </p>
        <LinkStudentForm
          onSubmitting={() => setRequestSent('')}
          onRequested={(result) => {
            setRequestSent(`Request sent to ${result.student.name}. They need to accept it in their app.`);
            refresh();
          }}
        />
        <Alert tone="success" className="mt-3">
          {requestSent}
        </Alert>
      </Card>

      <p className="text-center text-xs text-slate-500">This is a read-only view. Students can remove the link at any time.</p>
    </div>
  );
}
