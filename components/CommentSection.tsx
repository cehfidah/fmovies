'use client';
import { useState, useEffect, useCallback } from 'react';
import UserAuth from './UserAuth';

interface Comment { id: number; author: string; content: string; created_at: string }
interface User { id: number; email: string; name: string }

export default function CommentSection({ tmdbId }: { tmdbId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [status, setStatus] = useState('');

  const loadComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?tmdb_id=${tmdbId}`);
      const data = await res.json();
      if (data.comments) setComments(data.comments);
    } catch { /* ignore */ }
  }, [tmdbId]);

  useEffect(() => { loadComments(); }, [loadComments]);

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setStatus('');
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tmdb_id: tmdbId,
          content: text.trim(),
          guest_name: user ? undefined : (guestName || 'Anonymous'),
        }),
      });
      if (res.ok) {
        setText('');
        setStatus('Comment posted!');
        loadComments();
      } else {
        const d = await res.json();
        setStatus(d.error || 'Failed to post');
      }
    } catch {
      setStatus('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  return (
    <section className="mt-10">
      {showAuth && (
        <UserAuth
          onSuccess={u => { setUser(u); setShowAuth(false); }}
          onClose={() => setShowAuth(false)}
        />
      )}

      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-[#00acc1]">💬</span> Comments
        <span className="text-sm font-normal text-gray-400">({comments.length})</span>
      </h3>

      {/* Comment form */}
      <form onSubmit={submitComment} className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-[#00acc1] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user ? (user.name || user.email)[0].toUpperCase() : '?'}
          </div>
          <div className="flex-1">
            {user ? (
              <span className="text-sm text-gray-300">{user.name || user.email}</span>
            ) : (
              <div className="flex gap-2 flex-wrap">
                <input
                  type="text" placeholder="Your name (optional)" value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  className="flex-1 min-w-0 bg-[#0b0c0e] border border-[#30363d] rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00acc1]"
                  maxLength={80}
                />
                <button type="button" onClick={() => setShowAuth(true)}
                  className="text-xs text-[#00acc1] hover:underline whitespace-nowrap">
                  Sign in
                </button>
              </div>
            )}
          </div>
        </div>
        <textarea
          value={text} onChange={e => setText(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
          maxLength={2000}
          className="w-full bg-[#0b0c0e] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00acc1] resize-none"
        />
        <div className="flex items-center justify-between mt-2">
          {status && <span className="text-xs text-[#00acc1]">{status}</span>}
          <div className="ml-auto">
            <button type="submit" disabled={loading || !text.trim()}
              className="bg-[#00acc1] hover:bg-[#0097a7] text-white text-sm font-semibold px-5 py-1.5 rounded-lg transition disabled:opacity-50">
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </form>

      {/* Comment list */}
      <div className="space-y-3">
        {comments.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-6">Be the first to comment!</p>
        )}
        {comments.map(c => (
          <div key={c.id} className="flex gap-3 bg-[#161b22] border border-[#30363d] rounded-xl p-4">
            <div className="w-9 h-9 rounded-full bg-[#1c2128] flex items-center justify-center text-[#00acc1] font-bold text-sm flex-shrink-0">
              {c.author[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-white">{c.author}</span>
                <span className="text-xs text-gray-500">{timeAgo(c.created_at)}</span>
              </div>
              <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">{c.content}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
