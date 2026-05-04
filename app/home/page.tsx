"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import SocialsSection from '@/components/main_grid/SocialsSection';
import AddMediaSection from '@/components/AddMediaSection';
import Navbar from '@/components/Navbar';
import { authApi, blocksApi, uploadApi } from '@/utils/api';
import { Block, UISocialItem, WidthType, CreateBlockPayload } from '@/types';

export default function HomePage() {
    const router = useRouter();
    const [addedSocials, setAddedSocials] = useState<UISocialItem[]>([]);
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [avatar, setAvatar] = useState<string | null>(null);

    const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/blocks`;

    // 1. Get user's current location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    console.log("DEBUG: Got current location:", position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.error("DEBUG: Error getting location:", error);
                    setCurrentLocation({ lat: 40.7128, lng: -74.0060 });
                }
            );
        } else {
            console.error("DEBUG: Geolocation not supported");
            setCurrentLocation({ lat: 40.7128, lng: -74.0060 });
        }
    }, []);

    // 2. Fetch User Profile (Persists Bio/Name)
    const fetchUserProfile = useCallback(async () => {
        try {
            console.log("DEBUG: Fetching latest profile for bio sync...");
            const res = await authApi.getMe();
            const userData = res.data;
            if (userData.profile) {
                setName(userData.profile.displayName || "");
                setBio(userData.profile.bio || "");
                setAvatar(userData.profile.avatarUrl || null);
            }
        } catch (err) {
            console.error("DEBUG: Profile fetch failed", err);
        }
    }, []);

    // 3. Fetch Blocks and Initialize Everything
    const initEditor = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            await fetchUserProfile();

            console.log("DEBUG: Fetching blocks from API...");
            const response = await fetch(`${API_URL}/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error("Failed to fetch blocks");
            const data = await response.json();

            console.log("DEBUG: RAW DATA FROM DB:", data);

            if (Array.isArray(data)) {
                const mappedBlocks: UISocialItem[] = data.map((b: any) => ({
                    id: b._id,
                    type: b.type,
                    width: (b.style?.width as WidthType) || '1x1',
                    content: b.content,
                    title: b.content?.title || "",
                    description: b.content?.description || "",
                    // Prioritize logo mapping from the backend
                    image: b.content?.imageUrl || b.content?.logo || "",
                    logo: b.content?.logo || "",
                    url: b.content?.url || "",
                    platform: b.content?.platform || "",
                    handle: b.content?.handle || "",
                    color: b.style?.color || "",
                    iconName: b.content?.iconName || "",
                    location: b.content?.location,
                    position: b.position,
                    order: b.order || 0
                })).sort((a, b) => a.order - b.order);

                setAddedSocials(mappedBlocks);
            }

            const isRegistering = localStorage.getItem("is_registering") === "true";
            const setupComplete = localStorage.getItem("getnook_setup_complete") === "true";
            if (isRegistering && !setupComplete) setShowOnboarding(true);

        } catch (err) {
            console.error("DEBUG: Initialization failed", err);
        } finally {
            setLoading(false);
        }
    }, [router, fetchUserProfile]);

    useEffect(() => {
        initEditor();
    }, [initEditor]);

    const handleSetAddedSocials = useCallback((items: UISocialItem[] | ((prev: UISocialItem[]) => UISocialItem[])) => {
        if (typeof items === 'function') {
            setAddedSocials(prev => {
                const newItems = items(prev);
                syncPositionsToBackend(newItems);
                return newItems;
            });
        } else {
            setAddedSocials(items);
            syncPositionsToBackend(items);
        }
    }, []);

    const syncPositionsToBackend = async (items: UISocialItem[]) => {
        const token = localStorage.getItem("token");
        try {
            const blocksPayload = items.map((item, index) => ({
                id: item.id,
                position: item.position,
                order: index
            }));

            await fetch(`${API_URL}/positions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ blocks: blocksPayload })
            });
        } catch (err) {
            console.error("Position sync failed in DB");
        }
    };

    const handleAddContent = async (payload: any) => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) await initEditor();
        } catch (err) {
            console.error("Create failed", err);
        }
    };

    const handleAddLink = async (url: string) => {
        const handle = url.replace(/(^\w+:|^)\/\//, '').split('/')[0];
        const payload = {
            type: 'social',
            content: { platform: 'Link', handle, url: url, iconName: 'Link2' },
            style: { width: '1x1', color: 'bg-zinc-800' },
            position: { i: `block-${Date.now()}`, x: 0, y: addedSocials.length, w: 1, h: 1 }
        };
        await handleAddContent(payload);
    };

    const handleAddImage = async (file: File) => {
        try {
            const uploadRes = await uploadApi.uploadImage(file);
            const imageUrl = uploadRes.data.imageUrl || uploadRes.data.url;
            await handleAddContent({
                type: 'image',
                content: { imageUrl },
                style: { width: '1x1' },
                position: { i: `img-${Date.now()}`, x: 0, y: addedSocials.length, w: 1, h: 1 }
            });
        } catch (err) { console.error("Image failed", err); }
    };

    const handleAddHeading = async () => {
        await handleAddContent({
            type: 'heading',
            content: { title: "Add Heading...", description: "" },
            style: { width: 'full' },
            position: { i: `head-${Date.now()}`, x: 0, y: addedSocials.length, w: 2, h: 1 }
        });
    };

    const handleAddQuote = async () => {
        await handleAddContent({
            type: 'quote',
            content: { title: "", description: "Add your quote here..." },
            style: { width: 'full' },
            position: { i: `quote-${Date.now()}`, x: 0, y: addedSocials.length, w: 2, h: 1 }
        });
    };

    const handleAddMap = async () => {
        await handleAddContent({
            type: 'map',
            content: { location: currentLocation || { lat: 40.7128, lng: -74.0060 } },
            style: { width: '2x2' },
            position: { i: `map-${Date.now()}`, x: 0, y: addedSocials.length, w: 2, h: 2 }
        });
    };

    const handleUpdateBlock = async (id: string, updates: any) => {
        try {
            await blocksApi.updateBlock(id, updates);
        } catch (err) {
            console.error("Update failed", err);
        }
    };

    const handleDeleteBlock = async (id: string) => {
        try {
            await blocksApi.deleteBlock(id);
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-blue-500" size={48} />
        </div>
    );

    return (
        <main className="min-h-screen bg-white">
            {showOnboarding ? (
                <AddMediaSection
                    onNext={() => {
                        setShowOnboarding(false);
                        initEditor();
                    }}
                    onBack={() => setShowOnboarding(false)}
                    addedSocials={addedSocials}
                    setAddedSocials={setAddedSocials}
                    viewMode={viewMode}
                />
            ) : (
                <>
                    <SocialsSection
                        addedSocials={addedSocials}
                        setAddedSocials={handleSetAddedSocials}
                        viewMode={viewMode}
                        onUpdateBlock={handleUpdateBlock}
                        onDeleteBlock={handleDeleteBlock}
                        name={name}
                        setName={setName}
                        bio={bio}
                        setBio={setBio}
                        avatar={avatar}
                        setAvatar={setAvatar}
                    />
                    <Navbar
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        onAddLink={handleAddLink}
                        onAddImage={handleAddImage}
                        onAddQuote={handleAddQuote}
                        onAddMap={handleAddMap}
                        onAddHeading={handleAddHeading}
                    />
                </>
            )}
        </main>
    );
}