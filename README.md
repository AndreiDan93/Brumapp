# Brum Password Reset Web Page

This folder contains a standalone password reset page for Supabase Auth.
It is independent of the mobile app build.

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

If you use another path, add that exact URL.

## 4. Mobile app change needed

In `mobile/context/AuthContext.tsx`, change password reset redirect from deep link to web URL:

```ts
const WEB_RESET_URL = "https://andreidan93.github.io/Brumapp/";

const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: WEB_RESET_URL,
});
```

## 5. Security notes

- Do not use service role keys in this page.
- HTTPS is required (GitHub Pages provides it).
- Reset links are short-lived and one-time use.
- This page validates password strength before submit.

## 6. Test flow

1. Request password reset from mobile app.
2. Open email link.
3. It should open the web page and allow setting a new password.
4. After success, open app and sign in with new password.
