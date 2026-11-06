import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { getFormErrors } from '../api/client.js';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import TextField from '../components/ui/TextField.jsx';
import Button from '../components/ui/Button.jsx';
import Alert from '../components/ui/Alert.jsx';

export default function LoginPage() {
  const { login } = useAuth();

  // "Controlled" inputs: React state is the single source of truth for what's typed.
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined })); // clear that field's error as they type
  }

  async function handleSubmit(event) {
    event.preventDefault(); // stop the browser's default full-page form submit
    setSubmitting(true);
    setError('');
    setFieldErrors({});
    try {
      // On success the user is stored in AuthProvider, and PublicOnlyRoute redirects us
      // (back to the page we wanted, or to our home screen). Nothing else to do here.
      await login(form);
    } catch (err) {
      const { formError, fieldErrors: errorsByField } = getFormErrors(err);
      setError(formError);
      setFieldErrors(errorsByField);
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back 👋"
      subtitle="Log in to continue."
      footer={
        <>
          New here?{' '}
          <Link to="/signup" className="font-semibold text-accent hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Alert tone="error">{error}</Alert>
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={form.email}
          onChange={updateField}
          error={fieldErrors.email}
          required
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={updateField}
          error={fieldErrors.password}
          required
        />
        <Button type="submit" size="lg" loading={submitting} className="w-full">
          Log in
        </Button>
      </form>
    </AuthLayout>
  );
}
