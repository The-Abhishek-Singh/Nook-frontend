// "use client";
// import React, { useState, useRef, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//     Link2,
//     Image as ImageIcon,
//     Quote,
//     MapPin,
//     Monitor,
//     Smartphone,
//     LogOut,
//     Heading1,
//     Loader2,
//     Share2,
//     Copy,
//     Check,
//     X,
//     Twitter,
//     Send
// } from 'lucide-react';

// interface NavbarProps {
//     onAddLink: (url: string) => void;
//     onAddImage: (file: File) => void;
//     onAddQuote: () => void;
//     onAddMap: () => void;
//     onAddHeading: () => void;
//     viewMode: 'desktop' | 'mobile';
//     setViewMode: (mode: 'desktop' | 'mobile') => void;
//     username: string;

// }

// export default function Navbar({
//     onAddLink, onAddImage, onAddQuote, onAddMap, onAddHeading, viewMode, setViewMode, username
// }: NavbarProps) {
//     const [showLinkPopup, setShowLinkPopup] = useState(false);
//     const [showSharePopup, setShowSharePopup] = useState(false);
//     const [linkInput, setLinkInput] = useState("");
//     const [uploading, setUploading] = useState(false);
//     const [loading, setLoading] = useState<string | null>(null);
//     const [copied, setCopied] = useState(false);
    
//     const fileInputRef = useRef<HTMLInputElement>(null);

//     // Get username directly from localStorage on mount
    

//     // Get frontend URL from env or fallback to origin
//     const frontendBase = process.env.NEXT_PUBLIC_FRONTEND_URL || (typeof window !== 'undefined' ? window.location.origin : '');
//     const shareUrl = `${frontendBase}/${username}`;

//     const handleCopyLink = async () => {
//         if (!username) return;
//         try {
//             await navigator.clipboard.writeText(shareUrl);
//             setCopied(true);
//             setTimeout(() => setCopied(false), 2000);
//         } catch (err) {
//             console.error("Failed to copy", err);
//         }
//     };

//     const shareToSocial = (platform: string) => {
//         const text = encodeURIComponent(`Check out my bento! ${shareUrl}`);
//         const encodedUrl = encodeURIComponent(shareUrl);

//         const urls: Record<string, string> = {
//             twitter: `https://twitter.com/intent/tweet?text=${text}`,
//             whatsapp: `https://wa.me/?text=${text}`,
//             telegram: `https://t.me/share/url?url=${encodedUrl}&text=${text}`
//         };
//         window.open(urls[platform], '_blank');
//     };

//     const handleAdd = async () => {
//         const trimmedUrl = linkInput.trim();
//         if (!trimmedUrl) return;
//         setLoading('link');
//         try {
//             await onAddLink(trimmedUrl);
//             setLinkInput("");
//             setShowLinkPopup(false);
//         } catch (error) {
//             console.error("Error creating link:", error);
//             alert("Failed to create link preview");
//         } finally {
//             setLoading(null);
//         }
//     };

//     const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0];
//         if (file) {
//             setUploading(true);
//             try {
//                 await onAddImage(file);
//             } catch (error) {
//                 console.error("Image upload error:", error);
//             } finally {
//                 setUploading(false);
//                 if (fileInputRef.current) fileInputRef.current.value = '';
//             }
//         }
//     };

//     const handleAddWithLoading = async (type: string, handler: () => void | Promise<void>) => {
//         setLoading(type);
//         try {
//             await handler();
//         } catch (error) {
//             console.error(`${type} creation error:`, error);
//         } finally {
//             setLoading(null);
//         }
//     };

//     const handleLogout = () => {
//         localStorage.clear();
//         window.location.href = "/login";
//     };

//     const isDisabled = loading !== null || uploading;

//     return (
//         <>
//         <style jsx global>{`
//             @keyframes shine {
//                 0% { left: -20%; }
//                 100% { left: 120%; }
//             }
//             .animate-shine {
//                 animation: shine 1.8s linear infinite;
//             }
//         `}</style>
//         <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-3 w-full max-w-fit px-4">

//             {/* Share Popup */}
//             <AnimatePresence>
//                 {showSharePopup && (
//                     <motion.div
//                         initial={{ opacity: 0, y: 15, scale: 0.9 }}
//                         animate={{ opacity: 1, y: 0, scale: 1 }}
//                         exit={{ opacity: 0, y: 15, scale: 0.9 }}
//                         className="bg-white border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.12)] rounded-[24px] p-4 flex flex-col gap-4 w-[280px]"
//                     >
//                         <div className="flex justify-between items-center">
//                             <span className="text-sm font-bold text-gray-800">Share your Bento</span>
//                             <button onClick={() => setShowSharePopup(false)} className="text-gray-400 hover:text-gray-600">
//                                 <X size={18} />
//                             </button>
//                         </div>

