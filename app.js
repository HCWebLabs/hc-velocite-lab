/* Velocité — inline routes, ES5-safe, polished */

(function () {
  var state = {
    motion: JSON.parse(localStorage.getItem('vx.motion') || 'true'),
    hasVT: !!document.startViewTransition,
    current: null
  };

  var stage = document.getElementById('stage');

  function init() {
    // Header controls
    var motionBtn = document.getElementById('motion-toggle');
    if (motionBtn) motionBtn.addEventListener('click', toggleMotion);
    var toastBtn = document.getElementById('push-toast');
    if (toastBtn) toastBtn.addEventListener('click', showToast);

    // Drawer
    var openMenu = document.getElementById('open-menu');
    if (openMenu) openMenu.addEventListener('click', openDrawer);
    var closeMenu = document.getElementById('close-menu');
    if (closeMenu) closeMenu.addEventListener('click', closeDrawer);
    var drawer = document.getElementById('drawer');
    if (drawer) {
      drawer.addEventListener('click', function (e) {
        if (e.target && e.target.matches('[data-close]')) closeDrawer();
      });
    }

    // Global ESC to close drawer or toast
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var d = document.getElementById('drawer');
        if (d && !d.hidden) { closeDrawer(); return; }
        var t = document.getElementById('toast');
        if (t && !t.hidden) { hideToast(); return; }
      }
    });

    // Route links (buttons/anchors)
    document.addEventListener('click', function (e) {
      var link = e.target && e.target.closest ? e.target.closest('[data-route-link]') : null;
      if (!link) return;
      var route = link.getAttribute('data-route-link');
      if (!route) return;
      e.preventDefault();
      go(route);
    });

    // Hash support (optional)
    window.addEventListener('hashchange', function () {
      var route = routeFromHash() || 'gallery';
      go(route, { useVT: true });
    });

    // Initial route
    var initial = routeFromHash() || 'gallery';
    go(initial, { useVT: false });

    updateMotionUI();
  }

  function routeFromHash() {
    var h = (location.hash || '').trim();
    if (h.indexOf('#/') !== 0) return null;
    return h.slice(2);
  }

  function go(route, opts) {
    opts = opts || { useVT: true };

    if (location.hash !== '#/' + route) {
      try { history.replaceState(null, '', '#/' + route); } catch (e) { location.hash = '#/' + route; }
    }

    var next = document.querySelector('[data-route="' + route + '"]');
    if (!next) return;

    var swap = function () {
      var sections = document.querySelectorAll('[data-route]');
      for (var i = 0; i < sections.length; i++) {
        sections[i].hidden = sections[i] !== next;
      }

      // topnav active + aria-current
      var navLinks = document.querySelectorAll('.topnav [data-route-link]');
      for (var j = 0; j < navLinks.length; j++) {
        var a = navLinks[j];
        var isActive = a.getAttribute('data-route-link') === route;
        a.classList.toggle('is-active', isActive);
        if (isActive) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
      }

      wireGallery();
      wireTabs();
      wireToastPattern();

      state.current = route;
      if (stage && stage.focus) stage.focus({ preventScroll: true });
    };

    if (state.hasVT && state.motion && opts.useVT && state.current !== route) {
      document.startViewTransition(swap);
    } else {
      swap();
    }
  }

  // Motion toggle
  function toggleMotion() {
    state.motion = !state.motion;
    localStorage.setItem('vx.motion', JSON.stringify(state.motion));
    updateMotionUI();
  }
  function updateMotionUI() {
    var btn = document.getElementById('motion-toggle');
    if (!btn) return;
    btn.setAttribute('aria-pressed', String(state.motion));
    var label = btn.querySelector('.label');
    if (label) label.textContent = 'Motion: ' + (state.motion ? 'On' : 'Off');
  }

  // Drawer
  function openDrawer() {
    var drawer = document.getElementById('drawer');
    if (!drawer) return;
    var show = function () {
      drawer.hidden = false;
      var sheet = drawer.querySelector('.drawer__sheet');
      if (sheet && sheet.focus) sheet.focus({ preventScroll: true });
    };
    if (state.hasVT && state.motion) document.startViewTransition(show); else show();
  }
  function closeDrawer() {
    var drawer = document.getElementById('drawer');
    if (!drawer) return;
    var hide = function () { drawer.hidden = true; };
    if (state.hasVT && state.motion) document.startViewTransition(hide); else hide();
  }

  // Toast
  var toastTimer = null;
  function showToast() {
    var toast = document.getElementById('toast');
    if (!toast) return;
    var show = function () {
      toast.hidden = false;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(hideToast, 2400);
    };
    if (state.hasVT && state.motion) document.startViewTransition(show); else show();
  }
  function hideToast() {
    var toast = document.getElementById('toast');
    if (!toast) return;
    var hide = function () { toast.hidden = true; };
    if (state.hasVT && state.motion) document.startViewTransition(hide); else hide();
  }
  function wireToastPattern() {
    var btn = document.getElementById('show-toast');
    if (btn) btn.addEventListener('click', showToast);
    var close = document.querySelector('.toast__close');
    if (close) close.addEventListener('click', hideToast);
  }

  // Gallery niceties
  function wireGallery() {
    var btn = document.querySelector('[data-action="focus-card"]');
    var card = document.querySelector('[data-route="gallery"] #demo-card');
    if (btn && card) btn.addEventListener('click', function () {
      if (card.scrollIntoView) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  // Tabs + arrow-key nav
  function wireTabs() {
    var wrap = document.querySelector('[data-route="pattern-tabs"] .tabs');
    if (!wrap) return;

    var list = wrap.querySelector('.tabs__list');
    list.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('[role="tab"]') : null;
      if (!btn) return;
      swapTo(btn);
    });

    list.addEventListener('keydown', function (e) {
      var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
      var idx = tabs.indexOf(document.activeElement);
      if (idx < 0) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); tabs[(idx + 1) % tabs.length].focus(); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); tabs[(idx - 1 + tabs.length) % tabs.length].focus(); }
      else if (e.key === 'Home') { e.preventDefault(); tabs[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); tabs[tabs.length - 1].focus(); }
    });

    function swapTo(btn){
      var current = list.querySelector('[aria-selected="true"]');
      if (current === btn) return;

      var nextId = btn.getAttribute('aria-controls');
      var next = wrap.querySelector('#'+nextId);
      var prev = wrap.querySelector('.tabs__panel.is-active');

      var swap = function () {
        if (current) current.setAttribute('aria-selected', 'false');
        btn.setAttribute('aria-selected', 'true');
        if (prev){ prev.setAttribute('hidden',''); prev.classList.remove('is-active'); }
        if (next){ next.removeAttribute('hidden'); next.classList.add('is-active'); }
      };

      if (state.hasVT && state.motion) document.startViewTransition(swap); else swap();
    }
  }

  // go!
  init();
})();
