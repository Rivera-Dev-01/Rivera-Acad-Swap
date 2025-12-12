import { createClient } from '@supabase/supabase-js';

// 1. Load keys safely
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. Log a warning instead of crashing the app if keys are missing
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('⚠️ SUPABASE KEYS MISSING! Check your .env file.');
}

// 3. Create the client (using placeholders if keys are missing to prevent crash)
// THE WORD "export" BELOW IS WHAT FIXES YOUR ERROR
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);