//                         <div className="flex items-center bg-gray-50 rounded-xl p-2 border border-gray-100">
//                             <span className="flex-1 text-xs text-gray-500 truncate mr-2">{username ? shareUrl : "Username not found"}</span>
//                             <button
//                                 onClick={handleCopyLink}
//                                 disabled={!username}
//                                 className="p-2 bg-white shadow-sm border border-gray-100 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
//                             >
//                                 {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-600" />}
//                             </button>
//                         </div>

//                         <div className="grid grid-cols-3 gap-2">
//                             <button
//                                 onClick={() => shareToSocial('twitter')}
//                                 disabled={!username}
//                                 className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
//                             >
//                                 <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white"><Twitter size={18} /></div>
//                                 <span className="text-[10px] font-medium">Twitter</span>
//                             </button>
//                             <button
//                                 onClick={() => shareToSocial('whatsapp')}
//                                 disabled={!username}
//                                 className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
//                             >
//                                 <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center text-white"><Send size={18} /></div>
//                                 <span className="text-[10px] font-medium">WhatsApp</span>
//                             </button>
//                             <button
//                                 onClick={() => shareToSocial('telegram')}
//                                 disabled={!username}
//                                 className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
//                             >
//                                 <div className="w-10 h-10 bg-[#0088cc] rounded-full flex items-center justify-center text-white"><Send size={18} /></div>
//                                 <span className="text-[10px] font-medium">Telegram</span>
//                             </button>
//                         </div>
//                     </motion.div>
//                 )}
//             </AnimatePresence>

//             <AnimatePresence>
//                 {showLinkPopup && (
//                     <motion.div
//                         initial={{ opacity: 0, y: 15, scale: 0.9 }}
//                         animate={{ opacity: 1, y: 0, scale: 1 }}
//                         exit={{ opacity: 0, y: 15, scale: 0.9 }}
//                         className="bg-white border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.12)] rounded-[20px] p-2 flex items-center gap-2 w-full max-w-[320px]"
//                     >
//                         <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-3 ml-1">
//                             {loading === 'link' ? <Loader2 size={14} className="text-gray-400 mr-2 animate-spin" /> : <Link2 size={14} className="text-gray-400 mr-2" />}
//                             <input
//                                 autoFocus
//                                 type="text"
//                                 value={linkInput}
//                                 onChange={(e) => setLinkInput(e.target.value)}
//                                 placeholder="instagram.com"
//                                 className="w-full py-2.5 bg-transparent outline-none text-sm font-semibold text-gray-800 placeholder:text-gray-400"
//                                 onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
//                                 disabled={isDisabled}
//                             />
//                         </div>
//                         <button
//                             onClick={handleAdd}
//                             disabled={isDisabled}
//                             className="bg-[#2ecc71] hover:bg-[#27ae60] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                             {loading === 'link' ? '...' : 'Add'}
//                         </button>
//                     </motion.div>
//                 )}
//             </AnimatePresence>

//             <input
//                 type="file"
//                 ref={fileInputRef}
//                 className="hidden"
//                 accept="image/*"
//                 onChange={handleFileChange}
//                 disabled={uploading}
//             />

//                <div className="bg-white border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.08)] rounded-[24px] p-1.5 flex items-center gap-1">
//                                <button
//                    onClick={() => {
//                        if (username) {
//                            handleCopyLink();
//                        }
//                        setShowSharePopup(!showSharePopup);
//                    }}
//                    className="relative overflow-hidden bg-[#2ecc71] hover:bg-[#27ae60] text-white px-5 py-2.5 rounded-[16px] text-sm font-bold transition-all active:scale-95 whitespace-nowrap flex items-center gap-2"
//                    disabled={isDisabled}
//                >
//                                   <span className="absolute inset-y-0 left-0 w-1/4 animate-shine bg-gradient-to-r from-transparent via-white/70 to-transparent skew-x-[-20deg] pointer-events-none" />
//                    <Share2 size={16} className="relative z-10" />
//                    <span className="relative z-10">Share my Bento</span>
//                </button>

//                 <div className="h-6 w-[1.5px] bg-gray-200/60 mx-2 hidden sm:block" />

