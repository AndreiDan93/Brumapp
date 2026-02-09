import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const formEl = document.getElementById("reset-form");
const submitEl = document.getElementById("submit");
const statusEl = document.getElementById("status");
const deepLinkEl = document.getElementById("deep-link");
const passwordEl = document.getElementById("password");
const confirmEl = document.getElementById("confirmPassword");
const helperEl = document.getElementById("reset-note");

function showStatus(type, message) {
  statusEl.className = `msg ${type}`;
  statusEl.textContent = message;
}

function clearStatus() {
  statusEl.className = "msg";
  statusEl.textContent = "";
}

function setFormVisible(visible) {
  formEl.style.display = visible ? "block" : "none";
  if (helperEl) {
    helperEl.style.display = visible ? "block" : "none";
  }
}

function setDeepLinkVisible(visible) {
  deepLinkEl.style.display = visible ? "block" : "none";
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

function isStrongPassword(password) {
  if (password.length < 8) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

function getConfig() {
  const cfg = window.BRUM_RESET_CONFIG;
  if (!cfg?.SUPABASE_URL || !cfg?.SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase config. Edit Web/config.js first.");
  }
  return cfg;
}

async function bootstrapRecoverySession(client, tokens) {
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

  if (tokenHash && type === "recovery") {
    const { error } = await client.auth.verifyOtp({
      type: "recovery",
      token_hash: tokenHash,
    });
    if (error) throw error;
    return;
  }

  throw new Error("Invalid or missing reset token.");
}

async function initialize() {
  setFormVisible(false);
  setDeepLinkVisible(false);
  submitEl.disabled = true;
  clearStatus();
  showStatus("ok", "Checking reset link...");

  let client;
  try {
    const cfg = getConfig();
    client = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const tokens = parseTokensFromUrl();
    await bootstrapRecoverySession(client, tokens);
    setFormVisible(true);
    submitEl.disabled = false;
    showStatus("ok", "Reset link is valid. You can set your new password.");
  } catch (error) {
    showStatus("error", "Reset link invalid or expired. Request a new reset email.");
    return;
  }

  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus();

    const password = passwordEl.value.trim();
    const confirm = confirmEl.value.trim();

    if (password !== confirm) {
      showStatus("error", "Passwords do not match.");
      return;
    }

    if (!isStrongPassword(password)) {
      showStatus(
        "error",
        "Password too weak. Use at least 8 chars with uppercase, lowercase and number."
      );
      return;
    }

    submitEl.disabled = true;
    submitEl.textContent = "Updating...";
    let updated = false;

    try {
      const { error } = await client.auth.updateUser({ password });
      if (error) throw error;
      updated = true;

      showStatus("ok", "Password updated successfully. Open Brum App and sign in.");
      setFormVisible(false);
      setDeepLinkVisible(true);
      formEl.reset();

      await client.auth.signOut();
    } catch (error) {
      showStatus("error", error?.message || "Failed to update password.");
    } finally {
      if (!updated) {
        submitEl.disabled = false;
        submitEl.textContent = "Update Password";
      }
    }
  });
}

initialize();
