import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { getFormErrors } from '../api/client.js';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import TextField from '../components/ui/TextField.jsx';
import Button from '../components/ui/Button.jsx';
import Alert from '../components/ui/Alert.jsx';
import RolePicker from '../components/RolePicker.jsx';

export default function SignupPage() {
  const { signup } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '', role: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    // Quick friendly check in the browser. The SERVER still validates everything (never trust the client).
    if (!form.role) {
      setFieldErrors({ role: 'Please choose whether you are a student or a supporter' });
      return;
    }

    setSubmitting(true);
    setError('');
    setFieldErrors({});
    try {
      await signup(form); // on success, PublicOnlyRoute redirects to the right home screen
    } catch (err) {
      const { formError, fieldErrors: errorsByField } = getFormErrors(err);
      setError(formError);
      setFieldErrors(errorsByField);
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="It takes less than a minute."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-accent hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Alert tone="error">{error}</Alert>
        <RolePicker value={form.role} onChange={(role) => setField('role', role)} error={fieldErrors.role} />
        <TextField
          label="Your name"
          name="name"
          autoComplete="name"
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          error={fieldErrors.name}
          maxLength={50}
          required
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={form.email}
          onChange={(e) => setField('email', e.target.value)}
          error={fieldErrors.email}
          required
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters."
          value={form.password}
          onChange={(e) => setField('password', e.target.value)}
          error={fieldErrors.password}
          maxLength={72}
          required
        />
        {form.role === 'student' && (
          <Alert tone="info">
            🔒 Your data is private. Nobody can see it unless <strong>you</strong> share an invite code with them.
          </Alert>
        )}
        <Button type="submit" size="lg" loading={submitting} className="w-full">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
