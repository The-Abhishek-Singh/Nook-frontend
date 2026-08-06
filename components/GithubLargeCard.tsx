"use client";

import React, { useRef } from "react";

interface GithubLargeCardProps {
    profile: any;
    fetchedItems: any[];
    logoUrl: string;
    subtitle: string;
    item?: { width: string };
    isNarrow?: boolean;
}

const GithubLargeCard = ({
    profile,
    fetchedItems,
    logoUrl,
    subtitle,
    item,
    isNarrow = false,
}: GithubLargeCardProps) => {
    const contributions = fetchedItems;
    const scrollRef = useRef<HTMLDivElement>(null);

    const isDown = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    const width = item?.width || "2x2";
    
    // Core structural states
    const isSquareSmall = width === "1x1" || width === "1:1";
    const isLargeCard = width === "2x2" || width === "full";
    
    // Parse the width and height dimensions safely
    const { w, h } = (() => {
        if (width.includes(":") || width.includes("x")) {
            const separator = width.includes(":") ? ":" : "x";
            const [wPart, hPart] = width.split(separator).map(Number);
            return { w: wPart || 0, h: hPart || 0 };
        }
        return { w: 0, h: 0 };
    })();

    // Layout configuration flags
    const isTallLayout = isNarrow || (w > 0 && h > w) || (width.startsWith("1") && !isSquareSmall);
    const is16to9 = w === 16 && h === 9;
    const is4to5 = w === 4 && h === 5;
    const is2x2 = width === "2x2";

    // Component visibility matrices
    const showFollowButton = !is4to5; 
    const showBioInHeader = isLargeCard && !isTallLayout && !is16to9 && !is2x2;
    const showBioBelowHeader = is2x2 && profile?.bio;
    const showFooterStats = isLargeCard && !isTallLayout && !is16to9;
    const showHeatmap = !isSquareSmall || is16to9;

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        isDown.current = true;
        startX.current = e.pageX;
        scrollLeft.current = scrollRef.current.scrollLeft;
    };

    const handleMouseLeave = () => {
        isDown.current = false;
    };

    const handleMouseUp = () => {
        isDown.current = false;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDown.current || !scrollRef.current) return;
        e.preventDefault();
        const walk = e.pageX - startX.current;
        scrollRef.current.scrollLeft = scrollLeft.current - walk;
    };

    const weeks: any[][] = [];
    for (let i = 0; i < contributions.length; i += 7) {
        weeks.push(contributions.slice(i, i + 7));
    }

    const handleGitHubRedirect = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (profile?.username) {
            window.open(`https://github.com/${profile.username}`, "_blank");
        }
    };

    // 1. Mini View (1x1 / 1:1)
    if (isSquareSmall) {
        return (
            <div onClick={handleGitHubRedirect} className="w-full h-full bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-4 flex flex-col items-center justify-center text-center gap-2 select-none">
                <div className="w-12 h-12 rounded-full overflow-hidden border bg-white flex items-center justify-center shadow-sm shrink-0">
                    <img src={logoUrl} alt={profile?.displayName} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 w-full px-1">
                    <h3 className="font-bold text-gray-900 text-sm truncate uppercase tracking-tight">
                        {profile?.displayName || "GitHub"}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold truncate tracking-wider uppercase">
                        {subtitle}
                    </p>
                </div>
            </div>
        );
    }

    // 2. Standard Responsive Adaptive View
    return (
        <div className="w-full h-full bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-5 flex flex-col justify-start gap-3 overflow-hidden select-none">
            
            {/* Header Area */}
            <div className={`flex ${isTallLayout ? "flex-col items-center text-center gap-3" : "justify-between items-center gap-3"} shrink-0`}>
                <div className={`flex ${isTallLayout ? "flex-col items-center gap-2" : "items-center gap-3"} min-w-0 flex-1 w-full`}>
                    <img
                        src={logoUrl}
                        alt={profile?.displayName}
                        className="w-14 h-14 rounded-full object-cover border shrink-0"
                    />
                    <div className="min-w-0 flex-1 w-full">
                        <h2 className="text-sm md:text-xl font-bold text-gray-900 truncate leading-tight">
                            {profile?.displayName}
                        </h2>
                        <p className="text-xs text-gray-400 font-medium truncate">
                            {subtitle}
                        </p>
                        {profile?.bio && showBioInHeader && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2 max-w-[260px]">
                                {profile.bio}
                            </p>
                        )}
                    </div>
                </div>

                {showFollowButton && (
                    <button
                        onClick={handleGitHubRedirect}
                        className={`bg-[#24292F] hover:bg-[#1b1f23] text-white text-xs px-4 py-2 rounded-xl font-semibold transition-colors shrink-0 ${isTallLayout ? "w-full max-w-[140px]" : ""}`}
                    >
                        Follow
                    </button>
                )}
            </div>

            {/* Description rendering explicitly below the logo header context for 2x2 grids */}
            {showBioBelowHeader && (
                <p className="text-xs text-gray-500 line-clamp-2 w-full px-1 shrink-0 -mt-1">
                    {profile.bio}
                </p>
            )}

            {/* Heatmap Area */}
            {showHeatmap && contributions.length > 0 && (
                <div className={`flex flex-col min-h-0 ${(!isTallLayout || is16to9) ? "mt-auto" : ""}`}>
                    <p className={`text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 shrink-0 ${isTallLayout ? "text-center" : ""}`}>
                        Contributions
                    </p>
                    <div 
                        ref={scrollRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                        className="overflow-x-auto overflow-y-hidden pb-1 cursor-grab active:cursor-grabbing select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    >
                        <div className={`flex gap-[2px] w-max ${(isTallLayout || is16to9) ? "mx-auto" : ""}`}>
                            {weeks.map((week, weekIndex) => (
                                <div key={weekIndex} className="flex flex-col gap-[2px]">
                                    {week.map((day: any) => (
                                        <div
                                            key={day.date}
                                            title={`${day.date} • ${day.count} contributions`}
                                            className="w-[7px] h-[7px] md:w-[9px] md:h-[9px] rounded-[1px] shrink-0"
                                            style={{ backgroundColor: day.level === 0 ? '#f3f4f6' : day.level === 1 ? '#bbf7d0' : day.level === 2 ? '#4ade80' : day.level === 3 ? '#16a34a' : '#166534' }}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Stats Grid Layer */}
            {showFooterStats && (
                <div className="mt-auto border-t pt-3 flex justify-around shrink-0">
                    <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">
                            {profile?.followers ?? 0}
                        </div>
                        <div className="text-xs text-gray-500">
                            Followers
                        </div>
                    </div>

                    <div className="w-px bg-gray-200" />

                    <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">
                            {profile?.following ?? 0}
                        </div>
                        <div className="text-xs text-gray-500">
                            Following
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GithubLargeCard;