//                 <div className="flex items-center gap-0.5">
//                     <button
//                         onClick={() => setShowLinkPopup(!showLinkPopup)}
//                         disabled={isDisabled}
//                         className={`p-2 rounded-[14px] transition-all ${showLinkPopup ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
//                     >
//                         {loading === 'link' ? <Loader2 size={20} className="animate-spin" /> : <Link2 size={20} />}
//                     </button>

//                     <button
//                         onClick={() => fileInputRef.current?.click()}
//                         disabled={isDisabled}
//                         className={`p-2 rounded-[14px] text-gray-500 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
//                     >
//                         {uploading ? <Loader2 size={20} className="animate-spin" /> : <img src="/assets/image.png" alt="Add image" className="w-[30px] h-[30px] object-contain rounded-lg" />}
//                     </button>

//                     <button
//                         onClick={() => handleAddWithLoading('quote', onAddQuote)}
//                         disabled={isDisabled}
//                         className={`p-2.5 rounded-[14px] text-gray-500 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20`}
//                     >
//                         {loading === 'quote' ? <Loader2 size={20} className="animate-spin" /> :  <img src="/assets/text.png" alt="Add quote" className="w-[30px] h-[30px] object-contain rounded-lg" />}
//                     </button>

//                     <button
//                         onClick={() => handleAddWithLoading('map', onAddMap)}
//                         disabled={isDisabled}
//                         className={`p-2.5 rounded-[14px] text-gray-500 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
//                     >
//                         {loading === 'map' ? <Loader2 size={20} className="animate-spin" /> : <img src="/assets/map.png" alt="Add map" className="w-[30px] h-[30px] object-contain rounded-lg" />}
//                     </button>

//                     <button
//                      onClick={() => handleAddWithLoading('heading', onAddHeading)}
//                      disabled={isDisabled}
//                      className={`p-2 bg-white border border-gray-200/70 shadow-sm rounded-[14px] hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
//                  >
//                      {loading === 'heading' ? (
//                          <Loader2 size={20} className="animate-spin text-gray-600" />
//                      ) : (
//                          <img src="/assets/title.svg" alt="Add heading" className="w-[20px] h-[20px] object-contain scale-125 rounded-[2px]" />
//                      )}
//                  </button>
//                 </div>

//                 <div className="h-6 w-[1.5px] bg-gray-200/60 mx-2 hidden sm:block" />

//                 <div className="flex items-center gap-0.5">
//                     <button
//                         onClick={() => setViewMode('desktop')}
//                         disabled={isDisabled}
//                         className={`p-2.5 rounded-[14px] transition-all ${viewMode === 'desktop' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
//                     >
//                         <img src="/assets/laptopblack.svg" alt="Desktop view" className={`w-[26px] h-[26px] object-contain rounded-lg ${viewMode === 'desktop' ? 'brightness-0 invert' : ''}`} />
//                     </button>
//                     <button
//                         onClick={() => setViewMode('mobile')}
//                         disabled={isDisabled}
//                         className={`p-2.5 rounded-[14px] transition-all ${viewMode === 'mobile' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
//                     >
//                         <img src="/assets/mobile.svg" alt="Mobile view" className={`w-[26px] h-[26px] object-contain rounded-lg ${ viewMode === "mobile"  ? "brightness-0 invert"  : ""}`}/>
//                     </button>
//                 </div>

//                 <div className="h-6 w-[1.5px] bg-gray-200/60 mx-2" />

//                 <button
//                     onClick={handleLogout}
//                     disabled={isDisabled}
//                     className="p-2.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-[14px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                     <LogOut size={20} />
//                 </button>
//             </div>
//         </div>
//         </>
//     );
// }

// "use client";
// import React, { useState, useRef, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//     Link2,
//     Image as ImageIcon,
//     Quote,
//     MapPin,
//     Monitor,
//     Smartphone,
//     LogOut,
//     Heading1,
//     Loader2,
//     Share2,
//     Copy,
//     Check,
//     X,
//     Twitter,
//     Send
// } from 'lucide-react';

// interface NavbarProps {
//     onAddLink: (url: string) => void;
//     onAddImage: (file: File) => void;
//     onAddQuote: () => void;
//     onAddMap: () => void;
//     onAddHeading: () => void;
//     viewMode: 'desktop' | 'mobile';
//     setViewMode: (mode: 'desktop' | 'mobile') => void;
//     username: string;

// }

