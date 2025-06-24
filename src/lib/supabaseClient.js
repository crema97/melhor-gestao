import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yfiygrsowmctczlnrdky.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmaXlncnNvd21jdGN6bG5yZGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMjE1NzQsImV4cCI6MjA2NTc5NzU3NH0.Z6dPRRvUDJ4qUQtoSVxBg1Cc313Bbht2h4ZQFkMxQqc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 