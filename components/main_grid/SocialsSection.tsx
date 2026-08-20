"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
    DndContext, closestCenter, KeyboardSensor, PointerSensor,
    useSensor, useSensors, DragEndEvent, DragOverlay, DragStartEvent
} from '@dnd-kit/core';
import {
    arrayMove, SortableContext, sortableKeyboardCoordinates,
    rectSortingStrategy
} from '@dnd-kit/sortable';
import { restrictToWindowEdges, restrictToParentElement } from '@dnd-kit/modifiers';

import ProfileSection from '../ProfileSection';
import SortableSocialCard from './SortableSocialCard';
import { authApi, blocksApi } from '@/utils/api';
import { UISocialItem, WidthType  } from '@/types';

interface SocialsSectionProps {
    addedSocials: UISocialItem[];
    setAddedSocials: (items: UISocialItem[] | ((prev: UISocialItem[]) => UISocialItem[])) => void;
    viewMode: 'desktop' | 'mobile';
    onUpdateBlock?: (id: string, updates: any) => Promise<void>;
    onDeleteBlock?: (id: string) => Promise<void>;
    name: string;
    setName: (name: string) => void;
    bio: string;
    setBio: (bio: string) => void;
    avatar: string | null;
    setAvatar: (url: string | null) => void;
}

// Helper functions for position mapping
const getWidthValue = (width: WidthType): number => {
    switch (width) {
        case "1x1":
        case "1x2":
        case "1:1":
            return 1;

        case "2x1":
        case "2x2":
        case "3:4":
        case "9:16":
            return 2;

        case "4:3":
        case "3:2":
        case "16:9":
        case "5:4":
        case "4:5":
            return 3;

        case "21:9":
            return 4;

        case "full":
            return 2;

        default:
            return 1;
    }
};

const getHeightValue = (width: WidthType): number => {
    switch (width) {
        case "1x1":
        case "2x1":
        case "1:1":
        case "16:9":
        case "21:9":
        case "3:2":
            return 1;

        case "1x2":
        case "2x2":
        case "4:3":
        case "5:4":
            return 2;

        case "3:4":
        case "9:16":
        case "2:3":
        case "4:5":
            return 3;

        case "full":
            return 1;

        default:
            return 1;
    }
};

const getGridSpanClasses = (width: WidthType, viewMode: 'desktop' | 'mobile'): string => {
    const colSpan = getWidthValue(width);
    const rowSpan = getHeightValue(width);

    // Map column spans dynamically
    const colClass = colSpan === 4 ? 'col-span-4' : colSpan === 3 ? 'col-span-3' : colSpan === 2 ? 'col-span-2' : 'col-span-1';
    const rowClass = rowSpan === 3 ? 'row-span-3' : rowSpan === 2 ? 'row-span-2' : 'row-span-1';

    return `${colClass} ${rowClass}`;
};

