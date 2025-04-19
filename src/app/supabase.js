import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yglesxkucnohlvnolemj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnbGVzeGt1Y25vaGx2bm9sZW1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2NDMwMTgsImV4cCI6MjA2MDIxOTAxOH0.KaTgjpa8MRRrsViKuYfla3mbdH5bH1j307MYyZQfoAc'

export const supabase = createClient(supabaseUrl, supabaseKey)