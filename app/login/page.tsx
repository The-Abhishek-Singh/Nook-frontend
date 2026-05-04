"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Linkedin, Github, Twitter, Dribbble, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/utils/api';

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            router.push('/');
        }
    }, [router]);

    const isTyping = email.length > 0 || password.length > 0;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        setLoading(true);
        try {
            const res = await authApi.login(email, password);
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("getnook_step", "3");
            router.push('/');
        } catch (err: any) {
            alert(err.response?.data?.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        alert("Google Sign-in clicked.");
    };

    return (
        <main className="min-h-screen bg-white flex flex-col md:flex-row items-center justify-center px-6 md:px-20 gap-12 lg:gap-24 overflow-hidden font-sans">

            {/* LEFT SECTION: Login Form */}
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
                                <motion.button
                                    key="google-login"
                                    type="button"
                                    onClick={handleGoogleSignIn}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="w-full bg-[#1da1f2] hover:bg-blue-500 text-white font-bold py-5 px-6 rounded-[2rem] flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-100"
                                >
                                    <div className="bg-white p-0.5 rounded-full">
                                        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#1da1f2" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#1da1f2" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#1da1f2" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path fill="#1da1f2" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                    </div>
                                    Sign in with Google
                                </motion.button>
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

            {/* RIGHT BENTO COLLAGE: Keeping your exact UI and animations */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full md:w-[50%] grid grid-cols-10 gap-4 max-w-2xl aspect-square relative p-10"
            >
                <div className="col-span-6 row-span-6 rounded-[2.5rem] overflow-hidden shadow-md border-2 border-gray-100">
                    <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" alt="3D Artwork" />
                </div>
                <div className="col-span-2 row-span-3 bg-[#f0f4ff] p-4 rounded-[2rem] flex flex-col items-center justify-center border border-blue-50/50">
                    <div className="w-8 h-8 bg-[#0057ff] rounded-lg flex items-center justify-center text-white mb-2 shadow-sm"><span className="text-[10px] font-bold">Bē</span></div>
                    <button className="bg-[#0057ff] text-white text-[8px] px-3 py-1 rounded-full font-bold">Follow</button>
                </div>
                <div className="col-span-2 row-span-3 bg-[#f0f4ff] p-4 rounded-[2rem] flex flex-col items-center justify-center border border-blue-50/50">
                    <Linkedin size={20} className="text-[#0077b5] mb-2" />
                    <button className="border border-gray-300 text-gray-700 text-[8px] px-3 py-1 rounded-full font-bold bg-white">Connect</button>
                </div>
                <div className="col-span-4 row-span-4 bg-[#fff1f5] p-5 rounded-[2.5rem] border border-pink-100">
                    <div className="flex justify-between items-center mb-4"><Dribbble size={16} className="text-[#ea4c89]" /><button className="bg-[#ea4c89] text-white text-[7px] px-2 py-0.5 rounded font-bold uppercase">Hire</button></div>
                    <div className="grid grid-cols-2 gap-2">{[1, 2, 3, 4].map((i) => (<div key={i} className="aspect-square bg-white rounded-xl shadow-sm border border-pink-50/50" />))}</div>
                </div>
                <div className="col-span-3 row-span-3 bg-[#f4faff] p-5 rounded-[2.5rem] flex flex-col items-center justify-center border border-blue-50">
                    <Twitter size={22} className="text-[#1DA1F2] mb-1" /><span className="text-[9px] text-gray-400 font-bold mb-3 uppercase tracking-tighter">Twitter</span>
                    <button className="bg-[#1DA1F2] text-white text-[9px] px-4 py-1.5 rounded-full font-bold shadow-md">Follow</button>
                </div>
                <div className="col-span-3 row-span-3 bg-white p-4 rounded-[2.5rem] shadow-lg border border-gray-100 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2"><div className="w-5 h-5 bg-gradient-to-tr from-yellow-400 to-purple-600 rounded-md flex items-center justify-center text-white"><Instagram size={12} /></div><span className="text-[10px] font-bold text-gray-800">Instagram</span></div>
                    <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-lg mb-2">{[1, 2, 3, 4].map((i) => (<div key={i} className="h-6 bg-gray-50 border border-gray-100 rounded-sm" />))}</div>
                    <button className="w-full bg-[#0095f6] text-white text-[8px] py-1 rounded-md font-bold">12k</button>
                </div>
                <div className="col-span-4 row-span-3 bg-gray-50/50 p-4 rounded-[2.5rem] border border-gray-100">
                    <div className="flex items-center gap-2 mb-2"><Github size={12} className="text-gray-900" /><span className="text-[10px] font-bold">Github</span></div>
                    <div className="grid grid-cols-7 gap-1">{Array.from({ length: 21 }).map((_, i) => (<div key={i} className={`w-full aspect-square rounded-[1px] ${i % 3 === 0 ? 'bg-green-500' : 'bg-gray-200'}`} />))}</div>
                </div>
            </motion.div>
        </main>
    );
}