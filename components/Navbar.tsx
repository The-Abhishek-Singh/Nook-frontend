"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Link2,
    Image as ImageIcon,
    Quote,
    MapPin,
    Monitor,
    Smartphone,
    LogOut,
    Heading1,
    Loader2,
    Share2,
    Copy,
    Check,
    X,
    Twitter,
    Send
} from 'lucide-react';

interface NavbarProps {
    onAddLink: (url: string) => void;
    onAddImage: (file: File) => void;
    onAddQuote: () => void;
    onAddMap: () => void;
    onAddHeading: () => void;
    viewMode: 'desktop' | 'mobile';
    setViewMode: (mode: 'desktop' | 'mobile') => void;
}

export default function Navbar({
    onAddLink, onAddImage, onAddQuote, onAddMap, onAddHeading, viewMode, setViewMode
}: NavbarProps) {
    const [showLinkPopup, setShowLinkPopup] = useState(false);
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [linkInput, setLinkInput] = useState("");
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [username, setLocalUsername] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Get username directly from localStorage on mount
    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
            setLocalUsername(storedUsername);
        }
    }, []);

    // Get frontend URL from env or fallback to origin
    const frontendBase = process.env.NEXT_PUBLIC_FRONTEND_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    const shareUrl = `${frontendBase}/${username}`;

    const handleCopyLink = async () => {
        if (!username) return;
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy", err);
        }
    };

    const shareToSocial = (platform: string) => {
        const text = encodeURIComponent(`Check out my bento! ${shareUrl}`);
        const encodedUrl = encodeURIComponent(shareUrl);

        const urls: Record<string, string> = {
            twitter: `https://twitter.com/intent/tweet?text=${text}`,
            whatsapp: `https://wa.me/?text=${text}`,
            telegram: `https://t.me/share/url?url=${encodedUrl}&text=${text}`
        };
        window.open(urls[platform], '_blank');
    };

    const handleAdd = async () => {
        const trimmedUrl = linkInput.trim();
        if (!trimmedUrl) return;
        setLoading('link');
        try {
            await onAddLink(trimmedUrl);
            setLinkInput("");
            setShowLinkPopup(false);
        } catch (error) {
            console.error("Error creating link:", error);
            alert("Failed to create link preview");
        } finally {
            setLoading(null);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploading(true);
            try {
                await onAddImage(file);
            } catch (error) {
                console.error("Image upload error:", error);
            } finally {
                setUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        }
    };

    const handleAddWithLoading = async (type: string, handler: () => void | Promise<void>) => {
        setLoading(type);
        try {
            await handler();
        } catch (error) {
            console.error(`${type} creation error:`, error);
        } finally {
            setLoading(null);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    const isDisabled = loading !== null || uploading;

    return (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-3 w-full max-w-fit px-4">

            {/* Share Popup */}
            <AnimatePresence>
                {showSharePopup && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.9 }}
                        className="bg-white border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.12)] rounded-[24px] p-4 flex flex-col gap-4 w-[280px]"
                    >
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-800">Share your Bento</span>
                            <button onClick={() => setShowSharePopup(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex items-center bg-gray-50 rounded-xl p-2 border border-gray-100">
                            <span className="flex-1 text-xs text-gray-500 truncate mr-2">{username ? shareUrl : "Username not found"}</span>
                            <button
                                onClick={handleCopyLink}
                                disabled={!username}
                                className="p-2 bg-white shadow-sm border border-gray-100 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
                            >
                                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-600" />}
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => shareToSocial('twitter')}
                                disabled={!username}
                                className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                            >
                                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white"><Twitter size={18} /></div>
                                <span className="text-[10px] font-medium">Twitter</span>
                            </button>
                            <button
                                onClick={() => shareToSocial('whatsapp')}
                                disabled={!username}
                                className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                            >
                                <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center text-white"><Send size={18} /></div>
                                <span className="text-[10px] font-medium">WhatsApp</span>
                            </button>
                            <button
                                onClick={() => shareToSocial('telegram')}
                                disabled={!username}
                                className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                            >
                                <div className="w-10 h-10 bg-[#0088cc] rounded-full flex items-center justify-center text-white"><Send size={18} /></div>
                                <span className="text-[10px] font-medium">Telegram</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showLinkPopup && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.9 }}
                        className="bg-white border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.12)] rounded-[20px] p-2 flex items-center gap-2 w-full max-w-[320px]"
                    >
                        <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-3 ml-1">
                            {loading === 'link' ? <Loader2 size={14} className="text-gray-400 mr-2 animate-spin" /> : <Link2 size={14} className="text-gray-400 mr-2" />}
                            <input
                                autoFocus
                                type="text"
                                value={linkInput}
                                onChange={(e) => setLinkInput(e.target.value)}
                                placeholder="instagram.com"
                                className="w-full py-2.5 bg-transparent outline-none text-sm font-semibold text-gray-800 placeholder:text-gray-400"
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                disabled={isDisabled}
                            />
                        </div>
                        <button
                            onClick={handleAdd}
                            disabled={isDisabled}
                            className="bg-[#2ecc71] hover:bg-[#27ae60] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading === 'link' ? '...' : 'Add'}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
            />

            <div className="bg-white/80 backdrop-blur-2xl border border-gray-200/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-[24px] p-2 flex items-center gap-1">
                <button
                    onClick={() => {
                        if (username) {
                            handleCopyLink();
                        }
                        setShowSharePopup(!showSharePopup);
                    }}
                    className="bg-[#2ecc71] hover:bg-[#27ae60] text-white px-5 py-2.5 rounded-[16px] text-sm font-bold transition-all active:scale-95 whitespace-nowrap flex items-center gap-2"
                    disabled={isDisabled}
                >
                    <Share2 size={16} />
                    Share my Bento
                </button>

                <div className="h-6 w-[1.5px] bg-gray-200/60 mx-2 hidden sm:block" />

                <div className="flex items-center gap-0.5">
                    <button
                        onClick={() => setShowLinkPopup(!showLinkPopup)}
                        disabled={isDisabled}
                        className={`p-2.5 rounded-[14px] transition-all ${showLinkPopup ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {loading === 'link' ? <Loader2 size={20} className="animate-spin" /> : <Link2 size={20} />}
                    </button>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isDisabled}
                        className={`p-2.5 rounded-[14px] text-gray-500 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {uploading ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}
                    </button>

                    <button
                        onClick={() => handleAddWithLoading('quote', onAddQuote)}
                        disabled={isDisabled}
                        className={`p-2.5 rounded-[14px] text-gray-500 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {loading === 'quote' ? <Loader2 size={20} className="animate-spin" /> : <Quote size={20} />}
                    </button>

                    <button
                        onClick={() => handleAddWithLoading('map', onAddMap)}
                        disabled={isDisabled}
                        className={`p-2.5 rounded-[14px] text-gray-500 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {loading === 'map' ? <Loader2 size={20} className="animate-spin" /> : <MapPin size={20} />}
                    </button>

                    <button
                        onClick={() => handleAddWithLoading('heading', onAddHeading)}
                        disabled={isDisabled}
                        className={`p-2.5 rounded-[14px] text-gray-500 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {loading === 'heading' ? <Loader2 size={20} className="animate-spin" /> : <Heading1 size={20} />}
                    </button>
                </div>

                <div className="h-6 w-[1.5px] bg-gray-200/60 mx-2 hidden sm:block" />

                <div className="flex items-center gap-0.5">
                    <button
                        onClick={() => setViewMode('desktop')}
                        disabled={isDisabled}
                        className={`p-2.5 rounded-[14px] transition-all ${viewMode === 'desktop' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <Monitor size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('mobile')}
                        disabled={isDisabled}
                        className={`p-2.5 rounded-[14px] transition-all ${viewMode === 'mobile' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <Smartphone size={20} />
                    </button>
                </div>

                <div className="h-6 w-[1.5px] bg-gray-200/60 mx-2" />

                <button
                    onClick={handleLogout}
                    disabled={isDisabled}
                    className="p-2.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-[14px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </div>
    );
}