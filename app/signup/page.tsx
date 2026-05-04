"use client";
import { useRouter } from 'next/navigation';
import ClaimSection from '@/components/ClaimSection';

export default function SignUpPage() {
    const router = useRouter();

    const handleSuccess = () => {
        router.push('/socials');
    };

    return (
        <main className="min-h-screen bg-white">
            <ClaimSection
                onBack={() => router.push('/')}
                onNext={handleSuccess}
            />
        </main>
    );
}