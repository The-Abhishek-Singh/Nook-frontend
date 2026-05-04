"use client";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import HeroSection from '@/components/HeroSection';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) router.push('/home');
  }, [router]);

  return (
    <main className="min-h-screen bg-white">
      <HeroSection onNext={() => router.push('/claim')} />
    </main>
  );
} 