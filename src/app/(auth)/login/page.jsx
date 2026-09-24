import Header from '@/components/Header';
import { LoginForm } from '../../../components/login-form';
import Footer from '@/components/Footer';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-600">Loading...</div>}>
        <LoginForm />
      </Suspense>
      <Footer />
    </>
  );
}
