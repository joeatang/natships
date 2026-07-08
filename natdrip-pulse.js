// -----------------------------------------------------------------------------
// NATDRIP pulse ribbon · universal drop-in
//
// Polls the drip worker's /status endpoint every 30s and drives a thin
// heatmapped ribbon at the top of the page. Tap/hover reveals the current
// level word and recent activity count. Never exposes raw amounts.
//
// Config via window.NATDRIP_PULSE (optional, override before this script loads):
//   { statusUrl: 'https://natdrip.unatom.workers.dev/status',
//     pollMs: 30000, hideOnErr: true, ctaHref: '/', hidePhases: ['pre'] }
// -----------------------------------------------------------------------------
(function () {
  'use strict';
  if (window.__NATDRIP_PULSE__) return;
  window.__NATDRIP_PULSE__ = true;

  const cfg = Object.assign({
    statusUrl: 'https://natdrip.unatom.workers.dev/status',
    pollMs:    30000,
    hideOnErr: false,
    ctaHref:   '/',
    hidePhases: ['pre'],       // ribbon hides in pre-launch state
  }, window.NATDRIP_PULSE || {});

  // level word buckets by percentRemaining
  const LEVELS = [
    { min: 0.75, level: 'flowing full', color: '#5dd0e3' },  // cool cyan
    { min: 0.50, level: 'flowing warm', color: '#7dcf5b' },  // green
    { min: 0.25, level: 'warming up',   color: '#f7c948' },  // yellow
    { min: 0.10, level: 'getting hot',  color: '#f0962d' },  // orange
    { min: 0.00, level: 'running dry',  color: '#f17d8e' },  // pink-red
  ];

  function bucketFor(pct) {
    for (const b of LEVELS) if (pct >= b.min) return b;
    return LEVELS[LEVELS.length - 1];
  }

  // ---------- DOM setup ----------
  const ribbon = document.createElement('div');
  ribbon.className = 'natdrip-ribbon ndp-hidden';
  ribbon.setAttribute('role', 'status');
  ribbon.setAttribute('aria-label', 'NATDRIP pool status');
  ribbon.setAttribute('tabindex', '0');

  const tip = document.createElement('div');
  tip.className = 'natdrip-tip';
  tip.innerHTML = `
    <span class="ndp-level">·</span>
    <span class="ndp-status">loading</span>
    <span class="ndp-activity"></span>
    <a class="ndp-link" href="${cfg.ctaHref}">unatom.fun · claim →</a>
  `;

  // Attach when body exists
  function attach() {
    if (!document.body) { requestAnimationFrame(attach); return; }
    document.body.appendChild(ribbon);
    document.body.appendChild(tip);
    wireEvents();
    poll();
    setInterval(poll, cfg.pollMs);
  }

  function wireEvents() {
    let hideTimer;
    const show = () => {
      clearTimeout(hideTimer);
      tip.classList.add('ndp-show');
      hideTimer = setTimeout(() => tip.classList.remove('ndp-show'), 3200);
    };
    ribbon.addEventListener('mouseenter', show);
    ribbon.addEventListener('click', show);
    ribbon.addEventListener('touchstart', show, { passive: true });
    ribbon.addEventListener('focus', show);
    ribbon.addEventListener('blur', () => tip.classList.remove('ndp-show'));
    // Keep tip open while cursor is on it
    tip.addEventListener('mouseenter', () => clearTimeout(hideTimer));
    tip.addEventListener('mouseleave', () => { hideTimer = setTimeout(() => tip.classList.remove('ndp-show'), 400); });
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
      if (cfg.hideOnErr) ribbon.classList.add('ndp-hidden');
      // else leave the last-known state visible — offline shouldn't hide the pulse
    }
  }

  function render(data) {
    // Hide ribbon entirely in specific phases (pre-launch)
    if (data.phase && cfg.hidePhases.includes(data.phase)) {
      ribbon.classList.add('ndp-hidden');
      return;
    }

    // Percent remaining — prefer server-computed if present, else derive from pool/distributed
    let pctRemaining;
    if (typeof data.percentRemaining === 'number') {
      pctRemaining = Math.max(0, Math.min(1, data.percentRemaining));
    } else if (data.pool && data.distributed != null) {
      pctRemaining = Math.max(0, Math.min(1, 1 - (data.distributed / data.pool)));
    } else {
      pctRemaining = 1;
    }

    // Pick bucket by percent OR use server-provided level word directly
    let bucket;
    if (data.level && typeof data.level === 'string') {
      bucket = LEVELS.find(b => b.level === data.level) || bucketFor(pctRemaining);
    } else {
      bucket = bucketFor(pctRemaining);
    }

    ribbon.style.setProperty('--ndp-color', bucket.color);
    ribbon.style.setProperty('--ndp-fill',  (pctRemaining * 100).toFixed(1) + '%');
    ribbon.classList.remove('ndp-hidden');

    // Dry state urgent pulse
    ribbon.classList.toggle('ndp-dry', bucket.level === 'running dry');

    // Activity flash if distributed increased since last poll
    if (typeof data.distributed === 'number') {
      if (lastDistributed != null && data.distributed > lastDistributed) {
        ribbon.classList.remove('ndp-active-flash');
        // reflow to restart animation
        void ribbon.offsetWidth;
        ribbon.classList.add('ndp-active-flash');
        setTimeout(() => ribbon.classList.remove('ndp-active-flash'), 800);
      }
      lastDistributed = data.distributed;
    }

    // Tooltip
    tip.querySelector('.ndp-level').textContent = 'NATDRIP ·';
    tip.querySelector('.ndp-status').textContent = bucket.level;
    const recent = typeof data.recentClaims === 'number' ? data.recentClaims : null;
    const act = tip.querySelector('.ndp-activity');
    if (recent === null) {
      act.textContent = '';
    } else if (recent === 0) {
      act.textContent = '· quiet · you could be next';
    } else if (recent === 1) {
      act.textContent = '· 1 claimed in the last hour';
    } else {
      act.textContent = `· ${recent} claimed in the last hour`;
    }
    // Recolor level word
    tip.querySelector('.ndp-level').style.color = bucket.color;
    tip.querySelector('.ndp-status').style.color = bucket.color;

    ribbon.style.setProperty('--ndp-active-color', bucket.color);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
})();
