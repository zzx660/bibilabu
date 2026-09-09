import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!url || !anon) {
    console.warn('[supabase] 缺少 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY,请在 .env 配置');
}
export const supabase = createClient(url || 'http://localhost:54321', anon || 'placeholder', {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined
    }
});
export async function currentProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user)
        return null;
    const { data } = await supabase
        .from('profiles')
        .select('id,email,role,pub_key,display_name')
        .eq('id', user.id)
        .single();
    return data;
}
