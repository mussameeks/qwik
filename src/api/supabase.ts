// src/api/supabase.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// HMR-safe singleton (kugira ngo client itiyongera buri hot reload)
declare global { var __sb: SupabaseClient | undefined }
function make(){ return createClient(url!, key!, { auth: { persistSession: true, autoRefreshToken: true } }) }

export const sb: SupabaseClient = (globalThis as any).__sb ?? make()
;(globalThis as any).__sb = sb

export default sb
