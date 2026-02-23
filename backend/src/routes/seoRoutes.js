
import express from 'express';
import supabase from '../config/database.js';

const router = express.Router();

// Always use the primary domain for SEO regardless of what Vercel passes
const FRONTEND_URL = 'https://smstyredepot.com';


router.get('/robots.txt', (req, res) => {
    const robotsContent = `User-agent: *
Allow: /
Sitemap: ${FRONTEND_URL}/sitemap.xml
`;
    res.header('Content-Type', 'text/plain');
    res.send(robotsContent);
});


router.get('/sitemap.xml', async (req, res) => {
    try {
        
        const { data: products, error } = await supabase
            .from('products')
            .select('id, updated_at');

        if (error) throw error;

        
        const staticRoutes = [
            { path: '', freq: 'weekly', priority: '1.0' },
            { path: '/products', freq: 'daily', priority: '0.9' },
            { path: '/services', freq: 'monthly', priority: '0.8' },
            { path: '/brands', freq: 'monthly', priority: '0.8' },
            { path: '/contact', freq: 'monthly', priority: '0.7' },
            { path: '/compare', freq: 'monthly', priority: '0.7' },
            { path: '/privacy', freq: 'yearly', priority: '0.3' },
            { path: '/terms', freq: 'yearly', priority: '0.3' }
        ];

        
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        
        staticRoutes.forEach(route => {
            xml += `\n  <url>\n    <loc>${FRONTEND_URL}${route.path}</loc>\n    <changefreq>${route.freq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>`;
        });

        
        products.forEach(product => {
            xml += `\n  <url>\n    <loc>${FRONTEND_URL}/product/${product.id}</loc>\n    <lastmod>${new Date(product.updated_at || Date.now()).toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>`;
        });

        xml += `
</urlset>`;

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        console.error('Sitemap generation error:', error);
        res.status(500).send('Error generating sitemap');
    }
});

export default router;
