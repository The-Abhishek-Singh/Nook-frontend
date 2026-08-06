"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Loader2,
    ArrowLeft,
    Pencil,
    Link2,
} from 'lucide-react';
import { socialsApi, blocksApi } from '@/utils/api';

// --- Types ---
interface AddMediaSectionProps {
    onNext: () => void;
    onBack: () => void;
    addedSocials: any[];
    setAddedSocials: any;
    viewMode?: 'desktop' | 'mobile';
}

// Platform icon SVGs, served from /public/assets — replaces the previous lucide-react icons.
const ICON_SRC: { [key: string]: string } = {
    Instagram: '/assets/instagram.svg',
    Twitter: '/assets/twitter.svg',
    Github: '/assets/github.svg',
    Linkedin: '/assets/linkedin.svg',
    Youtube: '/assets/youtube.svg',
    Globe: '/globe.svg',
};

// Preview-card background per platform. Instagram stays white, others get light brand tint.
const PREVIEW_TINT: { [key: string]: string } = {
    Instagram: 'bg-white',
    Twitter: 'bg-[#eaf6ff]',
    Linkedin: 'bg-[#eaf3fb]',
    Github: 'bg-[#f2f2f2]',
    YouTube: 'bg-[#fff0f0]',
    Website: 'bg-[#f5f5f5]',
};

const PREVIEW_LABEL: { [key: string]: string } = {
    Instagram: 'Follow',
    Twitter: 'Follow',
    Linkedin: 'Connect',
    Github: 'Follow',
    YouTube: 'Subscribe',
    Website: 'Visit',
};

