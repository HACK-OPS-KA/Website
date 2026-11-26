# HACK//OPS Website: complete instructions

Everything needed to run, edit, deploy and administer **hackops.tech**.

This repo is the canonical source. What lands on `main` is live about a minute later.

For non-technical content edits there is a shorter German guide: [EDITING.md](EDITING.md).

---

## 1. What this is

A static site. No build step, no framework, no server. Plain HTML, CSS and vanilla
JavaScript served directly by GitHub Pages.

The front page is one scrolling page: a hero with a live 3D pyramid over a sky
photo, the next operation in its own colours, two ways in (builders, companies),
every past operation as a tile in its own look, the community numbers, the
formats for companies, an FAQ and the footer. The same design runs on the ops
platform at https://ops.nedilko.tech/page, where it reads live numbers from the
event database; this repo holds a static copy of it, so numbers and ops here are
edited by hand.

The one dynamic part is the in-room vote system, which is backed by Firebase
because GitHub Pages cannot run server code or enforce timing. It ran for
slopathon and is kept, unmounted, for the next operation.

### Operation numbering

Slopathon is **op//001**. `firebase-init.js` still holds
`EVENT_ID = "op002-slopathon"`: it is a live Firestore path with the real results
under it and must not be renamed.

### File map

| File | Purpose |
|---|---|
| `index.html` | The whole front page. Each section starts with a `═══ 01 HERO ═══` style comment. |
| `home.css` | All styling for `index.html`, `photos.html` and `projects.html`. Colours are the variables in `.hp` at the top. |
| `home.js` | Front page behaviour: the 3D hero, slide-open rows, counting numbers, reel buttons. The page works without it. |
| `photos.html` | Photo and privacy notice for event photography. Keep the URL: event pages link to it. |
| `projects.html` | The slop museum, the op//001 archive (a snapshot of the SLOPATHON repo's projects.json). |
| `assets/home/` | Everything the new pages show: sky, 3D pyramid, partner logos, op key visuals, game covers. |
| `assets/vendor/three/` | three.js r169 (MIT), loaded through the import map in `index.html`. |
| `EVENT-BLURBS.md` | Paste-ready copy for lu.ma, socials and posters. Keep in sync with `photos.html`. |
| `vote.js` | Vote widget: countdown, modal, casting a vote. Not mounted between events. |
| `admin.html` | Vote administration: sign in, manage teams, set the voting window. |
| `site.css` | Styles of `admin.html` and the vote widget (the old front page's stylesheet). |
| `firebase-init.js` | Shared Firebase bootstrap and the `EVENT_ID` constant. |
| `firestore.rules` | Firestore security rules. The real enforcement layer. |
| `projects.json` | The op//001 project list, as generated in the SLOPATHON repo. |
| `CNAME` | Holds `hackops.tech`. This is what claims the custom domain. Do not delete. |
| `.nojekyll` | Stops GitHub from running Jekyll over the files. |
| `serve.ps1` | Local dev server, serves the folder it sits in. |

---

## 2. Run it locally

```bash
git clone https://github.com/HACK-OPS-KA/Website.git
```

Then from the repo folder:

```bash
pwsh serve.ps1
```

Open http://localhost:8322

You need a local server rather than opening `index.html` directly, because the
site uses JavaScript modules and `fetch`, which browsers block on `file://` URLs.

`serve.ps1` serves whatever folder it sits in, so it works from any clone.

---

## 3. Editing content

All front page content is in `index.html`. Each section starts with a comment:

| Section | Search for | What it controls |
|---|---|---|
| Hero | `01 HERO` | The title, the "Next event" button (link to the next op on lu.ma), the partner logos |
| Next op | `02 NEXT OP` | The upcoming operation: name, dates, place, key visual, its colours (`--op-*` in the `style` attribute), the steps |
| Two ways in | `03 TWO WAYS IN` | What builders get, the three formats for companies |
| Ops so far | `04 OPS SO FAR` | One tile per past operation, and the game jam band with its winners |
| Numbers | `05 THE COMMUNITY` | The numbers; `data-count` is what the counter runs to, the text is what it ends on |
| Companies | `06 FOR COMPANIES` | Formats, the package table, the fair play note |
| FAQ | `08 FAQ` | Questions and answers |
| Footer | `09 FOOTER` | Links, contact address, credits for the sky photo and reflections |

Typical changes:

- **A new op is announced:** in `02 NEXT OP` change name, dates, place and the
  lu.ma link (also the "Next event" button in `01 HERO`, the "Sign up" buttons and
  the FAQ button: search for the old lu.ma link). Put its square key visual in
  `assets/home/looks/` and point the `<img>` at it.
- **An op is over:** copy a tile in `04 OPS SO FAR`, set its colours
  (`--op-base`, `--op-ink`, `--op-accent`, `--op-on-accent`), number, name, date,
  participants and link, and update the numbers in `05`.
- **A new partner:** add a white logo (SVG, or PNG with transparency) to
  `assets/home/partners/` and copy a `hp-logo-slot` in **both** copies of the
  logo set in `01 HERO` (the strip loops by sliding one copy after the other).

### Style rules

- No em dashes, no emojis.
- Only name sponsors once the deal is signed.
- Colours only through the variables at the top of `home.css` (`--hp-blue`,
  `--hp-paper`, `--hp-ink`, ...) and the per-op `--op-*` variables. Text on a
  coloured tile uses `--op-ink`; buttons use `--op-accent` with `--op-on-accent`.
- The pixel face is Press Start 2P (the Slopathon title face); every glyph is as
  wide as it is tall, so long words need a smaller size.
- Check every change at desktop width and at 375 px.

---

## 3a. Motion, keyboard and contrast

**Motion.** The 3D hero, the sliding rows and the counting numbers all check
`prefers-reduced-motion`; with it on, the page shows the still pyramid
(`assets/home/3d/pyramid-*.webp`) and plain rows. The 3D scene pauses when the
hero is off screen or the tab is hidden.

**Without JavaScript** everything still reads: the rows are plain `<details>`,
the numbers are already in the markup, the pyramid is the still image.

**Contrast.** White text over the sky photo sits on a cobalt wash
(`.hp-hero-3d::after`); keep it if you change the photo.

---

## 4. Deployment

GitHub Pages serves `main` from the repository root. There is no CI and no build.

1. Commit to `main`.
2. Wait about one minute.
3. It is live on https://hackops.tech

Check the build status:

```bash
gh api repos/HACK-OPS-KA/Website/pages/builds/latest --jq '{status,commit}'
```

`status` goes `building` then `built`. Confirm the `commit` matches what you pushed.

### Your change is not showing

Almost always browser cache, not a failed deploy. Verify the deployed commit with
the command above first. If it matches, hard reload with `Ctrl+Shift+R`, or append
a query string such as `https://hackops.tech/?v=2`.

CSS and JS are linked with a version query (for example `home.css?v=1`).
Bump that number when you change those files and need visitors to pick it up
immediately rather than whenever their cache expires.

---

## 5. Domain

`hackops.tech` is registered at **get.tech**. DNS is managed there.

Required records:

| Type | Name | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `hack-ops-ka.github.io` |

The four A records are GitHub's shared Pages addresses and are the same for every
GitHub Pages site. GitHub decides which repo answers by reading the `CNAME` file
in the repo, which is why that file must stay in place.

The `www` CNAME currently still points at `hackops-ka.github.io`, the organisation
the site used to live in. This works today, because GitHub routes Pages requests by
the `Host` header rather than by which `github.io` name the CNAME resolves to, and
`www.hackops.tech` redirects to the apex correctly.

It is still worth updating to `hack-ops-ka.github.io` as hygiene, so the record
matches reality and nothing depends on the old organisation continuing to exist.
This is not urgent and nothing is broken until then.

HTTPS is enforced. The certificate is issued and renewed by GitHub automatically
and covers both the apex and `www`.

### Only one repo may claim the domain

If a second repository also has a `CNAME` file containing `hackops.tech` and has
Pages enabled, the two will fight over the domain and one will break. The old
`hackops-ka/hackops-site` repo still contains a `CNAME` file, but its Pages site
has been deleted, so it is inert. Do not re-enable Pages there.

---

## 6. Firebase and the vote system

### Why it exists

GitHub Pages is static, so it cannot keep a vote tally or stop people voting
before the window opens. Firebase provides both.

Critically, the timing is enforced **server side** in the Firestore rules using
`request.time`, which is Firestore's own clock. A visitor cannot open the vote
early by changing their device clock. The countdown in the browser is cosmetic.

### Project

- Firebase project: **hackops-vote**
- Plan: Spark (free)
- Region: eur3
- Client config lives in `firebase-init.js`. These values are public identifiers,
  not secrets. Security comes from the rules, not from hiding them.

### Data model

Everything is namespaced under an event ID (`op002-slopathon`, the slopathon
despite its name, see the numbering note in section 1; set in
`firebase-init.js`) so future operations reuse the schema without collisions and
without deleting past results.

```
events/{eventId}/config/vote    { unlockAt: Timestamp, expiresAt: Timestamp }
events/{eventId}/teams/{id}     { name: string, createdAt: Timestamp }
events/{eventId}/tallies/{id}   { count: number }
```

`tallies` documents share their ID with the matching `teams` document. They are a
separate collection on purpose: team names stay publicly readable, while vote
counts stay hidden until voting closes.

### How the rules protect it

Read `firestore.rules` for the authoritative version. The important parts:

- Voting needs no login, which keeps it frictionless for attendees.
- `allow get` on a tally is always permitted, because the vote transaction has to
  read the current count before incrementing it. This exposes one document, not
  the standings.
- `allow list` on tallies is blocked for the public until `request.time` passes
  `expiresAt`. This is what stops people watching the leaderboard mid vote.
  Admins can always list, to monitor turnout.
- The only public write allowed is an update that changes nothing except `count`,
  and only to exactly `count + 1`, and only strictly inside the voting window.

A consequence worth knowing: because an update must be exactly `count + 1`, a
tally cannot be decremented. Removing a bad vote means an admin deletes and
recreates the tally document.

### Deploying rule changes

Rules are edited in the Firebase Console under Firestore Database, Rules, then
Publish. The copy in this repo is the source of truth. Keep them in sync.

If you edit rules through browser automation rather than by hand, verify the full
text before publishing. The console's editor has dropped closing braces silently
in the past.

---

## 7. Running a vote

> **Note (new front page, 2026-11):** the redesigned `index.html` has no slot for
> the vote widget yet. Before the next in-room vote, add a container for `vote.js`
> to the page and load the `.vote-*` styles from `site.css` (or move them into
> `home.css`). `admin.html` works as before.

1. Go to https://hackops.tech/admin.html and sign in.
2. Add each team by name. This creates the team and its zero tally together.
3. Set the opening and closing times. These are entered as Berlin wall clock time
   regardless of your own timezone, and converted correctly across DST.
4. Save. The button reports success or the exact error underneath itself.

What attendees see on the front page:

- Before the window: a locked card counting down to the opening time.
- During: a single "vote now" button. Tapping it opens a confirmation dialog where
  they pick a team and then confirm as a separate action. The two step flow and a
  250ms minimum between steps exist to prevent misclicks casting a vote.
- After: results.

A device that has voted is remembered in `localStorage`. This is a convenience
guard, not real enforcement, since clearing site data resets it. The genuine
protection is the timing window in the rules.

### Before a live event

Test with throwaway team names and delete them afterwards. Real tallies cannot be
decremented, so a stray test vote on a real team has to be fixed by deleting and
recreating that team's tally document.

---

## 8. Access and permissions handover

Below is every system the site depends on and how to give someone full control.
**No passwords are stored in this repository and none should ever be committed
here.** It is public, so anything committed is permanently public even if deleted
later. Share credentials through a password manager instead.

| System | What it controls | How to grant full access |
|---|---|---|
| GitHub org `HACK-OPS-KA` | This repo, deployment, the SLOPATHON repo | Org Settings, People, Invite member, role **Owner** |
| GitHub Pages | Hosting and the custom domain | Comes with repo Admin permission |
| Firebase project `hackops-vote` | Vote data, rules, admin accounts | Firebase Console, Project settings, Users and permissions, Add member, role **Owner** |
| Firestore | The vote data itself | Covered by the Firebase role above |
| Firebase Authentication | The admin sign in account | Console, Authentication, Users. Add or reset accounts here. |
| get.tech account | The `hackops.tech` domain and all DNS | Registrar account access. Transfer or share credentials directly. |

### Things that are easy to miss

- **Authorized domains.** Firebase Authentication only accepts sign in from domains
  on its allow list. `hackops.tech` had to be added manually under Authentication,
  Settings, Authorized domains. `localhost` is allowed by default, which is why
  admin sign in can work locally and fail in production. If admin login breaks
  after a domain change, check this first.
- **Admin account.** Sign in is a single shared email and password account in
  Firebase Authentication. To rotate it, change the password in the Firebase
  Console and redistribute it through your password manager. To give someone their
  own login instead, add another user in Authentication. The rules treat any
  authenticated user as an admin, so only create accounts for people who should
  have full control.
- **Billing.** The project is on the free Spark plan. Nothing will be charged, but
  it also means quotas are capped. Watch usage if a vote gets unexpectedly large.

---

## 9. Troubleshooting

**A content change is not visible.** Check the deployed commit matches your push,
then hard reload. See section 4.

**Admin "save schedule" appears to do nothing.** You are almost certainly on a
cached copy of `admin.html`. Hard reload. The current version always prints either
a success line or the exact error under the button, so a completely silent button
means old code.

**Admin save fails with `permission-denied`.** You are not actually authenticated
against production. Check that `hackops.tech` is in the Firebase Authentication
authorized domains list, then sign out and back in.

**`www.hackops.tech` does not load but `hackops.tech` does.** Check the `www` CNAME
at get.tech. It should point at `hack-ops-ka.github.io`. See section 5.

**The vote widget shows the wrong state.** The countdown is cosmetic and follows
the visitor's clock, but the actual open and close is enforced by Firestore. If
they disagree, the Firestore config document is the truth. Re-save the schedule
from the admin panel.

**Layout broke on mobile after a CSS change.** Re-measure at 375x812. See the
positioning notes in section 3.
