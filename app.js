/* ==========================================================================
   DISTRIVALTO — DIGITAL MARKETING GOVERNANCE
   Executive Presentation — Interaction Layer
   ========================================================================== */

(function () {
  'use strict';

  const container = document.getElementById('scrollContainer');
  const panels = Array.from(document.querySelectorAll('.panel'));
  const navDots = Array.from(document.querySelectorAll('.nav-dot'));
  const progressBar = document.getElementById('progressBar');

  let currentIndex = 0;
  let isScrolling = false;

  /* ---------------------------------------------------------------------
     Section navigation
     --------------------------------------------------------------------- */

  function goToSection(index) {
    if (index < 0 || index >= panels.length) return;
    isScrolling = true;
    panels[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
    currentIndex = index;
    updateActiveDot(index);
    window.setTimeout(() => { isScrolling = false; }, 700);
  }

  function updateActiveDot(index) {
    navDots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  }

  navDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.section, 10);
      goToSection(idx);
    });
  });

  /* ---------------------------------------------------------------------
     Keyboard navigation
     --------------------------------------------------------------------- */

  window.addEventListener('keydown', (e) => {
    if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
      e.preventDefault();
      goToSection(currentIndex + 1);
    } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
      e.preventDefault();
      goToSection(currentIndex - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      goToSection(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goToSection(panels.length - 1);
    }
  });

  /* ---------------------------------------------------------------------
     Scroll tracking — active section + progress bar
     --------------------------------------------------------------------- */

  function onScroll() {
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight - container.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progressBar.style.width = progress + '%';

    if (isScrolling) return;

    let closest = 0;
    let closestDist = Infinity;
    panels.forEach((panel, i) => {
      const dist = Math.abs(panel.offsetTop - scrollTop);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    if (closest !== currentIndex) {
      currentIndex = closest;
      updateActiveDot(closest);
    }
  }

  container.addEventListener('scroll', onScroll, { passive: true });

  /* ---------------------------------------------------------------------
     Reveal-on-view via IntersectionObserver
     --------------------------------------------------------------------- */

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    },
    { root: container, threshold: 0.3 }
  );

  panels.forEach((panel) => revealObserver.observe(panel));
  // Reveal hero immediately on load
  panels[0].classList.add('in-view');

  /* ---------------------------------------------------------------------
     Platform grid — data-driven badge render
     --------------------------------------------------------------------- */

  const PLATFORMS = [
    'Meta', 'Facebook', 'Instagram', 'Google Ads', 'GA4',
    'Google Tag Manager', 'Search Console', 'YouTube', 'TikTok',
    'Pinterest', 'HubSpot', 'Amazon', 'Walmart', 'Website',
    'Looker Studio', 'Bitwarden', 'AI Tools'
  ];

  function initials(name) {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  function renderPlatformGrid() {
    const grid = document.getElementById('platformGrid');
    if (!grid) return;
    const html = PLATFORMS.map((name) => `
      <div class="platform-card">
        <svg class="platform-icon" viewBox="0 0 32 32" aria-hidden="true">
          <circle cx="16" cy="16" r="14.5" fill="none" stroke="currentColor" stroke-width="1.4"/>
          <text x="16" y="20.5" text-anchor="middle" font-family="Inter, sans-serif" font-weight="700" font-size="11" fill="currentColor">${initials(name)}</text>
        </svg>
        <span>${name}</span>
      </div>
    `).join('');
    grid.innerHTML = html;
  }

  renderPlatformGrid();

  /* ---------------------------------------------------------------------
     Governance diagram — custom SVG hierarchy
     --------------------------------------------------------------------- */

  function renderGovernanceDiagram() {
    const target = document.getElementById('governanceDiagram');
    if (!target) return;

    const nodes = [
      { title: 'Business Owner', sub: 'Strategic Ownership', primary: false, y: 20 },
      { title: 'Marketing Manager', sub: 'Full Administrator', primary: true, y: 150 },
      { title: 'Digital Marketing Specialist', sub: 'Full Administrator', primary: true, y: 280 },
      { title: 'Contributors', sub: 'Scoped Execution Access', primary: false, y: 410 }
    ];

    const w = 920;
    const nodeW = 340;
    const nodeH = 88;
    const cx = w / 2;
    const totalH = 500;

    let connectors = '';
    for (let i = 0; i < nodes.length - 1; i++) {
      const y1 = nodes[i].y + nodeH;
      const y2 = nodes[i + 1].y;
      connectors += `<path class="gov-connector" d="M ${cx} ${y1} L ${cx} ${y2}"/>`;
      connectors += `<circle cx="${cx}" cy="${y2}" r="3.5" fill="#3DB7FF"/>`;
    }

    let nodesSvg = '';
    nodes.forEach((n) => {
      const x = cx - nodeW / 2;
      nodesSvg += `
        <g>
          <rect class="gov-node-rect ${n.primary ? 'primary' : ''}" x="${x}" y="${n.y}" width="${nodeW}" height="${nodeH}" rx="16"/>
          <text class="gov-node-title ${n.primary ? 'on-primary' : ''}" x="${cx}" y="${n.y + 38}" text-anchor="middle" font-size="19">${n.title}</text>
          <text class="gov-node-sub ${n.primary ? 'on-primary' : ''}" x="${cx}" y="${n.y + 62}" text-anchor="middle" font-size="12.5" letter-spacing="0.04em">${n.sub.toUpperCase()}</text>
        </g>
      `;
    });

    target.innerHTML = `
      <svg viewBox="0 0 ${w} ${totalH}" xmlns="http://www.w3.org/2000/svg">
        ${connectors}
        ${nodesSvg}
      </svg>
    `;
  }

  renderGovernanceDiagram();

  /* ---------------------------------------------------------------------
     Roadmap diagram — custom SVG horizontal flow
     --------------------------------------------------------------------- */

  function renderRoadmapDiagram() {
    const target = document.getElementById('roadmapDiagram');
    if (!target) return;

    const phases = [
      { title: 'Foundation', phase: 'STAGE 1' },
      { title: 'Inventory', phase: 'STAGE 2' },
      { title: 'Governance', phase: 'STAGE 3' },
      { title: 'Audit', phase: 'STAGE 4' },
      { title: 'Quick Wins', phase: 'STAGE 5' },
      { title: 'Execution', phase: 'STAGE 6' }
    ];

    const w = 1200;
    const h = 260;
    const n = phases.length;
    const nodeW = 168;
    const nodeH = 130;
    const gap = (w - n * nodeW) / (n - 1);
    const y = (h - nodeH) / 2;

    let connectors = '';
    for (let i = 0; i < n - 1; i++) {
      const x1 = i * (nodeW + gap) + nodeW;
      const x2 = x1 + gap;
      const midY = y + nodeH / 2;
      connectors += `<path class="roadmap-connector" d="M ${x1} ${midY} L ${x2} ${midY}" marker-end="url(#arrow)"/>`;
    }

    let nodes = '';
    phases.forEach((p, i) => {
      const x = i * (nodeW + gap);
      const isActive = i === 0;
      nodes += `
        <g>
          <rect class="roadmap-node-rect ${isActive ? 'active' : ''}" x="${x}" y="${y}" width="${nodeW}" height="${nodeH}" rx="18" fill="${isActive ? '#1D2B7F' : '#FFFFFF'}"/>
          <text class="roadmap-node-phase" x="${x + nodeW / 2}" y="${y + 40}" text-anchor="middle" font-size="11" letter-spacing="0.08em" fill="${isActive ? '#7ECEFF' : '#3DB7FF'}">${p.phase}</text>
          <text class="roadmap-node-title" x="${x + nodeW / 2}" y="${y + 72}" text-anchor="middle" font-size="16" fill="${isActive ? '#FFFFFF' : '#10163F'}">${p.title}</text>
          <text x="${x + nodeW / 2}" y="${y + 96}" text-anchor="middle" font-size="20" font-weight="700" fill="${isActive ? 'rgba(255,255,255,0.3)' : 'rgba(29,43,127,0.15)'}">0${i + 1}</text>
        </g>
      `;
    });

    target.innerHTML = `
      <svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L6,3 L0,6" fill="none" stroke="#1D2B7F" stroke-width="1.4"/>
          </marker>
        </defs>
        ${connectors}
        ${nodes}
      </svg>
    `;
  }

  renderRoadmapDiagram();

  /* ---------------------------------------------------------------------
     Recalculate on resize (roadmap diagram uses viewBox, so scaling is
     automatic — no rebuild required, but keep hook for future needs)
     --------------------------------------------------------------------- */

  window.addEventListener('resize', () => {
    // Layout is viewBox-relative; nothing to recompute currently.
  });

})();
