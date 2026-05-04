"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { blocksApi } from '@/utils/api';
import { UISocialItem, WidthType } from '@/types';
import PublicSocialCard from '@/components/main_grid/PublicSocialCard';

export default function ProfilePage() {
    const params = useParams();
    const username = params.username as string;
    const [blocks, setBlocks] = useState<UISocialItem[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

    // Sync viewMode with screen width for card ratios
    useEffect(() => {
        const handleResize = () => {
            setViewMode(window.innerWidth < 1024 ? 'mobile' : 'desktop');
        };
        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchPublicData = async () => {
            try {
                const res = await blocksApi.getUserBlocks(username);
                const { blocks: rawBlocks, profile: userProfile } = res.data;

                const mapped = rawBlocks.map((b: any) => ({
                    id: b._id,
                    type: b.type,
                    width: (b.style?.width as WidthType) || '1x1',
                    content: b.content,
                    title: b.content?.title || "",
                    description: b.content?.description || "",
                    image: b.content?.imageUrl || b.content?.logo || "",
                    logo: b.content?.logo || "",
                    url: b.content?.url || "",
                    handle: b.content?.handle || "",
                    color: b.style?.color || "",
                    iconName: b.content?.iconName || "",
                    location: b.content?.location,
                }));

                setBlocks(mapped);
                setProfile(userProfile);
            } catch (err) {
                console.error("Profile not found", err);
            } finally {
                setLoading(false);
            }
        };
        if (username) fetchPublicData();
    }, [username]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-zinc-900" size={48} />
        </div>
    );

    if (!profile && !loading) return <div className="min-h-screen flex items-center justify-center text-xl font-bold text-gray-800">User Not Found</div>;

    return (
        <main className="min-h-screen bg-[#fafafa] flex flex-col lg:flex-row px-4 md:px-8 lg:px-16 py-8 md:py-12 lg:py-24 gap-8 lg:gap-12 overflow-x-hidden">
            {/* Sidebar Profile Info */}
            <div className="w-full lg:w-[350px] xl:w-[400px] shrink-0 flex flex-col items-center lg:items-start space-y-6 pt-4">
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-gray-100">
                    {profile?.avatarUrl ? (
                        <img src={profile.avatarUrl} className="w-full h-full object-cover" alt="avatar" />
                    ) : (
                        <div className="w-full h-full bg-gray-200" />
                    )}
                </div>
                <div className="space-y-2 text-center lg:text-left px-2 max-w-lg">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter leading-none mb-2">
                        {profile?.displayName || username}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 font-medium leading-tight">
                        {profile?.bio || "No bio available"}
                    </p>
                </div>
            </div>

            {/* Blocks Grid */}
            <div className="flex-1 w-full max-w-[1200px] mx-auto lg:mx-0">
                <div
                    className="grid grid-flow-dense gap-4 md:gap-6 justify-center lg:justify-start"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: viewMode === 'mobile'
                            ? 'repeat(2, minmax(140px, 160px))'
                            : 'repeat(auto-fill, 208px)'
                    }}
                >
                    {blocks.map((item) => (
                        <PublicSocialCard
                            key={item.id}
                            item={item}
                            viewMode={viewMode}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}