"use client";
import Image from 'next/image';
import { ArrowRight, Instagram, Github, Twitter, Linkedin, Youtube } from 'lucide-react';
import { FloatingIcon } from './FloatingIcon';

export default function HeroSection({ onNext }: { onNext: () => void }) {
    return (
        <section className="relative h-screen w-full flex flex-col items-center justify-center px-6 overflow-hidden bg-white">

            {/* Background Elements - Fixed scattering for better balance */}
            <FloatingIcon x="10%" y="20%" delay={0.2} color="bg-pink-500"><Instagram size={24} /></FloatingIcon>
            <FloatingIcon x="80%" y="15%" delay={0.4} color="bg-black"><Github size={24} /></FloatingIcon>
            <FloatingIcon x="85%" y="65%" delay={0.1} color="bg-red-600"><Youtube size={24} /></FloatingIcon>
            <FloatingIcon x="15%" y="70%" delay={0.6} color="bg-[#0077b5]"><Linkedin size={24} /></FloatingIcon>

            <div className="z-10 flex flex-col items-center text-center max-w-4xl">

                {/* Logo Section */}
           


                {/* Headline */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 leading-[1.05] tracking-tight mb-8">
                    Elevate Your <br />
                    <span className="text-blue-600">Online Presence</span>
                </h1>

                {/* Subtext */}
                <p className="text-lg md:text-xl text-gray-500 mb-12 max-w-xl mx-auto leading-relaxed">
                    Bento is a powerful link-in-bio platform that helps you showcase your best self online. Increase engagement by up to 60%.
                </p>

                {/* Enhanced Center Aligned Button */}
                <div className="w-full flex justify-center">
                    <button
                        onClick={onNext}
                        className="group relative bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-5 px-10 rounded-2xl flex items-center gap-3 transition-all duration-300 shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.5)] active:scale-95"
                    >
                        <span>Create your Bento</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                </div>

            </div>

            {/* Subtle Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] -z-10 opacity-50" />
        </section>
    );
}