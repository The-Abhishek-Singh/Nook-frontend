"use client";
import React, { useState } from 'react';
import { MapPin, Quote, Link2 } from 'lucide-react';
import IconRenderer from './IconRenderer';
import LiveMap from './LiveMap';
import { UISocialItem, WidthType } from '@/types';

const laptopRatios: Record<WidthType, string> = {
    '1x1': 'w-[208px] h-[208px]', '2x1': 'w-[448px] h-[208px]',
    '1x2': 'w-[208px] h-[448px]', '2x2': 'w-[448px] h-[448px]', 'full': 'w-full min-h-[70px]'
};

const mobileRatios: Record<WidthType, string> = {
    '1x1': 'w-[160px] h-[160px]', '2x1': 'w-[352px] h-[160px]',
    '1x2': 'w-[160px] h-[352px]', '2x2': 'w-[352px] h-[160px]', 'full': 'w-full min-h-[60px]'
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

export default function PublicSocialCard({ item, viewMode }: { item: UISocialItem, viewMode: 'desktop' | 'mobile' }) {
    const ratioClasses = viewMode === 'mobile' ? mobileRatios : laptopRatios;
    const [imgError, setImgError] = useState(false);

    const getCleanDomainName = (url: string) => {
        if (!url) return "";
        try {
            const cleanUrl = url.replace(/\\/g, '').trim();
            const urlObj = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`);
            return urlObj.hostname.replace('www.', '').split('.')[0];
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
        if (domain) logoUrl = `https://logo.clearbit.com/${domain}.com`;
    }

    let displayTitle = (isLink || isSocial) ? (getCleanDomainName(rawUrl) || item.platform || "Link") : (item.title || item.content?.title || "");

    return (
        <div className={`${getGridSpan(item.width)} ${item.width === 'full' || isHeading ? 'col-span-full w-full' : ''}`}>
            <div
                onClick={() => rawUrl && window.open(rawUrl, '_blank')}
                className={`relative transition-all duration-300 ${rawUrl ? 'cursor-pointer hover:scale-[1.02]' : ''} ${isHeading ? 'w-full h-[70px]' : ratioClasses[item.width]} 
                ${isQuote || isText ? 'bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-4' :
                        isHeading ? 'bg-white rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center px-4' :
                            item.type === 'map' ? 'bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden' :
                                'bg-white rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col overflow-hidden'}`}>

                {isHeading ? (
                    <div className="w-full flex items-center gap-3 h-full">
                        <div className="min-w-[160px] max-w-fit bg-[#F5F5F7] rounded-xl px-4 py-2.5">
                            <span className="font-bold text-gray-800 text-lg uppercase tracking-tight">{displayTitle}</span>
                        </div>
                        <div className="flex-1 h-[1px] bg-gray-100 mr-2" />
                    </div>
                ) : isQuote ? (
                    <div className="w-full h-full bg-[#F5F5F7] rounded-[1.5rem] p-5 flex flex-col justify-center">
                        <Quote size={20} className="text-gray-400 mb-2" />
                        <p className="text-gray-700 text-lg font-medium leading-relaxed italic">"{item.description}"</p>
                    </div>
                ) : item.type === 'map' ? (
                    <LiveMap lat={item.location?.lat} lng={item.location?.lng} />
                ) : item.type === 'image' ? (
                    <img src={item.image} className="w-full h-full object-cover" alt="Content" />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center gap-3">
                        {logoUrl && !imgError ? (
                            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white flex items-center justify-center">
                                <img src={logoUrl.replace(/\\/g, '')} className="w-full h-full object-cover" alt={displayTitle} onError={() => setImgError(true)} />
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