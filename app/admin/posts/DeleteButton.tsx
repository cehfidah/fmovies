'use client';

export default function DeleteButton({ id }: { id: number }) {
  return (
    <button
      onClick={async () => {
        if (!confirm('Delete this post?')) return;
        const r = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
        if (r.ok) location.reload();
      }}
      style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '1rem', padding: 0 }}
      title="Delete"
    >
      <i className="uil uil-trash-alt" />
    </button>
  );
}
