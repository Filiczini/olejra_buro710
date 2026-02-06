import { supabase } from '../config/supabase';
export const storageService = {
    uploadImage: async (file) => {
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = `projects/${fileName}`;
        const { error: uploadError } = await supabase.storage
            .from('projects')
            .upload(filePath, file.buffer, {
            contentType: file.mimetype,
        });
        if (uploadError)
            throw uploadError;
        const { data } = supabase.storage
            .from('projects')
            .getPublicUrl(filePath);
        return data.publicUrl;
    },
    deleteImage: async (imageUrl) => {
        try {
            const filePath = imageUrl.split('/projects/')[1];
            if (!filePath)
                return;
            await supabase.storage
                .from('projects')
                .remove([`projects/${filePath}`]);
        }
        catch (error) {
            console.error('Error deleting image:', error);
        }
    },
};
