/* Velocité — Robust router + patterns */

const stage = document.querySelector('#stage');
const topnavLinks = () => Array.from(document.querySelectorAll('.topnav a[data-link]'));

const routes = {
  '/gallery': '#tpl-gallery',
  '/about': '#tpl-about',
  '/pattern/card': '#tpl-pattern-card',
  '/pattern/menu': '#tpl-pattern-menu',
  '/pattern/toast': '#tpl-pattern-toast',
  '/pattern/tabs': '#tpl-pattern-tabs',
};

const state = {
  motion: JSON.parse(localStorage.getItem('vx.motion') ?? 'true'),
  hasVT: 'startViewTransition' in document,
};

/* ---------- Init ---------- */
init();

function init(){
  // Ensure we start on a valid route
  if (!routes[getPath()]) location.hash = '#/gallery';
  render(); // immediate first paint

  // Delegated link handling (always prevent default and set hash)
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-link]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#/')) return;
    e.preventDefault();
    if (location.hash === href) return; // no-op
    location.hash = href; // hashchange will render
  });

  // Hash-based routing with optional VT wrapper
  window.addEventListener('hashchange', () => {
    if (state.hasVT && state.motion){
      document.startViewTransition(render);
    } else {
      render();
    }
  });

  // Header controls
  document.querySelector('#motion-toggle')?.addEventListener('click', toggleMotion);
  document.querySelector('#push-toast')?.addEventListener('click', showToast);

  // Drawer hooks
  document.querySelector('#open-menu')?.addEventListener('click', openDrawer);
  document.querySelector('#close-menu')?.addEventListener('click', closeDrawer);
  document.querySelector('#drawer')?.addEventListener('click', (e) => {
    if (e.target.matches('[data-close]')) closeDrawer();
  });

  updateMotionUI();
}

/* ---------- Render ---------- */
function getPath(){
  const h = (location.hash || '#/gallery').slice(1); // remove '#'
  return h || '/gallery';
}

function render(){
  const path = getPath();
  const tplSel = routes[path] || routes['/gallery'];
  const tpl = document.querySelector(tplSel);
  if (!tpl) return;

  stage.setAttribute('aria-busy', 'true');
  stage.replaceChildren(tpl.content.cloneNode(true));
  stage.setAttribute('aria-busy', 'false');

  // set nav active state
  topnavLinks().forEach(a => a.classList.toggle('is-active', a.getAttribute('href').slice(1) === path));

  // attach per-view hooks
  wireGallery();
  wireTabs();
  wireToastPattern();

  // focus main for a11y
  requestAnimationFrame(() => stage.focus({ preventScroll: true }));
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
  const btn = stage.querySelector('[data-action="focus-card"]');
  const card = stage.querySelector('#demo-card');
  btn?.addEventListener('click', () => card?.scrollIntoView({ behavior:'smooth', block:'center' }));
}

/* ---------- Tabs (partial swap) ---------- */
function wireTabs(){
  const tabs = stage.querySelector('.tabs');
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

