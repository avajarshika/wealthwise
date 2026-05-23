import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://mzazjpcdnrorezfkexld.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16YXpqcGNkbnJvcmV6ZmtleGxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1Mjc1MzUsImV4cCI6MjA5NTEwMzUzNX0.5JKVdUezzuN8D1KokS_jSiKpBCIaOiiInvogdgerBuQ"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)