"use client";

import React, { useCallback, useRef, useEffect, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, MapPin, Quote, Link2, GripVertical } from 'lucide-react';
import IconRenderer from './IconRenderer';
import LiveMap from './LiveMap';
import { UISocialItem, WidthType, BlockContent } from '@/types';

const laptopRatios: Record<WidthType, string> = {
    '1x1': 'w-[208px] h-[208px]',
    '2x1': 'w-[448px] h-[208px]',
    '1x2': 'w-[208px] h-[448px]',
    '2x2': 'w-[448px] h-[448px]',
    'full': 'w-full min-h-[70px]'
};

const mobileRatios: Record<WidthType, string> = {
    '1x1': 'w-[160px] h-[160px]',
    '2x1': 'w-[352px] h-[160px]',
    '1x2': 'w-[160px] h-[352px]',
    '2x2': 'w-[352px] h-[352px]', // FIX: Changed from 160px to 352px to make it a square
    'full': 'w-full min-h-[60px]'
};

const getGridSpan = (width: WidthType): string => {
    switch (width) {
        case '1x1': return 'col-span-1 row-span-1';
        case '2x1': return 'col-span-2 row-span-1';
        case '1x2': return 'col-span-1 row-span-2';
        case '2x2': return 'col-span-2 row-span-2';
        case 'full': return 'col-span-full';
        default: return 'col-span-1 row-span-1';
    }
};

interface SortableSocialCardProps {
    item: UISocialItem;
    removeItem: (id: string) => void;
    changeRatio: (id: string, width: WidthType) => void;
    updateItem: (id: string, data: any) => void;
    viewMode: 'desktop' | 'mobile';
    isOverlay?: boolean;
}

