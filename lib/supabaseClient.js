import { createClient } from '@supabase/supabase-js';

// GitHub Actions에서 주입한 환경변수 사용 (NEXT_PUBLIC_*)
const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnon);
