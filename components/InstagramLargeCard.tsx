"use client";

import React from "react";

interface InstagramLargeCardProps {
    profile: any;
    fetchedItems: any[];
    logoUrl: string;
    subtitle: string;
    item: any;
}

const InstagramLargeCard = ({
    profile,
    fetchedItems = [],
    logoUrl,
    subtitle,
    item
}: InstagramLargeCardProps) => {

    const width = item?.width;

    // Small or constrained square layouts that need a centered logo + text profile layout
    const isSmallCentered = ["1x1", "1:1"].includes(width);

    // Gracefully handle platforms like LinkedIn where fetchedItems might be empty
    const hasItems = fetchedItems && fetchedItems.length > 0;

    const imageCount =
        !hasItems || isSmallCentered
            ? 0
            : width === "2x2"
            ? 6
            : width === "21:9"
            ? 4
            : width === "2x1"
            ? 1
            : ["3x2", "3:2", "16:9"].includes(width)
            ? 3
            : ["1x2", "2:3", "3:4", "4:5", "9:16"].includes(width)
            ? 1
            : 2;

    // Normalize items so Twitter (media_url / text) and Instagram (thumbnail / url) map cleanly
    const posts = fetchedItems.slice(0, imageCount).map((postItem: any) => ({
        id: postItem.id || Math.random(),
        url: postItem.url || "#",
        thumbnail: postItem.media_url || (postItem.thumbnail?.includes('profile_images') ? '' : postItem.thumbnail) || "",
        text: postItem.caption || postItem.text || ""
    }));

    const hideImages = !hasItems || imageCount === 0 || isSmallCentered;

    const isVertical = ["1x2", "2:3", "3:4", "4:5", "9:16"].includes(width);

    const isLarge = width === "2x2";

    const isWide = ["2x1", "3:2", "16:9", "21:9"].includes(width);

    // Completely hide follow button in small slots to reduce clutter
    const hideFollowBtn = isSmallCentered;

    // ─── CENTERED COMPACT VIEW (For 1x1 / 1:1) ───────────────────────────
    if (isSmallCentered) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center gap-2">
                <img
                    src={logoUrl || "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"}
                    alt="Logo"
                    className="w-12 h-12 object-contain flex-shrink-0"
                />
                <div className="min-w-0 w-full flex flex-col items-center">
                    <h2 className="font-bold text-gray-900 text-sm sm:text-base truncate max-w-full leading-tight">
                        {profile?.displayName || subtitle || "Instagram"}
                    </h2>
                    <p className="text-[11px] sm:text-xs text-gray-400 font-medium truncate max-w-full uppercase tracking-tight mt-0.5">
                        @{profile?.username || subtitle}
                    </p>
                </div>
            </div>
        );
    }

    // ─── DEDICATED SIDE-BY-SIDE VIEW (For 21:9) ──────────────────────────
    if (width === "21:9") {
        return (
            <div className="w-full h-full flex flex-row items-center justify-between overflow-hidden p-4 sm:p-5 gap-4">
                {/* Left Profile Column */}
                <div className="flex flex-col justify-between h-full min-w-0 flex-1 py-0.5">
                    <div className="flex flex-col gap-2">
                        
                        <img
                            src={logoUrl || "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"}
                            alt="Logo"
                            className="w-10 h-10 object-contain flex-shrink-0"
                        />
                        <div className="min-w-0">
                            <h2 className="font-bold text-base sm:text-lg text-gray-900 truncate leading-tight">
                                {profile?.displayName || subtitle || "Instagram"}
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500 truncate mt-0.5">
                                @{profile?.username || subtitle}
                            </p>
                        </div>
                    </div>
                    
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://instagram.com/${profile?.username}`, "_blank");
                        }}
                        className="shrink-0 w-full max-w-[150px] h-9 rounded-xl bg-[#4F95F6] hover:bg-[#4288EB] text-white font-semibold flex items-center justify-center gap-1.5 text-xs sm:text-sm mt-2"
                    >
                        <span>Follow</span>
                        <span>{profile?.followers}</span>
                    </button>
                </div>

                {/* Right 2x2 Photos Column */}
                {hasItems ? (
                    <div className="grid grid-cols-2 gap-2 h-full aspect-square flex-shrink-0 min-h-0">
                        {posts.map((post: any) => (
                            <a
                                key={post.id}
                                href={post.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="overflow-hidden rounded-xl bg-gray-100 relative aspect-square"
                            >
                                {post.thumbnail ? (
                                    <img
                                        src={post.thumbnail}
                                        alt="Thumbnail"
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                ) : (
                                    <p className="p-2 text-[10px] text-gray-600 line-clamp-3 flex items-center h-full">{post.text}</p>
                                )}
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col justify-center items-center flex-1 h-full text-gray-400 text-xs text-center p-2">
                        <p>{profile?.bio || "No recent feed available."}</p>
                    </div>
                )}
            </div>
        );
    }

    // ─── DEDICATED COMPACT HORIZONTAL VIEW (For 2x1) ──────────────────────
    if (width === "2x1") {
        return (
            <div className="w-full h-full flex flex-row items-center justify-between overflow-hidden p-4 gap-4">
                {/* Left Profile Block */}
                <div className="flex flex-row items-center gap-3 min-w-0 flex-1">
                    <img
                        src={logoUrl || "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"}
                        alt="Logo"
                        className="w-10 h-10 object-contain flex-shrink-0"
                    />
                    <div className="min-w-0 flex flex-col">
                        <h2 className="font-bold text-base text-gray-900 truncate leading-tight">
                            {profile?.displayName || subtitle || "Instagram"}
                        </h2>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                            @{profile?.username || subtitle}
                        </p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://instagram.com/${profile?.username}`, "_blank");
                            }}
                            className="w-fit px-3 h-6 mt-1.5 rounded-lg bg-[#4F95F6] hover:bg-[#4288EB] text-white font-semibold flex items-center justify-center gap-1 text-[11px]"
                        >
                            <span>Follow</span>
                        </button>
                    </div>
                </div>

                {/* Right Single Balanced Image Frame */}
                {hasItems && posts[0] ? (
                    <a
                        href={posts[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="overflow-hidden rounded-xl bg-gray-100 h-full aspect-square flex-shrink-0 relative"
                    >
                        {posts[0].thumbnail ? (
                            <img
                                src={posts[0].thumbnail}
                                alt="Posts"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                        ) : (
                            <p className="p-2 text-[10px] text-gray-600 line-clamp-3 flex items-center h-full">{posts[0].text}</p>
                        )}
                    </a>
                ) : (
                    <div className="text-xs text-gray-400 text-right max-w-[120px] line-clamp-3">
                        {profile?.bio || ""}
                    </div>
                )}
            </div>
        );
    }

    // ─── STANDARD / EXPANDED VIEWS ──────────────────────────────────────
    return (
        <div className="w-full h-full flex flex-col overflow-hidden p-4 sm:p-5 justify-between">
            <div>
                {/* Header */}
                <div className={`flex flex-shrink-0 w-full justify-between items-center ${
                    isWide 
                        ? "gap-2 mb-3 pb-1.5 border-b border-gray-50" 
                        : isVertical 
                        ? "flex-col items-start gap-2 mb-3" 
                        : "gap-3 mb-3"
                }`}>
                    {/* Left Block */}
                    <div className={`min-w-0 flex ${
                        isWide 
                            ? "flex-row items-center gap-2 flex-1" 
                            : isVertical 
                            ? "flex-row items-center gap-2.5 w-full" 
                            : "flex-col"
                    }`}>
                        <img
                            src={logoUrl || "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"}
                            alt="Logo"
                            className={`object-contain flex-shrink-0 ${ 
                                isWide ? "w-6 h-6" : "w-8 h-8 sm:w-9 sm:h-9" 
                            }`}/>

                        <div className={`min-w-0 flex ${
                            isWide 
                                ? "flex-row items-baseline gap-1.5 flex-1" 
                                : isVertical 
                                ? "flex-col flex-1" 
                                : "flex-col"
                        }`}>
                            <h2 className={`font-bold truncate leading-tight text-gray-900 ${ 
                                isWide ? "text-xs sm:text-sm" : "text-sm sm:text-base"
                            } ${isWide || isVertical ? "mt-0" : "mt-1"}`}>
                                {profile?.displayName || subtitle || "Instagram"}
                            </h2>

                            <p className={`truncate text-gray-500 ${ 
                                isWide ? "text-[10px] sm:text-xs" : "text-xs"
                            } ${isWide ? "mt-0 opacity-70" : isVertical ? "mt-0" : "mt-0.5"}`}>
                                @{profile?.username || subtitle}
                            </p>
                        </div>
                    </div>

                    {/* Right Block */}
                    {!hideFollowBtn && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(
                                    `https://instagram.com/${profile?.username}`,
                                    "_blank"
                                );
                            }}
                            className={`shrink-0 rounded-xl bg-[#4F95F6] hover:bg-[#4288EB] text-white font-semibold flex items-center justify-center gap-1.5 ${
                                isWide 
                                    ? "h-6 px-2.5 text-[10px] sm:text-xs" 
                                    : isVertical 
                                    ? "w-full h-7 text-xs bg-[#4F95F6]/10 text-[#4F95F6] hover:bg-[#4F95F6]/25 mt-1" 
                                    : "h-7 sm:h-8 px-3 text-xs"
                            }`}>
                            <span>Follow</span>
                            <span className={isVertical ? "inline" : "hidden lg:block"}>{profile?.followers}</span>
                        </button>
                    )}
                </div>

                {/* Empty state / Bio fallback if items are missing (like LinkedIn) */}
                {!hasItems && (
                    <div className="flex flex-col justify-center items-center py-6 text-center text-gray-400 text-xs px-2">
                        <p>{profile?.bio || "No recent feed available for this account."}</p>
                    </div>
                )}
            </div>

            {/* Images Grid */}
            {!hideImages && (
                isVertical ? (
                    <div className="flex flex-col flex-1 gap-2 min-h-0 w-full overflow-hidden">
                        {posts.map((post: any) => (
                            <a
                                key={post.id}
                                href={post.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 w-full overflow-hidden rounded-xl bg-gray-900/5 relative flex items-center justify-center min-h-0"
                            >
                                {post.thumbnail ? (
                                    <img
                                        src={post.thumbnail}
                                        alt="thumbnail"
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                ) : (
                                    <p className="p-3 text-xs text-gray-600 line-clamp-3">{post.text}</p>
                                )}
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className={`flex-1 grid gap-1.5 content-end overflow-hidden min-h-0
                    ${ isLarge
                            ? "grid-cols-3"
                            : imageCount === 4
                            ? "grid-cols-4"
                            : imageCount === 3
                            ? "grid-cols-3"
                            : "grid-cols-2"
                    }
                `}>
                        {posts.map((post: any) => (
                            <a
                                key={post.id}
                                href={post.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className={`overflow-hidden rounded-xl bg-gray-900/5 ${
                                    isWide 
                                        ? "relative h-full w-full flex items-center justify-center" 
                                        : ["4:5", "3:4", "2:3", "3:2", "4:3", "16:9"].includes(width)
                                        ? "relative w-full h-full flex items-center justify-center" 
                                        : "relative aspect-square"
                                }`}
                            >
                                {post.thumbnail ? (
                                    <img
                                        src={post.thumbnail}
                                        alt="thumbnail"
                                        className=" block w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                ) : (
                                    <div className="p-2 text-[10px] text-gray-600 overflow-hidden h-full flex items-center text-center">
                                        {post.text}
                                    </div>
                                )}
                            </a>
                        ))}
                    </div>
                )
            )}
        </div>
    );
};

export default InstagramLargeCard;