// export default function Navbar({
//     onAddLink, onAddImage, onAddQuote, onAddMap, onAddHeading, viewMode, setViewMode, username
// }: NavbarProps) {
//     const [showLinkPopup, setShowLinkPopup] = useState(false);
//     const [showSharePopup, setShowSharePopup] = useState(false);
//     const [linkInput, setLinkInput] = useState("");
//     const [uploading, setUploading] = useState(false);
//     const [loading, setLoading] = useState<string | null>(null);
//     const [copied, setCopied] = useState(false);
    
//     const fileInputRef = useRef<HTMLInputElement>(null);

//     // Get username directly from localStorage on mount
    

//     // Get frontend URL from env or fallback to origin
//     const frontendBase = process.env.NEXT_PUBLIC_FRONTEND_URL || (typeof window !== 'undefined' ? window.location.origin : '');
//     const shareUrl = `${frontendBase}/${username}`;

//     const handleCopyLink = async () => {
//         if (!username) return;
//         try {
//             await navigator.clipboard.writeText(shareUrl);
//             setCopied(true);
//             setTimeout(() => setCopied(false), 2000);
//         } catch (err) {
//             console.error("Failed to copy", err);
//         }
//     };

//     const shareToSocial = (platform: string) => {
//         const text = encodeURIComponent(`Check out my bento! ${shareUrl}`);
//         const encodedUrl = encodeURIComponent(shareUrl);

//         const urls: Record<string, string> = {
//             twitter: `https://twitter.com/intent/tweet?text=${text}`,
//             whatsapp: `https://wa.me/?text=${text}`,
//             telegram: `https://t.me/share/url?url=${encodedUrl}&text=${text}`
//         };
//         window.open(urls[platform], '_blank');
//     };

//     const handleAdd = async () => {
//         const trimmedUrl = linkInput.trim();
//         if (!trimmedUrl) return;
//         setLoading('link');
//         try {
//             await onAddLink(trimmedUrl);
//             setLinkInput("");
//             setShowLinkPopup(false);
//         } catch (error) {
//             console.error("Error creating link:", error);
//             alert("Failed to create link preview");
//         } finally {
//             setLoading(null);
//         }
//     };

//     const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0];
//         if (file) {
//             setUploading(true);
//             try {
//                 await onAddImage(file);
//             } catch (error) {
//                 console.error("Image upload error:", error);
//             } finally {
//                 setUploading(false);
//                 if (fileInputRef.current) fileInputRef.current.value = '';
//             }
//         }
//     };

//     const handleAddWithLoading = async (type: string, handler: () => void | Promise<void>) => {
//         setLoading(type);
//         try {
//             await handler();
//         } catch (error) {
//             console.error(`${type} creation error:`, error);
//         } finally {
//             setLoading(null);
//         }
//     };

//     const handleLogout = () => {
//         localStorage.clear();
//         window.location.href = "/login";
//     };

//     const isDisabled = loading !== null || uploading;

//     return (
//         <>
//         <style jsx global>{`
//             @keyframes shine {
//                 0% { left: -20%; }
//                 100% { left: 120%; }
//             }
//             .animate-shine {
//                 animation: shine 1.8s linear infinite;
//             }
//             .no-scrollbar {
//                 -ms-overflow-style: none;
//                 scrollbar-width: none;
//             }
//             .no-scrollbar::-webkit-scrollbar {
//                 display: none;
//             }
//         `}</style>
//         <div className="fixed bottom-4 md:bottom-10 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 md:gap-3 w-full max-w-fit px-2 md:px-4">

//             {/* Share Popup */}
//             <AnimatePresence>
//                 {showSharePopup && (
//                     <motion.div
//                         initial={{ opacity: 0, y: 15, scale: 0.9 }}
//                         animate={{ opacity: 1, y: 0, scale: 1 }}
//                         exit={{ opacity: 0, y: 15, scale: 0.9 }}
//                         className="bg-white border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.12)] rounded-[24px] p-4 flex flex-col gap-4 w-[90vw] max-w-[280px] md:w-[280px]"
//                     >
//                         <div className="flex justify-between items-center">
//                             <span className="text-sm font-bold text-gray-800">Share your Bento</span>
//                             <button onClick={() => setShowSharePopup(false)} className="text-gray-400 hover:text-gray-600">
//                                 <X size={18} />
//                             </button>
//                         </div>

