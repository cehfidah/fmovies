'use client';
import { useState } from 'react';

interface User { id: number; email: string; name: string }

interface UserAuthProps {
  onSuccess?: (user: User) => void;
  onClose?: () => void;
}

export default function UserAuth({ onSuccess, onClose }: UserAuthProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/user-login' : '/api/auth/register';
      const body = mode === 'login' ? { email, password } : { email, password, name };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
      onSuccess?.(data.user);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="relative w-full max-w-sm rounded-xl bg-[#161b22] border border-[#30363d] p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {onClose && (
          <button onClick={onClose} className="absolute top-3 right-4 text-gray-400 hover:text-white text-xl">&times;</button>
        )}
        <h2 className="text-xl font-bold text-white mb-4">
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </h2>
        <form onSubmit={submit} className="space-y-3">
          {mode === 'register' && (
            <input
              type="text" placeholder="Your name (optional)" value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-lg bg-[#0b0c0e] border border-[#30363d] px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00acc1]"
              maxLength={100}
            />
          )}
          <input
            type="email" placeholder="Email address" value={email}
            onChange={e => setEmail(e.target.value)} required
            className="w-full rounded-lg bg-[#0b0c0e] border border-[#30363d] px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00acc1]"
            maxLength={255}
          />
          <input
            type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)} required
            className="w-full rounded-lg bg-[#0b0c0e] border border-[#30363d] px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00acc1]"
            maxLength={200}
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full bg-[#00acc1] hover:bg-[#0097a7] text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-400">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            className="text-[#00acc1] hover:underline"
          >
            {mode === 'login' ? 'Register' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}
