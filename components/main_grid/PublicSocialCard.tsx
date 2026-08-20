
"use client";
import React, { useState } from 'react';
import { MapPin, Quote, Link2 } from 'lucide-react';
import IconRenderer from './IconRenderer';
import { UISocialItem, WidthType } from '@/types';
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

const getGridSpan = (width: WidthType): string => {
    switch (width) {
        case '1x1':
        case '1:1':
            return 'col-span-1 row-span-1';
        case '2x1':
        case '3:2':
        case '4:3':
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
            return 'col-span-full';
        default:
            return 'col-span-1 row-span-1';
    }
};

export default function PublicSocialCard({ item, viewMode }: { item: UISocialItem, viewMode: 'desktop' | 'mobile' }) {
    const ratioClasses = viewMode === 'mobile' ? mobileRatios : laptopRatios;
    const [imgError, setImgError] = useState(false);

    const getCleanDomainName = (url: string) => {
        if (!url) return "";
        try {
            const cleanUrl = url.replace(/\\/g, '').trim();
            const urlObj = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`);
            return urlObj.hostname.replace('www.', '');
        } catch { return ""; }
    };

    const isHeading = item.type === 'heading';
    const isQuote = item.type === 'quote';
    const isText = item.type === 'text';
    const isLink = item.type === 'link';
    const isSocial = item.type === 'social';
    const rawUrl = (item.url || item.content?.url || '').toString().replace(/\\/g, '').trim();

    let logoUrl = item.logo || item.content?.logo || item.image || item.content?.imageUrl || '';
    if (!logoUrl && rawUrl) {
        const domain = getCleanDomainName(rawUrl);
        if (domain) logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    }

    const domainNameOnly = getCleanDomainName(rawUrl).split('.')[0];
    let displayTitle = (isLink || isSocial) ? (domainNameOnly || item.platform || "Link") : (item.title || item.content?.title || "");

    return (
        <div className={`${getGridSpan(item.width)} ${item.width === 'full' || isHeading ? 'col-span-full w-full' : ''}`}>
            <div
                onClick={() => rawUrl && window.open(rawUrl, '_blank')}
                className={`relative transition-all duration-300 ${rawUrl ? 'cursor-pointer hover:scale-[1.02]' : ''} ${isHeading ? 'w-full h-[70px]' : ratioClasses[item.width]} 
                ${isQuote || isText ? 'bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-4' :
                        isHeading ? ' flex items-center px-4' :
                            item.type === 'map' ? 'bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden' :
                                'bg-white rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col overflow-hidden'}`}>

                {isHeading ? (
    <div className="w-full h-full flex items-center px-4 py-3">
        <div className="flex-1 h-full bg-[#F5F5F7] rounded-xl px-4 py-2.5 flex items-center">
            <span
                className="font-bold text-gray-800 text-lg uppercase tracking-tight w-full"
                style={{ textAlign: item.content?.textAlign || 'left' }}
            >
                {displayTitle}
            </span>
        </div>
    </div>
) : isQuote ? (
    <div className="w-full h-full bg-[#F5F5F7] rounded-[1.5rem] p-6 flex flex-col items-center justify-center text-center">
        {item.description ? (
            <p className="text-gray-700 text-lg font-medium leading-relaxed italic">"{item.description}"</p>
        ) : (
            <p className="text-gray-300 text-lg font-medium italic">No quote added</p>
        )}
    </div>
) : item.type === 'map' ? (
                    <LiveMap lat={item.location?.lat} lng={item.location?.lng} />
                ) : item.type === 'image' ? (
                    <img src={item.image} className="w-full h-full object-cover" alt="Content" />
                ) : (item.platform?.toLowerCase() === "instagram"||item.platform?.toLowerCase() === "twitter")
                 && (item.content?.cachedData?.items?.length ?? 0) > 0 ? (
                    <InstagramLargeCard
                        item={item}
                        profile={item.content?.cachedData?.profile}
                        fetchedItems={item.content?.cachedData?.items || []}
                        logoUrl={logoUrl}
                        subtitle={item.handle || `@${item.content?.cachedData?.profile?.username || ''}`}
                    />
                ) : item.platform?.toLowerCase() === "github" && (item.content?.cachedData?.items?.length ?? 0) > 0 ? (
                    <GithubLargeCard
                        item={item}    
                        profile={item.content?.cachedData?.profile}
                        fetchedItems={item.content?.cachedData?.items || []}
                        logoUrl={logoUrl}
                        subtitle={item.handle || `@${item.content?.cachedData?.profile?.username || ''}`}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center gap-3">
                        {logoUrl && !imgError ? (
                            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white flex items-center justify-center">
                                <img src={logoUrl.replace(/\\/g, '')} className="w-full h-full object-cover scale-120" alt={displayTitle} onError={() => setImgError(true)} />
                            </div>
                        ) : (
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white ${item.color || 'bg-zinc-800 shadow-lg'}`}>
                                {item.iconName ? <IconRenderer name={item.iconName} size={32} /> : <Link2 size={32} />}
                            </div>
                        )}
                        <div className="flex flex-col min-w-0 w-full">
                            <h3 className="font-bold text-gray-900 text-base truncate uppercase tracking-tight">{displayTitle}</h3>
                            <p className="text-[11px] text-gray-400 font-bold truncate max-w-[150px] mx-auto uppercase">{item.handle || getCleanDomainName(rawUrl)}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}