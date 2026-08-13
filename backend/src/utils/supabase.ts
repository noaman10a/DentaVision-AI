/**
 * DentaVision AI — Supabase Client Utility
 * Owner: Twahir (Backend Lead)
 *
 * Exports lazy getter functions for Supabase clients.
 * Clients are created on first use (after dotenv has loaded env vars).
 * NEVER expose the admin/service-role client to the frontend.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "../config/env";

let _adminClient: SupabaseClient | null = null;
let _anonClient: SupabaseClient | null = null;

// Server-side admin client (service role key — full DB access, never expose)
export const getSupabaseAdmin = (): SupabaseClient => {
  if (!_adminClient) {
    _adminClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  }
  return _adminClient;
};

// Anon client (used for validating user JWT tokens)
export const getSupabaseAnon = (): SupabaseClient => {
  if (!_anonClient) {
    _anonClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
  }
  return _anonClient;
};

