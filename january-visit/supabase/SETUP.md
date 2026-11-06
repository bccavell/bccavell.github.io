# Turning on shared mode (Supabase setup)

About 30–45 minutes, once. Until you finish, the app keeps working in
**local mode** (everything saved on each phone), so nothing breaks halfway.

> 🔑 **Two keys, two very different jobs**
> - **anon / publishable key**: safe to put in `config.js`. It's public by design.
> - **service_role / secret key**: the master key. **Never** paste it
>   anywhere outside the Supabase dashboard, including chats.

---

## 1. Create the project (5 min) · LOR-32

1. Go to **supabase.com** → sign up (signing in with GitHub is easiest) → **New project**.
2. Name: `january-visit`. Database password: click **Generate** and save it
   in your password manager (you won't need it day-to-day).
3. Region: **West EU (London)** (`eu-west-2`), which is closest to you, so it's fastest.
4. Plan: **Free**. Wait about 2 minutes while it sets up.

## 2. Build the database (5 min) · LOR-33, LOR-34, LOR-38

1. Open `january-visit/supabase/schema.sql` in the repo.
2. Scroll to **PART 5** at the bottom and add your friends' emails to the guest
   list, **in lowercase**, exactly as they'll type them:
   ```sql
   insert into public.members (email, display_name) values
     ('billyccavell@gmail.com', 'Billy')
     , ('their.email@gmail.com', 'Their Name')
     , ('other.friend@icloud.com', 'Other Friend')
   on conflict (email) do nothing;
   ```
3. Supabase → **SQL Editor** → **New query** → paste the **whole file** → **Run**.
   You should see "Success. No rows returned".
4. Check: **Table Editor** should list `members`, `ideas` (5 starter ideas),
   `idea_hearts` and `posts`. **Storage** should show a `media` bucket marked
   *Private*.

> Forgot someone? Table Editor → `members` → **Insert row**, or re-run just the
> `insert into public.members` lines. Re-running the whole file is safe too.

## 3. Let it send emails to your friends (10 min) ⚠️ important

Supabase's built-in email **only sends to people on your Supabase team, and
only about 2 emails an hour**. Your friends' codes would never arrive. So
we plug in your own Gmail to send them.

**a) Make a Gmail "app password"** (a separate password just for this, which
you can cancel any time):
1. Your Google Account needs **2-Step Verification** turned on
   (myaccount.google.com → Security).
2. Go to **myaccount.google.com/apppasswords** → name it `Supabase` →
   **Create** → copy the 16-letter password.

**b) Give it to Supabase:** **Authentication → Emails → SMTP Settings**
(sometimes under Project Settings → Authentication) → turn on **Custom SMTP**:

| Field | Value |
|---|---|
| Sender email | `billyccavell@gmail.com` |
| Sender name | `Our January 💛` |
| Host | `smtp.gmail.com` |
| Port | `587` |
| Username | `billyccavell@gmail.com` |
| Password | the 16-letter app password |

Save. Then **Authentication → Rate Limits** → set "emails per hour" to about
**30** (plenty for a handful of friends).

> Prefer not to use your Gmail? **Brevo** (free, 300 emails/day) works the same
> way with its SMTP details. Don't use Resend's free plan without your own
> domain: it only sends to yourself.

## 4. Put the code in the email (3 min)

The app signs people in with a **6-digit code** they type in. That works
inside the installed home-screen app, whereas a magic link always opens
Safari instead. Supabase's default email only has the link, so:

**Authentication → Emails → Templates → Magic Link** → replace the body with:

```html
<h2>Your Our January code 💛</h2>
<p>Type this code into the app:</p>
<p style="font-size:28px;font-weight:bold;letter-spacing:4px">{{ .Token }}</p>
<p>Or tap here to sign in: <a href="{{ .ConfirmationURL }}">Sign in</a></p>
<p>If you didn't ask for this, you can ignore it.</p>
```

Subject: `Your Our January code`. Save.

## 5. Tell Supabase where the app lives (2 min)

**Authentication → URL Configuration**:
- **Site URL:** `https://bccavell.github.io/january-visit/`
- **Redirect URLs** → add `https://bccavell.github.io/january-visit/`
  (and `http://localhost:8765/january-visit/` if you test on your laptop)

## 6. Connect the app (2 min) · LOR-32

1. **Project Settings → API** (or "Data API" / "API Keys"): copy the
   **Project URL** and the **anon / public** (or **publishable**) key.
2. Paste them into `january-visit/config.js`:
   ```js
   const SUPABASE_CONFIG = {
     url: "https://abcdefghijkl.supabase.co",
     anonKey: "eyJhbGciOi...",
   };
   ```
3. Commit and push (or tell Claude to: pasting the **anon** key in chat is fine).

## 7. Test it (10 min) · LOR-45

On your phone, open the app → **Ideas** → *Join the trip* → your email → type
the code. Then:

- [ ] Heart an idea, add one, delete it
- [ ] Post text, a photo, and a short video on the Love tab
- [ ] Sign in on a **second** phone (or a private browser tab) as a friend:
      your post should appear on it **without refreshing**
- [ ] Try an email that's **not** on the guest list: you should see 🔒
- [ ] Airplane mode: the app still opens and shows the last feed

## If something goes wrong

| Symptom | Likely fix |
|---|---|
| No email arrives | Step 3 (custom SMTP). Check spam. Look in **Authentication → Logs**. |
| "Too many tries" | Rate limit. Wait a few minutes, or raise it (step 3). |
| 🔒 "not on the guest list" | The email in `members` must match exactly, in lowercase. |
| Code says expired | Codes last about an hour. Request a new one. |
| Tapping the link opens Safari, not the app | Expected on iPhone. Type the code instead. |
| App still looks like local mode | `config.js` is still blank, or the old version is cached. Close and reopen the app. |

## Free plan limits to keep an eye on (LOR-46)

About 1 GB of file storage, 50 MB per file, and 5 GB of downloads a month.
**Free projects pause after about a week with no activity**, so open the app
around 1 January to wake it up before everyone arrives. Check
**Settings → Usage** mid-trip.