// --- SUB-COMPONENT: SocialRow ---
const SocialRow = ({
    iconSrc,
    color,
    placeholder,
    onAdd,
    isAdded,
    onRemove,
    currentValue,
    viewMode
}: {
    iconSrc: string,
    color: string,
    placeholder: string,
    onAdd: (val: string) => void,
    isAdded: boolean,
    onRemove: () => void,
    currentValue: string,
    viewMode?: string
}) => {
    const [value, setValue] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    const handleAddClick = () => {
        if (value.trim()) {
            onAdd(value.trim());
            setValue("");
            setIsEditing(false);
        }
    };

    const startEditing = () => {
        setValue(currentValue);
        setIsEditing(true);
    };

    return (
        <div className={`flex items-center gap-4 w-full ${viewMode === 'mobile' ? 'max-w-full' : 'max-w-md'}`}>
            <div className="w-11 h-11 rounded-xl shadow-lg transition-transform duration-300 shrink-0 overflow-hidden">
                <img src={iconSrc} alt="" className="w-full h-full object-cover" />
            </div>

            <div className={`flex-1 relative flex items-center border rounded-2xl pr-2 transition-all duration-300 shadow-sm ${
                (isAdded && !isEditing)
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-white border-gray-100 focus-within:ring-4 focus-within:ring-blue-50 focus-within:border-blue-200'
            }`}>
                <span className={`pl-4 font-bold ${(isAdded && !isEditing) ? 'text-blue-400' : 'text-[#000000]'} ${viewMode === 'mobile' ? 'text-xs' : 'text-sm'}`}>
                    {placeholder.includes("website") ? "" : "@"}
                </span>

                <input
                    type="text"
                    disabled={isAdded && !isEditing}
                    value={isEditing ? value : (isAdded ? currentValue : value)}
                    onChange={(e) => setValue(e.target.value)}
                    autoComplete="off"
                    spellCheck="false"
                    className="w-full text-black py-4 px-1 outline-none text-sm font-black bg-transparent placeholder:text-gray-300 transition-colors"
                    style={{
                        color: (isAdded && !isEditing) ? '#3b82f6' : '#000000',
                        opacity: 1,
                    }}
                    placeholder={placeholder}
                />

                <div className="flex items-center gap-1">
                    <AnimatePresence mode="wait">
                        {(isAdded && !isEditing) ? (
                            <div className="flex items-center" key="added-actions">
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onClick={startEditing}
                                    className="text-blue-500 p-2 hover:bg-blue-100 rounded-xl transition-colors"
                                    title="Edit"
                                >
                                    <Pencil size={18} />
                                </motion.button>
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onClick={onRemove}
                                    className="text-gray-400 p-2 hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    <X size={18} />
                                </motion.button>
                            </div>
                        ) : (
                            (value.length > 0 || isEditing) && (
                                <motion.button
                                    key="add-btn"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    onClick={handleAddClick}
                                    className="bg-[#2ecc71] text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-[#27ae60] transition-all shadow-md active:scale-95 shrink-0"
                                >
                                    {isEditing ? "Update" : "Add"}
                                </motion.button>
                            )
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: PreviewCard ---
const PreviewCard = ({ platform, handle, iconName, color }: { platform: string; handle: string; iconName: string; color: string }) => {
    const iconSrc = ICON_SRC[iconName] || ICON_SRC.Globe;
    const tint = PREVIEW_TINT[platform] || 'bg-white';
    const label = PREVIEW_LABEL[platform] || 'Follow';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className={`w-[180px] h-[180px] rounded-[1.5rem] border border-gray-100 shadow-sm p-4 flex flex-col justify-between shrink-0  ${tint}`}
        >
            <div className="w-9 h-9 rounded-lg overflow-hidden">
                <img src={iconSrc} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
                <p className="text-[12px] font-semibold text-gray-900 truncate">{platform}</p>
                {platform !== 'Website' && (
                    <p className="text-[11px] text-gray-400 font-medium truncate">@{handle}</p>
                )}
            </div>
            <button className={`text-white text-[12px] font-bold py-1.5 rounded-full w-fit px-5 mt-auto ${color}`}>
                {label}
            </button>
        </motion.div>
    );
};

export default function AddMediaSection({ onNext, onBack, addedSocials, setAddedSocials, viewMode }: AddMediaSectionProps) {
    const [socials, setSocials] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const mapping: { [key: string]: string } = {};
        addedSocials.forEach(item => {
            if (item.type === 'social') {
                mapping[item.platform.toLowerCase()] = item.handle;
            }
        });
        setSocials(mapping);
    }, [addedSocials]);

    const handleAddSocial = (platformKey: string, platformName: string, handle: string, iconName: string, color: string) => {
        setSocials(prev => ({ ...prev, [platformKey]: handle }));

        setAddedSocials((prev: any[]) => {
            const filtered = prev.filter(s => s.platform !== platformName);
            const newBlock = {
                id: `social-${platformKey}`,
                type: 'social',
                platform: platformName,
                handle: handle,
                iconName: iconName,
                color: color,
                btnColor: color,
                width: '1x1'
            };
            return [...filtered, newBlock];
        });
    };

    const handleRemoveSocial = (platformKey: string, platformName: string) => {
        setSocials(prev => {
            const newState = { ...prev };
            delete newState[platformKey];
            return newState;
        });
        setAddedSocials(addedSocials.filter((s: any) => s.platform !== platformName));
    };

    const handleSaveAndNext = async () => {
        setLoading(true);

        const rawMapping: any = {
            instagram: socials.instagram ? `https://instagram.com/${socials.instagram}` : "",
            twitter: socials.twitter ? `https://twitter.com/${socials.twitter}` : "",
            linkedin: socials.linkedin ? `https://linkedin.com/in/${socials.linkedin}` : "",
            github: socials.github ? `https://github.com/${socials.github}` : "",
            youtube: socials.youtube ? `https://youtube.com/@${socials.youtube}` : "",
            website: socials.website || ""
        };

        const formattedData = Object.fromEntries(
            Object.entries(rawMapping).filter(([_, value]) => value !== "")
        );

        try {
            if (Object.keys(formattedData).length > 0) {
                await socialsApi.updateSocials(formattedData);
            }

            const socialBlocksToCreate = addedSocials.filter(s => s.type === 'social');

            if (socialBlocksToCreate.length > 0) {
                for (let i = 0; i < socialBlocksToCreate.length; i++) {
                    const s = socialBlocksToCreate[i];
                    const resolvedUrl = s.platform === 'Website' ? s.handle : rawMapping[s.platform.toLowerCase()];
                    const payload = {
                        type: 'social',
                        content: {
                            platform: s.platform,
                            handle: s.handle,
                            url: resolvedUrl,
                            iconName: s.iconName
                        },
                        style: {
                            width: '1x1',
                            color: s.color || 'bg-zinc-800'
                        },
                        position: {
                            i: `block-${s.platform.toLowerCase()}`,
                            x: 0,
                            y: i,
                            w: 1,
                            h: 1
                        }
                    };
                    await blocksApi.createBlock(payload);
                }
            }
            onNext();
        } catch (error: any) {
            console.error("DEBUG: Save error:", error.response?.data || error);
            alert("Failed to save. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    const previewBlocks = addedSocials.filter(s => s.type === 'social');

    return (
        <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`min-h-screen bg-[#fafafa] text-black pb-32 ${viewMode === 'mobile' ? 'pt-5 px-4' : 'pt-10 px-8 md:px-16'}`}
        >
            <div className={`mx-auto ${viewMode === 'mobile' ? 'max-w-full' : 'max-w-[1350px]'}`}>

                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-400 hover:text-black hover:cursor-pointer font-bold text-sm mb-6 lg:-ml-22 transition-colors"
                >
                    <ArrowLeft size={16} /> Back to Editor
                </button>

                <div className={`flex ${viewMode === 'mobile' ? 'flex-col' : 'flex-col lg:flex-row lg:items-start lg:gap-12'}`}>

                    {/* Left Form Column */}
                    <div className={viewMode === 'mobile' ? 'w-full' : 'w-full lg:w-[480px] shrink-0 lg:-ml-16'}>
                        <header className="mb-8">
                            <h1 className="text-2xl md:text-3xl font-black text-[#000000] mb-1 tracking-tighter leading-tight whitespace-nowrap">
                                Now, let's add your social media
                            </h1>
                            <h1 className="text-2xl md:text-3xl font-black text-[#000000] tracking-tighter leading-tight">
                                accounts to your page.
                            </h1>
                        </header>

                        <div className="space-y-4 mb-10 text-black">
                            <SocialRow
                                iconSrc={ICON_SRC.Twitter}
                                color="bg-[#1DA1F2]"
                                placeholder="username"
                                isAdded={!!socials.twitter}
                                currentValue={socials.twitter || ""}
                                onAdd={(val) => handleAddSocial('twitter', 'Twitter', val, 'Twitter', 'bg-[#1DA1F2]')}
                                onRemove={() => handleRemoveSocial('twitter', 'Twitter')}
                                viewMode={viewMode}
                            />
                            <SocialRow
                                iconSrc={ICON_SRC.Instagram}
                                color="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
                                placeholder="username"
                                isAdded={!!socials.instagram}
                                currentValue={socials.instagram || ""}
                                onAdd={(val) => handleAddSocial('instagram', 'Instagram', val, 'Instagram', 'bg-[#E1306C]')}
                                onRemove={() => handleRemoveSocial('instagram', 'Instagram')}
                                viewMode={viewMode}
                            />
                            <SocialRow
                                iconSrc={ICON_SRC.Linkedin}
                                color="bg-[#0077b5]"
                                placeholder="username"
                                isAdded={!!socials.linkedin}
                                currentValue={socials.linkedin || ""}
                                onAdd={(val) => handleAddSocial('linkedin', 'Linkedin', val, 'Linkedin', 'bg-[#0077b5]')}
                                onRemove={() => handleRemoveSocial('linkedin', 'Linkedin')}
                                viewMode={viewMode}
                            />
                            <SocialRow
                                iconSrc={ICON_SRC.Github}
                                color="bg-black"
                                placeholder="username"
                                isAdded={!!socials.github}
                                currentValue={socials.github || ""}
                                onAdd={(val) => handleAddSocial('github', 'Github', val, 'Github', 'bg-black')}
                                onRemove={() => handleRemoveSocial('github', 'Github')}
                                viewMode={viewMode}
                            />
                            <SocialRow
                                iconSrc={ICON_SRC.Youtube}
                                color="bg-[#FF0000]"
                                placeholder="username"
                                isAdded={!!socials.youtube}
                                currentValue={socials.youtube || ""}
                                onAdd={(val) => handleAddSocial('youtube', 'YouTube', val, 'Youtube', 'bg-[#FF0000]')}
                                onRemove={() => handleRemoveSocial('youtube', 'YouTube')}
                                viewMode={viewMode}
                            />
                            <SocialRow
                                iconSrc={ICON_SRC.Globe}
                                color="bg-zinc-800"
                                placeholder="username"
                                isAdded={!!socials.website}
                                currentValue={socials.website || ""}
                                onAdd={(val) => handleAddSocial('website', 'Website', val, 'Globe', 'bg-zinc-800')}
                                onRemove={() => handleRemoveSocial('website', 'Website')}
                                viewMode={viewMode}
                            />
                        </div>

                        <footer className="flex items-center gap-6">
                            <button
                                onClick={handleSaveAndNext}
                                disabled={loading}
                                className="bg-black text-white px-10 py-4 rounded-[2rem] font-black text-sm shadow-xl hover:bg-zinc-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : "Next"}
                            </button>
                            <button
                                onClick={onNext}
                                className="text-black font-bold hover:opacity-70 transition-opacity text-sm"
                            >
                                Skip
                            </button>
                        </footer>
                    </div>

                    {/* Live Preview Panel Column with 4-Card Single Row Grid */}
                    <div className="flex-1 w-full mt-12 lg:mt-0 lg:ml-20">
                        {/* Top Aligned Header matching the left title row level */}
                        <div className="w-full flex items-center justify-center relative mb-6 mt-5">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <span className="relative bg-[#fafafa] px-6 text-sm font-bold text-gray-800 tracking-tight">
                                Your page
                            </span>
                        </div>

                        {previewBlocks.length > 0 && (
    <motion.div
        layout
        className="flex flex-wrap gap-6"
    >
        <AnimatePresence mode="popLayout">
            {previewBlocks.map((s) => (
                <PreviewCard
                    key={s.id}
                    platform={s.platform}
                    handle={s.handle}
                    iconName={s.iconName}
                    color={s.color}
                />
            ))}
        </AnimatePresence>
    </motion.div>
)}
                    </div>

                </div>
            </div>
        </motion.section>
    );
}

