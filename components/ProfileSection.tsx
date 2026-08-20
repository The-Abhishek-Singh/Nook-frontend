"use client";
import React, { useRef, useState } from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';
import { authApi } from '@/utils/api';

interface ProfileSectionProps {
    avatar: string | null;
    setAvatar: (url: string | null) => void;
    name: string;
    setName: (name: string) => void;
    bio: string;
    setBio: (bio: string) => void;
    viewMode?: 'desktop' | 'mobile';
}

export default function ProfileSection({
    avatar,
    setAvatar,
    name,
    setName,
    bio,
    setBio,
    viewMode = 'desktop'
}: ProfileSectionProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const BIO_CHAR_LIMIT = 250;
    const bioCharCount = bio.length;
    const isBioOverLimit = bioCharCount > BIO_CHAR_LIMIT;

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const res = await authApi.updateAvatar(file);
            const newUrl = res.data.avatarUrl || res.data.user?.profile?.avatarUrl;
            if (newUrl) {
                setAvatar(newUrl);
            }
        } catch (error) {
            console.error("Avatar upload failed:", error);
        } finally {
            setUploading(false);
        }
    };

     const handleProfileUpdate = async () => {
    if (isBioOverLimit) return;
    try {
        const payload = {
            profile: {
                displayName: name,
                bio: bio
            }
        };
        await authApi.updateProfile(payload);
    } catch (error) {
        console.error("Auto-save failed:", error);
    }
};

    return (
        <div className={`flex flex-col items-center ${viewMode === 'mobile' ? 'items-center text-center' : 'lg:items-start lg:text-left'} mb-8 transition-all duration-300`}>
            <div className="relative group">
                <div
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className={`
                        ${viewMode === 'mobile' ? 'w-32 h-32' : 'w-40 h-40'} 
                        aspect-square rounded-full border-2 border-dashed border-gray-200 flex flex-col items-center justify-center bg-gray-50 overflow-hidden relative shadow-inner transition-all 
                        cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 group
                        ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    {avatar ? (
                        <div className="w-full h-full rounded-full overflow-hidden">
                            <img
                                src={avatar}
                                className="w-full h-full object-cover"
                                style={{ borderRadius: '50%' }}
                                alt="Avatar"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-gray-400 group-hover:text-blue-400 transition-colors">
                            {uploading ? (
                                <Loader2 size={24} className="animate-spin" />
                            ) : (
                                <ArrowUp size={viewMode === 'mobile' ? 20 : 24} />
                            )}
                            <span className={`${viewMode === 'mobile' ? 'text-[8px]' : 'text-[10px]'} font-bold mt-1 uppercase tracking-wider`}>
                                {uploading ? 'Uploading...' : 'Add Avatar'}
                            </span>
                        </div>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarUpload}
                        className="hidden"
                        accept="image/*"
                    />
                </div>
            </div>

            <div className="mt-8 w-full space-y-2">
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={handleProfileUpdate}
                    className={`${viewMode === 'mobile' ? 'text-3xl text-center' : 'text-5xl text-left'} font-black text-gray-900 bg-transparent outline-none w-full placeholder:text-gray-200 transition-all`}
                    placeholder="Your Name"
                />
                <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    onBlur={handleProfileUpdate}
                    className={`${viewMode === 'mobile' ? 'text-lg text-center' : 'text-xl text-left'} text-gray-400 bg-transparent outline-none w-full font-medium placeholder:text-gray-200 resize-none overflow-hidden`}
                    placeholder="Your Bio"
                    rows={2}
                />
               <p className={`text-xs font-bold ${viewMode === 'mobile' ? 'text-center' : 'text-left'} ${isBioOverLimit ? "text-red-500" : "text-gray-300"}`}>
                   {bioCharCount}/{BIO_CHAR_LIMIT} characters
                   {isBioOverLimit && " — Limit exceeded"}
               </p>
            </div>
        </div>
    );
}