"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, SlidersHorizontal, Check , X} from 'lucide-react';
import SocialsSection from '@/components/main_grid/SocialsSection';
import AddMediaSection from '@/components/AddMediaSection';
import Navbar from '@/components/Navbar';
import { authApi, blocksApi, uploadApi } from '@/utils/api';
import { Block, UISocialItem, WidthType, CreateBlockPayload, BlockPosition } from '@/types';
import FetchToast from '@/components/FetchToast';

import { optimizeImage } from "@/utils/imageOptimizer";

// How often to poll while a social block is still fetching, and how long to keep trying.
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 12;

type ActiveModalType = 'username' | 'email' | 'password' | null;

export default function HomePage() {
    const router = useRouter();
    const [addedSocials, setAddedSocials] = useState<UISocialItem[]>([]);
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [uploadingImages, setUploadingImages] = useState<Set<string>>(new Set());
    const [toasts, setToasts] = useState<{ id: string; label: string; status: 'loading' | 'success' | 'error' }[]>([]);
    const activeToastIdsRef = useRef<Set<string>>(new Set());

    // Settings Popover State & Dynamic Modal State
    const [showSettingsPopover, setShowSettingsPopover] = useState(false);
    const [activeModal, setActiveModal] = useState<ActiveModalType>(null);
    const [showUsernameSuccess, setShowUsernameSuccess] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    
    // Form fields
    const [newUsername, setNewUsername] = useState("");
    const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [displayName, setDisplayName] = useState("");
    
    const popoverRef = useRef<HTMLDivElement>(null);

    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [avatar, setAvatar] = useState<string | null>(null);

    const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/blocks`;

    // Close settings popover and sub-modals when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setShowSettingsPopover(false);
                setActiveModal(null);
            }
        };
        if (showSettingsPopover || activeModal) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSettingsPopover, activeModal]);

    // 1. Get user's current location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("DEBUG: Error getting location:", error);
                    setCurrentLocation({ lat: 40.7128, lng: -74.0060 });
                }
            );
        } else {
            setCurrentLocation({ lat: 40.7128, lng: -74.0060 });
        }
    }, []);

    // 2. Fetch User Profile
    const fetchUserProfile = useCallback(async () => {
        try {
            const res = await authApi.getMe();
            const userData = res.data;
            if (userData.profile) {
                setName(userData.username || "");
                setNewUsername(userData.username || "");
                setBio(userData.profile.bio || "");
                setAvatar(userData.profile.avatarUrl || null);
                setDisplayName(userData.profile.displayName || "");
            }
        } catch (err) {
            console.error("DEBUG: Profile fetch failed", err);
        }
    }, []);

    const fetchBlocksOnly = useCallback(async (): Promise<UISocialItem[]> => {
        const token = localStorage.getItem("token");
        if (!token) return [];

        const response = await fetch(`${API_URL}/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error("Failed to fetch blocks");
        const data = await response.json();

        if (!Array.isArray(data)) return [];

        return data.map((b: any) => ({
            id: b._id,
            type: b.type,
            width: (b.style?.width as WidthType) || '1x1',
            content: b.content,
            title: b.content?.title || "",
            description: b.content?.description || "",
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
    }, [API_URL]);

    const initEditor = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            await fetchUserProfile();
            const mappedBlocks = await fetchBlocksOnly();
            setAddedSocials(mappedBlocks);

            const isRegistering = localStorage.getItem("is_registering") === "true";
            const setupComplete = localStorage.getItem("getnook_setup_complete") === "true";
            if (isRegistering && !setupComplete) setShowOnboarding(true);

        } catch (err) {
            console.error("DEBUG: Initialization failed", err);
        } finally {
            setLoading(false);
        }
    }, [router, fetchUserProfile, fetchBlocksOnly]);

    useEffect(() => {
        initEditor();
    }, [initEditor]);

    const pollingRef = useRef<NodeJS.Timeout | null>(null);
    const pollAttemptsRef = useRef(0);

    useEffect(() => {
        const pendingBlocks = addedSocials.filter(
            (b) => b.type === 'social' && b.content?.fetchStatus === 'fetching'
        );

        pendingBlocks.forEach((block) => {
            if (!activeToastIdsRef.current.has(block.id)) {
                activeToastIdsRef.current.add(block.id);
                setToasts((prev) => [
                    ...prev,
                    { id: block.id, label: `Fetching ${block.platform || 'data'}...`, status: 'loading' }
                ]);
            }
        });

        activeToastIdsRef.current.forEach((blockId) => {
            const stillPending = pendingBlocks.some((b) => b.id === blockId);
            if (!stillPending) {
                const block = addedSocials.find((b) => b.id === blockId);
                const finalStatus: 'success' | 'error' =
                    block?.content?.fetchStatus === 'completed' ? 'success' : 'error';
                const label =
                    finalStatus === 'success'
                        ? `${block?.platform || 'Data'} loaded!`
                        : `Failed to fetch ${block?.platform || 'data'}`;

                setToasts((prev) =>
                    prev.map((t) => (t.id === blockId ? { ...t, status: finalStatus, label } : t))
                );
                activeToastIdsRef.current.delete(blockId);

                setTimeout(() => {
                    setToasts((prev) => prev.filter((t) => t.id !== blockId));
                }, 2500);
            }
        });

        const pendingKey = pendingBlocks.map((b) => b.id).join(',');
        if (!pendingKey || pollingRef.current) return;

        pollAttemptsRef.current = 0;

        pollingRef.current = setInterval(async () => {
            pollAttemptsRef.current += 1;
            try {
                const freshBlocks = await fetchBlocksOnly();
                setAddedSocials((prev) =>
                    prev.map((item) => {
                        if (item.content?.fetchStatus !== 'fetching') return item;
                        const fresh = freshBlocks.find((f) => f.id === item.id);
                        return fresh ? { ...item, ...fresh } : item;
                    })
                );

                const stillPending = freshBlocks.some(
                    (b) => b.type === 'social' && b.content?.fetchStatus === 'fetching'
                );
                if (!stillPending || pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) {
                    if (pollingRef.current) clearInterval(pollingRef.current);
                    pollingRef.current = null;
                }
            } catch (err) {
                console.error("Polling failed:", err);
            }
        }, POLL_INTERVAL_MS);

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
        };
    }, [addedSocials, fetchBlocksOnly]);

    // Auto-switch preview mode based on actual viewport width
useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');

    const applyViewMode = (isMobile: boolean) => {
        setViewMode(isMobile ? 'mobile' : 'desktop');
    };

    // Set initial state on mount
    applyViewMode(mql.matches);

    const handleChange = (e: MediaQueryListEvent) => {
        applyViewMode(e.matches);
    };

    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
}, []);

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
                method: 'PUT',
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

    const handleUpdatePassword = async () => {
    setIsUpdatingPassword(true);

    try {
        await authApi.updatePassword({
            oldPassword,
            newPassword,
        });

        setOldPassword("");
        setNewPassword("");

        setActiveModal(null);
        setShowSettingsPopover(false);
    } catch (err:any) {
        console.error("Failed to update password", err);
        const reason =err?.response?.data?.message || err?.response?.data?.error || err?.message ||"Failed to update password. Please check your current password.";
       pushErrorToast(reason);
    } finally {
        setIsUpdatingPassword(false);
    }
};

const pushErrorToast = (label: string) => {
    const id = `err-${Date.now()}`;
    setToasts((prev) => [...prev, { id, label, status: 'error' }]);
    setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
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

    const handleChangeUsername = async () => {
    setIsUpdatingUsername(true);

    try {
        const res = await authApi.changeUsername(newUsername);

        // Update UI
        setName(res.data.username);

       setActiveModal(null);
       setShowUsernameSuccess(true);
    } catch (err:any) {
        console.error("Failed to change username", err);
        const reason =
         err?.response?.data?.message || err?.response?.data?.error || err?.message ||"Failed to change username. Please try again.";
       pushErrorToast(reason);
    } finally {
        setIsUpdatingUsername(false);
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
        const tempId = `temp-${Date.now()}`;
        const previewUrl = URL.createObjectURL(file);

        const tempBlock: UISocialItem = {
            id: tempId,
            type: "image",
            width: "1x1",
            image: previewUrl,
            title: "",
            description: "",
            content: {
                imageUrl: previewUrl,
                title: "",
                description: "",
            },
            style: {
                width: "1x1",
                backgroundColor: "#ffffff",
            },
        };

        setAddedSocials(prev => [...prev, tempBlock]);
        setUploadingImages(prev => {
            const next = new Set(prev);
            next.add(tempId);
            return next;
        });

        try {
            const optimizedFile = await optimizeImage(file);
            const uploadRes = await uploadApi.uploadImage(optimizedFile);
            const imageUrl = uploadRes.data.imageUrl || uploadRes.data.url;

            const position: BlockPosition = {
                i: `img-${Date.now()}`,
                x: 0,
                y: addedSocials.length,
                w: 1,
                h: 1,
            };

            await handleAddContent({
                type: "image",
                content: { imageUrl },
                style: { width: "1x1" },
                position,
            });

            setAddedSocials(prev => prev.filter(item => item.id !== tempId));
            await initEditor();
            URL.revokeObjectURL(previewUrl);
        } catch (err) {
            console.error("Image failed", err);
            setAddedSocials(prev => prev.filter(item => item.id !== tempId));
        } finally {
            setUploadingImages(prev => {
                const next = new Set(prev);
                next.delete(tempId);
                return next;
            });
        }
    };

    const handleAddHeading = async () => {
        await handleAddContent({
            type: 'heading',
            content: { title: "", description: "" },
            style: { width: 'full' },
            position: { i: `head-${Date.now()}`, x: 0, y: addedSocials.length, w: 4, h: 1 }
        });
    };

    const handleAddQuote = async () => {
        await handleAddContent({
            type: 'quote',
            content: { title: "", description: "" },
            style: { width: '2x1' },
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

    const handleLogout = async () => {
    try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (refreshToken) {
            await authApi.logout(refreshToken);
        }
    } catch (err) {
        console.error("Logout failed", err);
    } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");

    window.location.href = "/login";
}
};

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-blue-500" size={48} />
        </div>
    );

    return (
        <main className="min-h-screen bg-white relative">
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
                        username={name}
                    />
                </>
            )}

            {/* Bottom-left Settings Popover Container */}
            {/* Bottom-left Settings Popover Container */}
<div ref={popoverRef} className="fixed bottom-4 left-4 z-50">

    {/* Mobile-only dark backdrop, sits behind the modal, in front of everything else */}
    {(activeModal || showUsernameSuccess) && (
        <div
            className="fixed inset-0 bg-black/40 z-[55] lg:hidden"
            onClick={() => {
                setActiveModal(null);
                setShowUsernameSuccess(false);
            }}
        />
    )}

    {/* Popover Card matching exact reference design style */}
    {showSettingsPopover && (
        <div className="absolute bottom-14 left-0 w-62 max-w-[calc(100vw-2rem)] lg:max-w-none bg-white rounded-[28px] shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-zinc-100/80 py-3 mb-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
            {/* Change Username Row */}
            <div 
                onClick={(e) => {
                 e.stopPropagation();
                 setShowUsernameSuccess(false);
                 setActiveModal(activeModal === 'username' ? null : 'username');
             }}
                className={`px-5 py-3 hover:bg-zinc-50/85 cursor-pointer transition-colors ${activeModal === 'username' ? 'bg-zinc-50/80' : ''}`}
            >
                <p className="text-[14px] font-medium text-zinc-900 tracking-tight">Change Username</p>
                <p className="text-[13px] text-zinc-400 mt-0.5">/{name ? name.toLowerCase().replace(/\s+/g, '') : 'username'}</p>
            </div>

            {/* Change Password Row */}
            <div 
                onClick={(e) => {
                    e.stopPropagation();
                    setShowUsernameSuccess(false); 
                    setActiveModal(activeModal === 'password' ? null : 'password');
                }}
                className={`px-5 py-3 hover:bg-zinc-50/85 cursor-pointer transition-colors ${activeModal === 'password' ? 'bg-zinc-50/80' : ''}`}
            >
                <p className="text-[14px] font-medium text-zinc-900 tracking-tight">Change Password</p>
                <p className="text-[13px] text-zinc-400 mt-0.5">Signed in with Google</p>
            </div>

            <div className="h-[1px] bg-zinc-100 my-1.5 mx-5"></div>
            <div 
                onClick={() => {
                     setShowSettingsPopover(false);
                     setActiveModal(null);
                     handleLogout();
                }}
                className="px-5 py-3 hover:bg-zinc-50/80 cursor-pointer transition-colors"
            >
                <p className="text-[14px] font-medium text-zinc-900 tracking-tight">Log Out</p>
            </div>

            {/* Change Username Sub-panel */}
{activeModal === 'username' && (
    <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 lg:contents"
        onClick={() => setActiveModal(null)}
    >
        <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[330px] lg:w-[330px] lg:absolute lg:left-[205px] lg:-top-20 bg-white rounded-[32px] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.1)] border border-zinc-100/90 animate-in fade-in zoom-in-95 duration-150"
        >
            <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                aria-label="Close"
            >
                <X size={16} />
            </button>

            <h3 className="text-[16px] font-semibold text-zinc-900 tracking-tight">Change Username</h3>
            <p className="text-[13px] text-zinc-400 mt-0.5 mb-5">Choose a new username for your Bento.</p>
            
            <div className="relative flex items-center bg-zinc-50/80 border border-zinc-200/80 rounded-2xl px-4 py-3 mb-4 focus-within:border-zinc-400 transition-all">
                <span className="text-[14px] text-zinc-400 font-normal mr-0.5">bento.me/</span>
                <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="bg-transparent text-[14px] font-medium text-zinc-900 outline-none w-full"
                    placeholder="username"
                />
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white ml-2 flex-shrink-0">
                    <Check size={12} strokeWidth={3} />
                </div>
            </div>

            <button
                onClick={handleChangeUsername}
                disabled={isUpdatingUsername}
                className="w-full py-3.5 bg-[#6366f1] hover:bg-[#5558e6] text-white text-[14px] font-medium rounded-2xl shadow-[0_8px_20px_rgba(99,102,241,0.25)] transition-all flex items-center justify-center"
            >
                {isUpdatingUsername ? <Loader2 className="animate-spin" size={18} /> : "Update My Username"}
            </button>
        </div>
    </div>
)}

{/* Username Success Panel */}
{showUsernameSuccess && (
    <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 lg:contents"
        onClick={() => setShowUsernameSuccess(false)}
    >
        <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[330px] lg:w-[330px] lg:absolute lg:left-[205px] lg:-top-20 bg-white rounded-[32px] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.1)] border border-zinc-100 animate-in fade-in zoom-in-95 duration-150"
        >
            <button
                onClick={() => setShowUsernameSuccess(false)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                aria-label="Close"
            >
                <X size={16} />
            </button>

            <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-full bg-[#4ADE80] flex items-center justify-center">
                    <Check className="text-white" size={32} />
                </div>
            </div>

            <h3 className="text-center font-semibold text-lg">
                Your new username is
            </h3>

            <div className="mt-5 bg-zinc-100 rounded-xl py-3 text-center font-medium text-zinc-600">
                bento.me/{name}
            </div>

            <button
                onClick={async () => {
                    try {
                        await navigator.clipboard.writeText(
                            `${window.location.origin}/${name}`
                        );

                        setCopiedLink(true);

                        setTimeout(() => {
                            setCopiedLink(false);
                            setShowUsernameSuccess(false);
                        }, 1200);

                    } catch (err) {
                        console.error("Failed to copy link", err);
                    }
                }}
                className="mt-5 w-full py-3 rounded-xl bg-[#4ADE80] text-white font-semibold"
            >
                {copiedLink ? "Copied!" : "Copy my Link"}
            </button>

            <p className="mt-4 text-center text-sm text-zinc-400">
                The link is ready for your bio!
            </p>
        </div>
    </div>
)}

{/* Change Password Sub-panel */}
{activeModal === 'password' && (
    <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 lg:contents"
        onClick={() => setActiveModal(null)}
    >
        <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[330px] lg:w-[330px] lg:absolute lg:left-[205px] lg:top-[1px] bg-white rounded-[32px] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.1)] border border-zinc-100/90 animate-in fade-in zoom-in-95 duration-150"
        >
            <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                aria-label="Close"
            >
                <X size={16} />
            </button>

            <h3 className="text-[16px] font-semibold text-zinc-900 tracking-tight">Change Password</h3>
            <p className="text-[13px] text-zinc-400 mt-0.5 mb-5">Set a new secure password for your account.</p>
            
            <div className="relative flex items-center bg-zinc-50/80 border border-zinc-200/80 rounded-2xl px-4 py-3 mb-3">
                <input
                 type="password"
                 value={oldPassword}
                 onChange={(e) => setOldPassword(e.target.value)}
                 placeholder="Current password"
                 className="bg-transparent text-[14px] font-medium text-zinc-900 outline-none w-full"
             />
            </div>
            <div className="relative flex items-center bg-zinc-50/80 border border-zinc-200/80 rounded-2xl px-4 py-3 mb-4">
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="bg-transparent text-[14px] font-medium text-zinc-900 outline-none w-full"
                />
            </div>

            <button
                onClick={handleUpdatePassword}
                disabled={isUpdatingPassword}
                className="w-full py-3.5 bg-[#6366f1] hover:bg-[#5558e6] text-white text-[14px] font-medium rounded-2xl shadow-[0_8px_20px_rgba(99,102,241,0.25)] transition-all flex items-center justify-center"
            >
                Update Password
            </button>
        </div>
    </div>
)}
        </div>
    )}

    {/* Bottom-left Trigger Icon Button */}
    <button
      onClick={() => {
        setShowSettingsPopover(prev => !prev);
        if (showSettingsPopover) setActiveModal(null);
    }}
    className="w-9 h-9 rounded-full text-zinc-600 flex items-center justify-center shadow-md hover:bg-zinc-50 transition-all border border-zinc-200/80 p-2"
    title="Settings"
>
    <img src="/assets/logout.svg" alt="Settings" className="w-full h-full object-contain" />
</button>
</div>

            <FetchToast toasts={toasts} />
        </main>
    );
}