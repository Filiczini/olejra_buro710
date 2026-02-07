import { supabase } from '../config/supabase';
export const siteSettingsService = {
    getAll: async () => {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*');
        if (error)
            throw error;
        // Convert array to object: { company_name: "Bureau 710", ... }
        const settings = {};
        data.forEach(item => {
            settings[item.key] = item.value;
        });
        return settings;
    },
    get: async (key) => {
        const { data, error } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', key)
            .single();
        if (error)
            throw error;
        return data?.value;
    },
    update: async (key, value) => {
        const { data, error } = await supabase
            .from('site_settings')
            .update({ value, updated_at: new Date().toISOString() })
            .eq('key', key)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    },
};
