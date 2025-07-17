export async function getSupabase() {
  const dynamicImport = new Function('u', 'return import(u)') as (url: string) => Promise<any>
  const { createClient } = await dynamicImport('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON!
  )
}