const SocialsSection: React.FC<SocialsSectionProps> = ({
    addedSocials,
    setAddedSocials,
    viewMode,
    onUpdateBlock,
    onDeleteBlock,
    name,
    setName,
    bio,
    setBio,
    avatar,
    setAvatar,
}) => {
    const router = useRouter();
    const [leftSaved, setLeftSaved] = useState(true);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const pendingApiCalls = useRef<Map<string, NodeJS.Timeout>>(new Map());
    const BIO_CHAR_LIMIT = 250;
    const bioCharCount = bio.length;
    const isBioOverLimit = bioCharCount > BIO_CHAR_LIMIT;

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            const oldIndex = addedSocials.findIndex((i) => i.id === active.id);
            const newIndex = addedSocials.findIndex((i) => i.id === over.id);

            const newItems = arrayMove(addedSocials, oldIndex, newIndex);

            // 1. Update UI state immediately
            setAddedSocials(newItems);

            // 2. Prepare positions update - MUST match Postman format
            const positionsData = {
                blocks: newItems.map((item, index) => ({
                    id: item.id,
                    order: index
                }))
            };

            console.log("🔄 Sending to backend:", JSON.stringify(positionsData, null, 2));

            // 3. Sync to Backend
            try {
                const response = await blocksApi.updatePositions(positionsData);
                console.log("✅ Positions synced successfully:", response.data);
            } catch (err: any) {
                console.error("❌ Failed to sync positions:", err.response?.data || err.message);
                // Revert UI if backend update fails
                setAddedSocials(addedSocials);
            }
        }
    };

    const handleSaveChanges = async () => {
    if (isBioOverLimit) return;
    setLoading(true);
    try {
        await authApi.updateProfile({
            profile: { displayName: name, bio: bio }
        });
        setLeftSaved(true);
    } catch (error) {
        console.error("Save failed:", error);
    } finally {
        setLoading(false);
    }
};

    const removeItem = async (id: string) => {
        if (pendingApiCalls.current.has(id)) {
            clearTimeout(pendingApiCalls.current.get(id));
            pendingApiCalls.current.delete(id);
        }

        const previousItems = [...addedSocials];
        setAddedSocials(prev => prev.filter((s) => s.id !== id));

        try {
            if (onDeleteBlock) {
                await onDeleteBlock(id);
            } else {
                await blocksApi.deleteBlock(id);
            }
            console.log(`✅ Block ${id} deleted`);
        } catch (err) {
            console.error("Failed to delete block:", err);
            setAddedSocials(previousItems);
        }
    };

    const changeRatio = async (id: string, newWidth: WidthType) => {
        const currentItem = addedSocials.find(s => s.id === id);
        if (!currentItem) return;

        const oldWidth = currentItem.width;

        // Update UI immediately
        setAddedSocials(prev => prev.map((s) =>
            s.id === id ? { ...s, width: newWidth } : s
        ));

        console.log(`Changing block ${id} from ${oldWidth} to ${newWidth}`);

        try {
            // Prepare update payload - ONLY update what's needed
            const updatePayload = {
                style: { width: newWidth }
            };

            if (onUpdateBlock) {
                await onUpdateBlock(id, updatePayload);
            } else {
                await blocksApi.updateBlock(id, updatePayload);
            }

            console.log(`✅ Block ${id} size updated to ${newWidth}`);

            // Also update position dimensions in a separate call if needed
            const positionUpdate = {
                position: {
                    w: getWidthValue(newWidth),
                    h: getHeightValue(newWidth)
                }
            };

            if (onUpdateBlock) {
                await onUpdateBlock(id, positionUpdate);
            } else {
                await blocksApi.updateBlock(id, positionUpdate);
            }

        } catch (err) {
            console.error("Failed to update block size:", err);
            // Revert UI on error
            setAddedSocials(prev => prev.map(s =>
                s.id === id ? { ...s, width: oldWidth } : s
            ));
        }
    };

    // const updateItem = useCallback((id: string, newData: any) => {
    //     if (pendingApiCalls.current.has(id)) {
    //         clearTimeout(pendingApiCalls.current.get(id));
    //         pendingApiCalls.current.delete(id);
    //     }

    //     // Update UI immediately
    //     setAddedSocials(prev => prev.map((s) => {
    //         if (s.id === id) {
    //             return { ...s, ...newData };
    //         }
    //         return s;
    //     }));

    //     // Debounce API call
    //     const timer = setTimeout(async () => {
    //         try {
    //             let updatePayload: any = {};

    //             if (newData.title !== undefined || newData.description !== undefined) {
    //                 updatePayload.content = {
    //                     title: newData.title,
    //                     description: newData.description
    //                 };
    //             }

    //             if (newData.style) {
    //                 updatePayload.style = newData.style;
    //             }

    //             if (Object.keys(updatePayload).length > 0) {
    //                 if (onUpdateBlock) {
    //                     await onUpdateBlock(id, updatePayload);
    //                 } else {
    //                     await blocksApi.updateBlock(id, updatePayload);
    //                 }
    //                 console.log(`✅ Block ${id} content updated`);
    //             }
    //         } catch (err) {
    //             console.error(`Failed to update block ${id}:`, err);
    //         } finally {
    //             pendingApiCalls.current.delete(id);
    //         }
    //     }, 500);

    //     pendingApiCalls.current.set(id, timer);
    // }, [onUpdateBlock]);


    const updateItem = useCallback((id: string, newData: any) => {
    if (pendingApiCalls.current.has(id)) {
        clearTimeout(pendingApiCalls.current.get(id));
        pendingApiCalls.current.delete(id);
    }

    // Update UI immediately — merge nested content properly
    setAddedSocials(prev => prev.map((s) => {
        if (s.id !== id) return s;
        const merged = { ...s, ...newData };
        if (newData.content) {
            merged.content = { ...s.content, ...newData.content };
            if (newData.content.location) {
                merged.location = newData.content.location; // top-level, used by LiveMap
            }
        }
        return merged;
    }));

    // Debounce API call
    const timer = setTimeout(async () => {
        try {
            const updatePayload: any = {};

            // Pass through ANY content fields given — location, url, title, description, etc.
            if (newData.content) {
                updatePayload.content = { ...newData.content };
            }
            if (newData.title !== undefined) {
                updatePayload.content = { ...(updatePayload.content || {}), title: newData.title };
            }
            if (newData.description !== undefined) {
                updatePayload.content = { ...(updatePayload.content || {}), description: newData.description };
            }
            if (newData.style) {
                updatePayload.style = newData.style;
            }
            if (newData.logo !== undefined) {
                updatePayload.logo = newData.logo;
            }

            if (Object.keys(updatePayload).length > 0) {
                if (onUpdateBlock) {
                    await onUpdateBlock(id, updatePayload);
                } else {
                    await blocksApi.updateBlock(id, updatePayload);
                }
                console.log(`✅ Block ${id} updated`);
            }
        } catch (err) {
            console.error(`Failed to update block ${id}:`, err);
        } finally {
            pendingApiCalls.current.delete(id);
        }
    }, 500);

    pendingApiCalls.current.set(id, timer);
}, [onUpdateBlock]);

    useEffect(() => {
        return () => {
            pendingApiCalls.current.forEach(timer => clearTimeout(timer));
            pendingApiCalls.current.clear();
        };
    }, []);

    const activeItem = addedSocials.find((s) => s.id === activeId);

    return (
        <section className={`min-h-screen bg-[#fafafa] flex flex-col ${viewMode === 'mobile' ? 'items-center pt-10' : 'lg:flex-row px-6 lg:px-16 py-12 lg:py-24 gap-12'} overflow-x-hidden relative`}>
            <div className={`transition-all duration-500 ${viewMode === 'mobile' ? 'w-[375px] mb-8' : 'w-full lg:w-[400px] shrink-0 '}`}>        
                <AnimatePresence mode="wait">
                    {!leftSaved ? (
                        <motion.div key="edit-mode" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                            <ProfileSection
                                avatar={avatar} setAvatar={setAvatar}
                                name={name} setName={setName}
                                bio={bio} setBio={setBio}
                                viewMode={viewMode}
                            />
                            <button
                             onClick={handleSaveChanges}
                             disabled={loading || isBioOverLimit}
                             className="w-full bg-black text-white py-5 rounded-[2rem] font-bold flex items-center justify-center gap-2 shadow-xl hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                             {loading ? <Loader2 className="animate-spin" size={20} /> : "Save Profile Changes"}
                         </button>
                        </motion.div>
                    ) : (
                        <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center lg:items-start space-y-6 pt-4 relative">
                            <div className="relative group">
                                <div className="w-44 h-44 rounded-full overflow-hidden ">
                                    {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="avatar" /> : <div className="w-full h-full bg-gray-200" />}
                                </div>
                                <button
                                    onClick={() => setLeftSaved(false)}
                                    className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-900 p-2.5 rounded-full hover:bg-white transition-all shadow-lg z-10 active:scale-95"
                                >
                                    <Pencil size={16} />
                                </button>
                            </div>
                            <div className="space-y-2 text-center lg:text-left px-2">
                                <h1 className={`${viewMode === 'mobile' ? 'text-4xl' : 'text-5xl'} font-black text-gray-900 tracking-tighter leading-none mb-2`}>
                                    {name || "Your Name"}
                                </h1>
                               <p className="text-xl text-gray-500 font-medium leading-tight break-words whitespace-pre-wrap max-w-full text-justify">
                                    {bio || "Your Bio"}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                
            </div>

            <div className={`flex justify-start items-start transition-all duration-500 ${viewMode === 'mobile' ? 'w-[375px]' : 'flex-1'}`}>
                <motion.div animate={{ width: viewMode === 'mobile' ? '375px' : '100%' }} className="min-h-[500px] relative w-full">
                    {addedSocials.length === 0 ? (
                        <div className="flex items-center justify-center h-64 text-gray-400">
                            <p>No blocks yet. Click the + button to add content!</p>
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            modifiers={[restrictToParentElement, restrictToWindowEdges]}
                        >
                            <SortableContext items={addedSocials.map((s) => s.id)} strategy={rectSortingStrategy}>
                                <div className="grid grid-flow-dense gap-6" style={{ display: 'grid', gridTemplateColumns: viewMode === 'mobile' ? 'repeat(2, 160px)' : 'repeat(auto-fill, 208px)' }}>
                                    {addedSocials.map((item: UISocialItem) => (
                                        <SortableSocialCard
                                            key={item.id}
                                            item={item}
                                            viewMode={viewMode}
                                            removeItem={removeItem}
                                            changeRatio={changeRatio}
                                            updateItem={updateItem}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                            <DragOverlay adjustScale={false}>
                                {activeId && activeItem && (
                                    <SortableSocialCard
                                        item={activeItem}
                                        viewMode={viewMode}
                                        isOverlay={true}
                                        removeItem={removeItem}
                                        changeRatio={changeRatio}
                                        updateItem={updateItem}
                                    />
                                )}
                            </DragOverlay>
                        </DndContext>
                    )}
                </motion.div>
            </div>
        </section>
    );
};

export default SocialsSection;