//                         <div className="flex items-center bg-gray-50 rounded-xl p-2 border border-gray-100">
//                             <span className="flex-1 text-xs text-gray-500 truncate mr-2">{username ? shareUrl : "Username not found"}</span>
//                             <button
//                                 onClick={handleCopyLink}
//                                 disabled={!username}
//                                 className="p-2 bg-white shadow-sm border border-gray-100 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
//                             >
//                                 {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-600" />}
//                             </button>
//                         </div>

//                         <div className="grid grid-cols-3 gap-2">
//                             <button
//                                 onClick={() => shareToSocial('twitter')}
//                                 disabled={!username}
//                                 className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
//                             >
//                                 <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white"><Twitter size={18} /></div>
//                                 <span className="text-[10px] font-medium">Twitter</span>
//                             </button>
//                             <button
//                                 onClick={() => shareToSocial('whatsapp')}
//                                 disabled={!username}
//                                 className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
//                             >
//                                 <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center text-white"><Send size={18} /></div>
//                                 <span className="text-[10px] font-medium">WhatsApp</span>
//                             </button>
//                             <button
//                                 onClick={() => shareToSocial('telegram')}
//                                 disabled={!username}
//                                 className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
//                             >
//                                 <div className="w-10 h-10 bg-[#0088cc] rounded-full flex items-center justify-center text-white"><Send size={18} /></div>
//                                 <span className="text-[10px] font-medium">Telegram</span>
//                             </button>
//                         </div>
//                     </motion.div>
//                 )}
//             </AnimatePresence>

//             <AnimatePresence>
//                 {showLinkPopup && (
//                     <motion.div
//                         initial={{ opacity: 0, y: 15, scale: 0.9 }}
//                         animate={{ opacity: 1, y: 0, scale: 1 }}
//                         exit={{ opacity: 0, y: 15, scale: 0.9 }}
//                         className="bg-white border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.12)] rounded-[20px] p-2 flex items-center gap-2 w-[90vw] max-w-[320px] md:w-full"
//                     >
//                         <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-3 ml-1">
//                             {loading === 'link' ? <Loader2 size={14} className="text-gray-400 mr-2 animate-spin" /> : <Link2 size={14} className="text-gray-400 mr-2" />}
//                             <input
//                                 autoFocus
//                                 type="text"
//                                 value={linkInput}
//                                 onChange={(e) => setLinkInput(e.target.value)}
//                                 placeholder="instagram.com"
//                                 className="w-full py-2.5 bg-transparent outline-none text-sm font-semibold text-gray-800 placeholder:text-gray-400"
//                                 onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
//                                 disabled={isDisabled}
//                             />
//                         </div>
//                         <button
//                             onClick={handleAdd}
//                             disabled={isDisabled}
//                             className="bg-[#2ecc71] hover:bg-[#27ae60] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                             {loading === 'link' ? '...' : 'Add'}
//                         </button>
//                     </motion.div>
//                 )}
//             </AnimatePresence>

//             <input
//                 type="file"
//                 ref={fileInputRef}
//                 className="hidden"
//                 accept="image/*"
//                 onChange={handleFileChange}
//                 disabled={uploading}
//             />

//                <div className="bg-white border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.08)] rounded-[18px] md:rounded-[24px] p-1 md:p-1.5 flex items-center gap-1 max-w-[92vw] md:max-w-none">
//                                <button
//                    onClick={() => {
//                        if (username) {
//                            handleCopyLink();
//                        }
//                        setShowSharePopup(!showSharePopup);
//                    }}
//                    className="relative overflow-hidden bg-[#2ecc71] hover:bg-[#27ae60] text-white px-3 py-2 md:px-5 md:py-2.5 rounded-[12px] md:rounded-[16px] text-xs md:text-sm font-bold transition-all active:scale-95 whitespace-nowrap flex items-center gap-2 shrink-0"
//                    disabled={isDisabled}
//                >
//                                   <span className="absolute inset-y-0 left-0 w-1/4 animate-shine bg-gradient-to-r from-transparent via-white/70 to-transparent skew-x-[-20deg] pointer-events-none" />
//                    <Share2 size={16} className="relative z-10" />
//                    <span className="relative z-10 hidden sm:inline">Share my Bento</span>
//                </button>

//                 <div className="h-6 w-[1.5px] bg-gray-200/60 mx-2 hidden sm:block shrink-0" />

