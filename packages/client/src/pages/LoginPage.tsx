import { LoginForm } from '@/features/auth';

export function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <LoginForm />
    </main>
  );
}
