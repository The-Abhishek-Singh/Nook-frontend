"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Twitter,
    Instagram,
    Github,
    Linkedin,
    Youtube,
    Globe,
    X,
    Loader2,
    ArrowLeft,
    Pencil,
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

// --- SUB-COMPONENT: SocialRow ---
const SocialRow = ({
    icon: Icon,
    color,
    placeholder,
    onAdd,
    isAdded,
    onRemove,
    currentValue,
    viewMode
}: {
    icon: any,
    color: string,
    placeholder: string,
    onAdd: (val: string) => void,
    isAdded: boolean,
    onRemove: () => void,
    currentValue: string,
    viewMode?: string
}) => {
    const [value, setValue] = useState("");

    // Use internal state to handle switching to edit mode
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
            <div className={`p-3 rounded-xl text-white ${color} shadow-lg transition-transform duration-300 shrink-0`}>
                <Icon size={viewMode === 'mobile' ? 20 : 24} />
            </div>

            <div className={`flex-1 relative flex items-center border rounded-2xl pr-2 transition-all duration-300 shadow-sm ${(isAdded && !isEditing)
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

export default function AddMediaSection({ onNext, onBack, addedSocials, setAddedSocials, viewMode }: AddMediaSectionProps) {
    const [socials, setSocials] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);

    // Sync local 'socials' state with 'addedSocials' prop on mount
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
        // 1. Update UI dictionary
        setSocials(prev => ({ ...prev, [platformKey]: handle }));

        // 2. Update addedSocials list - REMOVE existing one first to prevent duplicates
        setAddedSocials((prev: any[]) => {
            const filtered = prev.filter(s => s.platform !== platformName);
            const newBlock = {
                id: `social-${platformKey}`, // Constant ID based on platform prevents multiples
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
                    const payload = {
                        type: 'social',
                        content: {
                            platform: s.platform,
                            handle: s.handle,
                            text: s.platform === 'Website' ? s.handle : rawMapping[s.platform.toLowerCase()],
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

    return (
        <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`min-h-screen bg-[#fafafa] text-black pb-32 ${viewMode === 'mobile' ? 'pt-10 px-4' : 'pt-24 px-6 md:px-24'}`}
        >
            <div className={`mx-auto ${viewMode === 'mobile' ? 'max-w-full' : 'max-w-2xl lg:mx-0'}`}>

                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-400 hover:text-black font-bold text-sm mb-8 transition-colors"
                >
                    <ArrowLeft size={16} /> Back to Editor
                </button>

                <header className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-[#000000] mb-2 tracking-tighter leading-tight">
                        Now, let's add your social
                    </h1>
                    <h1 className="text-4xl md:text-5xl font-black text-[#000000] tracking-tighter leading-tight">
                        media accounts.
                    </h1>
                    <p className="mt-4 text-gray-400 font-medium text-lg">
                        This will help people find you everywhere.
                    </p>
                </header>

                <div className="space-y-5 mb-16 text-black">
                    <SocialRow
                        icon={Instagram}
                        color="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
                        placeholder="instagram-username"
                        isAdded={!!socials.instagram}
                        currentValue={socials.instagram || ""}
                        onAdd={(val) => handleAddSocial('instagram', 'Instagram', val, 'Instagram', 'bg-[#E1306C]')}
                        onRemove={() => handleRemoveSocial('instagram', 'Instagram')}
                        viewMode={viewMode}
                    />
                    <SocialRow
                        icon={Twitter}
                        color="bg-[#1DA1F2]"
                        placeholder="twitter-handle"
                        isAdded={!!socials.twitter}
                        currentValue={socials.twitter || ""}
                        onAdd={(val) => handleAddSocial('twitter', 'Twitter', val, 'Twitter', 'bg-[#1DA1F2]')}
                        onRemove={() => handleRemoveSocial('twitter', 'Twitter')}
                        viewMode={viewMode}
                    />
                    <SocialRow
                        icon={Github}
                        color="bg-black"
                        placeholder="github-username"
                        isAdded={!!socials.github}
                        currentValue={socials.github || ""}
                        onAdd={(val) => handleAddSocial('github', 'Github', val, 'Github', 'bg-black')}
                        onRemove={() => handleRemoveSocial('github', 'Github')}
                        viewMode={viewMode}
                    />
                    <SocialRow
                        icon={Linkedin}
                        color="bg-[#0077b5]"
                        placeholder="linkedin-username"
                        isAdded={!!socials.linkedin}
                        currentValue={socials.linkedin || ""}
                        onAdd={(val) => handleAddSocial('linkedin', 'Linkedin', val, 'Linkedin', 'bg-[#0077b5]')}
                        onRemove={() => handleRemoveSocial('linkedin', 'Linkedin')}
                        viewMode={viewMode}
                    />
                    <SocialRow
                        icon={Youtube}
                        color="bg-[#FF0000]"
                        placeholder="youtube-channel"
                        isAdded={!!socials.youtube}
                        currentValue={socials.youtube || ""}
                        onAdd={(val) => handleAddSocial('youtube', 'YouTube', val, 'Youtube', 'bg-[#FF0000]')}
                        onRemove={() => handleRemoveSocial('youtube', 'YouTube')}
                        viewMode={viewMode}
                    />
                    <SocialRow
                        icon={Globe}
                        color="bg-zinc-800"
                        placeholder="yourwebsite.com"
                        isAdded={!!socials.website}
                        currentValue={socials.website || ""}
                        onAdd={(val) => handleAddSocial('website', 'Website', val, 'Globe', 'bg-zinc-800')}
                        onRemove={() => handleRemoveSocial('website', 'Website')}
                        viewMode={viewMode}
                    />
                </div>

                <footer className="flex items-center gap-8">
                    <button
                        onClick={handleSaveAndNext}
                        disabled={loading}
                        className="bg-black text-white px-16 py-5 rounded-[2rem] font-black text-lg shadow-2xl hover:bg-zinc-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : "Finish"}
                    </button>
                    <button
                        onClick={onNext}
                        className="text-gray-400 font-bold hover:text-black transition-colors"
                    >
                        Skip for now
                    </button>
                </footer>
            </div>
        </motion.section>
    );
}