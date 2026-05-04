import React from 'react';
import * as Icons from 'lucide-react';

interface IconRendererProps {
    name: string;
    size: number;
    className?: string;
}

const IconRenderer = ({ name, size, className }: IconRendererProps) => {
    // @ts-ignore
    const LucideIcon = Icons[name];
    if (!LucideIcon) return <Icons.Globe size={size} className={className} />;
    return <LucideIcon size={size} className={className} />;
};

export default IconRenderer;