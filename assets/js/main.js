/* ==========================================================================
   Rakshya — interactions
   Vanilla JS, no dependencies. Everything degrades gracefully without JS.
   ========================================================================== */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };

  /* ------------------------------------------------------------------------
     Icons (inline so there are no extra network requests)
     ------------------------------------------------------------------------ */
  var I = {
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    woman: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="5"/><path d="M12 13v9M9 19h6"/></svg>',
    child: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="5" r="3"/><path d="M12 8v7M8 11h8M10 22l2-7 2 7"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
    cross: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/></svg>',
    flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3.3.4 1.6 1.6 2.8 2.5 2.8z"/></svg>',
    compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2.1 6.3-6.3 2.1 2.1-6.3z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>'
  };

  /* ------------------------------------------------------------------------
     Emergency directory — single source of truth for every page.
     Numbers are Nepal's public toll-free lines; verify periodically.
     ------------------------------------------------------------------------ */
  var HELPLINES = [
    { name: "Nepal Police", number: "100", tag: "Emergency", icon: "shield", urgent: true,
      desc: "Immediate danger, assault, abduction or any crime in progress. 24/7, nationwide." },
    { name: "Women's Helpline — National Women Commission", number: "1145", tag: "Women", icon: "woman",
      desc: "Gender-based violence, harassment, domestic abuse, legal guidance. Toll-free." },
    { name: "Child Helpline", number: "1098", tag: "Children", icon: "child",
      desc: "Child abuse, missing or trafficked children, child labour and exploitation. 24/7, toll-free." },
    { name: "Psychosocial Support — TPO Nepal", number: "16600102005", display: "1660-010-2005", tag: "Mental health", icon: "heart",
      desc: "Free, confidential counselling for trauma, anxiety, depression and crisis support." },
    { name: "Ambulance", number: "102", tag: "Medical", icon: "cross",
      desc: "Medical emergencies and urgent transport to hospital." },
    { name: "Tourist Police", number: "1144", tag: "Travel", icon: "compass",
      desc: "Help for travellers and anyone in tourist areas — English-speaking officers." },
    { name: "Fire Brigade", number: "101", tag: "Emergency", icon: "flame",
      desc: "Fire and rescue emergencies." }
  ];

  function telHref(n) { return "tel:" + n.replace(/[^\d+]/g, ""); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ------------------------------------------------------------------------
     Toast
     ------------------------------------------------------------------------ */
  var toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) {
      toastEl = doc.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      doc.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-on"); }, 3200);
  }

  /* ------------------------------------------------------------------------
     Drawer (generic, accessible: focus trap, Esc, scrim click, restore focus)
     ------------------------------------------------------------------------ */
  var openDrawerEl = null, lastFocus = null;
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

  function visibleFocusables(el) {
    return $$(FOCUSABLE, el).filter(function (n) { return n.offsetParent !== null || n === doc.activeElement; });
  }

  function openDrawer(el, opener) {
    if (!el) return;
    if (openDrawerEl && openDrawerEl !== el) closeDrawer(openDrawerEl, true);
    lastFocus = opener || doc.activeElement;
    el.hidden = false;
    // force reflow so the transition runs
    void el.offsetWidth;
    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
    doc.body.classList.add("is-locked");
    openDrawerEl = el;
    $$('[aria-controls="' + el.id + '"]').forEach(function (b) { b.setAttribute("aria-expanded", "true"); });
    var target = $("[data-autofocus]", el) || $(".drawer__panel", el);
    setTimeout(function () { target && target.focus(); }, reduceMotion ? 0 : 80);
  }

  function closeDrawer(el, silent) {
    el = el || openDrawerEl;
    if (!el) return;
    el.classList.remove("is-open");
    el.setAttribute("aria-hidden", "true");
    doc.body.classList.remove("is-locked");
    $$('[aria-controls="' + el.id + '"]').forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
    openDrawerEl = null;
    setTimeout(function () { if (!el.classList.contains("is-open")) el.hidden = true; }, reduceMotion ? 0 : 550);
    if (!silent && lastFocus && lastFocus.focus) lastFocus.focus();
  }

  doc.addEventListener("keydown", function (e) {
    if (!openDrawerEl) return;
    if (e.key === "Escape") { e.preventDefault(); closeDrawer(); return; }
    if (e.key === "Tab") {
      var f = visibleFocusables(openDrawerEl);
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  doc.addEventListener("click", function (e) {
    var opener = e.target.closest("[data-open-drawer]");
    if (opener) {
      var target = doc.getElementById(opener.getAttribute("data-open-drawer"));
      if (target) { e.preventDefault(); openDrawer(target, opener); }
      return;
    }
    if (e.target.closest("[data-close-drawer]")) { e.preventDefault(); closeDrawer(); }
  });

  /* ------------------------------------------------------------------------
     Emergency drawer — injected on every page
     ------------------------------------------------------------------------ */
  function buildEmergencyDrawer() {
    var items = HELPLINES.map(function (h) {
      return '<li class="helpline">' +
        '<span class="helpline__icon">' + I[h.icon] + '</span>' +
        '<span><span class="helpline__name">' + esc(h.name) + '</span>' +
        '<span class="helpline__desc">' + esc(h.desc) + '</span></span>' +
        '<a class="helpline__call" href="' + telHref(h.number) + '" aria-label="Call ' + esc(h.name) + ' on ' + esc(h.display || h.number) + '">' +
        I.phone + esc(h.display || h.number) + '</a></li>';
    }).join("");

    var wrap = doc.createElement("div");
    wrap.className = "drawer";
    wrap.id = "emergency-drawer";
    wrap.hidden = true;
    wrap.setAttribute("aria-hidden", "true");
    wrap.innerHTML =
      '<div class="drawer__scrim" data-close-drawer></div>' +
      '<div class="drawer__panel" role="dialog" aria-modal="true" aria-labelledby="emergency-title" tabindex="-1">' +
        '<div class="drawer__head"><div><h2 id="emergency-title">Emergency help</h2>' +
        '<p>You are not alone. Tap a number to call — all lines below are free.</p></div>' +
        '<button class="icon-btn" type="button" data-close-drawer aria-label="Close emergency directory">' + I.close + '</button></div>' +
        '<div class="drawer__body">' +
          '<a class="urgent-banner" href="tel:100" data-autofocus>' + I.shield.replace('aria-hidden="true"', 'aria-hidden="true" width="26" height="26"') +
          '<span>In immediate danger?<br><small>Call Nepal Police now</small></span><strong>100</strong></a>' +
          '<ul class="helpline-list">' + items + '</ul>' +
          '<p class="small-print">If you cannot speak safely, stay on the line — operators are trained to listen for background cues. ' +
          'Numbers verified for Nepal; if a line is busy, try Police (100) first.</p>' +
          '<p class="small-print"><a href="community.html#helplines">Open the full helpline directory →</a></p>' +
        '</div></div>';
    doc.body.appendChild(wrap);
  }

  /* Full directory on the community page */
  function buildHelplineGrid() {
    var grid = $("#helpline-grid");
    if (!grid) return;
    grid.innerHTML = HELPLINES.map(function (h, i) {
      return '<li class="helpline-card tilt reveal' + (h.urgent ? " helpline-card--urgent" : "") + '" style="--d:' + (i * 0.06).toFixed(2) + 's">' +
        '<div class="helpline-card__top"><span class="helpline__icon">' + I[h.icon] + '</span>' +
        '<span class="helpline-card__tag">' + esc(h.tag) + '</span></div>' +
        '<h3>' + esc(h.name) + '</h3>' +
        '<div class="helpline-card__number">' + esc(h.display || h.number) + '</div>' +
        '<p>' + esc(h.desc) + '</p>' +
        '<a class="btn ' + (h.urgent ? "btn--light" : "") + '" href="' + telHref(h.number) + '">' + I.phone + 'Call now</a></li>';
    }).join("");
  }

  /* ------------------------------------------------------------------------
     Header: scrolled state + mobile menu
     ------------------------------------------------------------------------ */
  function initHeader() {
    var header = $(".site-header");
    if (!header) return;
    var ticking = false;
    function update() {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();

    var toggle = $(".menu-toggle"), menu = $("#mobile-menu");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var open = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!open));
        toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
        menu.hidden = open;
      });
      doc.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !menu.hidden) { menu.hidden = true; toggle.setAttribute("aria-expanded", "false"); toggle.focus(); }
      });
    }
  }

  /* ------------------------------------------------------------------------
     Scroll reveal
     ------------------------------------------------------------------------ */
  function initReveal() {
    var els = $$(".reveal");
    if (!("IntersectionObserver" in window) || reduceMotion) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------------
     3D tilt + pointer glow (fine pointers only)
     ------------------------------------------------------------------------ */
  function initTilt() {
    if (!finePointer || reduceMotion) return;
    $$(".tilt").forEach(function (card) {
      var raf = null;
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          card.classList.add("is-tilting");
          card.style.transform = "perspective(900px) rotateX(" + ((0.5 - y) * 7).toFixed(2) + "deg) rotateY(" + ((x - 0.5) * 9).toFixed(2) + "deg) translateY(-6px)";
          card.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
          card.style.setProperty("--my", (y * 100).toFixed(1) + "%");
        });
      });
      card.addEventListener("pointerleave", function () {
        if (raf) cancelAnimationFrame(raf);
        card.classList.remove("is-tilting");
        card.style.transform = "";
      });
    });
  }

  /* ------------------------------------------------------------------------
     Origin story — scroll progress drives the sticky word + bar
     ------------------------------------------------------------------------ */
  function initStoryProgress() {
    var story = $("[data-story]");
    if (!story || reduceMotion) { if (story) story.style.setProperty("--p", 1); return; }
    var ticking = false;
    function update() {
      var r = story.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.7 - r.top) / (r.height - vh * 0.3)));
      story.style.setProperty("--p", p.toFixed(3));
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ------------------------------------------------------------------------
     Quick exit (trauma-informed): leaves instantly and replaces history
     ------------------------------------------------------------------------ */
  function initQuickExit() {
    var btn = $(".quick-exit");
    if (!btn) return;
    function leave() {
      try { doc.body.innerHTML = ""; } catch (e) { /* noop */ }
      window.location.replace("https://www.google.com/search?q=weather+kathmandu");
    }
    btn.addEventListener("click", leave);
    var last = 0;
    doc.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || openDrawerEl || e.defaultPrevented) return;
      var now = Date.now();
      if (now - last < 600) leave();
      last = now;
    });
  }

  /* ------------------------------------------------------------------------
     Community: filters + "I hear you" support reactions
     ------------------------------------------------------------------------ */
  function initFeed() {
    var chips = $$(".filters .chip");
    var cards = $$(".story-card");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var f = chip.getAttribute("data-filter");
        chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
        var shown = 0;
        cards.forEach(function (card) {
          var match = f === "all" || card.getAttribute("data-topic") === f;
          card.hidden = !match;
          if (match) shown++;
        });
        var live = $("#feed-status");
        if (live) live.textContent = shown + " " + (shown === 1 ? "story" : "stories") + " shown";
      });
    });

    $$(".support-btn").forEach(function (b) {
      b.addEventListener("click", function () {
        var on = b.getAttribute("aria-pressed") === "true";
        b.setAttribute("aria-pressed", String(!on));
        var c = $("[data-count]", b);
        if (c) c.textContent = String(parseInt(c.textContent, 10) + (on ? -1 : 1));
      });
    });
  }

  /* ------------------------------------------------------------------------
     Anonymous submission portal (multi-step)
     NOTE: This is a front-end only flow. Wire `submitToModeration` to your
     backend endpoint; nothing is stored or transmitted in this build.
     ------------------------------------------------------------------------ */
  function initPortal() {
    var form = $("#share-form");
    if (!form) return;
    var steps = $$(".step", form);
    var dots = $$(".portal-steps li", form.closest(".drawer__body") || doc);
    var current = 0;
    var text = $("#story-text", form);
    var counter = $("#story-count", form);
    var piiWarn = $("#pii-warning", form);
    var MIN = 40, MAX = 3000;

    function show(i, silent) {
      current = i;
      steps.forEach(function (s, idx) { s.classList.toggle("is-active", idx === i); s.hidden = idx !== i; });
      dots.forEach(function (d, idx) {
        d.classList.toggle("is-done", idx < i);
        d.classList.toggle("is-current", idx === i);
      });
      var h = $("h3", steps[i]);
      if (h && !silent) { h.setAttribute("tabindex", "-1"); h.focus(); }
    }

    function err(id, msg) { var el = $("#" + id, form); if (el) el.textContent = msg || ""; }

    function validate(i) {
      if (i === 0) {
        var topic = $('input[name="topic"]:checked', form);
        err("err-topic", topic ? "" : "Please choose the option that fits best — you can pick “Something else”.");
        return !!topic;
      }
      if (i === 1) {
        var v = text.value.trim();
        if (v.length < MIN) { err("err-story", "Please share at least " + MIN + " characters so moderators can understand."); text.focus(); return false; }
        err("err-story", "");
        return true;
      }
      if (i === 2) {
        var ok = $("#consent-moderation", form).checked && $("#consent-anon", form).checked;
        err("err-consent", ok ? "" : "Please confirm both points to continue.");
        if (ok) fillReview();
        return ok;
      }
      return true;
    }

    function fillReview() {
      var topic = $('input[name="topic"]:checked', form);
      var region = $("#region", form);
      $("#review-topic").textContent = topic ? topic.getAttribute("data-label") : "—";
      $("#review-region").textContent = region && region.value ? region.options[region.selectedIndex].text : "Not shared";
      $("#review-story").textContent = text.value.trim();
      $("#review-support").textContent = $("#want-support", form).checked ? "Yes — show me support resources" : "No";
    }

    // Live character count + gentle warning if names/phones/emails appear
    var PII = /(\b\d{7,}\b)|([\w.+-]+@[\w-]+\.[\w.]+)|(\b98\d{8}\b)/;
    text.addEventListener("input", function () {
      var n = text.value.length;
      counter.textContent = n + " / " + MAX;
      piiWarn.hidden = !PII.test(text.value);
    });

    form.addEventListener("click", function (e) {
      var nav = e.target.closest("[data-step]");
      if (!nav) return;
      var dir = nav.getAttribute("data-step");
      if (dir === "next") { if (validate(current)) show(Math.min(current + 1, steps.length - 1)); }
      else if (dir === "back") show(Math.max(current - 1, 0));
    });

    function refCode() {
      var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", out = "RK-";
      var buf = new Uint32Array(8);
      (window.crypto || window.msCrypto).getRandomValues(buf);
      for (var i = 0; i < 8; i++) { out += chars[buf[i] % chars.length]; if (i === 3) out += "-"; }
      return out;
    }

    function submitToModeration(payload) {
      // Placeholder: replace with fetch('/api/submissions', { method: 'POST', body: JSON.stringify(payload) })
      // Do NOT log IP addresses or set identifying cookies on the server.
      return new Promise(function (resolve) { setTimeout(resolve, 900); });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = $('button[type="submit"]', form);
      btn.disabled = true;
      btn.textContent = "Sending securely…";
      var topic = $('input[name="topic"]:checked', form);
      submitToModeration({
        topic: topic && topic.value,
        region: $("#region", form).value || null,
        story: text.value.trim(),
        wantsSupport: $("#want-support", form).checked
      }).then(function () {
        $("#ref-code").textContent = refCode();
        form.reset();
        counter.textContent = "0 / " + MAX;
        piiWarn.hidden = true;
        btn.disabled = false;
        btn.textContent = "Submit to moderation";
        show(steps.length - 1);
      });
    });

    // Reset to step one whenever the drawer opens fresh
    $$('[data-open-drawer="share-drawer"]').forEach(function (b) {
      b.addEventListener("click", function () { if (current === steps.length - 1) show(0, true); });
    });

    show(0, true);
  }

  /* ------------------------------------------------------------------------
     Products: carousel
     ------------------------------------------------------------------------ */
  function initCarousels() {
    $$(".carousel").forEach(function (car) {
      var track = $(".carousel__track", car);
      var items = Array.prototype.slice.call(track.children);
      var dotsWrap = $(".carousel__dots", car);
      var prev = $("[data-prev]", car), next = $("[data-next]", car);

      var dots = items.map(function (_, i) {
        var b = doc.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Go to item " + (i + 1) + " of " + items.length);
        b.addEventListener("click", function () { go(i); });
        dotsWrap && dotsWrap.appendChild(b);
        return b;
      });

      function go(i) {
        var it = items[Math.max(0, Math.min(items.length - 1, i))];
        track.scrollTo({ left: it.offsetLeft - track.offsetLeft, behavior: reduceMotion ? "auto" : "smooth" });
      }
      function activeIndex() {
        var x = track.scrollLeft, best = 0, min = Infinity;
        items.forEach(function (it, i) {
          var d = Math.abs(it.offsetLeft - track.offsetLeft - x);
          if (d < min) { min = d; best = i; }
        });
        return best;
      }
      function sync() {
        var a = activeIndex();
        dots.forEach(function (d, i) { d.setAttribute("aria-current", String(i === a)); });
        if (prev) prev.disabled = track.scrollLeft < 4;
        if (next) next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      }
      var t;
      track.addEventListener("scroll", function () { clearTimeout(t); t = setTimeout(sync, 60); }, { passive: true });
      prev && prev.addEventListener("click", function () { go(activeIndex() - 1); });
      next && next.addEventListener("click", function () { go(activeIndex() + 1); });
      track.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { e.preventDefault(); go(activeIndex() + 1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); go(activeIndex() - 1); }
      });
      window.addEventListener("resize", sync, { passive: true });
      sync();
    });
  }

  /* ------------------------------------------------------------------------
     Products: interactive step-by-step guide (tabs + steps + slider)
     ------------------------------------------------------------------------ */
  function initGuide() {
    var guide = $("[data-guide]");
    if (!guide) return;
    var tabs = $$('[role="tab"]', guide);
    var panels = $$('[role="tabpanel"]', guide);
    var range = $("#guide-range", guide);
    var rangeOut = $("#guide-range-out", guide);
    var activeTool = 0;

    function setStep(n) {
      var panel = panels[activeTool];
      var items = $$(".steps-list li", panel);
      n = Math.max(0, Math.min(items.length - 1, n));
      items.forEach(function (li, i) { li.classList.toggle("is-on", i === n); });
      $$(".scene", guide).forEach(function (s) {
        s.classList.toggle("is-on", s.getAttribute("data-scene") === activeTool + "-" + n);
      });
      if (range) { range.max = String(items.length); range.value = String(n + 1); }
      if (rangeOut) rangeOut.textContent = "Step " + (n + 1) + " of " + items.length;
    }

    function setTool(i) {
      activeTool = i;
      tabs.forEach(function (t, idx) {
        var on = idx === i;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach(function (p, idx) { p.hidden = idx !== i; });
      setStep(0);
    }

    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { setTool(i); });
      t.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var n = (i + d + tabs.length) % tabs.length;
        tabs[n].focus(); setTool(n);
      });
    });
    panels.forEach(function (p) {
      $$(".steps-list li", p).forEach(function (li, i) {
        var b = $("button", li);
        (b || li).addEventListener("click", function () { setStep(i); });
      });
    });
    range && range.addEventListener("input", function () { setStep(parseInt(range.value, 10) - 1); });

    setTool(0);
  }

  /* ------------------------------------------------------------------------
     Copy-to-clipboard helpers (e.g. email)
     ------------------------------------------------------------------------ */
  function initCopy() {
    $$("[data-copy]").forEach(function (b) {
      b.addEventListener("click", function () {
        var v = b.getAttribute("data-copy");
        if (navigator.clipboard) navigator.clipboard.writeText(v).then(function () { toast("Copied: " + v); });
      });
    });
  }

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */
  function boot() {
    buildEmergencyDrawer();
    buildHelplineGrid();
    initHeader();
    initReveal();
    initTilt();
    initStoryProgress();
    initQuickExit();
    initFeed();
    initPortal();
    initCarousels();
    initGuide();
    initCopy();
    var y = $("#year"); if (y) y.textContent = new Date().getFullYear();
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
