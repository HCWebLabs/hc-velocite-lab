/* Velocité — View Transition micro-patterns */

const Vx = (() => {
  const stage = document.querySelector('#stage');
  const motionBtn = document.querySelector('#motion-toggle');
  const toastBtn = document.querySelector('#push-toast');
  const openMenuBtn = document.querySelector('#open-menu');
  const drawer = document.querySelector('#drawer');
  const closeMenuBtn = document.querySelector('#close-menu');
  const toast = document.querySelector('#toast');

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

  function init(){
    updateMotionUI();

    if (!location.hash) location.hash = '#/gallery';
    renderFromHash({ useVT:false });

    document.addEventListener('click', onNavClick);
    window.addEventListener('hashchange', () => renderFromHash({ useVT:true }));

    // Motion toggle
    motionBtn?.addEventListener('click', () => {
      state.motion = !state.motion;
      localStorage.setItem('vx.motion', JSON.stringify(state.motion));
      updateMotionUI();
    });

    // Global toast trigger
    toastBtn?.addEventListener('click', () => showToast());

    // Drawer
    openMenuBtn?.addEventListener('click', openDrawer);
    closeMenuBtn?.addEventListener('click', closeDrawer);
    drawer?.addEventListener('click', (e) => { if (e.target.matches('[data-close]')) closeDrawer(); });

    // Toast dismiss
    toast?.querySelector('.toast__close')?.addEventListener('click', () => hideToast());
  }

  function updateMotionUI(){
    motionBtn?.setAttribute('aria-pressed', String(state.motion));
    motionBtn?.querySelector('.label')?.textContent = `Motion: ${state.motion ? 'On' : 'Off'}`;
    document.documentElement.classList.toggle('motion-off', !state.motion);
  }

  // ---------- Routing ----------
  function onNavClick(e){
    const a = e.target.closest('a[data-link]');
    const b = e.target.closest('button[data-link]'); // back button in card pattern
    const linkEl = a || b;
    if (!linkEl) return;

    // normalize active in topnav
    const href = linkEl.getAttribute('href');
    document.querySelectorAll('.topnav a').forEach(n => n.classList.toggle('is-active', n.getAttribute('href') === href));

    if (state.hasVT && state.motion){
      e.preventDefault();
      const targetHash = href;
      document.startViewTransition(() => { location.hash = targetHash; });
      return;
    }
  }

  function renderFromHash({ useVT } = { useVT:true }){
    const path = (location.hash || '#/gallery').replace('#','');
    const tplSel = routes[path] || routes['/gallery'];
    const tpl = document.querySelector(tplSel);
    if (!tpl) return;

    stage.setAttribute('aria-busy', 'true');

    const swap = () => {
      stage.replaceChildren(tpl.content.cloneNode(true));
      requestAnimationFrame(() => {
        stage.focus({ preventScroll: true });
        stage.setAttribute('aria-busy', 'false');
        // attach pattern-specific hooks
        wireGalleryEnhancements();
        wireTabs();
        wireToastPattern();
      });
    };

    if (state.hasVT && state.motion && useVT){
      document.startViewTransition(swap);
    } else {
      swap();
    }
  }

  // ---------- Patterns ----------

  // Card morph: focus button scrolls into view; clicking the CTA triggers route change (handled in onNavClick)
  function wireGalleryEnhancements(){
    const btn = stage.querySelector('[data-action="focus-card"]');
    const card = stage.querySelector('#demo-card');
    if (btn && card){
      btn.addEventListener('click', () => card.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    }
  }

  // Tabs: partial swap only inside the panels container
  function wireTabs(){
    const tabs = stage.querySelector('.tabs');
    if (!tabs) return;

    const list = tabs.querySelector('.tabs__list');
    const panels = tabs.querySelectorAll('.tabs__panel');

    list.addEventListener('click', (e) => {
      const btn = e.target.closest('[role="tab"]');
      if (!btn) return;

      const current = list.querySelector('[aria-selected="true"]');
      if (current === btn) return;

      const nextId = btn.getAttribute('aria-controls');
      const next = tabs.querySelector('#'+nextId);
      const prev = tabs.querySelector('.tabs__panel.is-active');

      const doSwap = () => {
        // update aria & hidden
        current?.setAttribute('aria-selected', 'false');
        btn.setAttribute('aria-selected', 'true');
        prev?.setAttribute('hidden', '');
        prev?.classList.remove('is-active');
        next?.removeAttribute('hidden');
        next?.classList.add('is-active');
      };

      if (state.hasVT && state.motion){
        // scope the transition to the panel area by naming the viewport & panels in CSS
        document.startViewTransition(doSwap);
      } else {
        doSwap();
      }
    });
  }

  // Toast show/hide
  let toastTimer = null;
  function showToast(){
    if (!toast) return;
    const show = () => {
      toast.hidden = false;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(hideToast, 2400);
    };
    if (state.hasVT && state.motion){ document.startViewTransition(show); } else { show(); }
  }
  function hideToast(){
    if (!toast) return;
    const hide = () => { toast.hidden = true; };
    if (state.hasVT && state.motion){ document.startViewTransition(hide); } else { hide(); }
  }

  // Drawer open/close
  function openDrawer(){
    if (!drawer) return;
    const show = () => {
      drawer.hidden = false;
      drawer.querySelector('.drawer__sheet')?.focus({ preventScroll: true });
    };
    if (state.hasVT && state.motion){ document.startViewTransition(show); } else { show(); }
  }
  function closeDrawer(){
    if (!drawer) return;
    const hide = () => { drawer.hidden = true; };
    if (state.hasVT && state.motion){ document.startViewTransition(hide); } else { hide(); }
  }

  return { init };
})();

Vx.init();
