"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Instagram, Linkedin, Github, Twitter, Dribbble, Loader2, Heart, Figma, Wind, PenTool, Video, Circle, Send, Code2, Mail,Check  } from 'lucide-react';
import Link from 'next/link';
import { authApi } from '@/utils/api';

export default function ClaimSection({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
    const [username, setUsername] = useState("");
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [checkingUsername, setCheckingUsername] = useState(false);
    const [usernameError, setUsernameError] = useState("");
    const [usernameSuccess, setUsernameSuccess] = useState(false);
    const [registerError, setRegisterError] = useState("");
    const [isRightHovered, setIsRightHovered] = useState(false);
    const [showPasswordChecklist, setShowPasswordChecklist] = useState(false);

const passwordChecks = [
    { label: "At least 8 characters", test: (pw: string) => pw.length >= 8 },
    { label: "One uppercase letter", test: (pw: string) => /[A-Z]/.test(pw) },
    { label: "One lowercase letter", test: (pw: string) => /[a-z]/.test(pw) },
    { label: "One number", test: (pw: string) => /\d/.test(pw) },
    { label: "One special character (@$!%*?&^#()_-+=)", test: (pw: string) => /[@$!%*?&^#()_\-+=]/.test(pw) },
];

const allPasswordChecksPassed = passwordChecks.every((check) => check.test(password));

    const [isDesktop, setIsDesktop] = useState(true);

    useEffect(() => {
        const mql = window.matchMedia("(min-width: 768px)");

        const updateIsDesktop = () => setIsDesktop(mql.matches);

        updateIsDesktop();

        mql.addEventListener("change", updateIsDesktop);

        return () => mql.removeEventListener("change", updateIsDesktop);
    }, []);

    const isTyping = email.length > 0 || password.length > 0;

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsernameError("");
        setUsernameSuccess(false);
        const value = e.target.value;
        if (value.startsWith("getnook.me/")) {
            setUsername(value.slice(11).toLowerCase().replace(/\s+/g, ''));
        } else if (value === "" || !value.includes("getnook.me/")) {
            setUsername("");
        }
    };

    const handleGrabLink = async () => {
        if (!username) return;
        setCheckingUsername(true);
        setUsernameError("");
        try {
            const res = await authApi.checkUsername(username);
            if (res.data.available) {
                setUsernameSuccess(true);
                setTimeout(() => setStep(2), 600);
            } else {
                setUsernameError("This username is already taken.");
            }
        } catch (err: any) {
            setUsernameError(err.response?.data?.message || "Error checking username.");
        } finally {
            setCheckingUsername(false);
        }
    };

    const handleRegisterAndClaim = async () => {
        if (!email || !password || !username) return;
        setLoading(true);
        setRegisterError("");

        try {
            const res = await authApi.register({
                email,
                password,
                username,
                displayName: username
            });

            const token = res.data.accessToken;
            if (token) {
                localStorage.setItem("token", token);
                // Save ONLY username as requested
                localStorage.setItem("username", username);
                localStorage.setItem("is_registering", "true");

                onNext();
            }
        } catch (err: any) {
            console.error("Signup Error:", err);
            setRegisterError(err.response?.data?.message || err.response?.data?.error || "Registration failed. Check details.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = () => alert("Google Sign-in clicked.");


    const gatherTransition = { type: "spring" as const, stiffness: 300, damping: 16, mass: 0.9 };
    const gridState = { x: 0, y: 0, rotateX: 0, rotateY: 0, rotateZ: 0, scale: 1, boxShadow: "0px 8px 20px -8px rgba(0,0,0,0.12)" };

    const tileScatter = (x: number, y: number, rotateX: number, rotateY: number, rotateZ: number, delayGather: number, delayRelease: number) => {

        if (!isDesktop) {
            return {
                animate: gridState,
                transition: { duration: 0 },
                style: { transformStyle: "preserve-3d" as const }
            };
        }

        return {
            animate: isRightHovered
                ? gridState
                : { x, y, rotateX, rotateY, rotateZ, scale: 1.03, boxShadow: "0px 20px 35px -10px rgba(0,0,0,0.22)" },
            transition: { ...gatherTransition, delay: isRightHovered ? delayGather : delayRelease },
            style: { transformStyle: "preserve-3d" as const }
        };
    };

    return (
        <section className="min-h-screen flex flex-col md:flex-row items-center justify-center px-6 md:px-20 gap-8 md:gap-16 bg-white overflow-hidden font-sans">
            <div className="w-full md:w-1/2 max-w-md min-h-[450px] flex flex-col justify-center order-2 md:order-1">
                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter leading-tight">First, claim your unique link</h1>
                            <div className="space-y-2">
                                <div className="relative group">
                                    <input type="text" value={`getnook.me/${username}`} onChange={handleUsernameChange} className={`w-full text-black bg-gray-100 py-6 px-8 rounded-[2rem] text-xl font-medium outline-none border-2 transition-all ${usernameError ? 'border-red-500 bg-red-50' : usernameSuccess ? 'border-green-500 bg-green-50' : 'border-transparent focus:border-blue-500/20 focus:bg-white'}`} />
                                </div>
                                {usernameError && <p className="text-red-500 text-xs font-bold ml-6">{usernameError}</p>}
                                {usernameSuccess && <p className="text-green-600 text-xs font-bold ml-6">Username is available!</p>}
                                {username.length > 0 && !usernameSuccess && (
                                    <button onClick={handleGrabLink} disabled={checkingUsername} className="w-full bg-black text-white py-5 rounded-[2rem] text-lg font-bold shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 mt-4">
                                        {checkingUsername ? <Loader2 className="animate-spin" size={20} /> : "Grab my Link"}
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-col gap-4 pt-2">
                                <Link href="/login" className="text-sm text-gray-400 hover:text-black font-bold transition-colors w-fit">or Log in</Link>
                                <button onClick={onBack} className="text-xs text-gray-400 hover:text-black transition-colors w-fit flex items-center gap-1">← Back to home</button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <button onClick={() => setStep(1)} className="text-gray-400 hover:text-black transition-colors mb-4"><ArrowLeft size={24} /></button>
                            <div className="space-y-2 mb-8">
                                <p className="text-sm font-bold text-green-600 italic font-mono uppercase">getnook.me/{username} is yours!</p>
                                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">Now, Create your account</h1>
                            </div>
                            <div className="space-y-6">
                                <div className="flex gap-3">
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="flex-1 text-black bg-gray-100 py-5 px-6 rounded-2xl outline-none focus:bg-white border-2 border-transparent focus:border-gray-300 transition-all text-sm font-medium" />
                                    <div className="relative flex-1">
    <input
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onFocus={() => setShowPasswordChecklist(true)}
        onBlur={() => setTimeout(() => setShowPasswordChecklist(false), 150)}
        placeholder="Password"
        className="w-full text-black bg-gray-100 py-5 px-6 rounded-2xl outline-none focus:bg-white border-2 border-transparent focus:border-gray-300 transition-all text-sm font-medium pr-16"
    />
    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-white px-2 py-1 text-black rounded-md border border-gray-100 shadow-sm">{showPassword ? "Hide" : "Show"}</button>

    <AnimatePresence>
        {showPasswordChecklist && (
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl p-4 z-50"
            >
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Password must contain</p>
                <div className="space-y-1.5">
                    {passwordChecks.map((check, idx) => {
                        const passed = check.test(password);
                        return (
                            <div key={idx} className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${passed ? "bg-green-500" : "bg-gray-200"}`}>
                                    {passed && <Check size={10} className="text-white" strokeWidth={3} />}
                                </div>
                                <span className={`text-xs font-medium transition-colors ${passed ? "text-green-600" : "text-gray-400"}`}>
                                    {check.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        )}
    </AnimatePresence>
</div>
                                </div>
                                {registerError && <p className="text-red-500 text-xs font-bold text-center mt-2 bg-red-50 py-2 rounded-lg">{registerError}</p>}
                                <button onClick={handleRegisterAndClaim} disabled={loading} className="w-full bg-black hover:bg-zinc-800 text-white py-5 rounded-[2rem] text-sm font-bold shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Create account"}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onMouseEnter={() => setIsRightHovered(true)}
                onMouseLeave={() => setIsRightHovered(false)}
                style={{ perspective: 1400 }}
                className="w-full md:w-[54%] grid grid-cols-4 gap-2 md:gap-4 max-w-[46rem] p-3 md:p-6 cursor-pointer translate-x-0 md:translate-x-12 order-1 md:order-2"
            >
                {/* 1. Large 3D Artwork Tile (Top Left) */}
                <motion.div
                    {...tileScatter(-30, -28, 10, -10, -12, 0, 0.34)}
                    className="col-span-2 row-span-2 rounded-xl md:rounded-[1.75rem] overflow-hidden aspect-square bg-gray-100 z-10"
                >
                    <img src="/assets/photo1.png" className="w-full h-full object-cover" alt="3D Artwork" />
                </motion.div>

                {/* 2. Behance Tile */}
                <motion.div
                    {...tileScatter(38, -33, 12, 12, 16, 0.04, 0.30)}
                    className="col-span-1 row-span-1 bg-[#f0f4ff] p-2 md:p-4 rounded-lg md:rounded-[1.25rem] flex flex-col items-start justify-between border border-blue-50/50 aspect-square z-20"
                >
                    <div className="flex flex-col items-start gap-1">
                        <div className="w-7 h-7 md:w-10 md:h-10 bg-[#0057ff] rounded-lg md:rounded-xl flex items-center justify-center text-white shadow-sm">
                            <span className="text-[8px] md:text-[10px] font-bold ">Bē</span>
                        </div>
                        <span className="text-[8px] md:text-[10px] font-bold text-gray-900 mt-1">Behance</span>
                    </div>
                    <button className="bg-[#0057ff] hover:bg-blue-600 text-white text-[7px] md:text-[9px] px-2 py-1.5 md:px-3 md:py-2 rounded-full font-bold transition-all">
                        Follow 6.5k
                    </button>
                </motion.div>

                {/* 3. LinkedIn Tile */}
                <motion.div
                    {...tileScatter(52, -19, 12, 14, 20, 0.08, 0.26)}
                    className="col-span-1 row-span-1 bg-[#f0f4ff] p-2 md:p-4 rounded-lg md:rounded-[1.25rem] flex flex-col items-start justify-between border border-blue-50/50 aspect-square z-30"
                >
                    <div className="flex flex-col items-start gap-1">
                        <div className="w-7 h-7 md:w-10 md:h-10 bg-white rounded-lg md:rounded-xl flex items-center justify-center shadow-sm">
                            <img src="/assets/linkedin.svg" alt="LinkedIn" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-[8px] md:text-[10px] font-bold text-gray-900 mt-1">LinkedIn</span>
                    </div>
                    <button className="border border-blue-300 text-gray-700 text-[7px] md:text-[9px] px-2 py-1.5 md:px-4 md:py-2 rounded-full font-bold bg-white hover:bg-gray-50 transition-all">
                        Connect
                    </button>
                </motion.div>

                {/* 4. Dribbble App Grid Tile */}
                <motion.div
                    {...tileScatter(-22, 25, 8, -6, -10, 0.06, 0.28)}
                    className="col-span-2 row-span-2 bg-[#fff5f7] p-3 py-4 md:p-6 md:py-7 rounded-xl md:rounded-[1.75rem] border border-pink-100 flex flex-col justify-between min-h-[160px] md:min-h-[280px] z-10"
                >
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col items-start gap-1">
                            <div className="w-7 h-7 md:w-10 md:h-10 bg-white rounded-lg md:rounded-xl flex items-center justify-center shadow-sm ">
                                <img src="/assets/dribble.svg" alt="Dribbble" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-[9px] md:text-xs font-semibold text-gray-900">Dribbble</span>
                        </div>
                        <button className="bg-[#ea4c89] hover:bg-[#d43f78] text-white text-[8px] md:text-[12px] px-2 py-1 md:px-3 md:py-2 rounded-full md:rounded-md font-bold flex items-center gap-1 shadow-sm">
                            ✉️ Hire Me
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-1 md:gap-2 my-2 md:my-3">
                        <div className="bg-white p-1 rounded-lg md:rounded-2xl shadow-sm border border-pink-50 aspect-square flex items-center justify-center overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover rounded-md md:rounded-xl" alt="App Icon 1" />
                        </div>
                        <div className="bg-white p-1 rounded-lg md:rounded-2xl shadow-sm border border-pink-50 aspect-square flex items-center justify-center overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover rounded-md md:rounded-xl" alt="App Icon 2" />
                        </div>
                        <div className="bg-white p-1 rounded-lg md:rounded-2xl shadow-sm border border-pink-50 aspect-square flex items-center justify-center overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover rounded-md md:rounded-xl" alt="App Icon 3" />
                        </div>
                        <div className="bg-white p-1 rounded-lg md:rounded-2xl shadow-sm border border-pink-50 aspect-square flex items-center justify-center overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover rounded-md md:rounded-xl" alt="App Icon 4" />
                        </div>
                        <div className="bg-white p-1 rounded-lg md:rounded-2xl shadow-sm border border-pink-50 aspect-square flex items-center justify-center overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover rounded-md md:rounded-xl" alt="App Icon 5" />
                        </div>
                        <div className="bg-white p-1 rounded-lg md:rounded-2xl shadow-sm border border-pink-50 aspect-square flex items-center justify-center overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover rounded-md md:rounded-xl" alt="App Icon 6" />
                        </div>
                    </div>
                </motion.div>

                {/* 5. iOS UI Kit Tile */}
                <motion.div
                    {...tileScatter(36, 41, -12, 12, 14, 0.12, 0.22)}
                    className="col-span-1 row-span-1 bg-white p-2 md:p-5 rounded-lg md:rounded-[1.25rem] border border-gray-100 flex flex-col justify-between aspect-square z-20"
                >
                    <div className="flex flex-col items-start gap-1">
                        <div className="w-7 h-7 md:w-10 md:h-10 bg-black rounded-md md:rounded-lg flex items-center justify-center text-white">
                            <span className="text-[8px] md:text-[10px]">🎨</span>
                        </div>
                        <span className="text-[8px] md:text-[10px] font-bold text-gray-800">iOS UI Kit</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <button className="text-[7px] md:text-[9px] text-gray-400 font-bold">❤️ 3.9k</button>
                        <button className="text-[7px] md:text-[9px] text-blue-500 font-bold">📥 3.9k</button>
                    </div>
                </motion.div>

                {/* 6. Instagram Tile */}
                <motion.div
                    {...tileScatter(49, -6, -8, 14, -18, 0.16, 0.18)}
                    className="col-span-1 row-span-2 bg-white p-2 md:p-4 rounded-md md:rounded-[0.75rem] border border-gray-100 flex flex-col items-start justify-between z-30"
                >
                    <div className="w-full">
                        <div className="w-7 h-7 md:w-10 md:h-10 rounded-md flex items-center justify-center mb-1 md:mb-1.5">
                            <img src="/assets/instagram.svg" alt="Instagram" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-[8px] md:text-[10px] font-bold text-gray-800 block mb-4 md:mb-8">Instagram</span>
                        <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-lg md:rounded-xl">
                            <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=100" className="w-full h-8 md:h-15 object-cover rounded-md" alt="ig 1" />
                            <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=100" className="w-full h-8 md:h-15 object-cover rounded-md" alt="ig 2" />
                            <img src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=100" className="w-full h-8 md:h-15 object-cover rounded-md" alt="ig 3" />
                            <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=100" className="w-full h-8 md:h-15 object-cover rounded-md" alt="ig 4" />
                        </div>
                    </div>
                    <button className="w-full bg-[#0095f6] hover:bg-blue-600 text-white text-[7px] md:text-[9px] py-1.5 md:py-2 rounded-full md:rounded-md font-bold transition-all mt-2">
                        Follow 12k
                    </button>
                </motion.div>

                {/* 7. Twitter Tile */}
                <motion.div
                    {...tileScatter(-38, 44, -14, -8, 15, 0.20, 0.14)}
                    className="col-span-1 row-span-1 bg-[#f4faff] p-2 md:p-5 rounded-lg md:rounded-[1.25rem] flex flex-col items-start justify-between border border-blue-50 min-h-[90px] md:min-h-[135px] z-20"
                >
                    <div className="flex flex-col items-start gap-1">
                        <div className="w-7 h-7 md:w-10 md:h-10 bg-white rounded-md md:rounded-lg flex items-center justify-center shadow-sm">
                            <img src="/assets/twitter.svg" alt="Twitter" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-[8px] md:text-[10px] font-bold text-gray-800">Twitter</span>
                    </div>
                    <button className="w-full bg-[#1DA1F2] hover:bg-blue-400 text-white text-[7px] md:text-[9px] py-1.5 md:py-2 rounded-full font-bold shadow-sm transition-all mt-2 md:mt-3">
                        Follow 12k
                    </button>
                </motion.div>

                {/* 8. Github Contribution Tile */}
                <motion.div
                    {...tileScatter(36, 49, -10, -12, -14, 0.24, 0.10)}
                    className="col-span-2 row-span-1 bg-white p-2 px-3 md:p-5 md:px-6 rounded-xl md:rounded-[1.75rem] border border-gray-100 flex items-center justify-between gap-2 overflow-hidden z-20"
                >
                    <div className="flex flex-col justify-between h-full py-0.5 shrink-0">
                        <div className="flex flex-col items-start gap-1">
                            <div className="w-7 h-7 md:w-10 md:h-10 bg-black rounded-lg md:rounded-xl flex items-center justify-center shadow-sm">
                                <img src="/assets/github.svg" alt="Github" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-[9px] md:text-xs font-bold text-gray-900 mt-1">Github</span>
                        </div>
                        <button className="border border-gray-200 text-gray-700 text-[9px] md:text-xs px-3 py-1 md:px-5 md:py-1.5 rounded-full md:rounded-md font-bold bg-white hover:bg-gray-50 transition-all shadow-sm mt-2 md:mt-4">
                            Follow
                        </button>
                    </div>

                    <div className="flex-1 min-w-0 flex justify-end overflow-hidden">
                        <div className="grid grid-rows-6 grid-flow-col gap-0.5 md:gap-2 p-1 md:p-2">
                            {[
                                0, 1, 0, 2, 0, 0, 0, 0, 1, 2,
                                2, 2, 3, 2, 1, 0, 2, 0, 0, 1,
                                0, 0, 2, 2, 2, 2, 0, 0, 3, 0,
                                0, 0, 0, 0, 2, 2, 3, 0, 1, 2,
                                3, 2, 3, 0, 2, 0, 0, 2

                            ].map((level, i) => {
                                const bgColors = {
                                    0: "bg-gray-100",
                                    1: "bg-green-200",
                                    2: "bg-green-400",
                                    3: "bg-green-700"
                                };
                                return (
                                    <div
                                        key={i}
                                        className={`w-1.5 h-1.5 md:w-3.5 md:h-3.5 rounded-[1px] md:rounded-[3px] ${bgColors[level as keyof typeof bgColors]}`}
                                    />
                                );
                        })}
                        </div>
                    </div>
                </motion.div>
            </motion.div>


        </section>
    );
}
