import { createClient } from '@supabase/supabase-js'

// 현성님이 복사한 URL과 Key를 여기에 따옴표('') 안에 넣어주세요!
const supabaseUrl = 'https://jhduyrvvnjxxrwexdquw.supabase.co'
const supabaseAnonKey = 'sb_publishable_u7mKlPgZXlMyt-ceoTuJPA_XIWg2khr'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)