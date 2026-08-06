"use client";
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface ToastItem {
    id: string;
    label: string;
    status: 'loading' | 'success' | 'error';
}

interface FetchToastProps {
    toasts: ToastItem[];
}

export default function FetchToast({ toasts }: FetchToastProps) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 left-4 sm:left-auto z-[100] flex flex-col gap-2 items-end">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className="flex items-center gap-2.5 bg-white shadow-lg border border-gray-100 rounded-2xl px-4 py-3 text-sm font-medium text-gray-800 min-w-[220px] animate-in fade-in slide-in-from-top-2 duration-300"
                >
                    {t.status === 'loading' && <Loader2 size={16} className="animate-spin text-blue-500 shrink-0" />}
                    {t.status === 'success' && <CheckCircle2 size={16} className="text-green-500 shrink-0" />}
                    {t.status === 'error' && <XCircle size={16} className="text-red-500 shrink-0" />}
                    <span className="truncate">{t.label}</span>
                </div>
            ))}
        </div>
    );
}