/* the slop museum — loads projects.json and paints the archive.
   remote-first (auto-updates as PRs merge), local copy as fallback. */
(function () {
  'use strict';

  var REMOTE = 'https://raw.githubusercontent.com/HACK-OPS-KA/SLOPATHON/main/projects.json';
  var LOCAL = 'projects.json';

  // final op//001 vote result, keyed by project slug. This lives here rather
  // than in projects.json because that file is generated in the SLOPATHON
  // repo and loaded remote-first, so any field added to it gets overwritten
  // on the next regeneration.
  var FINAL_VOTES = {
    'terminal-arcade': 5,
    'sloppy-keyboard': 3,
    'TokLock': 3,
    'calendar-council': 2,
    'cursed_minesweeper': 2,
    'gaslight-gatekeep-grandmaster': 2,
    'screamy-bird': 2,
    'slopario': 1,
    'chladni_clock': 0,
    'cursor-distorter': 0,
    'silence-enforcer': 0,
    'the-weight-bay': 0
  };

  // most votes first. Ties fall back to title so the order is stable, and
  // anything with no recorded result (a project added after the vote) sorts
  // to the end rather than silently landing among the winners.
  function byFinalPlace(a, b) {
    var va = FINAL_VOTES[a.slug];
    var vb = FINAL_VOTES[b.slug];
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    if (vb !== va) return vb - va;
    return String(a.title || a.slug).localeCompare(String(b.title || b.slug));
  }

  var grid = document.getElementById('grid');
  var countEl = document.getElementById('count');
  var filterEl = document.getElementById('filter');
  var modalBack = document.getElementById('modalBack');
  var mTitle = document.getElementById('mTitle');
  var mBody = document.getElementById('mBody');

  var ALL = [];

  // ---- theme toggle (shares localStorage key with the main desktop) ----
  document.getElementById('themeToggle').addEventListener('click', function () {
    var dark = document.documentElement.classList.toggle('dark');
    try { localStorage.setItem('hackops-theme', dark ? 'dark' : 'light'); } catch (e) {}
  });

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function load() {
    fetchJson(REMOTE)
      .catch(function () { return fetchJson(LOCAL); })
      .then(function (data) {
        ALL = ((data && data.projects) || []).slice().sort(byFinalPlace);
        render(ALL);
        countEl.innerHTML = '<b>' + ALL.length + '</b> exhibit' + (ALL.length === 1 ? '' : 's');
      })
      .catch(function () {
        grid.innerHTML = '<p class="empty">could not load the archive. try again in a moment.</p>';
      });
  }

  function fetchJson(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    });
  }

  function render(list) {
    if (!list.length) { grid.innerHTML = '<p class="empty">nothing matches.</p>'; return; }
    grid.innerHTML = '';
    list.forEach(function (p, i) {
      var card = document.createElement('article');
      card.className = 'card';
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', 'open ' + (p.title || p.slug));

      var shot = p.thumbnail
        ? '<div class="shot"><img loading="lazy" src="' + esc(p.thumbnail) + '" alt="' + esc(p.title) + ' screenshot" onerror="this.parentNode.innerHTML=&quot;<div class=\\&quot;noshot\\&quot;>no screenshot<br>// damage report pending</div>&quot;"></div>'
        : '<div class="shot"><div class="noshot">no screenshot<br>// damage report pending</div></div>';

      var team = (p.team || []).slice(0, 4).map(function (t) {
        return '<span class="chip">' + esc(t) + '</span>';
      }).join('');

      var cursed = p.cursed
        ? '<p class="cursed"><span class="lbl">why it shouldn’t exist —</span> ' + esc(p.cursed) + '</p>'
        : '';

      card.innerHTML =
        '<div class="tbar"><span class="t">projects/' + esc(p.slug) + '</span><span class="b">□</span></div>' +
        shot +
        '<div class="body">' +
          '<h3>' + esc(p.title || p.slug) + '</h3>' +
          (p.tagline ? '<p class="desc">' + esc(p.tagline) + '</p>' : '') +
          cursed +
          (team ? '<div class="team">' + team + '</div>' : '') +
        '</div>';

      card.addEventListener('click', function () { openModal(p); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(p); }
      });
      grid.appendChild(card);
    });
  }

  function openModal(p) {
    mTitle.textContent = 'projects/' + p.slug;
    var team = (p.team || []).length
      ? '<p class="kv">team</p><p class="sub" style="margin-bottom:14px">' + (p.team || []).map(esc).join(' · ') + '</p>'
      : '';
    var cursed = p.cursed
      ? '<p class="kv">why it shouldn’t exist</p><p class="cursed-line">' + esc(p.cursed) + '</p>'
      : '';
    var shots = (p.screenshots || []).slice(0, 6);
    var gallery = shots.length
      ? '<p class="kv">exhibits</p><div class="gallery">' + shots.map(function (s) {
          return '<a href="' + esc(s) + '" target="_blank" rel="noopener"><img loading="lazy" src="' + esc(s) + '" alt="screenshot" onerror="this.closest(&quot;a&quot;).style.display=&quot;none&quot;"></a>';
        }).join('') + '</div>'
      : '';

    mBody.innerHTML =
      '<h2>' + esc(p.title || p.slug) + '</h2>' +
      (p.tagline ? '<p class="sub">' + esc(p.tagline) + '</p>' : '') +
      team +
      cursed +
      gallery +
      '<div class="actions">' +
        '<a class="btn" href="' + esc(p.github) + '" target="_blank" rel="noopener">view on github ↗</a>' +
        (p.readme_url ? '<a class="btn ghost" href="' + esc(p.readme_url) + '" target="_blank" rel="noopener">read the readme</a>' : '') +
      '</div>';

    modalBack.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalBack.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.getElementById('mClose').addEventListener('click', closeModal);
  modalBack.addEventListener('click', function (e) { if (e.target === modalBack) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  // ---- filter ----
  filterEl.addEventListener('input', function () {
    var q = filterEl.value.trim().toLowerCase();
    if (!q) { render(ALL); return; }
    render(ALL.filter(function (p) {
      var hay = [p.title, p.slug, p.tagline, p.cursed, (p.team || []).join(' ')].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    }));
  });

  load();
})();
