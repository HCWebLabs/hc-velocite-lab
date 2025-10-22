/* Velocité — Inline routes + dependable nav */

const state = {
  motion: JSON.parse(localStorage.getItem('vx.motion') ?? 'true'),
  hasVT: 'startViewTransition' in document,
  current: null
};

const stage = document.querySelector('#stage');

/* ---------- Init ---------- */
init();

function init(){
  // Wire header controls
  document.querySelector('#motion-toggle')?.addEventListener('click', toggleMotion);
  document.querySelector('#push-toast')?.addEventListener('click', showToast);

  // Drawer
  document.querySelector('#open-menu')?.addEventListener('click', openDrawer);
  document.querySelector('#close-menu')?.addEventListener('click', closeDrawer);
  document.querySelector('#drawer')?.addEventListener('click', (e)=>{ if (e.target.matches('[data-close]')) closeDrawer(); });

  // Route links (buttons/anchors) — delegate clicks
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-route-link]');
    if (!link) return;
    const route = link.getAttribute('data-route-link');
    e.preventDefault();
    go(route);
  });

  // Hash support (optional, so browser back works)
  window.addEventListener('hashchange', () => {
    const route = routeFromHash() || 'gallery';
    go(route, {useVT:true});
  });

  // Initial route
  const initial = routeFromHash() || 'gallery';
  go(initial, {useVT:false});

  updateMotionUI();
}

/* ---------- Routing ---------- */
function routeFromHash(){
  const h = location.hash.trim();
  if (!h.startsWith('#/')) return null;
  return h.slice(2); // "#/gallery" -> "gallery"
}

function go(route, opts={useVT:true}){
  // normalize URL hash for shareability
  if (location.hash !== `#/${route}`) {
    history.replaceState(null, '', `#/${route}`);
  }

  const prev = state.current;
  const next = document.querySelector(`[data-route="${route}"]`);
  if (!next) return;

  const swap = () => {
    // hide all, show next
    document.querySelectorAll('[data-route]').forEach(sec => {
      if (sec === next) { sec.hidden = false; } else { sec.hidden = true; }
    });

    // topnav active state
    document.querySelectorAll('.topnav [data-route-link]').forEach(a => {
      a.classList.toggle('is-active', a.getAttribute('data-route-link') === route);
    });

    // per-view hooks
    wireGallery();
    wireTabs();
    wireToastPattern();

    state.current = route;
    stage.focus({ preventScroll:true });
  };

  if (state.hasVT && state.motion && opts.useVT && prev !== route){
    document.startViewTransition(swap);
  } else {
    swap();
  }
}

/* ---------- Motion toggle ---------- */
function toggleMotion(){
  state.motion = !state.motion;
  localStorage.setItem('vx.motion', JSON.stringify(state.motion));
  updateMotionUI();
}
function updateMotionUI(){
  const btn = document.querySelector('#motion-toggle');
  btn?.setAttribute('aria-pressed', String(state.motion));
  btn?.querySelector('.label')?.textContent = `Motion: ${state.motion ? 'On' : 'Off'}`;
}

/* ---------- Drawer ---------- */
function openDrawer(){
  const drawer = document.querySelector('#drawer');
  if (!drawer) return;
  const show = () => { drawer.hidden = false; drawer.querySelector('.drawer__sheet')?.focus({ preventScroll:true }); };
  if (state.hasVT && state.motion){ document.startViewTransition(show); } else { show(); }
}
function closeDrawer(){
  const drawer = document.querySelector('#drawer');
  if (!drawer) return;
  const hide = () => { drawer.hidden = true; };
  if (state.hasVT && state.motion){ document.startViewTransition(hide); } else { hide(); }
}

/* ---------- Toast (global + pattern page) ---------- */
let toastTimer = null;
function showToast(){
  const toast = document.querySelector('#toast');
  if (!toast) return;
  const show = () => {
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => hideToast(), 2400);
  };
  if (state.hasVT && state.motion){ document.startViewTransition(show); } else { show(); }
}
function hideToast(){
  const toast = document.querySelector('#toast');
  if (!toast) return;
  const hide = () => { toast.hidden = true; };
  if (state.hasVT && state.motion){ document.startViewTransition(hide); } else { hide(); }
}
function wireToastPattern(){
  document.querySelector('#show-toast')?.addEventListener('click', showToast);
  document.querySelector('.toast__close')?.addEventListener('click', hideToast);
}

/* ---------- Gallery niceties ---------- */
function wireGallery(){
  const btn = document.querySelector('[data-action="focus-card"]');
  const card = document.querySelector('[data-route="gallery"] #demo-card');
  btn?.addEventListener('click', () => card?.scrollIntoView({ behavior:'smooth', block:'center' }));
}

/* ---------- Tabs (partial swap) ---------- */
function wireTabs(){
  const tabs = document.querySelector('[data-route="pattern-tabs"] .tabs');
  if (!tabs) return;

  const list = tabs.querySelector('.tabs__list');
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('[role="tab"]');
    if (!btn) return;

    const current = list.querySelector('[aria-selected="true"]');
    if (current === btn) return;

    const nextId = btn.getAttribute('aria-controls');
    const next = tabs.querySelector('#'+nextId);
    const prev = tabs.querySelector('.tabs__panel.is-active');

    const swap = () => {
      current?.setAttribute('aria-selected', 'false');
      btn.setAttribute('aria-selected', 'true');
      prev?.setAttribute('hidden', '');
      prev?.classList.remove('is-active');
      next?.removeAttribute('hidden');
      next?.classList.add('is-active');
    };

    if (state.hasVT && state.motion){
      document.startViewTransition(swap);
    } else {
      swap();
    }
  });
}
