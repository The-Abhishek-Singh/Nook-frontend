"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import SocialsSection from '@/components/main_grid/SocialsSection';
import AddMediaSection from '@/components/AddMediaSection';
import Navbar from '@/components/Navbar';
import { authApi, blocksApi, uploadApi } from '@/utils/api';
import { Block, UISocialItem, WidthType, CreateBlockPayload, BlockPosition } from '@/types';
import { optimizeImage } from "@/utils/imageOptimizer";

export default function EditorPage() {
    const router = useRouter();
    const [addedSocials, setAddedSocials] = useState<UISocialItem[]>([]);
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [uploadingImages, setUploadingImages] = useState<Set<string>>(new Set());

    // Profile States
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [avatar, setAvatar] = useState<string | null>(null);


    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setCurrentLocation({ lat: 40.7128, lng: -74.0060 });
                }
            );
        } else {
            setCurrentLocation({ lat: 40.7128, lng: -74.0060 });
        }
    }, []);

    // Fetch User Profile
    const fetchUserProfile = useCallback(async () => {
        try {
            const res = await authApi.getMe();
            const user = res.data;
            if (user && user.profile) {
                setName(user.profile.displayName || "");
                setBio(user.profile.bio || "");
                setAvatar(user.profile.avatarUrl || null);
            }
        } catch (err) {
            console.error("Profile fetch failed", err);
        }
    }, []);

    const initEditor = useCallback(async () => {
        const token = localStorage.getItem("token");
        console.log("DEBUG: Token status ->", token ? "Found" : "Not Found");

        if (!token) {
            console.warn("DEBUG: No token, redirecting to login...");
            router.push('/login');
            return;
        }

        try {
            await fetchUserProfile();

            console.log("DEBUG: Calling blocksApi.getMyBlocks()...");
            const res = await blocksApi.getMyBlocks();

            let blocks: Block[] = [];

            if (Array.isArray(res.data)) {
                blocks = res.data;
                console.log("DEBUG: Blocks from res.data (array):", blocks.length);
            } else if (res.data && Array.isArray(res.data.blocks)) {
                blocks = res.data.blocks;
                console.log("DEBUG: Blocks from res.data.blocks:", blocks.length);
            } else if (res.data && Array.isArray(res.data.data)) {
                blocks = res.data.data;
                console.log("DEBUG: Blocks from res.data.data:", blocks.length);
            }

            console.log("DEBUG: Total blocks found:", blocks.length);

            // DEBUG: Log each block's style and position
            blocks.forEach((block, index) => {
                console.log(`DEBUG: Block ${index + 1}:`, {
                    id: block._id,
                    type: block.type,
                    style: block.style,
                    position: block.position,
                    width: block.style?.width || 'not set'
                });
            });

            const isRegistering = localStorage.getItem("is_registering") === "true";
            const setupComplete = localStorage.getItem("getnook_setup_complete") === "true";
            if (isRegistering && !setupComplete) setShowOnboarding(true);

            if (blocks && blocks.length > 0) {
                const sortedBlocks = [...blocks].sort((a, b) => (a.order || 0) - (b.order || 0));

                const mappedBlocks: UISocialItem[] = sortedBlocks.map((b) => {
                    // CRITICAL FIX: Read width from style.width first
                    let width: WidthType = '1x1';

                    // Priority 1: Check style.width (this is where we save it)
                    if (b.style?.width) {
                        width = b.style.width as WidthType;
                        console.log(`Block ${b._id} has style.width: ${width}`);
                    }
                    // Priority 2: Check position dimensions
                    else if (b.position) {
                        if (b.position.w === 2 && b.position.h === 1) width = '2x1';
                        else if (b.position.w === 1 && b.position.h === 2) width = '1x2';
                        else if (b.position.w === 2 && b.position.h === 2) width = '2x2';
                        else if (b.position.w === 1 && b.position.h === 1) width = '1x1';
                        console.log(`Block ${b._id} using position dimensions: w=${b.position.w}, h=${b.position.h} -> ${width}`);
                    }

                    // Ensure content object exists
                    const content = b.content || {};

                    const item: UISocialItem = {
                        id: b._id,
                        type: b.type,
                        width: width, // Use the determined width
                        content: content,
                        title: content.title || "",
                        description: content.description || "",
                        image: content.imageUrl || content.logo || "",
                        platform: content.platform || "",
                        handle: content.handle || "",
                        color: b.style?.color || "",
                        iconName: content.iconName || "",
                        location: content.location,
                        position: b.position,
                        order: b.order,
                        url: content.url || "",
                        logo: content.logo || "",
                        style: b.style // Preserve the full style object
                    };

                    return item;
                });

                console.log("DEBUG: Final mapped blocks with widths:", mappedBlocks.map(b => ({ id: b.id, type: b.type, width: b.width })));
                setAddedSocials(mappedBlocks);
            } else {
                console.log("DEBUG: No blocks found");
                setAddedSocials([]);
            }
        } catch (err: any) {
            console.error("DEBUG: Fetch Error Detail:", err);
            console.error("DEBUG: Error response:", err.response?.data);
            setAddedSocials([]);
        } finally {
            setLoading(false);
        }
    }, [router, fetchUserProfile]);

    useEffect(() => {
        initEditor();
    }, [initEditor]);

    const handleSetAddedSocials = useCallback((items: UISocialItem[] | ((prev: UISocialItem[]) => UISocialItem[])) => {
        if (typeof items === 'function') {
            setAddedSocials(prev => items(prev));
        } else {
            setAddedSocials(items);
            const syncPositions = async () => {
                try {
                    const positions = items.map((item, index) => ({
                        id: item.id,
                        position: index
                    }));
                    await blocksApi.updatePositions({ blocks: positions });
                } catch (err) {
                    console.error("Position sync failed", err);
                }
            };
            syncPositions();
        }
    }, []);

    const handleAddLink = async (url: string) => {
        try {
            const position: BlockPosition = {
                i: `link-${Date.now()}`,
                x: (addedSocials.length % 2) * 2,
                y: Math.floor(addedSocials.length / 2),
                w: 1,
                h: 1
            };

            const payload: CreateBlockPayload = {
                type: 'social',
                content: {
                    url: url,
                    handle: url.replace(/(^\w+:|^)\/\//, '').split('/')[0],
                    platform: 'Link',
                    iconName: 'Link2'
                },
                style: {
                    width: '1x1',
                    color: 'bg-zinc-800',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px'
                },
                position: position
            };

            await blocksApi.createBlock(payload);
            await initEditor();
        } catch (err: any) {
            console.error("Link creation failed:", err);
            alert("Failed to add link. Please try again.");
        }
    };

    // const handleAddImage = async (file: File) => {
    //     try {
    //         const optimizedFile = await optimizeImage(file);
    //         const uploadRes = await uploadApi.uploadImage(optimizedFile);
    //         const imageUrl = uploadRes.data.imageUrl || uploadRes.data.url;

    //         const position: BlockPosition = {
    //             i: `image-${Date.now()}`,
    //             x: (addedSocials.length % 2) * 2,
    //             y: Math.floor(addedSocials.length / 2),
    //             w: 1,
    //             h: 1
    //         };

    //         const payload: CreateBlockPayload = {
    //             type: 'image',
    //             content: {
    //                 imageUrl: imageUrl,
    //                 title: '',
    //                 description: ''
    //             },
    //             style: {
    //                 width: '1x1',
    //                 backgroundColor: '#ffffff',
    //                 borderRadius: '12px'
    //             },
    //             position: position
    //         };

    //         await blocksApi.createBlock(payload);
    //         await initEditor();
    //     } catch (err) {
    //         console.error("Image upload failed", err);
    //     }
    // };


    const handleAddImage = async (file: File) => {
        alert("HANDLE ADD IMAGE");
         console.log("🚀 HANDLE ADD IMAGE CALLED", file);

    const tempId = `temp-${Date.now()}`;
    const previewUrl = URL.createObjectURL(file);

    // Temporary block shown immediately
    const tempBlock: UISocialItem = {
        id: tempId,
        type: "image",
        width: "1x1",
        image: previewUrl,
        content: {
            imageUrl: previewUrl,
            title: "",
            description: "",
        },
        title: "",
        description: "",
        style: {
            width: "1x1",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
        },
    };
    console.log("Adding preview blocks")

    setAddedSocials(prev => [...prev, tempBlock]);

    setUploadingImages(prev => new Set(prev).add(tempId));

    try {
        // Compress / Convert
        const optimizedFile = await optimizeImage(file);

        // Upload
        const uploadRes = await uploadApi.uploadImage(optimizedFile);

        const imageUrl =
            uploadRes.data.imageUrl ||
            uploadRes.data.url;

        // Create real block
        const position: BlockPosition = {
            i: `image-${Date.now()}`,
            x: (addedSocials.length % 2) * 2,
            y: Math.floor(addedSocials.length / 2),
            w: 1,
            h: 1,
        };

        const payload: CreateBlockPayload = {
            type: "image",
            content: {
                imageUrl,
                title: "",
                description: "",
            },
            style: {
                width: "1x1",
                backgroundColor: "#ffffff",
                borderRadius: "12px",
            },
            position,
        };

        await blocksApi.createBlock(payload);

        // Reload actual block from backend
        await initEditor();
    } catch (err) {
        console.error(err);

        // Remove preview block if upload fails
        setAddedSocials(prev =>
            prev.filter(item => item.id !== tempId)
        );
    } finally {
        URL.revokeObjectURL(previewUrl);

        setUploadingImages(prev => {
            const next = new Set(prev);
            next.delete(tempId);
            return next;
        });
    }
    };


    const handleAddHeading = async () => {
        try {
            const position: BlockPosition = {
                i: `heading-${Date.now()}`,
                x: 0,
                y: addedSocials.length,
                w: 2,
                h: 1
            };

            const payload: CreateBlockPayload = {
                type: 'heading',
                content: {
                    title: "New Heading",
                    description: ""
                },
                style: {
                    width: 'full',
                    backgroundColor: "#ffffff",
                    textColor: "#111111",
                    borderRadius: "12px",
                    fontSize: "24px",
                    isHighlighted: false
                },
                position: position
            };

            await blocksApi.createBlock(payload);
            await initEditor();
        } catch (err: any) {
            console.error("Heading creation failed:", err);
            alert("Failed to add heading. Please try again.");
        }
    };

    const handleAddQuote = async () => {
        try {
            const position: BlockPosition = {
                i: `quote-${Date.now()}`,
                x: (addedSocials.length % 2) * 2,
                y: Math.floor(addedSocials.length / 2),
                w: 2,
                h: 1
            };

            const payload: CreateBlockPayload = {
                type: 'quote',
                content: {
                    title: "",
                    description: "New quote..."
                },
                style: {
                    width: 'full',
                    backgroundColor: "#ffffff",
                    textColor: "#111111",
                    borderRadius: "12px",
                    isHighlighted: false
                },
                position: position
            };

            await blocksApi.createBlock(payload);
            await initEditor();
        } catch (err: any) {
            console.error("Quote creation failed:", err);
            alert("Failed to add quote. Please try again.");
        }
    };

    const handleAddMap = async () => {
        try {
            const location = currentLocation || { lat: 40.7128, lng: -74.0060 };

            const position: BlockPosition = {
                i: `map-${Date.now()}`,
                x: (addedSocials.length % 2) * 2,
                y: Math.floor(addedSocials.length / 2),
                w: 2,
                h: 2
            };

            const payload: CreateBlockPayload = {
                type: 'map',
                content: {
                    location: location,
                    title: "My Location",
                    description: ""
                },
                style: {
                    width: '2x2',
                    backgroundColor: "#ffffff",
                    borderRadius: "12px"
                },
                position: position
            };

            await blocksApi.createBlock(payload);
            await initEditor();
        } catch (err: any) {
            console.error("Map creation failed:", err);
        }
    };

    const handleUpdateBlock = async (id: string, updates: any) => {
        try {
            console.log(`Updating block ${id} with:`, updates);
            const response = await blocksApi.updateBlock(id, updates);
            console.log(`Update response:`, response.data);
            return response.data;
        } catch (err) {
            console.error("Block update failed", err);
            throw err;
        }
    };

    const handleDeleteBlock = async (id: string) => {
        try {
            await blocksApi.deleteBlock(id);
        } catch (err) {
            console.error("Block deletion failed", err);
            throw err;
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
                        username={name}
                    />
                </>
            )}
        </main>
    );
}
