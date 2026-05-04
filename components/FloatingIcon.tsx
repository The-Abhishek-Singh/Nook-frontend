"use client";
import { motion } from 'framer-motion';

export const FloatingIcon = ({ children, x, y, delay, color }: any) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
            opacity: 1,
            scale: 1,
            y: [0, -15, 0]
        }}
        transition={{
            opacity: { duration: 0.5, delay },
            y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: delay }
        }}
        className={`absolute p-4 rounded-2xl shadow-xl flex items-center justify-center text-white ${color} hidden md:flex`}
        style={{ left: x, top: y }}
    >
        {children}
    </motion.div>
);