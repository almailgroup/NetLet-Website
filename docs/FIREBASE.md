# Firebase Authentication for NetLet

Registered accounts live in Firebase. This is what to click, in order, and what
each value is for.

Time: about fifteen minutes. Cost: nothing — Firebase Authentication's free tier
covers email/password sign-in with no card on file.

---

## What this actually changes

Firebase holds the password. NetLet's Postgres keeps one row per shopper —
their id, email, name, and the Firebase uid that links the two — because saved
products, delivery area, notification preferences and order tracking are all
foreign keys to that row. Moving the *credential* to Firebase does not mean
moving the *shopper's data* out of the database.

The password is checked on the server, not in the browser. No Firebase SDK is
shipped to the client, no Firebase token is ever held in JavaScript, and the
session stays the same httpOnly cookie it was before. Nothing about how sign-in
feels changes.

If the four variables below are left empty, sign-in falls back to NetLet's own
scrypt password digest exactly as it works today. Nothing breaks while you set
this up.

---

## 1. Create the project

1. Go to <https://console.firebase.google.com> and sign in with the Google
   account that should own this.
2. **Create a project**. Name it `netlet` (or anything — the name is only a
   label; the *project ID* underneath it is what matters).
3. Google Analytics: **off** is fine. It is unrelated to accounts and can be
   turned on later.
4. Wait for provisioning, then **Continue**.

## 2. Turn on email/password sign-in

1. Left sidebar → **Build** → **Authentication** → **Get started**.
2. **Sign-in method** tab → **Email/Password** → **Enable** the first toggle.
   Leave "Email link (passwordless sign-in)" off.
3. **Save**.

At this point the **Users** tab is where every shopper who registers on NetLet
will appear.

## 3. Get the four values

### `FIREBASE_PROJECT_ID` and `FIREBASE_API_KEY`

1. Gear icon (top left, beside "Project Overview") → **Project settings**.
2. **General** tab. **Project ID** is there — copy it.
3. Scroll to **Your apps**. If there is no web app yet, click the **`</>`**
   (Web) icon, give it a nickname (`netlet-web`), **do not** tick Firebase
   Hosting, and **Register app**.
4. Firebase shows a `firebaseConfig` block. Copy the `apiKey` value.

The API key is a public identifier, not a secret — it appears in the page source
of every Firebase web app in the world. It lives in NetLet's server environment
only because the password check runs server-side.

### `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY`

These two **are** secret.

1. Still in **Project settings** → **Service accounts** tab.
2. **Generate new private key** → **Generate key**. A `.json` file downloads.
3. Open it. You need two fields:
   - `client_email` — looks like
     `firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com`
   - `private_key` — a long block starting `-----BEGIN PRIVATE KEY-----`

**Do not commit that JSON file, and do not put it anywhere under `client/`.**
Anyone holding it can read and modify every account in the project. Delete the
download once the values are in your `.env`.

## 4. Put them in `.env`

```sh
FIREBASE_PROJECT_ID=netlet-a1b2c
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@netlet-a1b2c.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADAN...\n-----END PRIVATE KEY-----\n"
FIREBASE_API_KEY=AIzaSy...
```

Three details that will otherwise cost you an afternoon:

- **`FIREBASE_PRIVATE_KEY` must be in double quotes**, on one line, with its
  newlines left as the two characters `\n`. That is exactly how the JSON file
  writes it, so copy the value from the JSON verbatim — including the trailing
  `\n` before the closing quote. The server converts them back to real newlines.
- **All four or none.** With any one missing, NetLet uses the local password
  path instead. That is deliberate, not a bug — but it means a typo in one
  variable looks like "Firebase isn't working" rather than an error.
- `DATABASE_URL` and `JWT_SECRET` are still required. Firebase replaces the
  password store, not the database or the session cookie.

## 5. Apply the database migration

The `users` table gained a `firebase_uid` column and `password_hash` became
optional:

```sh
pnpm db:push
```

Existing accounts keep working: they still have their scrypt digest, and the
first time one of them signs in after you have also created them in Firebase,
their row is adopted rather than duplicated — same id, same saved products.

## 6. Check it

```sh
pnpm dev
```

Open the storefront, register a new account, then look at
**Firebase console → Authentication → Users**. The address should be listed,
with a creation timestamp. That is the whole test: if it is there, accounts are
being stored in Firebase.

Sign out and back in to confirm the password check works.

---

## Migrating the accounts you already have

If people have already registered against the current scrypt table, their
passwords **cannot** be moved into Firebase — a scrypt digest is one-way, which
is the point of it. Two honest options:

- **Leave them.** An account with a local digest and no Firebase uid keeps
  signing in through the fallback path. New registrations go to Firebase. The
  two coexist indefinitely.
- **Import them.** Firebase's CLI can take scrypt hashes
  (`firebase auth:import --hash-algo=SCRYPT …`), but it wants Firebase's own
  scrypt parameters, which are not the ones `server/_core/password.ts` uses.
  In practice this means asking those shoppers to reset their password.

Given how few accounts exist today, leaving them is the right answer.

---

## What you get next, for free

Now that Firebase owns identity, these are configuration rather than
development:

- **Password reset by email** — Authentication → Templates. Firebase sends the
  message and hosts the reset page.
- **Email verification** before an account can order.
- **Google / Apple sign-in** — one more provider toggled on in the same
  Sign-in method tab.
- **Blocking abuse** — Authentication → Settings has rate limits and a domain
  allowlist.

None of these are wired into the storefront yet. They are listed so you know
what the switch bought.

---

## Troubleshooting

**"Email or password is incorrect" for a password you know is right.**
The account is in the local table, not Firebase, and Firebase is now configured
— so sign-in is asking Firebase about an address it has never heard of. Either
register the address in Firebase console → Authentication → **Add user**, or
clear the Firebase variables to go back to the local path.

**Registration fails with an opaque error and the server log mentions a
`DECODER routines::unsupported` or an invalid PEM.**
`FIREBASE_PRIVATE_KEY` lost its newlines. It must be the quoted single-line form
with literal `\n`, as in step 4.

**Everything still uses the old password table.**
One of the four variables is empty or misspelled. The server checks all four
together before it uses Firebase at all. Restart after editing `.env` — the
values are read at boot.

**`Firebase sign-in failed with HTTP 403`.**
The Identity Toolkit API is not enabled for the project, which happens if the
project was created outside the Firebase console. Enable "Identity Toolkit API"
in the Google Cloud console for the same project.
