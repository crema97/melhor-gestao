import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yfiygrsowmctczlnrdky.supabase.co'
// Você precisa substituir pela sua Service Role Key (não a Anon Key)
const supabaseServiceKey = 'SUA_SERVICE_ROLE_KEY_AQUI'

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey) 