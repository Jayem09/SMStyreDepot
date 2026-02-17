import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
    googleVerification?: string;
}

export function SEO({
    title = "SMS Tyre Depot | Premium Tyres & Magwheels",
    description = "The best collection of high-performance tyres and stylish magwheels in the Philippines. Professional fitting, balancing, and premium services.",
    image = "/og-image.jpg",
    url = "https://smstyredepot.com",
    type = "website",
    googleVerification = "9NCE3Tw9BB5svjWe0jgOwjCQNP7LVPITYEbbH2A0G7Y"
}: SEOProps) {
    const siteTitle = title === "SMS Tyre Depot | Premium Tyres & Magwheels"
        ? title
        : `${title} | SMS Tyre Depot`;

    // Build absolute image URL
    const absoluteImageUrl = image?.startsWith('http') ? image : `${url}${image}`;

    // Build absolute page URL
    const absoluteUrl = url?.startsWith('http') ? url : `https://smstyredepot.com${url}`;

    return (
        <Helmet>
            {/* Verification */}
            {googleVerification && <meta name="google-site-verification" content={googleVerification} />}

            {/* Canonical URL */}
            <link rel="canonical" href={absoluteUrl} />

            {/* Standard Metadata */}
            <title>{siteTitle}</title>
            <meta name="description" content={description} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={absoluteUrl} />
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={absoluteImageUrl} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={absoluteUrl} />
            <meta name="twitter:title" content={siteTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={absoluteImageUrl} />
        </Helmet>
    );
}
