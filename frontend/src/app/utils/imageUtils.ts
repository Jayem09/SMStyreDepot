

interface ImageOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg';
}


export const getOptimizedImageUrl = (url: string, _options: ImageOptions = {}): string => {
    if (!url) return '/placeholder.png';

    
    if (url.startsWith('/') || url.includes('?')) {
        return url;
    }

    
    

    
    
    
    
    
    

    return url;
};


export const preloadImage = (url: string) => {
    if (typeof window === 'undefined') return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
};
