"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/utils/api';
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isRightHovered, setIsRightHovered] = useState(false);

    useEffect(() => {
    const checkAuth = async () => {
        const token = localStorage.getItem("token");

        if (!token || token === "undefined") {
            return;
        }

        try {
            await authApi.getMe();
            router.replace("/");
        } catch {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
        }
    };

    checkAuth();
}, [router]);

    const isTyping = email.length > 0 || password.length > 0;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        setLoading(true);
        try {
             const res = await authApi.login(email, password);
             localStorage.setItem("token", res.data.accessToken);
             localStorage.setItem("refreshToken", res.data.refreshToken);
             localStorage.setItem("getnook_step", "3");

             router.push("/");
        } catch (err: any) {
            alert(err.response?.data?.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    

    return (
        <main className="min-h-screen bg-white flex flex-col md:flex-row items-center justify-center px-6 md:px-20 gap-12 lg:gap-24 overflow-hidden font-sans">

            {/* LEFT SECTION: Login Form (Untouched) */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full md:w-[40%] max-w-md space-y-8"
            >
                <div className="space-y-2">
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Log in to your nook</h1>
                    <p className="text-xl text-gray-400 font-medium">Good to have you back!</p>
                </div>

                <form className="space-y-4" onSubmit={handleLogin}>
                    <div className="flex flex-col gap-4">
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address"
                            className="w-full bg-gray-100 border-none rounded-[1.5rem] py-5 px-8 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200 transition-all outline-none font-medium"
                        />

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full bg-gray-100 border-none rounded-[1.5rem] py-5 px-8 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200 transition-all outline-none pr-20 font-medium"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border border-gray-100 text-black shadow-sm"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    <button type="button" className="text-[10px] text-gray-400 font-black uppercase tracking-widest hover:text-black transition-colors ml-2">
                        Reset Password?
                    </button>

                    <div className="pt-4">
                        <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-6">OR</p>

                        <AnimatePresence mode="wait">
                            {!isTyping ? (
                        
                            <GoogleLogin
                                theme="filled_blue"
                                shape="pill"
                                size="large"
                                width="100%"
                                onSuccess={async (credentialResponse) => {
                                    try {
                                        if (!credentialResponse.credential) {
                                            throw new Error("No Google credential received");
                                        }
                            
                                        const res = await authApi.oauthSync({
                                            credential: credentialResponse.credential,
                                        });

                                localStorage.setItem("token", res.data.accessToken);
                                localStorage.setItem("refreshToken", res.data.refreshToken);

                                router.push("/");
                            } catch (err: any) {
                                console.error(err);
                                alert(err.response?.data?.message || "Google login failed");
                              }
                          }}
                          onError={() => {
                              alert("Google Sign-In failed");
                          }}
                      />
                            ) : (
                                <motion.button
                                    key="black-login"
                                    type="submit"
                                    disabled={loading}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="w-full bg-black hover:bg-zinc-800 text-white font-bold py-5 px-6 rounded-[2rem] flex items-center justify-center transition-all shadow-2xl active:scale-[0.98] disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : "Log in"}
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </form>

                <p className="text-sm text-gray-400 font-medium">
                    New here? <Link href="/" className="text-black hover:underline underline-offset-4 font-bold">Create your link</Link>
                </p>
            </motion.div>

            {/* RIGHT BENTO COLLAGE WITH BALANCED RIGHT-SHIFTED SCATTER */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onMouseEnter={() => setIsRightHovered(true)}
                onMouseLeave={() => setIsRightHovered(false)}
                className="w-full md:w-[54%] grid grid-cols-4 gap-4 max-w-[46rem] p-6 cursor-pointer translate-x-8 md:translate-x-12"
            >
                {/* 1. Large 3D Artwork Tile (Top Left) */}
                <motion.div 
                    animate={isRightHovered ? { x: -25, y: -30, rotate: -8, scale: 1.03 } : { x: 0, y: 0, rotate: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 220, damping: 18 }}
                    className="col-span-2 row-span-2 rounded-[1.75rem] overflow-hidden shadow-sm aspect-square bg-gray-100 z-10"
                >
                    <img src="/assets/photo1.png" className="w-full h-full object-cover" alt="3D Artwork" />
                </motion.div>

                {/* 2. Behance Tile */}
                <motion.div 
                    animate={isRightHovered ? { x: 25, y: -35, rotate: 10, scale: 1.05 } : { x: 0, y: 0, rotate: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 240, damping: 16 }}
                    className="col-span-1 row-span-1 bg-[#f0f4ff] p-4 rounded-[1.25rem] flex flex-col items-start justify-between border border-blue-50/50 aspect-square z-20"
                >
                    <div className="flex flex-col items-start gap-1">
                        <div className="w-10 h-10 bg-[#0057ff] rounded-xl flex items-center justify-center text-white shadow-sm">
                            <span className="text-[10px] font-bold ">Bē</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-900 mt-1">Behance</span>
                    </div>
                    <button className="bg-[#0057ff] hover:bg-blue-600 text-white text-[9px] px-3 py-2 rounded-full font-bold transition-all">
                        Follow 6.5k
                    </button>
                </motion.div>

                {/* 3. LinkedIn Tile */}
                <motion.div 
                    animate={isRightHovered ? { x: 35, y: -20, rotate: 15, scale: 1.05 } : { x: 0, y: 0, rotate: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 250, damping: 17 }}
                    className="col-span-1 row-span-1 bg-[#f0f4ff] p-4 rounded-[1.25rem] flex flex-col items-start justify-between border border-blue-50/50 aspect-square z-30"
                >
                    <div className="flex flex-col items-start gap-1">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <img src="/assets/linkedin.svg" alt="LinkedIn" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-900 mt-1">LinkedIn</span>
                    </div>
                    <button className="border border-blue-300 text-gray-700 text-[9px] px-4 py-2 rounded-full font-bold bg-white hover:bg-gray-50 transition-all">
                        Connect
                    </button>
                </motion.div>

                {/* 4. Dribbble App Grid Tile */}
                <motion.div 
                    animate={isRightHovered ? { x: -15, y: 15, rotate: -5, scale: 1.02 } : { x: 0, y: 0, rotate: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 19 }}
                    className="col-span-2 row-span-2 bg-[#fff5f7] p-6 py-7 rounded-[1.75rem] border border-pink-100 flex flex-col justify-between shadow-sm min-h-[280px] z-10"
                >
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col items-start gap-1">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm ">
                                <img src="/assets/dribble.svg" alt="Dribbble" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-xs font-semibold text-gray-900">Dribbble</span>
                        </div>
                        <button className="bg-[#ea4c89] hover:bg-[#d43f78] text-white text-[12px] px-3 py-2 rounded-md font-bold flex items-center gap-1 shadow-sm">
                            ✉️ Hire Me
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 my-3">
                        <div className="bg-white p-1 rounded-2xl shadow-sm border border-pink-50 aspect-square flex items-center justify-center overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover rounded-xl" alt="App Icon 1" />
                        </div>
                        <div className="bg-white p-1 rounded-2xl shadow-sm border border-pink-50 aspect-square flex items-center justify-center overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover rounded-xl" alt="App Icon 2" />
                        </div>
                        <div className="bg-white p-1 rounded-2xl shadow-sm border border-pink-50 aspect-square flex items-center justify-center overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover rounded-xl" alt="App Icon 3" />
                        </div>
                        <div className="bg-white p-1 rounded-2xl shadow-sm border border-pink-50 aspect-square flex items-center justify-center overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover rounded-xl" alt="App Icon 4" />
                        </div>
                        <div className="bg-white p-1 rounded-2xl shadow-sm border border-pink-50 aspect-square flex items-center justify-center overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover rounded-xl" alt="App Icon 5" />
                        </div>
                        <div className="bg-white p-1 rounded-2xl shadow-sm border border-pink-50 aspect-square flex items-center justify-center overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover rounded-xl" alt="App Icon 6" />
                        </div>
                    </div>
                </motion.div>

                {/* 5. iOS UI Kit Tile */}
                <motion.div 
                    animate={isRightHovered ? { x: 20, y: 25, rotate: 8, scale: 1.05 } : { x: 0, y: 0, rotate: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 230, damping: 18 }}
                    className="col-span-1 row-span-1 bg-white p-5 rounded-[1.25rem] border border-gray-100 flex flex-col justify-between shadow-sm aspect-square z-20"
                >
                    <div className="flex flex-col items-start gap-1">
                        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white">
                            <span className="text-[10px]">🎨</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-800">iOS UI Kit</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <button className="text-[9px] text-gray-400 font-bold">❤️ 3.9k</button>
                        <button className="text-[9px] text-blue-500 font-bold">📥 3.9k</button>
                    </div>
                </motion.div>

                {/* 6. Instagram Tile */}
                <motion.div 
                    animate={isRightHovered ? { x: 30, y: -10, rotate: -10, scale: 1.04 } : { x: 0, y: 0, rotate: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 210, damping: 17 }}
                    className="col-span-1 row-span-2 bg-white p-4 rounded-[0.75rem] border border-gray-100 shadow-sm flex flex-col items-start justify-between z-30"
                >
                    <div className="w-full">
                        <div className="w-10 h-10 rounded-md flex items-center justify-center mb-1.5">
                            <img src="/assets/instagram.svg" alt="Instagram" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-800 block mb-8">Instagram</span>
                        <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-xl">
                            <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=100" className="w-full h-15 object-cover rounded-md" alt="ig 1" />
                            <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=100" className="w-full h-15 object-cover rounded-md" alt="ig 2" />
                            <img src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=100" className="w-full h-15 object-cover rounded-md" alt="ig 3" />
                            <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=100" className="w-full h-15 object-cover rounded-md" alt="ig 4" />
                        </div>
                    </div>
                    <button className="w-full bg-[#0095f6] hover:bg-blue-600 text-white text-[9px] py-2 rounded-md font-bold transition-all mt-2">
                        Follow 12k
                    </button>
                </motion.div>

                {/* 7. Twitter Tile */}
                <motion.div 
                    animate={isRightHovered ? { x: -25, y: 30, rotate: 10, scale: 1.05 } : { x: 0, y: 0, rotate: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 220, damping: 16 }}
                    className="col-span-1 row-span-1 bg-[#f4faff] p-5 rounded-[1.25rem] flex flex-col items-start justify-between border border-blue-50 shadow-sm min-h-[135px] z-20"
                >
                    <div className="flex flex-col items-start gap-1">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <img src="/assets/twitter.svg" alt="Twitter" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-800">Twitter</span>
                    </div>
                    <button className="w-full bg-[#1DA1F2] hover:bg-blue-400 text-white text-[9px] py-2 rounded-full font-bold shadow-sm transition-all mt-3">
                        Follow 12k
                    </button>
                </motion.div>

                {/* 8. Github Contribution Tile */}
                <motion.div 
                    animate={isRightHovered ? { x: 25, y: 35, rotate: -6, scale: 1.03 } : { x: 0, y: 0, rotate: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 190, damping: 18 }}
                    className="col-span-2 row-span-1 bg-white p-5 px-6 rounded-[1.75rem] border border-gray-100 shadow-sm flex items-center justify-between z-20"
                >
                    <div className="flex flex-col justify-between h-full py-0.5">
                        <div className="flex flex-col items-start gap-1">
                            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-sm">
                                <img src="/assets/github.svg" alt="Github" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-xs font-bold text-gray-900 mt-1">Github</span>
                        </div>
                        <button className="border border-gray-200 text-gray-700 text-xs px-5 py-1.5 rounded-md font-bold bg-white hover:bg-gray-50 transition-all shadow-sm mt-4">
                            Follow
                        </button>
                    </div>

                    <div className="grid grid-rows-6 grid-flow-col gap-2 p-2">
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
                                    className={`w-3.5 h-3.5 rounded-[3px] ${bgColors[level as keyof typeof bgColors]}`} 
                                />
                            );
                        })}
                    </div>
                </motion.div>
            </motion.div>
        </main>
    );
}