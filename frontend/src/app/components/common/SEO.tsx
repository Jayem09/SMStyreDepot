import { Helmet } from 'react-helmet-async';

export interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
    googleVerification?: string;
    preloadImages?: string[];
}

export function SEO({
    title = 'SMS Tyre Depot | Premium Tyres & Expert Service',
    description = 'The best collection of high-performance tyres and stylish magwheels in the Philippines. Professional fitting, balancing, and premium services.',
    keywords = 'tyres, car tyres, tyre shop, SMS Tyre Depot, tyre service, auto parts, magwheels, Philippines',
    image = '/og-image.jpg',
    url = window.location.href,
    type = 'website',
    googleVerification = '9NCE3Tw9BB5svjWe0jgOwjCQNP7LVPITYEbbH2A0G7Y',
    preloadImages = []
}: SEOProps) {
    const siteName = 'SMS Tyre Depot';
    const siteTitle = title === siteName || title === 'SMS Tyre Depot | Premium Tyres & Expert Service'
        ? title
        : `${title} | ${siteName}`;

    
    const absoluteImageUrl = image?.startsWith('http') ? image : `${window.location.origin}${image}`;

    
    const absoluteUrl = url?.startsWith('http') ? url : `${window.location.origin}${url}`;

    return (
        <Helmet>
            {}
            <title>{siteTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            {googleVerification && <meta name="google-site-verification" content={googleVerification} />}

            {}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={absoluteImageUrl} />
            <meta property="og:url" content={absoluteUrl} />
            <meta property="og:site_name" content={siteName} />

            {}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={siteTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={absoluteImageUrl} />

            {}
            {preloadImages && preloadImages.length > 0 && preloadImages.map((src) => (
                <link key={src} rel="preload" as="image" href={src} />
            ))}

            {}
            <link rel="canonical" href={absoluteUrl} />
        </Helmet>
    );
}
