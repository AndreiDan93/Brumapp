import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const statusEl = document.getElementById("status");

function showStatus(type, message) {
  statusEl.className = `msg ${type}`;
  statusEl.textContent = message;
}

function parseTokensFromUrl() {
  const url = new URL(window.location.href);
  const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
  const query = url.searchParams;

  return {
    code: query.get("code") || hash.get("code"),
    accessToken: hash.get("access_token") || query.get("access_token"),
    refreshToken: hash.get("refresh_token") || query.get("refresh_token"),
    tokenHash: hash.get("token_hash") || query.get("token_hash"),
    type: hash.get("type") || query.get("type"),
  };
}

function getConfig() {
  const cfg = window.BRUM_RESET_CONFIG;
  if (!cfg?.SUPABASE_URL || !cfg?.SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase config. Edit Web/config.js first.");
  }
  return cfg;
}

async function bootstrapVerificationSession(client, tokens) {
  const { code, accessToken, refreshToken, tokenHash, type } = tokens;

  if (code) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return;
  }

  if (accessToken && refreshToken) {
    const { error } = await client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw error;
    return;
  }

  if (tokenHash && type) {
    const { error } = await client.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (error) throw error;
    return;
  }

  throw new Error("Invalid or missing confirmation token.");
}

async function initialize() {
  try {
    const cfg = getConfig();
    const client = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const tokens = parseTokensFromUrl();
    await bootstrapVerificationSession(client, tokens);
    showStatus("ok", "Your email is confirmed. Your Brum account is now active.");
    await client.auth.signOut();
  } catch (error) {
    console.error("Account confirmation failed:", error);
    showStatus("error", "This confirmation link is invalid or expired. Request a new one.");
  }
}

initialize();
