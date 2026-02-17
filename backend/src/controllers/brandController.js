import supabase from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getBrands = async (req, res, next) => {
    try {
        const { data: brands, error } = await supabase
            .from('brands')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        res.json({ brands: brands || [] });
    } catch (error) {
        next(error);
    }
};

export const getBrand = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { data: brand, error } = await supabase
            .from('brands')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !brand) {
            return res.status(404).json({ error: 'Brand not found' });
        }
        res.json({ brand });
    } catch (error) {
        next(error);
    }
};

export const createBrand = async (req, res, next) => {
    try {
        const { name, logo, description } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Brand name is required' });
        }

        const { data: brand, error } = await supabase
            .from('brands')
            .insert([{ name, logo, description }])
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(400).json({ error: 'Brand already exists' });
            }
            throw error;
        }
        res.status(201).json({ brand });
    } catch (error) {
        next(error);
    }
};

export const updateBrand = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, logo, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Brand name is required' });
        }

        const { data: brand, error } = await supabase
            .from('brands')
            .update({ name, logo, description, updated_at: new Date() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(400).json({ error: 'Brand already exists' });
            }
            throw error;
        }
        res.json({ brand });
    } catch (error) {
        next(error);
    }
};

export const deleteBrand = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('brands')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Brand deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const getBrandAssets = async (req, res, next) => {
    try {
        // Path to the brands images folder in the frontend public directory
        const brandsPath = path.join(__dirname, '../../../frontend/public/images/brands');

        if (!fs.existsSync(brandsPath)) {
            return res.json({ assets: [] });
        }

        const files = fs.readdirSync(brandsPath);
        const assets = files
            .filter(file => {
                const ext = path.extname(file).toLowerCase();
                return ['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(ext);
            })
            .map(file => ({
                name: file,
                path: `/images/brands/${file}`
            }));

        res.json({ assets });
    } catch (error) {
        console.error('Error listing brand assets:', error);
        next(error);
    }
};
