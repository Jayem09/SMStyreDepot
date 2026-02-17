import supabase from '../config/database.js';

export const getSizes = async (req, res, next) => {
    try {
        const { data: sizes, error } = await supabase
            .from('product_sizes')
            .select('*')
            .order('size_value', { ascending: true });

        if (error) throw error;
        res.json({ sizes: sizes || [] });
    } catch (error) {
        next(error);
    }
};

export const getSize = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { data: size, error } = await supabase
            .from('product_sizes')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !size) {
            return res.status(404).json({ error: 'Size not found' });
        }
        res.json({ size });
    } catch (error) {
        next(error);
    }
};

export const createSize = async (req, res, next) => {
    try {
        const { size_value } = req.body;
        if (!size_value) {
            return res.status(400).json({ error: 'size_value is required' });
        }

        const { data: size, error } = await supabase
            .from('product_sizes')
            .insert([{ size_value }])
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(400).json({ error: 'Size already exists' });
            }
            throw error;
        }
        res.status(201).json({ size });
    } catch (error) {
        next(error);
    }
};

export const updateSize = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { size_value } = req.body;

        if (!size_value) {
            return res.status(400).json({ error: 'size_value is required' });
        }

        const { data: size, error } = await supabase
            .from('product_sizes')
            .update({ size_value, updated_at: new Date() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(400).json({ error: 'Size already exists' });
            }
            throw error;
        }
        res.json({ size });
    } catch (error) {
        next(error);
    }
};

export const deleteSize = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('product_sizes')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Size deleted successfully' });
    } catch (error) {
        next(error);
    }
};
