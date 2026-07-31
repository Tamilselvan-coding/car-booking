import Link from 'next/link';

export function NotFound() {
  return (
    <div className="reveal-up mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center sm:px-6">
      <p className="text-sm font-black uppercase tracking-wide text-amber-600">404</p>
      <h1 className="mt-2 text-3xl font-black tracking-normal">Page not found</h1>
      <p className="mt-3 text-sm font-medium leading-6 text-zinc-600">
        The page you are looking for has moved or does not exist. Try the homepage or contact us directly.
      </p>
      <Link href="/" className="shine-button mt-6 inline-flex h-12 items-center rounded-lg bg-zinc-950 px-6 text-sm font-black text-white">
        Back to Home
      </Link>
    </div>
  );
}
