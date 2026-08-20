export type WidthType =
    | "1x1"
    | "2x1"
    | "1x2"
    | "2x2"
    | "full"
    | "1:1"
    | "3:4"
    | "4:3"
    | "2:3"
    | "3:2"
    | "9:16"
    | "16:9"
    | "5:4"
    | "4:5"
    | "21:9";

export interface BlockPosition {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface BlockContent {
    title?: string;
    description?: string;
    url?: string;
    logo?: string;
    imageUrl?: string;
    imagePublicId?: string;
    videoUrl?: string;
    videoPublicId?: string;
    embedCode?: string;
    githubUsername?: string;
    youtubeChannelId?: string;
    platform?: string;
    handle?: string;
    iconName?: string;
    location?: {
        lat: number;
        lng: number;
    };
    textAlign?: TextAlign;
    cachedData?: CachedSocialData;
    fetchStatus?: "pending" | "fetching" | "completed" | "failed";
    lastFetchedAt?: Date;
}

export interface BlockStyle {
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: string;
    fontSize?: string;
    isHighlighted?: boolean;
    width?: WidthType;
    color?: string;
}

export interface Block {
    _id: string;
    userId?: string;
    type: 'link' | 'image' | 'video' | 'text' | 'social' | 'map' | 'spotify' | 'github' | 'youtube' | 'heading' | 'quote';
    position: BlockPosition;
    content: BlockContent;
    style: BlockStyle;
    isActive?: boolean;
    isDraft?: boolean;
    clicks?: number;
    views?: number;
    order?: number;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
}

export interface UISocialItem {
    id: string;
    type: string;
    width: WidthType;
    content?: BlockContent;
    title?: string;
    description?: string;
    image?: string;
    platform?: string;
    handle?: string;
    color?: string;
    iconName?: string;
    location?: { lat: number; lng: number };
    position?: BlockPosition;
    order?: number;
    url?: string;
    logo?: string;
    style?: {  // Add this
        width?: string;
        color?: string;
        backgroundColor?: string;
        borderRadius?: string;
        [key: string]: any;
    };
}

export interface CreateBlockPayload {
    type: string;
    content: BlockContent;
    style: {
        width?: WidthType;
        color?: string;
        backgroundColor?: string;
        textColor?: string;
        borderRadius?: string;
        fontSize?: string;
        isHighlighted?: boolean;
    };
    position: BlockPosition;
}

export interface CachedSocialData {
    platform: string;

    profile?: {
        displayName?: string;
        username?: string;
        title?: string;
        description?: string;
        avatar?: string;
        favicon?: string;
        preview?: string;
        url?: string;
    };

    items?: any[];

    fetchedAt?: string;
}

export type TextAlign = 'left' | 'center' | 'right';
