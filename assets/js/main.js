/* Orient Fashions — v1 interactions */
(function () {
  'use strict';

  /* ---- Sticky header state ---- */
  var hdr = document.querySelector('.hdr');
  if (hdr && !hdr.classList.contains('hdr--solid')) {
    var onScroll = function () {
      hdr.classList.toggle('is-stuck', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Mobile nav ---- */
  var burger = document.querySelector('.burger');
  if (burger && hdr) {
    var setMenu = function (open) {
      hdr.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
      /* the panel fills the screen below the header */
      document.documentElement.style.setProperty('--hdr-h', hdr.offsetHeight + 'px');
    };
    burger.addEventListener('click', function () { setMenu(!hdr.classList.contains('is-open')); });
    document.querySelectorAll('.nav a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860 && hdr.classList.contains('is-open')) setMenu(false);
    });
  }

  /* ---- Scroll reveal ---- */
  var rv = document.querySelectorAll('[data-rv]');
  if (rv.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            var d = e.target.getAttribute('data-rv');
            e.target.style.transitionDelay = (d ? parseInt(d, 10) : 0) + 'ms';
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      rv.forEach(function (el) { io.observe(el); });
    } else {
      rv.forEach(function (el) { el.classList.add('is-in'); });
    }
  }

  /* ---- Accordions ---- */
  document.querySelectorAll('.acc').forEach(function (acc) {
    acc.querySelectorAll('.acc__btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.acc__item');
        var open = item.classList.contains('is-open');
        acc.querySelectorAll('.acc__item').forEach(function (i) {
          i.classList.remove('is-open');
          i.querySelector('.acc__btn').setAttribute('aria-expanded', 'false');
        });
        if (!open) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  });

  /* ---- Placeholder visibility toggle ---- */
  var t = document.querySelector('.ph-toggle');
  if (t) {
    // Persist across pages within the session
    try {
      if (window.sessionStorage && sessionStorage.getItem('ofPhOff') === '1') {
        document.body.classList.add('ph-off');
      }
    } catch (e) {}
    var sync = function () {
      var off = document.body.classList.contains('ph-off');
      t.querySelector('.ph-toggle__txt').textContent = off ? 'Show placeholders' : 'Hide placeholders';
      t.setAttribute('aria-pressed', String(!off));
    };
    sync();
    t.addEventListener('click', function () {
      var off = document.body.classList.toggle('ph-off');
      try { if (window.sessionStorage) sessionStorage.setItem('ofPhOff', off ? '1' : '0'); } catch (e) {}
      sync();
    });
  }

  /* ---- Inquiry form (front-end only in v1) ---- */
  /* ---- Contact form → email via FormSubmit (formsubmit.co) ----
     Careers enquiries go to the careers inbox. Everything else goes to info@,
     with a copy to Aarshia. After each inbox confirms its FormSubmit activation
     email, you can swap the address in each endpoint for the random alias
     FormSubmit sends, so the address isn't visible in the page source. */
  var FORM_ROUTES = {
    general: { endpoint: 'https://formsubmit.co/ajax/info@orientfashions.com', cc: 'aarshiasethi@orientfashions.com' },
    careers: { endpoint: 'https://formsubmit.co/ajax/hr@orientfashions.com', cc: '' }
  };

  var form = document.querySelector('[data-form]');
  if (form) {
    var msg = form.querySelector('[data-form-msg]');
    var btn = form.querySelector('[data-form-btn]');
    var typeSel = form.querySelector('#f-type');
    var consentBox = form.querySelector('#f-consent');
    var consentWrap = form.querySelector('[data-consent]');
    var msgLabel = form.querySelector('[data-msg-label]');
    var company = form.querySelector('#f-company');

    var isCareers = function () { return typeSel && typeSel.value === 'Careers'; };
    var say = function (text, kind) {
      if (!msg) return;
      msg.hidden = false; msg.textContent = text;
      msg.classList.toggle('is-error', kind === 'error');
      msg.classList.toggle('is-ok', kind === 'ok');
    };

    /* Show the right fields for job applicants vs buyers */
    var syncType = function () {
      var c = isCareers();
      form.querySelectorAll('[data-for-business]').forEach(function (el) { el.hidden = c; });
      form.querySelectorAll('[data-for-careers]').forEach(function (el) { el.hidden = !c; });
      if (company) company.required = !c;
      if (msgLabel) msgLabel.textContent = c ? 'Tell us about yourself' : 'Tell us about your project';
    };
    if (typeSel) { typeSel.addEventListener('change', function () { syncType(); if (msg) msg.hidden = true; }); syncType(); }

    form.querySelectorAll('input, textarea, select').forEach(function (el) {
      el.addEventListener('input', function () { var f = el.closest('.field'); if (f) f.classList.remove('is-error'); });
    });
    if (consentBox) consentBox.addEventListener('change', function () {
      if (consentWrap && consentBox.checked) consentWrap.classList.remove('is-error');
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      /* Required fields */
      var firstBad = null;
      form.querySelectorAll('[required]').forEach(function (el) {
        if (el.type === 'checkbox' || el.closest('[hidden]')) return;
        var ok = el.value.trim() !== '' && (el.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
        var f = el.closest('.field'); if (f) f.classList.toggle('is-error', !ok);
        if (!ok && !firstBad) firstBad = el;
      });
      if (firstBad) { say('Please fill in the highlighted fields.', 'error'); firstBad.focus(); return; }
      if (consentBox && !consentBox.checked) {
        if (consentWrap) consentWrap.classList.add('is-error');
        say('Please tick the privacy consent box so we can reply to your inquiry.', 'error');
        consentBox.focus(); return;
      }

      /* Spam trap filled in: pretend it worked and send nothing */
      var honey = form.querySelector('[name="_honey"]');
      if (honey && honey.value) { form.reset(); syncType(); say('Thank you. Your message has been sent.', 'ok'); return; }

      var careers = isCareers();
      var route = careers ? FORM_ROUTES.careers : FORM_ROUTES.general;
      var val = function (n) { var el = form.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ''; };
      var data = {
        'Name': val('name'),
        'Email': val('email'),
        'Country': val('country'),
        'Type of inquiry': val('type'),
        'Message': val('message'),
        'Privacy consent': 'Yes, given on ' + new Date().toUTCString()
      };
      if (!careers) {
        data['Company'] = val('company');
        data['Estimated annual volume'] = val('volume');
        data['Product category'] = val('category');
      }
      data._subject = careers
        ? 'Careers enquiry from ' + data['Name']
        : 'Website enquiry: ' + data['Type of inquiry'] + ' (' + (data['Company'] || data['Name']) + ')';
      data._replyto = data['Email'];
      data._template = 'table';
      data._captcha = 'false';
      if (route.cc) data._cc = route.cc;

      if (btn) { btn.disabled = true; btn.setAttribute('aria-busy', 'true'); }
      say('Sending…');

      fetch(route.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (!res.ok || String(res.j.success) === 'false') throw new Error(res.j.message || 'Send failed');
          form.reset(); syncType();
          say(careers
            ? 'Thank you. Your message has reached our careers team. Remember to email your CV to hr@orientfashions.com.'
            : 'Thank you. Your inquiry has been sent and we’ll get back to you shortly.', 'ok');
        })
        .catch(function (err) {
          var to = careers ? 'hr@orientfashions.com' : 'info@orientfashions.com';
          var why = (err && err.message) || '';
          if (window.console) console.warn('Form not sent:', why);
          if (location.protocol === 'file:') {
            say('This form only works when the site is opened from a web address, not from a file on your computer.', 'error');
          } else if (/activat/i.test(why)) {
            say('This form needs a one-time activation. An activation email has been sent to ' + to + '. Once the link in it is clicked, the form will work.', 'error');
          } else {
            say('Sorry, your message couldn’t be sent just now. Please try again, or email us directly at ' + to + '.', 'error');
          }
        })
        .then(function () { if (btn) { btn.disabled = false; btn.removeAttribute('aria-busy'); } });
    });
  }

  /* ---- Looping carousel ----
     Three copies of the card set live in the track. The scroll position parks
     in the middle copy and is silently shunted back whenever it drifts into a
     neighbour, so the loop never reaches an edge in either direction.
     Motion is animated by hand rather than with scroll-behavior:smooth because
     we need to know exactly when it has stopped before shunting. */
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-carousel]').forEach(function (root) {
    var vp = root.querySelector('.car__viewport');
    var track = root.querySelector('.car__track');
    var prev = root.querySelector('[data-car-prev]');
    var next = root.querySelector('[data-car-next]');
    var rail = root.querySelector('.car__rail');
    var thumb = root.querySelector('.car__thumb');
    var originals = Array.prototype.slice.call(track.children);
    if (!vp || !originals.length) return;
    var setW = 0, step = 0, animating = false, raf = null;

    function buildClones() {
      var before = document.createDocumentFragment(), after = document.createDocumentFragment();
      originals.forEach(function (el) {
        var a = el.cloneNode(true), b = el.cloneNode(true);
        a.setAttribute('data-clone', ''); a.setAttribute('aria-hidden', 'true');
        b.setAttribute('data-clone', ''); b.setAttribute('aria-hidden', 'true');
        before.appendChild(a); after.appendChild(b);
      });
      track.insertBefore(before, track.firstChild);
      track.appendChild(after);
    }

    function measure() {
      // Read real laid-out offsets. Card width comes from a clamp() that only
      // settles once fonts and final viewport width are in, so computing from
      // width + gap picks up a stale value and throws the loop out.
      var firstClone = track.firstElementChild;
      if (!firstClone) return;
      setW = originals[0].offsetLeft - firstClone.offsetLeft;
      step = originals.length > 1
        ? originals[1].offsetLeft - originals[0].offsetLeft
        : originals[0].offsetWidth;
      if (!setW || !step) return;

      var overflows = setW - (step - originals[0].offsetWidth) > vp.clientWidth + 1;
      if (prev) prev.hidden = !overflows;
      if (next) next.hidden = !overflows;
      if (rail) rail.style.display = overflows ? '' : 'none';
      if (!overflows) { vp.scrollLeft = setW; return; }
      if (vp.scrollLeft < 1) vp.scrollLeft = setW;
      normalise(); paint();
    }

    function normalise() {
      if (!setW) return;
      if (vp.scrollLeft < setW * 0.5) vp.scrollLeft += setW;
      else if (vp.scrollLeft > setW * 1.5) vp.scrollLeft -= setW;
    }

    function paint() {
      if (!setW || !thumb) return;
      var p = ((vp.scrollLeft - setW) % setW + setW) % setW;
      var frac = Math.min(1, vp.clientWidth / setW);
      thumb.style.width = (frac * 100) + '%';
      thumb.style.left = ((p / setW) * (100 - frac * 100)) + '%';
    }

    function animateTo(target, dur) {
      if (raf) cancelAnimationFrame(raf);
      if (reducedMotion) { vp.scrollLeft = target; normalise(); paint(); return; }
      var start = vp.scrollLeft, delta = target - start, t0 = performance.now();
      animating = true;
      raf = requestAnimationFrame(function frame(now) {
        var t = Math.min(1, (now - t0) / dur);
        var e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        vp.scrollLeft = start + delta * e;
        paint();
        if (t < 1) raf = requestAnimationFrame(frame);
        else { animating = false; normalise(); paint(); }
      });
    }
    function go(dir) { animateTo(vp.scrollLeft + dir * step, 420); }

    if (next) next.addEventListener('click', function () { go(1); });
    if (prev) prev.addEventListener('click', function () { go(-1); });
    vp.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });

    var idle;
    vp.addEventListener('scroll', function () {
      if (animating) return;
      paint();
      clearTimeout(idle);
      idle = setTimeout(function () { normalise(); paint(); }, 120);
    }, { passive: true });

    buildClones();
    measure();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    window.addEventListener('load', measure);
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt); rt = setTimeout(measure, 150);
    });
    // Unfold to a full list for printing, then restore
    if (window.matchMedia) {
      var mq = window.matchMedia('print');
      if (mq.addEventListener) mq.addEventListener('change', function (e) { if (!e.matches) measure(); });
    }
    window.addEventListener('afterprint', measure);
  });

  /* ---- Footer year ---- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---- Legal page: highlight the section being read in the contents list ---- */
  var toc = document.querySelector('.legal__toc');
  if (toc && 'IntersectionObserver' in window) {
    var links = {};
    toc.querySelectorAll('a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && links[en.target.id]) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove('is-active'); });
          links[en.target.id].classList.add('is-active');
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    document.querySelectorAll('.legal__body h2[id]').forEach(function (h) { io2.observe(h); });
  }

  /* ---- Contact map: Google Maps loads only after the visitor chooses to show it ---- */
  var map = document.querySelector('[data-map]');
  if (map) {
    var MAP_KEY = 'ofMapsConsent';
    var MAP_SRC = 'https://www.google.com/maps?q=G7P9%2B4C%20New%20Delhi&z=16&output=embed';
    var note = document.querySelector('[data-map-note]');
    var gate = map.querySelector('[data-map-gate]');
    var loadMap = function (remember) {
      if (map.querySelector('iframe')) return;
      var f = document.createElement('iframe');
      f.src = MAP_SRC;
      f.title = 'Map showing Orient Fashions, E-45/14 Okhla Industrial Area Phase 2, New Delhi';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.setAttribute('allowfullscreen', '');
      map.appendChild(f);
      if (gate) gate.hidden = true;
      if (note) note.hidden = false;
      if (remember) { try { localStorage.setItem(MAP_KEY, 'yes'); } catch (e) {} }
    };
    var btnLoad = map.querySelector('[data-map-load]');
    if (btnLoad) btnLoad.addEventListener('click', function () { loadMap(true); });
    var btnOff = document.querySelector('[data-map-off]');
    if (btnOff) btnOff.addEventListener('click', function () {
      try { localStorage.removeItem(MAP_KEY); } catch (e) {}
      var f = map.querySelector('iframe'); if (f) f.remove();
      if (gate) gate.hidden = false;
      if (note) note.hidden = true;
    });
    try { if (localStorage.getItem(MAP_KEY) === 'yes') loadMap(false); } catch (e) {}
  }

  /* ---- Hero video: make sure it plays on phones too; respect reduced-motion by pausing ---- */
  var hv = document.querySelector('.hero__video');
  if (hv) {
    hv.muted = true;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { hv.pause(); hv.removeAttribute('autoplay'); }
    else { var pr = hv.play(); if (pr && pr.catch) pr.catch(function () {}); }
  }

  /* ---- Brand ticker: seamless loop, 20s per logo set, half speed on hover ---- */
  var mq = document.querySelector('[data-marquee]');
  var mqTrack = mq && mq.querySelector('.marquee__track');
  if (mq && mqTrack) {
    var SET_SECONDS = 20;
    var original = Array.prototype.slice.call(mqTrack.children);
    var build = function () {
      mq.classList.remove('is-ready');
      while (mqTrack.children.length > original.length) mqTrack.removeChild(mqTrack.lastChild);
      var setW = mqTrack.scrollWidth;
      if (!setW) return;
      /* repeat the set until one half is at least as wide as the screen */
      var copies = Math.max(1, Math.ceil(mq.clientWidth / setW));
      var addSet = function (hidden) {
        original.forEach(function (el) {
          var c = el.cloneNode(true);
          if (hidden) { c.setAttribute('alt', ''); c.setAttribute('aria-hidden', 'true'); }
          mqTrack.appendChild(c);
        });
      };
      for (var i = 1; i < copies; i++) addSet(true);   /* first half */
      for (var j = 0; j < copies; j++) addSet(true);   /* second half, identical */
      mq.style.setProperty('--mq-dur', (SET_SECONDS * copies) + 's');
      void mqTrack.offsetWidth;
      mq.classList.add('is-ready');
    };
    var ready = function () {
      var imgs = original.filter(function (el) { return el.tagName === 'IMG' && !el.complete; });
      if (!imgs.length) { build(); return; }
      var left = imgs.length;
      imgs.forEach(function (im) {
        var done = function () { if (--left === 0) build(); };
        im.addEventListener('load', done, { once: true });
        im.addEventListener('error', done, { once: true });
      });
    };
    ready();
    var rT; window.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(build, 200); });

    var ease = null;
    var setRate = function (target) {
      var anim = mqTrack.getAnimations ? mqTrack.getAnimations()[0] : null;
      if (!anim) return;
      if (ease) cancelAnimationFrame(ease);
      var from = anim.playbackRate, start = performance.now(), dur = 400;
      var step = function (now) {
        var t = Math.min(1, (now - start) / dur);
        anim.playbackRate = from + (target - from) * (1 - Math.pow(1 - t, 3));
        if (t < 1) ease = requestAnimationFrame(step);
      };
      ease = requestAnimationFrame(step);
    };
    mq.addEventListener('mouseenter', function () { setRate(0.5); });
    mq.addEventListener('mouseleave', function () { setRate(1); });
  }
})();
