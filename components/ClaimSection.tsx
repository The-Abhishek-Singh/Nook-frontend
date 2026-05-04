"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Instagram, Linkedin, Github, Twitter, Dribbble, Loader2 } from 'lucide-react';
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

            const token = res.data.token;
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

    return (
        <section className="min-h-screen flex flex-col md:flex-row items-center justify-center px-6 md:px-20 gap-16 bg-white overflow-hidden font-sans">
            <div className="w-full md:w-1/2 max-w-md min-h-[450px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                            <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-tight">First, claim your unique link</h1>
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
                                <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Now, Create your account</h1>
                            </div>
                            <div className="space-y-6">
                                <div className="flex gap-3">
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="flex-1 text-black bg-gray-100 py-5 px-6 rounded-2xl outline-none focus:bg-white border-2 border-transparent focus:border-gray-300 transition-all text-sm font-medium" />
                                    <div className="relative flex-1">
                                        <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full text-black bg-gray-100 py-5 px-6 rounded-2xl outline-none focus:bg-white border-2 border-transparent focus:border-gray-300 transition-all text-sm font-medium pr-16" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-white px-2 py-1 text-black rounded-md border border-gray-100 shadow-sm">{showPassword ? "Hide" : "Show"}</button>
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

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full md:w-[50%] grid grid-cols-10 gap-4 max-w-2xl aspect-square relative p-10">
                <div className="col-span-6 row-span-6 rounded-[2.5rem] overflow-hidden shadow-md border-2 border-green-800"><img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" alt="3D Art" /></div>
                <div className="col-span-2 row-span-3 bg-[#f0f4ff] p-4 rounded-[2rem] flex flex-col items-center justify-center"><Linkedin size={20} className="text-[#0077b5] mb-2" /><button className="border border-gray-300 text-[8px] px-3 py-1 rounded-full font-bold bg-white">Connect</button></div>
                <div className="col-span-2 row-span-3 bg-[#f0f4ff] p-4 rounded-[2rem] flex flex-col items-center justify-center"><Twitter size={20} className="text-[#1da1f2] mb-2" /><button className="bg-[#1da1f2] text-white text-[8px] px-3 py-1 rounded-full font-bold">Follow</button></div>
                <div className="col-span-4 row-span-4 bg-[#fff1f5] p-5 rounded-[2.5rem] border border-pink-100"><div className="flex justify-between items-center mb-4"><Dribbble size={16} className="text-[#ea4c89]" /><button className="bg-[#ea4c89] text-white text-[7px] px-2 py-0.5 rounded font-bold">Hire</button></div><div className="grid grid-cols-2 gap-2">{[1, 2, 3, 4].map((i) => (<div key={i} className="aspect-square bg-white rounded-xl shadow-sm border border-pink-50/50" />))}</div></div>
                <div className="col-span-3 row-span-3 bg-white p-4 rounded-[2.5rem] shadow-lg border border-gray-100 flex flex-col justify-center"><div className="flex items-center gap-2 mb-2"><div className="w-5 h-5 bg-gradient-to-tr from-yellow-400 to-purple-600 rounded-md flex items-center justify-center text-white"><Instagram size={12} /></div><span className="text-[10px] font-bold">Instagram</span></div><button className="w-full bg-[#0095f6] text-white text-[8px] py-1 rounded-md font-bold">12k</button></div>
                <div className="col-span-4 row-span-3 bg-gray-50/50 p-4 rounded-[2.5rem] border border-gray-100"><div className="flex items-center gap-2 mb-2"><Github size={12} className="text-gray-900" /><span className="text-[10px] font-bold">Github</span></div><div className="grid grid-cols-7 gap-1">{Array.from({ length: 21 }).map((_, i) => (<div key={i} className={`w-full aspect-square rounded-[1px] ${i % 3 === 0 ? 'bg-green-500' : 'bg-gray-200'}`} />))}</div></div>
            </motion.div>
        </section>
    );
}