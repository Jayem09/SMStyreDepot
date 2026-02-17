import { Helmet } from 'react-helmet-async';

interface StructuredDataProps {
    type: 'Organization' | 'Product' | 'LocalBusiness';
    data: any;
}

export function StructuredData({ type, data }: StructuredDataProps) {
    let structuredData: any = {
        "@context": "https://schema.org",
        "@type": type,
        ...data
    };

    // Add default organization data if it's a LocalBusiness
    if (type === 'LocalBusiness') {
        structuredData = {
            "@context": "https://schema.org",
            "@type": "AutomotiveBusiness",
            "name": "SMS Tyre Depot",
            "image": "https://smstyredepot.com/og-image.jpg",
            "description": "Premium tyres and magwheels shop in the Philippines with professional fitting and balancing services.",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "W5V3+79P, J.M Katigbak St.",
                "addressLocality": "Lipa City",
                "addressRegion": "Batangas",
                "postalCode": "4217",
                "addressCountry": "PH"
            },
            "telephone": "+63 917 706 0025",
            "email": "smstyredepotlipa@gmail.com",
            "url": "https://smstyredepot.com",
            "priceRange": "₱₱",
            "openingHoursSpecification": [
                {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                    "opens": "08:00",
                    "closes": "19:00"
                },
                {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": "Saturday",
                    "opens": "08:00",
                    "closes": "19:00"
                }
            ],
            ...data
        };
    }

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
}
