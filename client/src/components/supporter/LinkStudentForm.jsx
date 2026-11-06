// Supporter enters the invite code the student created → sends a REQUEST the student must accept.
import { useState } from 'react';
import { redeemInvite } from '../../api/links.js';
import { getFormErrors } from '../../api/client.js';
import Button from '../ui/Button.jsx';
import Alert from '../ui/Alert.jsx';
import TextField from '../ui/TextField.jsx';

export default function LinkStudentForm({ onRequested, onSubmitting }) {
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    onSubmitting?.(); // lets the page clear an old "Request sent" message
    setSubmitting(true);
    setError('');
    try {
      const result = await redeemInvite(code); // { linkId, status: 'pending', telegramConnected, student }
      setCode('');
      onRequested(result);
    } catch (err) {
      const { formError, fieldErrors } = getFormErrors(err);
      setError(fieldErrors.code || formError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <div className="flex items-end gap-2">
        <TextField
          label="Invite code"
          name="code"
          placeholder="ABCD-EFGH"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={12}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="min-w-0 flex-1"
        />
        <Button type="submit" loading={submitting} disabled={!code.trim()}>
          Send request
        </Button>
      </div>
      <Alert tone="error">{error}</Alert>
    </form>
  );
}
