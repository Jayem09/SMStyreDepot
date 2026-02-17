import supabase from '../config/database.js';

export const getMakes = async (req, res) => {
    try {
        console.log('📡 Fetching makes from Supabase...');
        const { data, error } = await supabase
            .from('vehicle_tyre_mapping')
            .select('make');

        if (error) {
            console.error('❌ Supabase Error (getMakes):', error);
            throw error;
        }

        if (!data) return res.json([]);

        const uniqueMakes = [...new Set(data.filter(item => item && item.make).map(item => item.make))].sort();
        console.log(`Found ${uniqueMakes.length} makes`);
        res.json(uniqueMakes);
    } catch (error) {
        console.error('Backend Error (getMakes):', error.message);
        res.status(500).json({ error: error.message, details: 'Check if vehicle_tyre_mapping table exists' });
    }
};

export const getModels = async (req, res) => {
    const { make } = req.query;
    try {
        const { data, error } = await supabase
            .from('vehicle_tyre_mapping')
            .select('model')
            .eq('make', make);

        if (error) throw error;

        if (!data) return res.json([]);

        const uniqueModels = [...new Set(data.filter(item => item && item.model).map(item => item.model))].sort();
        res.json(uniqueModels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getYears = async (req, res) => {
    const { make, model } = req.query;
    try {
        const { data, error } = await supabase
            .from('vehicle_tyre_mapping')
            .select('year')
            .eq('make', make)
            .eq('model', model);

        if (error) throw error;

        if (!data) return res.json([]);

        const uniqueYears = [...new Set(data.filter(item => item && item.year).map(item => item.year))].sort((a, b) => b - a);
        res.json(uniqueYears);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getTrims = async (req, res) => {
    const { make, model, year } = req.query;
    try {
        const { data, error } = await supabase
            .from('vehicle_tyre_mapping')
            .select('trim, tyre_size')
            .eq('make', make)
            .eq('model', model)
            .eq('year', year);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
