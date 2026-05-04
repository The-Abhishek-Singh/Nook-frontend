"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AddMediaSection from '@/components/AddMediaSection';

export default function SocialsInputPage() {
    const router = useRouter();
    const [addedSocials, setAddedSocials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push('/login');
            return;
        }

        // Redirect to home if setup is already complete
        const isSetupComplete = localStorage.getItem("getnook_setup_complete");
        if (isSetupComplete === "true") {
            router.push('/home');
            return;
        }

        const saved = localStorage.getItem("getnook_socials");
        if (saved) {
            const parsedSocials = JSON.parse(saved);
            setAddedSocials(parsedSocials);

            // Optional: If you want to redirect just because the array isn't empty 
            // regardless of the setup flag, uncomment the lines below:
            // if (parsedSocials.length > 0) {
            //     router.push('/home');
            //     return;
            // }
        }

        setLoading(false);
    }, [router]);

    useEffect(() => {
        if (!loading) {
            localStorage.setItem("getnook_socials", JSON.stringify(addedSocials));
        }
    }, [addedSocials, loading]);

    const handleFinish = () => {
        localStorage.setItem("getnook_setup_complete", "true");
        localStorage.removeItem("is_registering");
        router.push('/home');
    };

    if (loading) return null;

    return (
        <main className="min-h-screen bg-white">
            <AddMediaSection
                onNext={handleFinish}
                onBack={() => router.push('/home')}
                addedSocials={addedSocials}
                setAddedSocials={setAddedSocials}
                viewMode="desktop"
            />
        </main>
    );
}