const SortableSocialCard = ({ item, removeItem, changeRatio, updateItem, viewMode, isOverlay = false }: SortableSocialCardProps) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
    const ratioClasses = viewMode === 'mobile' ? mobileRatios : laptopRatios;
    const style = { transform: CSS.Translate.toString(transform), transition, zIndex: isDragging ? 50 : 1 };
    const [imgError, setImgError] = useState(false);

    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const pendingUpdateRef = useRef<{ id: string; data: any } | null>(null);

    const getDomain = (url: string) => {
        if (!url) return "";
        try {
            const cleanUrl = url.replace(/\\/g, '');
            const urlObj = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`);
            return urlObj.hostname;
        } catch {
            return "";
        }
    };

    const handleContentChange = useCallback((value: string, field: string = 'title') => {
        const updatedContent: BlockContent = {};
        if (['text', 'quote', 'heading'].includes(item.type)) {
            if (field === 'title') {
                updatedContent.title = value;
                updatedContent.description = item.description || "";
            } else {
                updatedContent.title = item.title || "";
                updatedContent.description = value;
            }
            const updatedData = {
                content: updatedContent,
                title: field === 'title' ? value : item.title,
                description: field === 'description' ? value : item.description
            };
            updateItem(item.id, updatedData);

            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
            pendingUpdateRef.current = { id: item.id, data: updatedData };
            debounceTimerRef.current = setTimeout(() => {
                if (pendingUpdateRef.current) {
                    updateItem(pendingUpdateRef.current.id, pendingUpdateRef.current.data);
                    pendingUpdateRef.current = null;
                }
            }, 500);
        } else if (item.type === 'social' || item.type === 'link') {
            updatedContent.url = value;
            updateItem(item.id, { content: updatedContent });
        } else {
            updatedContent[field as keyof BlockContent] = value as any;
            updateItem(item.id, { content: updatedContent });
        }
    }, [item.id, item.type, item.title, item.description, updateItem]);

    useEffect(() => {
        return () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); };
    }, []);

    const isHeading = item.type === 'heading';
    const isQuote = item.type === 'quote';
    const isText = item.type === 'text';
    const isLink = item.type === 'link';
    const isSocial = item.type === 'social';

    let logoUrl = item.logo || item.content?.logo || item.image || item.content?.imageUrl || '';
    const clickUrl = (item.url || item.content?.url || '').toString().replace(/\\/g, '');

    if (!logoUrl && clickUrl) {
        const domain = getDomain(clickUrl);
        if (domain) {
            logoUrl = `https://logo.clearbit.com/${domain}`;
        }
    }

    let displayTitle = item.title || item.content?.title || item.platform || (isLink ? "Link" : (isSocial ? "Social Link" : "Link"));
    let displayHandle = item.handle || item.content?.handle || (clickUrl ? getDomain(clickUrl) : "view link");

    const handleImageError = () => {
        if (!imgError && clickUrl) {
            const domain = getDomain(clickUrl);
            if (domain && !logoUrl.includes('clearbit.com')) {
                const fallbackUrl = `https://logo.clearbit.com/${domain}`;
                setImgError(false);
                updateItem(item.id, { logo: fallbackUrl });
            } else {
                setImgError(true);
            }
        } else {
            setImgError(true);
        }
    };

    return (
        <div ref={setNodeRef} style={style} className={`${getGridSpan(item.width)} ${item.width === 'full' || isHeading ? 'col-span-full w-full' : ''}`}>
            <div className={`relative group w-full h-full ${isDragging && !isOverlay ? 'opacity-0' : 'opacity-100'}`}>

                {!isOverlay && (
                    <div
                        {...attributes}
                        {...listeners}
                        className="absolute top-2 left-1/2 -translate-x-1/2 z-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded-md text-gray-400"
                    >
                        <GripVertical size={16} />
                    </div>
                )}

                {!isOverlay && (
                    <button
                        onClick={() => removeItem(item.id)}
                        className="absolute -top-3 -left-3 z-[60] opacity-0 group-hover:opacity-100 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-800 hover:text-red-500 transition-all active:scale-90"
                    >
                        <Trash2 size={18} />
                    </button>
                )}
                <div
                    onClick={() => !isDragging && (isLink || isSocial) && clickUrl && window.open(clickUrl, '_blank')}
                    className={`relative transition-all duration-300 cursor-pointer ${isHeading ? 'w-full h-[70px]' : ratioClasses[item.width]} ${isOverlay ? 'shadow-2xl ring-4 ring-blue-500/20 scale-105' : ''} 
                    ${isQuote || isText ? 'bg-white rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col p-4' :
                            isHeading ? 'bg-white rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center px-4' :
                                item.type === 'map' ? 'bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden' :
                                    'bg-white rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col overflow-hidden'}`}>

                    {isHeading ? (
                        <div className="w-full flex items-center relative gap-3 h-full">
                            <div className="min-w-[160px] max-w-fit bg-[#F5F5F7] rounded-xl px-4 py-2.5 z-40">
                                <input
                                    className="w-full bg-transparent border-none outline-none font-bold text-gray-800 placeholder:text-[#9fb3d0] text-lg"
                                    placeholder="Add Heading..."
                                    value={item.title || ""}
                                    onChange={(e) => handleContentChange(e.target.value, 'title')}
                                />
                            </div>
                            <div className="flex-1 h-[1px] bg-gray-100 mr-2" />
                        </div>
                    ) : isQuote ? (
                        <div className="w-full h-full flex flex-col relative">
                            <div className="w-full h-full bg-[#F5F5F7] rounded-[1.5rem] p-5 flex flex-col overflow-hidden">
                                <div className="flex items-start gap-2 mb-3">
                                    <Quote size={20} className="text-gray-400 shrink-0 mt-1" />
                                    <textarea
                                        className="w-full bg-transparent border-none outline-none text-gray-700 text-lg resize-none placeholder:text-[#9fb3d0] font-medium leading-relaxed"
                                        placeholder="Add a quote or note..."
                                        value={item.description || ""}
                                        onChange={(e) => handleContentChange(e.target.value, 'description')}
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : isText ? (
                        <div className="w-full h-full flex flex-col relative">
                            <div className="w-full h-full bg-[#F5F5F7] rounded-[1.5rem] p-5 flex flex-col overflow-hidden">
                                <input
                                    className="w-full bg-transparent border-none outline-none font-bold text-gray-800 text-xl mb-3 placeholder:text-[#9fb3d0]"
                                    placeholder="Title..."
                                    value={item.title || ""}
                                    onChange={(e) => handleContentChange(e.target.value, 'title')}
                                />
                                <textarea
                                    className="w-full flex-1 bg-transparent border-none outline-none text-gray-600 text-base resize-none placeholder:text-[#9fb3d0]"
                                    placeholder="Write something..."
                                    value={item.description || ""}
                                    onChange={(e) => handleContentChange(e.target.value, 'description')}
                                />
                            </div>
                        </div>
                    ) : item.type === 'map' ? (
                        <div className="w-full h-full relative group">
                            <LiveMap lat={item.location?.lat} lng={item.location?.lng} />
                            <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                                <MapPin size={12} className="text-red-500" />
                                <span className="text-[10px] font-bold text-gray-800 uppercase tracking-tighter">Location</span>
                            </div>
                        </div>
                    ) : item.type === 'image' ? (
                        <div className="w-full h-full relative group">
                            <img src={item.image} className="w-full h-full object-cover pointer-events-none" alt="Content" />
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col relative">
                            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center gap-3">
                                {logoUrl && !imgError ? (
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white flex items-center justify-center">
                                        <img
                                            src={logoUrl.toString().replace(/\\/g, '')}
                                            className="w-full h-full object-cover"
                                            alt={displayTitle}
                                            onError={handleImageError}
                                        />
                                    </div>
                                ) : (
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white ${item.color || 'bg-gradient-to-br from-gray-800 to-gray-900'} shadow-lg`}>
                                        {item.iconName ? (
                                            <IconRenderer name={item.iconName} size={32} />
                                        ) : (
                                            <Link2 size={32} />
                                        )}
                                    </div>
                                )}
                                <div className="flex flex-col min-w-0 w-full">
                                    <h3 className="font-bold text-gray-900 text-base truncate uppercase tracking-tight">
                                        {displayTitle}
                                    </h3>
                                    <p className="text-[11px] text-gray-400 font-bold truncate max-w-[150px] mx-auto uppercase">
                                        {displayHandle}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {!isOverlay && item.width !== 'full' && !isHeading && !isQuote && !isText && (
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all flex items-center bg-[#050505] p-1.5 rounded-2xl gap-1 shadow-2xl z-40 border border-white/10">
                        {(['1x1', '2x1', '1x2', '2x2'] as WidthType[]).map((r) => (
                            <button
                                key={r}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    changeRatio(item.id, r);
                                }}
                                className={`p-2 rounded-xl transition-colors ${item.width === r ? 'bg-white text-black' : 'text-white hover:bg-white/10'}`}
                            >
                                <div className={`border-2 border-current rounded-sm ${r === '1x1' ? 'w-3.5 h-3.5' : r === '2x1' ? 'w-5 h-2.5' : r === '1x2' ? 'w-2.5 h-5' : 'w-4.5 h-4.5'}`} />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SortableSocialCard;