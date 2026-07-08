// -----------------------------------------------------------------------------
// NATDRIP pulse bar · v2 · universal drop-in
//
// Renders a proper live status bar with:
//   [◉ NATDRIP · flowing warm .............. 3 claimed in the last hour  claim →]
// Reads worker /status every 30s, heat-maps the level, heartbeats on activity.
// Never exposes raw pool/distributed amounts to the visible UI.
//
// Config via window.NATDRIP_PULSE (optional):
//   { statusUrl, pollMs, ctaHref, ctaLabel, hidePhases }
// -----------------------------------------------------------------------------
(function () {
  'use strict';
  if (window.__NATDRIP_PULSE__) return;
  window.__NATDRIP_PULSE__ = true;

  const cfg = Object.assign({
    statusUrl:  'https://natdrip.unatom.workers.dev/status',
    pollMs:     30000,
    ctaHref:    '/',
    ctaLabel:   'claim →',
    hidePhases: ['pre'],
  }, window.NATDRIP_PULSE || {});

  const LEVELS = [
    { min: 0.75, level: 'flowing full', color: '#5dd0e3' },
    { min: 0.50, level: 'flowing warm', color: '#7dcf5b' },
    { min: 0.25, level: 'warming up',   color: '#f7c948' },
    { min: 0.10, level: 'getting hot',  color: '#f0962d' },
    { min: 0.00, level: 'running dry',  color: '#f17d8e' },
  ];

  const bucketForPct = (pct) => LEVELS.find(b => pct >= b.min) || LEVELS[LEVELS.length - 1];
  const bucketByLabel = (label) => LEVELS.find(b => b.level === label);

  // ---------- DOM ----------
  const bar = document.createElement('div');
  bar.className = 'natdrip-bar ndp-hidden';
  bar.setAttribute('role', 'status');
  bar.setAttribute('aria-label', 'NATDRIP pool status — tap to claim');
  bar.setAttribute('tabindex', '0');
  bar.innerHTML = `
    <span class="ndp-dot" aria-hidden="true"></span>
    <span class="ndp-brand">NATDRIP</span>
    <span class="ndp-sep">·</span>
    <span class="ndp-status">connecting</span>
    <span class="ndp-activity"></span>
    <a class="ndp-cta" href="${cfg.ctaHref}" onclick="event.stopPropagation()">${cfg.ctaLabel}</a>
  `;

  function attach() {
    if (!document.body) { requestAnimationFrame(attach); return; }
    document.body.prepend(bar);
    // Push page content down so nothing sits under the bar
    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    const barHeight = isMobile ? 28 : 34;
    document.documentElement.style.setProperty('scroll-padding-top', barHeight + 'px');
    document.body.style.paddingTop = ((parseFloat(getComputedStyle(document.body).paddingTop) || 0) + barHeight) + 'px';
    // Clicking anywhere on the bar (except the CTA link itself) goes to claim
    bar.addEventListener('click', (e) => {
      if (e.target.closest('.ndp-cta')) return;
      window.location.href = cfg.ctaHref;
    });
    poll();
    setInterval(poll, cfg.pollMs);
  }

  // ---------- state + poll ----------
  let lastDistributed = null;

  async function poll() {
    try {
      const res = await fetch(cfg.statusUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      render(data);
    } catch (err) {
      // On failure, keep last shown state; don't hide the bar
    }
  }

  function render(data) {
    if (data.phase && cfg.hidePhases.includes(data.phase)) {
      bar.classList.add('ndp-hidden');
      return;
    }

    let pctRemaining;
    if (typeof data.percentRemaining === 'number') {
      pctRemaining = Math.max(0, Math.min(1, data.percentRemaining));
    } else if (data.pool && data.distributed != null) {
      pctRemaining = Math.max(0, Math.min(1, 1 - (data.distributed / data.pool)));
    } else {
      pctRemaining = 1;
    }

    const bucket = (data.level && bucketByLabel(data.level)) || bucketForPct(pctRemaining);
    bar.style.setProperty('--ndp-color', bucket.color);
    bar.style.setProperty('--ndp-fill',  (pctRemaining * 100).toFixed(1) + '%');
    bar.classList.remove('ndp-hidden');
    bar.classList.toggle('ndp-dry', bucket.level === 'running dry');

    bar.querySelector('.ndp-status').textContent = bucket.level;

    const recent = typeof data.recentClaims === 'number' ? data.recentClaims : null;
    const act = bar.querySelector('.ndp-activity');
    if (recent === null) {
      act.textContent = '';
    } else if (recent === 0) {
      act.textContent = 'quiet · you could be next';
    } else if (recent === 1) {
      act.textContent = '1 claimed in the last hour';
    } else {
      act.textContent = `${recent} claimed in the last hour`;
    }

    // Heartbeat flash when new claims come in
    if (typeof data.distributed === 'number') {
      if (lastDistributed != null && data.distributed > lastDistributed) {
        bar.classList.remove('ndp-active-flash');
        void bar.offsetWidth; // reflow to restart animation
        bar.classList.add('ndp-active-flash');
        setTimeout(() => bar.classList.remove('ndp-active-flash'), 700);
      }
      lastDistributed = data.distributed;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
})();
