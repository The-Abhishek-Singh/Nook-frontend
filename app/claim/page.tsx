"use client";
import { useRouter } from 'next/navigation';
import ClaimSection from '@/components/ClaimSection';
//
export default function ClaimPage() {
    const router = useRouter();

    return (
        <ClaimSection
            onBack={() => router.push('/')}
            onNext={() => router.push('/socials')}
        />
    );
}
