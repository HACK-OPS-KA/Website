# hack//ops website

static website source for the hack//ops builder community in karlsruhe. the site brings together events, community information, project pages, and a firebase-backed event voting interface.

## website and source

[hackops.tech](https://hackops.tech/) is served from this repository through github pages.
see [complete instructions](INSTRUCTIONS.md) for deployment and administration.

## quick start

from the repository root, start a local server with python 3:

```bash
python -m http.server 8000
```

open <http://localhost:8000>. use an http server because the site loads javascript modules and json data. there is no package installation or build step.

## project structure

| path | purpose |
| --- | --- |
| `index.html` | community landing page |
| `site.css` | styles and design variables |
| `engine.js` | camera navigation and interactions |
| `projects.html` / `projects.json` | project archive interface and data |
| `vote.js` / `admin.html` | event voting interface and administration |
| `firebase-init.js` / `firestore.rules` | firebase configuration and access rules |
| `assets/` | images and fonts |

## editing

read [the editing guide](EDITING.md) before changing content. preserve the lowercase visual style and verify layouts at desktop and mobile sizes. voting functionality depends on its firebase configuration and deployed rules.