//                 {/* Primary add-block icons: fixed desktop size always, horizontal scroll on mobile, no visible scrollbar */}
//                 <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
//                     <button
//                         onClick={() => setShowLinkPopup(!showLinkPopup)}
//                         disabled={isDisabled}
//                         className={`p-2 rounded-[14px] transition-all shrink-0 ${showLinkPopup ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
//                     >
//                         {loading === 'link' ? <Loader2 size={20} className="animate-spin" /> : <Link2 size={20} />}
//                     </button>

//                     <button
//                         onClick={() => fileInputRef.current?.click()}
//                         disabled={isDisabled}
//                         className={`p-2 rounded-[14px] text-gray-500 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0`}
//                     >
//                         {uploading ? <Loader2 size={20} className="animate-spin" /> : <img src="/assets/image.png" alt="Add image" className="w-[30px] h-[30px] object-contain rounded-lg" />}
//                     </button>

//                     <button
//                         onClick={() => handleAddWithLoading('quote', onAddQuote)}
//                         disabled={isDisabled}
//                         className={`p-2.5 rounded-[14px] text-gray-500 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 shrink-0`}
//                     >
//                         {loading === 'quote' ? <Loader2 size={20} className="animate-spin" /> :  <img src="/assets/text.png" alt="Add quote" className="w-[30px] h-[30px] object-contain rounded-lg" />}
//                     </button>

//                     <button
//                         onClick={() => handleAddWithLoading('map', onAddMap)}
//                         disabled={isDisabled}
//                         className={`p-2.5 rounded-[14px] text-gray-500 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0`}
//                     >
//                         {loading === 'map' ? <Loader2 size={20} className="animate-spin" /> : <img src="/assets/map.png" alt="Add map" className="w-[30px] h-[30px] object-contain rounded-lg" />}
//                     </button>

//                     <button
//                      onClick={() => handleAddWithLoading('heading', onAddHeading)}
//                      disabled={isDisabled}
//                      className={`p-2 bg-white border border-gray-200/70 shadow-sm rounded-[14px] hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0`}
//                  >
//                      {loading === 'heading' ? (
//                          <Loader2 size={20} className="animate-spin text-gray-600" />
//                      ) : (
//                          <img src="/assets/title.svg" alt="Add heading" className="w-[20px] h-[20px] object-contain scale-125 rounded-[2px]" />
//                      )}
//                  </button>
//                 </div>

//                 {/* Desktop/mobile preview toggle — hidden on small screens, unchanged on md+ */}
//                 <div className="h-6 w-[1.5px] bg-gray-200/60 mx-2 hidden md:block shrink-0" />

//                 <div className="hidden md:flex items-center gap-0.5 shrink-0">
//                     <button
//                         onClick={() => setViewMode('desktop')}
//                         disabled={isDisabled}
//                         className={`p-2.5 rounded-[14px] transition-all ${viewMode === 'desktop' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
//                     >
//                         <img src="/assets/laptopblack.svg" alt="Desktop view" className={`w-[26px] h-[26px] object-contain rounded-lg ${viewMode === 'desktop' ? 'brightness-0 invert' : ''}`} />
//                     </button>
//                     <button
//                         onClick={() => setViewMode('mobile')}
//                         disabled={isDisabled}
//                         className={`p-2.5 rounded-[14px] transition-all ${viewMode === 'mobile' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
//                     >
//                         <img src="/assets/mobile.svg" alt="Mobile view" className={`w-[26px] h-[26px] object-contain rounded-lg ${ viewMode === "mobile"  ? "brightness-0 invert"  : ""}`}/>
//                     </button>
//                 </div>

//                 {/* Logout — hidden on mobile since it's reachable from the home page icon there */}
//                 <div className="h-6 w-[1.5px] bg-gray-200/60 mx-2 hidden md:block shrink-0" />

//                 <button
//                     onClick={handleLogout}
//                     disabled={isDisabled}
//                     className="hidden md:block p-2.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-[14px] transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
//                 >
//                     <LogOut size={20} />
//                 </button>
//             </div>
//         </div>
//         </>
//     );
// }



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
    Send,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

interface NavbarProps {
    onAddLink: (url: string) => void;
    onAddImage: (file: File) => void;
    onAddQuote: () => void;
    onAddMap: () => void;
    onAddHeading: () => void;
    viewMode: 'desktop' | 'mobile';
    setViewMode: (mode: 'desktop' | 'mobile') => void;
    username: string;

}

