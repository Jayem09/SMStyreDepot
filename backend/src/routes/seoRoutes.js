
import express from 'express';
import supabase from '../config/database.js';

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://smstyredepot.com';

// robots.txt
router.get('/robots.txt', (req, res) => {
    const robotsContent = `User-agent: *
Allow: /
Sitemap: ${FRONTEND_URL}/sitemap.xml
`;
    res.header('Content-Type', 'text/plain');
    res.send(robotsContent);
});

// sitemap.xml
router.get('/sitemap.xml', async (req, res) => {
    try {
        // 1. Fetch all product IDs for dynamic links
        const { data: products, error } = await supabase
            .from('products')
            .select('id, updated_at');

        if (error) throw error;

        // 2. Define static routes
        const staticRoutes = [
            '',
            '/products',
            '/brands',
            '/about',
            '/services',
            '/contact'
        ];

        // 3. Build XML content
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        // Add static routes
        staticRoutes.forEach(route => {
            xml += `
  <url>
    <loc>${FRONTEND_URL}${route}</loc>
    <changefreq>daily</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`;
        });

        // Add dynamic product routes
        products.forEach(product => {
            xml += `
  <url>
    <loc>${FRONTEND_URL}/product/${product.id}</loc>
    <lastmod>${new Date(product.updated_at || Date.now()).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
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
