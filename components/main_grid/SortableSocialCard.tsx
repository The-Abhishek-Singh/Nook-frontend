

"use client";
import React, { useCallback, useRef, useEffect, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, MapPin, Quote, Link2, GripVertical, ChevronLeft, ChevronRight,Search, Lock, Unlock, X,AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import IconRenderer from './IconRenderer';
import { UISocialItem, WidthType, BlockContent } from '@/types';
import InstagramLargeCard from "../InstagramLargeCard";
import GithubLargeCard from '../GithubLargeCard';
import { PLATFORM_LOGOS } from '@/utils/platformLogos';
import dynamic from 'next/dynamic';
const LiveMap = dynamic(() => import('./LiveMap'), { ssr: false });

const laptopRatios: Record<WidthType, string> = {
    "1x1": "w-[208px] h-[208px]",
    "2x1": "w-[440px] h-[208px]",
    "1x2": "w-[208px] h-[440px]",
    "2x2": "w-[440px] h-[440px]",
    "full": "w-full min-h-[70px]",

    "1:1": "w-[208px] h-[208px]",
    "3:4": "w-[208px] h-[278px]",
    "4:3": "w-[278px] h-[208px]",
    "2:3": "w-[208px] h-[312px]",
    "3:2": "w-[312px] h-[208px]",
    "9:16": "w-[208px] h-[370px]",
    "16:9": "w-[370px] h-[208px]",
    "5:4": "w-[260px] h-[208px]",
    "4:5": "w-[208px] h-[260px]",
    "21:9": "w-[440px] h-[208px]"
};


const mobileRatios: Record<WidthType, string> = {
    "1x1": "w-[160px] h-[160px]",
    "2x1": "w-[344px] h-[160px]",
    "1x2": "w-[160px] h-[344px]",
    "2x2": "w-[344px] h-[344px]",
    "full": "w-full min-h-[60px]",

    "1:1": "w-[160px] h-[160px]",
    "3:4": "w-[160px] h-[214px]",
    "4:3": "w-[214px] h-[160px]",
    "2:3": "w-[160px] h-[240px]",
    "3:2": "w-[240px] h-[160px]",
    "9:16": "w-[160px] h-[284px]",
    "16:9": "w-[284px] h-[160px]",
    "5:4": "w-[200px] h-[160px]",
    "4:5": "w-[160px] h-[260px]",
    "21:9": "w-[344px] h-[160px]"
};

const getGridSpan = (width: WidthType, type?: String): string => {
    if (type === 'heading') return 'col-span-full w-full';
    switch (width) {
        case '1x1':
        case '1:1': 
            return 'col-span-1 row-span-1';
        case '2x1':
        case '3:2': 
        case '4:3':    // Changed from 2x2 to 2x1 so it fits a single row height cleanly
        case '5:4':
        case '16:9':
        case '21:9':
            return 'col-span-2 row-span-1';
        case '1x2':
        case '3:4':
        case '2:3':
        case '4:5':
        case '9:16':
            return 'col-span-1 row-span-2';
        case '2x2': 
            return 'col-span-2 row-span-2';
        case 'full': 
            return 'col-span-full w-full';
        default: 
            return 'col-span-1 row-span-1';
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
    const [page, setPage] = useState(0);
    const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | undefined>(
    item.location ? { lat: item.location.lat, lng: item.location.lng } : undefined
);

    const [isMapUnlocked, setIsMapUnlocked] = useState(false);
    const [showMapSearch, setShowMapSearch] = useState(false);
    const [mapSearchQuery, setMapSearchQuery] = useState("");
    const [mapSearchResults, setMapSearchResults] = useState<any[]>([]);
    const mapSearchDebounceRef = useRef<NodeJS.Timeout | null>(null);
    
    const platformLower = item.platform?.toLowerCase() || "";
    const isRestrictedPlatform = platformLower === "linkedin" || platformLower === "spotify";

    const pages: WidthType[][] = isRestrictedPlatform
        ? [["1x1", "1x2", "2x1"]]
        : [
            ["1x1", "2x1", "1x2", "2x2"],
            ["1:1", "3:4", "4:3", "2:3"],
            ["3:2", "9:16", "16:9", "5:4"],
            ["4:5", "21:9"]
          ];

    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const pendingUpdateRef = useRef<{ id: string; data: any } | null>(null);

    const searchLocation = useCallback((query: string) => {
    if (mapSearchDebounceRef.current) clearTimeout(mapSearchDebounceRef.current);
    if (!query.trim()) {
        setMapSearchResults([]);
        return;
    }
    mapSearchDebounceRef.current = setTimeout(async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/geocode?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            setMapSearchResults(data);
        } catch (err) {
            console.error("Location search failed", err);
            setMapSearchResults([]);
        }
    }, 400);
}, []);

const handleAlignChange = useCallback((align: 'left' | 'center' | 'right') => {
    updateItem(item.id, { content: { textAlign: align } });
}, [item.id, updateItem]);

     useEffect(() => {
    if (item.location) {
        setMapCoords({ lat: item.location.lat, lng: item.location.lng });
    }
}, [item.location?.lat, item.location?.lng]);

const handleSelectSearchResult = (result: any) => {
    const newLat = parseFloat(result.lat);
    const newLng = parseFloat(result.lon);
    setMapCoords({ lat: newLat, lng: newLng })

    updateItem(item.id, { content: { location: { lat: newLat, lng: newLng } } });
    setMapSearchQuery("");
    setMapSearchResults([]);
    setShowMapSearch(false);
};

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

    const cachedData = item.content?.cachedData;
    const profile = cachedData?.profile;
    const fetchedItems = cachedData?.items || [];
    const fetchStatus = item.content?.fetchStatus;

    const platformKey = item.platform?.toLowerCase();
    let logoUrl = (platformKey && PLATFORM_LOGOS[platformKey]) || item.logo || item.content?.logo || item.image || item.content?.imageUrl || '';
    if ((item.platform?.toLowerCase() === "website" || item.platform?.toLowerCase() === "linkedin") && profile?.favicon) {
        logoUrl = profile.favicon;
    }
    const clickUrl = (item.url || item.content?.url || '').toString().replace(/\\/g, '');
    if (logoUrl && (logoUrl === clickUrl || logoUrl.includes('linkedin.com') && !logoUrl.includes('s2/favicons'))) {
        logoUrl = '';
    }

    if (!logoUrl && clickUrl) {
        const domain = getDomain(clickUrl);
        if (domain) {
            logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
        }
    }

    let displayTitle = profile?.displayName || profile?.title || item.title || item.content?.title || item.platform || (isLink ? "Link" : (isSocial ? "Social Link" : "Link"));
    let displayHandle = profile?.username || item.handle || item.content?.handle || (clickUrl ? getDomain(clickUrl) : "view link");
    const subtitle = profile?.username ? `@${profile.username}` : displayHandle;

    const handleImageError = () => {
        if (!imgError && clickUrl) {
            const domain = getDomain(clickUrl);
            if (domain && !logoUrl.includes('clearbit.com')) {
                const fallbackUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
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
        <div ref={setNodeRef} style={style} className={`${getGridSpan(item.width, item.type)} ${isHeading ? 'col-span-full w-full' : `${ratioClasses[item.width]} max-w-none`} relative group`}>
            <div className={`w-full h-full ${isDragging && !isOverlay ? 'opacity-0' : 'opacity-100'}`}>

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
                    className={`relative transition-all duration-300 cursor-pointer ${isHeading ? 'w-full' : ratioClasses[item.width]} ${isOverlay ? 'shadow-2xl ring-4 ring-blue-500/20 scale-105' : ''} 
                    ${isQuote || isText ? 'bg-white rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col p-4' :
                            isHeading ? 'w-full' :
                                item.type === 'map' ? 'bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden' :
                                    'bg-white rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col overflow-hidden'}`}
                >
{isHeading ? (
     <div className="w-full flex items-center relative h-full px-4 py-3">
 <div className="flex-1 h-full bg-[#F5F5F7] rounded-xl px-4 py-2.5 flex items-center z-40">
     <input
         className="w-full bg-transparent border-none outline-none font-bold text-gray-800 placeholder:text-[#9fb3d0] text-lg"
         style={{ textAlign: item.content?.textAlign || 'left' }}
         placeholder="Add Heading..."
         value={item.title || ""}
         onChange={(e) => handleContentChange(e.target.value, 'title')}
     />
 </div>
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
                                        style={{ fieldSizing: 'content' } as React.CSSProperties}
                                    /> 
                                    <Quote size={20} className="text-gray-400 shrink-0 self-end" />
                                </div>
                            </div>
                        </div>
                    ): isText ? (
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
        {/* <LiveMap
            lat={item.location?.lat}
            lng={item.location?.lng}
            interactive={isMapUnlocked}
            onLocationChange={(newLat, newLng) => updateItem(item.id, { content: { location: { lat: newLat, lng: newLng } } })}
        /> */}
        <div
        className="w-full h-full relative group"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
    >
        <LiveMap
    key={`map-${item.id}-${item.order ?? 0}`} 
    lat={mapCoords?.lat}
    lng={mapCoords?.lng}
    interactive={isMapUnlocked}
    onLocationChange={(newLat, newLng) => {
        setMapCoords({ lat: newLat, lng: newLng });   // keep local state in sync on drag too
        updateItem(item.id, { content: { location: { lat: newLat, lng: newLng } } });
    }}
/>
</div>
        <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2 pointer-events-none">
            <MapPin size={12} className="text-red-500" />
            <span className="text-[10px] font-bold text-gray-800 uppercase tracking-tighter">Location</span>
        </div>
    </div>
) : item.type === 'image' ? (
                        <div className="w-full h-full flex items-center justify-center overflow-hidden">
                            <div className="overflow-hidden rounded-[inherit] bg-gray-100 w-full h-full">
                                <img
                                    src={item.image}
                                    className="w-full h-full object-cover pointer-events-none"
                                    alt="Content"
                                />
                            </div>
                        </div>
                    // ) : isSocial && fetchStatus === 'fetching' ? (
                    //    <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4 text-center">
                    //        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
                    //        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight">
                    //            Fetching {item.platform || "data"}...
                    //        </p>
                    //    </div>

                    ) : (item.platform?.toLowerCase() === "instagram" || item.platform?.toLowerCase() === "twitter") && fetchedItems.length > 0 ? (
                        <InstagramLargeCard
                            item={item}
                            profile={profile || item.content?.cachedData?.profile}
                            fetchedItems={fetchedItems || item.content?.cachedData?.items}
                            logoUrl={logoUrl}
                            subtitle={subtitle}
                        />
                    ) : item.platform?.toLowerCase() === "github" && fetchedItems.length > 0 ? (
                        <GithubLargeCard
                            item={item}
                            profile={profile}
                            fetchedItems={fetchedItems}
                            logoUrl={logoUrl}
                            subtitle={subtitle}
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col relative">
                            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center gap-3">
                                {logoUrl && !imgError ? (
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white flex items-center justify-center">
                                        <img
                                            src={logoUrl.toString().replace(/\\/g, '')}
                                            className="w-full h-full object-cover scale-120"
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
                                        {subtitle}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {item.type === 'map' && !isOverlay && (
    <div
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-4 right-4 z-40 flex flex-col items-end gap-2"
    >
        {showMapSearch && (
            <div className="w-64 max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                {mapSearchResults.length > 0 && (
                    <div className="max-h-52 overflow-y-auto">
                        {mapSearchResults.map((r, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSelectSearchResult(r)}
                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
                            >
                                {r.display_name}
                            </button>
                        ))}
                    </div>
                )}
                <div className="flex items-center gap-2 p-3">
                    <input
                        autoFocus
                        value={mapSearchQuery}
                        onChange={(e) => {
                            setMapSearchQuery(e.target.value);
                            searchLocation(e.target.value);
                        }}
                        placeholder="Search a location..."
                        className="flex-1 text-sm outline-none border border-gray-200 focus:border-emerald-400 rounded-full px-4 py-2 transition-colors"
                    />
                    {mapSearchQuery && (
                        <button
                            onClick={() => { setMapSearchQuery(""); setMapSearchResults([]); }}
                            className="text-gray-400 hover:text-gray-600 shrink-0"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>
        )}

        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-2xl shadow-xl border border-white/10">
            <button
                onClick={() => setShowMapSearch((prev) => !prev)}
                className={`p-2 rounded-xl transition-colors ${showMapSearch ? "bg-white text-black" : "text-white hover:bg-white/10"}`}
            >
                <Search size={14} />
            </button>
            <button
                onClick={() => { setIsMapUnlocked((prev) => !prev); setShowMapSearch(false); }}
                className={`p-2 rounded-xl transition-colors ${isMapUnlocked ? "bg-white text-black" : "text-white hover:bg-white/10"}`}
            >
                {isMapUnlocked ? <Unlock size={14} /> : <Lock size={14} />}
            </button>
        </div>
    </div>
)}

                {!isOverlay && item.width !== 'full' && !isHeading && !isQuote && !isText && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all flex items-center bg-black/60 backdrop-blur-md p-1 rounded-2xl gap-1 shadow-xl z-40 border border-white/10">
                        {page > 0 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPage((p) => p - 1);
                                }}
                                className="p-1 rounded-xl text-white hover:bg-white/10 transition-colors"
                            >
                                <ChevronLeft size={14} />
                            </button>
                        )}

                        {pages[page].map((r) => (
                            <button
                                key={r}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    changeRatio(item.id, r);
                                }}
                                className={`p-2 rounded-xl transition-colors ${
                                    item.width === r
                                        ? "bg-white text-black shadow-md"
                                        : "text-white hover:bg-white/10"
                                }`}
                            >
                                <div
                                    className={`border-2 border-current rounded-sm ${
                                        r === "1x1"
                                            ? "w-3.5 h-3.5"
                                            : r === "2x1"
                                            ? "w-5 h-2.5"
                                            : r === "1x2"
                                            ? "w-2.5 h-5"
                                            : r === "2x2"
                                            ? "w-4.5 h-4.5"
                                            : r === "16:9"
                                            ? "w-5 h-3"
                                            : r === "9:16"
                                            ? "w-3 h-5"
                                            : r === "4:3"
                                            ? "w-5 h-4"
                                            : r === "3:4"
                                            ? "w-4 h-5"
                                            : r === "2:3"
                                            ? "w-3 h-5"
                                            : r === "3:2"
                                            ? "w-5 h-3"
                                            : r === "5:4"
                                            ? "w-5 h-4"
                                            : r === "4:5"
                                            ? "w-4 h-5"
                                            : "w-6 h-3"
                                    }`}
                                />
                            </button>
                        ))}

                        {page < pages.length - 1 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPage((p) => p + 1);
                                }}
                                className="p-1 rounded-xl text-white hover:bg-white/10 transition-colors"
                            >
                                <ChevronRight size={14} />
                            </button>
                        )}

                        
                    </div>
                )}
                {!isOverlay && isHeading && (
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all flex items-center bg-black/60 backdrop-blur-md p-1 rounded-2xl gap-1 shadow-xl z-40 border border-white/10"
                    >
                        {(['left', 'center', 'right'] as const).map((align) => (
                            <button
                                key={align}
                                onClick={() => handleAlignChange(align)}
                                className={`p-2 rounded-xl transition-colors ${
                                    (item.content?.textAlign || 'left') === align
                                        ? "bg-white text-black shadow-md"
                                        : "text-white hover:bg-white/10"
                                }`}
                            >
                                {align === 'left' && <AlignLeft size={14} />}
                                {align === 'center' && <AlignCenter size={14} />}
                                {align === 'right' && <AlignRight size={14} />}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SortableSocialCard;
