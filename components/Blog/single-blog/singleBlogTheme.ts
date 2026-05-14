import { getAssetUrl } from '@/services/api';

export const SINGLE_BLOG_COLORS = {
    brown: '#3A2418',
    brown2: '#6B3F24',
    gold: '#C99A45',
    goldLight: '#F8D99A',
    cream: '#FFF8EF',
    soft: '#F6E8D8',
    ink: '#261812',
    muted: '#8A7565',
    border: '#EAD9C5',
    white: '#FFFFFF',
};

export type BlogPost = {
    _id: string;
    title: string;
    slug: string;
    excerpt?: string;
    description?: string;
    image?: string;
    category?: string;
    author?: { name: string; profile_image?: string };
    readingTimeText?: string;
    views?: number;
    createdAt?: string;
    published_date?: string;
    tags?: string[];
};

export type BlogComment = {
    _id: string;
    user?: { _id: string; name: string } | string;
    comment: string;
    createdAt?: string;
    likes?: string[];
};

export const blogImageUri = (img?: string) =>
    getAssetUrl(img) ||
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600';

export const formatBlogDate = (d?: string) => {
    if (!d) return '';

    try {
        return new Date(d).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    } catch {
        return '';
    }
};

export const getInitials = (name?: string) =>
    (name || 'HC')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();