# Deploying your portfolio + admin to Vercel (feraswe.com)

Your site is now **data-driven**: the public pages look exactly the same, but all the
content (About, Skills, Projects, Certificates, Experience, Contact, etc.) is editable from a
secure **/admin** page — no code editing needed. Content and uploaded images are stored in
**Vercel Blob**. Your password is checked on the server, never in the browser code.

Follow these steps once. After that, you just open `feraswe.com/admin`, edit, and click
**Save & Publish**.

---

## What you'll set up

| Thing | Value |
|---|---|
| Host | Vercel (free Hobby plan) |
| Domain | feraswe.com |
| Login password | the one you chose (set as `ADMIN_PASSWORD`) |
| Storage | a Vercel Blob store (free) |

---

## Step 1 — Push the latest code to GitHub

From the `Portfolio` folder:

```bash
git add -A
git commit -m "Add admin CMS + serverless backend"
git push
```

(Your repo is already `github.com/FerasAlkhodari/Portfolio`.)

> `.env`, `.env.local`, and `node_modules` are git-ignored, so your password and secrets are
> **not** pushed. Good.

---

## Step 2 — Import the project into Vercel

1. Go to <https://vercel.com> and sign in with GitHub.
2. **Add New… → Project** → import **FerasAlkhodari/Portfolio**.
3. On the configure screen:
   - **Framework Preset:** select **Other** (there is a `vercel.json` that also forces this — but set it anyway to be safe).
   - **Build Command:** leave as the default / empty (the project needs no build).
   - **Output Directory:** leave default.
4. Don't deploy yet — first add the environment variables (next step). If you already clicked
   Deploy, that's fine; just add the variables and redeploy afterward.

---

## Step 3 — Add your environment variables

In Vercel: **Project → Settings → Environment Variables**. Add these two (Environment:
**Production, Preview, Development** — tick all):

| Name | Value |
|---|---|
| `ADMIN_PASSWORD` | the password you want to type on /admin |
| `SESSION_SECRET` | a long random string (see below) |

Generate a `SESSION_SECRET` by running this on your computer:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as the value.

---

## Step 4 — Create the Blob store (where content + images are saved)

1. In Vercel: **Project → Storage → Create Database → Blob**.
2. Name it anything (e.g. `portfolio-content`) and **Connect** it to this project.
3. Vercel automatically adds a `BLOB_READ_WRITE_TOKEN` environment variable for you — you don't
   touch it.

---

## Step 5 — Deploy / Redeploy

Go to **Deployments → ⋯ → Redeploy** (so the new env vars + Blob store take effect).
When it finishes you'll get a `*.vercel.app` URL. Open it — your site should look identical to
before.

---

## Step 6 — Connect feraswe.com

1. Vercel: **Project → Settings → Domains → Add** → type `feraswe.com` (and add `www.feraswe.com`
   too; Vercel will offer to redirect one to the other).
2. Vercel shows you the DNS records to set. Go to wherever you bought the domain (your registrar's
   DNS settings) and add them:
   - Usually an **A record** for `feraswe.com` → `76.76.21.21`, **or** follow whatever Vercel
     shows (it may give you a CNAME for `www`). Always use exactly what Vercel displays.
3. Wait for DNS to propagate (minutes to a couple of hours). Vercel will show "Valid
   Configuration" and issue an HTTPS certificate automatically.

---

## Step 7 — Use your admin page 🎉

Open **`https://feraswe.com/admin`** → enter your password → edit anything → **Save & Publish**.
Changes appear on the live site within ~10–30 seconds.

- **Add a project image / widget:** open the Projects panel → a project → use the **Upload**
  button (or paste an image URL). Widgets are small thumbnails that can link to a website or
  enlarge an image.
- **Add a certificate / experience / skill:** open that panel → **Add** → fill in the fields.
- **Backup** downloads a JSON copy of all your content. **Import** loads one back in.

---

## Local development (optional)

To run the whole thing (site + API) locally:

```bash
npm i -g vercel        # one time
vercel link            # link to your Vercel project (one time)
vercel env pull .env.local   # pulls your real env vars incl. the Blob token
vercel dev             # serves the site + /api on http://localhost:3000
```

A `.env.local` is already present for convenience (your password + a dev session secret).
Login works locally with it; **saving/uploads** also need a `BLOB_READ_WRITE_TOKEN` (pull it with
`vercel env pull`, or paste it into `.env.local`).

> Plain `npm start` (Vite) still works for previewing the **static** site, but the `/api`
> functions and the admin page only run under `vercel dev` or on Vercel.

---

## Security notes (please read)

- Your password lives **only** as the `ADMIN_PASSWORD` env var on the server. It is never in the
  website's code or sent to visitors.
- Login issues a signed, `HttpOnly`, `Secure`, `SameSite=Strict` cookie that expires after 12
  hours.
- To **change the password**, just edit `ADMIN_PASSWORD` in Vercel and redeploy.
- `/admin` is marked `noindex` so search engines won't list it, but anyone can still reach the
  URL — the password is what protects it. Pick a strong one.
- For an extra layer, you can later enable Vercel **Deployment Protection / Password Protection**
  on the project (Settings → Deployment Protection).

---

## How it works (quick map)

```
index.html ── js/content.js ──GET /api/content──> Vercel Blob (content.json)
                                   │
admin.html ── js/admin.js ──> /api/login (cookie)
                          └──> POST /api/content   (save, admin only)
                          └──> POST /api/upload    (image -> Blob, admin only)
```

If the backend is ever unreachable, `index.html` simply shows the built-in static content, so the
site never breaks.
