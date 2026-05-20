import { redirect, notFound } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { getPostById } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import PostForm from '@/components/admin/PostForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: Props) {
  const user = await getAuthUser();
  if (!user) redirect('/admin/login');

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) notFound();

  const post = await getPostById(id).catch(() => null) as import('@/types').Post | null;
  if (!post) notFound();

  return (
    <AdminShell user={user}>
      <div style={{ maxWidth: '900px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>Edit Post</h1>
        <PostForm mode="edit" post={post} />
      </div>
    </AdminShell>
  );
}
