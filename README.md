# Brum Web Pages

This folder contains standalone web pages for:
- Home page (`/`)
- Email confirmation page (`/confirm/`)
- Password reset page (`/reset/`)

Everything is independent of the mobile build.

## 1. Configure Supabase values

Edit `Web/config.js`:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` (anon key only)

## 2. Publish this folder on GitHub Pages

Recommended for this repo:
- Create branch `gh-pages`.
- Put the contents of `Web/` at the root of `gh-pages`.
- Enable Pages from branch `gh-pages` in repository settings.

Your page URL will usually be:
- `https://andreidan93.github.io/Brumapp/`

If your structure is different, use your exact URL.

## 3. Supabase redirect configuration

In Supabase Dashboard -> Authentication -> URL Configuration -> Redirect URLs, add:
- `https://andreidan93.github.io/Brumapp/`
- `https://andreidan93.github.io/Brumapp/confirm/`
- `https://andreidan93.github.io/Brumapp/reset/`

If you use another path, add that exact URL.

## 4. Mobile app redirects

In `mobile/context/AuthContext.tsx`, use:

```ts
const PASSWORD_RESET_WEB_URL = "https://andreidan93.github.io/Brumapp/reset/";
const SIGNUP_CONFIRM_WEB_URL = "https://andreidan93.github.io/Brumapp/confirm/";

const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: PASSWORD_RESET_WEB_URL,
});

const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: SIGNUP_CONFIRM_WEB_URL,
  },
});
```

## 5. Security notes

- Do not use service role keys in this page.
- HTTPS is required (GitHub Pages provides it).
- Reset links are short-lived and one-time use.
- This page validates password strength before submit.

## 6. Test flows

1. Signup flow:
- Register in app.
- Open confirmation email.
- It should open `/confirm/` and show activation success.

2. Reset flow:
- Request reset from app.
- Open reset email.
- It should open `/reset/` and allow changing password.
- After success, open app and log in.
