/**
 * DentaVision AI — Supabase Client Utility
 * Owner: Twahir (Backend Lead)
 *
 * Exports a server-side Supabase client using the Service Role Key.
 * Used for server-side auth validation and Supabase Storage operations.
 * NEVER expose this client to the frontend.
 */

import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env";

// Server-side admin client (uses service role key — full DB access)
export const supabaseAdmin = createClient(
  env.SUPABASE_URL || "",
  env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// Anon client (used for auth token validation)
export const supabaseAnon = createClient(
  env.SUPABASE_URL || "",
  env.SUPABASE_ANON_KEY || ""
);