export default function Navbar({
    onAddLink, onAddImage, onAddQuote, onAddMap, onAddHeading, viewMode, setViewMode, username
}: NavbarProps) {
    const [showLinkPopup, setShowLinkPopup] = useState(false);
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [linkInput, setLinkInput] = useState("");
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Scroll-affordance state for the horizontally-scrollable icon strip on mobile
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    };

    useEffect(() => {
        checkScroll();
        const el = scrollRef.current;
        if (!el) return;

        el.addEventListener('scroll', checkScroll, { passive: true });
        window.addEventListener('resize', checkScroll);

        // Catches content changes inside the strip (e.g. loading spinners swapping in,
        // or controls appearing/disappearing when crossing the lg breakpoint)
        const ro = new ResizeObserver(checkScroll);
        ro.observe(el);

        return () => {
            el.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
            ro.disconnect();
        };
    }, []);

    const scrollByAmount = (dir: 'left' | 'right') => {
        scrollRef.current?.scrollBy({ left: dir === 'left' ? -80 : 80, behavior: 'smooth' });
    };

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
        <>
        <style jsx global>{`
            @keyframes shine {
                0% { left: -20%; }
                100% { left: 120%; }
            }
            .animate-shine {
                animation: shine 1.8s linear infinite;
            }
            .no-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
            .no-scrollbar::-webkit-scrollbar {
                display: none;
            }
            
        `}</style>
        <div className="fixed bottom-4 lg:bottom-10 inset-x-0 z-[100] flex flex-col items-center gap-2 lg:gap-3 px-4 pointer-events-none">

            {/* Share Popup */}
            <AnimatePresence>
                {showSharePopup && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.9 }}
                        className="bg-white border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.12)] rounded-[24px] p-4 flex flex-col gap-4 w-[90vw] max-w-[280px] lg:w-[280px] pointer-events-auto"
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
                        className="bg-white border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.12)] rounded-[20px] p-2 flex items-center gap-2 w-[90vw] max-w-[320px] lg:w-full pointer-events-auto"
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

               <div className="bg-white border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.08)] rounded-[20px] lg:rounded-[24px] p-1.5 flex items-center gap-1 max-w-[94vw] lg:max-w-fit lg:w-fit pointer-events-auto">

                   {/* Share — always fixed size, never shrinks, never scrolls */}
                   <button
                       onClick={() => {
                           if (username) {
                               handleCopyLink();
                           }
                           setShowSharePopup(!showSharePopup);
                       }}
                       className="relative overflow-hidden bg-[#2ecc71] hover:bg-[#27ae60] text-white px-3 py-2.5 lg:px-5 lg:py-2.5 rounded-[14px] lg:rounded-[16px] text-sm font-bold transition-all active:scale-95 whitespace-nowrap flex items-center gap-2 shrink-0"
                       disabled={isDisabled}
                   >
                       <span className="absolute inset-y-0 left-0 w-1/4 animate-shine bg-gradient-to-r from-transparent via-white/70 to-transparent skew-x-[-20deg] pointer-events-none" />
                       <Share2 className="relative z-10 w-4 h-4" />
                       <span className="relative z-10 hidden lg:inline">Share my Bento</span>
                   </button>

                    <div className="h-6 w-[1.5px] bg-gray-200/60 mx-1.5 lg:mx-2 shrink-0" />

                    {/* Scrollable region: content-add icons + toggle. Shrinks to fit inside the pill's
                        max-width first; only scrolls if it genuinely can't fit even at reduced mobile size.
                        Wrapped in a relative container so the scroll-affordance arrows/fades can overlay it. */}
                    <div className="relative min-w-0 flex-1 lg:flex-none">

                        {/* Left scroll indicator */}
                        {canScrollLeft && (
                            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent z-[5] lg:hidden" />
                        )}
                        {canScrollLeft && (
                            <button
                                onClick={() => scrollByAmount('left')}
                                aria-label="Scroll left"
                                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-5 h-5 rounded-full bg-white shadow-md border border-gray-100 lg:hidden"
                            >
                                <ChevronLeft size={12} className="text-gray-600" />
                            </button>
                        )}

                        <div
                            ref={scrollRef}
                            className="flex items-center gap-0.5 lg:gap-0.5 overflow-x-auto no-scrollbar min-w-0"
                        >

                            <button
                                onClick={() => setShowLinkPopup(!showLinkPopup)}
                                disabled={isDisabled}
                                className={`p-1.5 lg:p-2 rounded-[12px] lg:rounded-[14px] transition-all shrink-0 ${showLinkPopup ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {loading === 'link' ? <Loader2 className="animate-spin w-[18px] h-[18px] lg:w-5 lg:h-5" /> : <Link2 className="w-[18px] h-[18px] lg:w-5 lg:h-5" />}
                            </button>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isDisabled}
                                className="p-1.5 lg:p-2 rounded-[12px] lg:rounded-[14px] text-gray-500 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                            >
                                {uploading ? <Loader2 className="animate-spin w-[18px] h-[18px] lg:w-5 lg:h-5" /> : <img src="/assets/image.png" alt="Add image" className="w-[24px] h-[24px] lg:w-[30px] lg:h-[30px] object-contain rounded-lg" />}
                            </button>

                            <button
                                onClick={() => handleAddWithLoading('quote', onAddQuote)}
                                disabled={isDisabled}
                                className="p-2 lg:p-2.5 rounded-[12px] lg:rounded-[14px] text-gray-500 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 shrink-0"
                            >
                                {loading === 'quote' ? <Loader2 className="animate-spin w-[18px] h-[18px] lg:w-5 lg:h-5" /> : <img src="/assets/text.png" alt="Add quote" className="w-[24px] h-[24px] lg:w-[30px] lg:h-[30px] object-contain rounded-lg" />}
                            </button>

                            <button
                                onClick={() => handleAddWithLoading('map', onAddMap)}
                                disabled={isDisabled}
                                className="p-2 lg:p-2.5 rounded-[12px] lg:rounded-[14px] text-gray-500 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                            >
                                {loading === 'map' ? <Loader2 className="animate-spin w-[18px] h-[18px] lg:w-5 lg:h-5" /> : <img src="/assets/map.png" alt="Add map" className="w-[24px] h-[24px] lg:w-[30px] lg:h-[30px] object-contain rounded-lg" />}
                            </button>

                            <button
                             onClick={() => handleAddWithLoading('heading', onAddHeading)}
                             disabled={isDisabled}
                             className="p-1.5 lg:p-2 bg-white border border-gray-200/70 shadow-sm rounded-[12px] lg:rounded-[14px] hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                         >
                             {loading === 'heading' ? (
                                 <Loader2 className="animate-spin text-gray-600 w-[18px] h-[18px] lg:w-5 lg:h-5" />
                             ) : (
                                 <img src="/assets/title.svg" alt="Add heading" className="w-[18px] h-[18px] lg:w-[20px] lg:h-[20px] object-contain scale-125 rounded-[2px]" />
                             )}
                         </button>

                            <div className="h-6 w-[1.5px] bg-gray-200/60 mx-1 lg:mx-2 shrink-0" />

                            {/* Desktop/mobile preview toggle — visible at every width */}
                            <button
                                onClick={() => setViewMode('desktop')}
                                disabled={isDisabled}
                                className={`p-2 lg:p-2.5 rounded-[12px] lg:rounded-[14px] transition-all shrink-0 ${viewMode === 'desktop' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <img src="/assets/laptopblack.svg" alt="Desktop view" className={`w-[20px] h-[20px] lg:w-[26px] lg:h-[26px] object-contain rounded-lg ${viewMode === 'desktop' ? 'brightness-0 invert' : ''}`} />
                            </button>
                            <button
                                onClick={() => setViewMode('mobile')}
                                disabled={isDisabled}
                                className={`p-2 lg:p-2.5 rounded-[12px] lg:rounded-[14px] transition-all shrink-0 ${viewMode === 'mobile' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <img src="/assets/mobile.svg" alt="Mobile view" className={`w-[20px] h-[20px] lg:w-[26px] lg:h-[26px] object-contain rounded-lg ${ viewMode === "mobile"  ? "brightness-0 invert"  : ""}`}/>
                            </button>
                        </div>

                        {/* Right scroll indicator */}
                        {canScrollRight && (
                            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent z-[5] lg:hidden" />
                        )}
                        {canScrollRight && (
                            <button
                                onClick={() => scrollByAmount('right')}
                                aria-label="Scroll right"
                                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-5 h-5 rounded-full bg-white shadow-md border border-gray-100 lg:hidden"
                            >
                                <ChevronRight size={12} className="text-gray-600" />
                            </button>
                        )}
                    </div>

                {/* Logout — desktop only, reachable elsewhere on mobile */}
                <div className="h-6 w-[1.5px] bg-gray-200/60 mx-2 hidden lg:block shrink-0" />

                <button
                    onClick={handleLogout}
                    disabled={isDisabled}
                    className="hidden lg:block p-2.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-[14px] transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </div>
        </>
    );
}