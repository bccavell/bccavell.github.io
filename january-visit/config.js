// ============================================================
// JANUARY VISIT - config.js  ✏️  (your Supabase project's details)
// ============================================================
// Leave both blank and the app runs in LOCAL mode: ideas and notes
// are saved on each person's own phone, like before.
//
// Fill them in and the app switches to SHARED mode: sign-in, plus
// ideas, hearts and a photo/video feed that everyone sees.
//
// WHERE TO FIND THEM: Supabase dashboard -> Project Settings -> API
// (sometimes labelled "Data API" / "API Keys"):
//   url     = "Project URL", like https://abcdefghijkl.supabase.co
//   anonKey = the "anon" / "public" key (a long string starting "eyJ...")
//             or the newer "publishable" key (starting "sb_publishable_")
//
// IS IT SAFE TO PUT A KEY IN PUBLIC CODE? This one, yes. The anon key
// is MEANT to be public. Think of it as the building's street address,
// not the key to the front door. What actually protects the data is
// Row Level Security in supabase/schema.sql: the database checks every
// single request against the guest list, whoever sends it.
//
// ⚠️ NEVER put the "service_role" or "secret" key here. That one
// skips every security rule. It's the master key and must never
// leave the Supabase dashboard.
// ============================================================

const SUPABASE_CONFIG = {
  url: "",      // e.g. "https://abcdefghijkl.supabase.co"
  anonKey: "",  // e.g. "eyJhbGciOi..."
};
