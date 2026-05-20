import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import AdminShell from '@/components/admin/AdminShell';
import PostForm from '@/components/admin/PostForm';

export default async function NewPostPage() {
  const user = await getAuthUser();
  if (!user) redirect('/admin/login');

  return (
    <AdminShell user={user}>
      <div style={{ maxWidth: '900px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>New Post</h1>
        <PostForm mode="create" />
      </div>
    </AdminShell>
  );
}
