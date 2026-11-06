import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-5xl">🧭</p>
      <h1 className="text-xl font-bold">Page not found</h1>
      <Link to="/" className="font-semibold text-accent hover:underline">
        Go to the home screen
      </Link>
    </main>
  );
}
