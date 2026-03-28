import { createClient } from '@supabase/supabase-js';

const supabaseUrl ="https://rpewurzqpggzksbiyrwn.supabase.co";
const supabaseAnonKey ="sb_publishable_8NYV-ghJzJP7bFzatkz50w_MkL3zzlD";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);