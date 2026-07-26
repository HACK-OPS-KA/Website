# HACK//OPS Website: complete instructions

Everything needed to run, edit, deploy and administer **hackops.tech**.

This repo is the canonical source. What lands on `main` is live about a minute later.

For non-technical content edits there is a shorter German guide: [EDITING.md](EDITING.md).

---

## 1. What this is

A static site. No build step, no framework, no server. Plain HTML, CSS and vanilla
JavaScript served directly by GitHub Pages.

The front page is a "camera world": a fixed stage with a pastel grid where content
sits as absolutely positioned retro desktop windows in a large coordinate space.
The camera pans and zooms between stops instead of the page scrolling.

The one dynamic part is the op//002 vote system, which is backed by Firebase
because GitHub Pages cannot run server code or enforce timing.

### File map

| File | Purpose |
|---|---|
| `index.html` | The whole front page. All content lives here inside `<div id="world">`. |
| `site.css` | All styling. Design tokens (colors, fonts) are the variables at the top. |
| `engine.js` | Camera world engine: placement, camera stops, flight, ASCII pyramid. |
| `projects.html` / `.css` / `.js` / `.json` | Separate projects listing page. |
| `vote.js` | Front page vote widget: countdown, modal, casting a vote. |
| `admin.html` | Vote administration: sign in, manage teams, set the voting window. |
| `firebase-init.js` | Shared Firebase bootstrap and the `EVENT_ID` constant. |
| `firestore.rules` | Firestore security rules. The real enforcement layer. |
| `CNAME` | Holds `hackops.tech`. This is what claims the custom domain. Do not delete. |
| `.nojekyll` | Stops GitHub from running Jekyll over the files. |
| `serve.ps1` | Local dev server. |
| `assets/` | Images and the Good Times font used for the wordmark. |

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

Note: `EDITING.md` mentions port 8321. The correct port is **8322**, set in
`serve.ps1`.

---

## 3. Editing content

All page content is in `index.html` between `<div id="world">` and its closing tag.
Each block is marked with a comment heading:

| Section | Search for | What it controls |
|---|---|---|
| Home | `01 HOME` | Title, tagline, the "hack//ops runs ..." list |
| Easter egg | `02 MICROPRINT` | Hidden microprint, reachable by typing "slop" or clicking the pyramid 5 times |
| Manifesto | `03 MANIFESTO` | Self description and the four rules |
| Operations | `04 OPERATIONS` | The event windows |
| Crew | `05 CREW` | Names and roles |
| Decoration | `desktop decoration` | Fake windows and desktop icons |

### Style rules

- Everything lowercase. It is part of the design.
- No em dashes, no emojis.
- Only name sponsors once the deal is signed.
- Colors only through the variables: `var(--pink)`, `var(--purple)`, `var(--sky)`,
  `var(--silver)`, `var(--red)`, `var(--gold)`.

### How positioning works

This trips people up, so it is worth understanding.

- `data-x` / `data-y` set where an **element itself** sits in world space.
- `data-cx` / `data-cy` set only where the **camera** points for that stop. They do
  not move any element. This lets the camera centre on a cluster of cards without
  dragging the title block along with it.
- `data-vw` / `data-vh` define the world space rectangle a camera stop frames.
  Actual on screen scale is `min(innerWidth / vw, innerHeight / vh) * 0.85`, so
  whichever ratio is smaller decides the zoom. Increasing `vh` zooms out.
- Any of these with an `-m` suffix (`data-x-m`, `data-cy-m`, `data-vh-m`) overrides
  the base value on mobile, which is any viewport 640px wide or narrower.

Practical consequence: if you change a card's size in CSS, re-check the layout at
both 1280x800 and 375x812. Hand calculating heights from font sizes and padding
gets close but is usually off by 10 to 20 pixels. Measure in the browser with
`getBoundingClientRect()` and adjust.

Adding a new camera stop: give an element `data-stop`, `data-x`, `data-y`,
`data-vw` and `data-vh`. It gets a navigation chip automatically. Document order
is tour order.

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

CSS and JS are linked with a version query (for example `site.css?v=desktop-8`).
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

The `www` CNAME is different: it points at a specific organisation. Since the site
moved from the `hackops-ka` org to `HACK-OPS-KA`, this record has to be updated to
`hack-ops-ka.github.io`. Until it is, `www.hackops.tech` will not resolve to the
site while the apex `hackops.tech` works fine.

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

Everything is namespaced under an event ID (`op002-slopathon`, set in
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

**`www.hackops.tech` does not load but `hackops.tech` does.** The `www` CNAME still
points at the old organisation. Update it to `hack-ops-ka.github.io` at get.tech.
See section 5.

**The vote widget shows the wrong state.** The countdown is cosmetic and follows
the visitor's clock, but the actual open and close is enforced by Firestore. If
they disagree, the Firestore config document is the truth. Re-save the schedule
from the admin panel.

**Layout broke on mobile after a CSS change.** Re-measure at 375x812. See the
positioning notes in section 3.
