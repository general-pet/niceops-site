/* NiceOps — small, dependency-free interactions.
   Everything degrades gracefully: without JS the site is fully readable and usable. */
(function () {
  "use strict";

  var doc = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Page load: hero lines rise, rule draws, photo wipes in ---------- */
  function markLoaded() {
    document.body.classList.add("is-loaded");
    document.querySelectorAll("[data-draw-onload]").forEach(function (el) {
      el.classList.add("is-drawn");
    });
  }
  if (document.readyState === "complete") requestAnimationFrame(markLoaded);
  else window.addEventListener("load", function () { requestAnimationFrame(markLoaded); });
  // Safety net: never leave content hidden if the load event is slow.
  setTimeout(markLoaded, 1200);

  /* ---------- Mobile menu ---------- */
  var menu = document.getElementById("menu");
  var openBtn = document.querySelector("[data-menu-open]");
  var closeBtn = document.querySelector("[data-menu-close]");
  function focusables() {
    return menu.querySelectorAll("a[href], button:not([disabled])");
  }
  function openMenu() {
    menu.classList.add("is-open");
    menu.removeAttribute("inert");
    menu.setAttribute("aria-hidden", "false");
    openBtn.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
    setTimeout(function () { (closeBtn || focusables()[0]).focus(); }, 50);
  }
  function closeMenu() {
    menu.classList.remove("is-open");
    menu.setAttribute("inert", "");
    menu.setAttribute("aria-hidden", "true");
    openBtn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
    openBtn.focus();
  }
  if (menu && openBtn) {
    openBtn.addEventListener("click", openMenu);
    if (closeBtn) closeBtn.addEventListener("click", closeMenu);
    menu.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
      if (e.key === "Tab") {
        var f = focusables();
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { if (menu.classList.contains("is-open")) closeMenu(); });
    });
    window.matchMedia("(min-width: 768px)").addEventListener("change", function (mq) {
      if (mq.matches && menu.classList.contains("is-open")) closeMenu();
    });
  }

  /* ---------- Scroll reveal + hand-drawn marks ---------- */
  var revealTargets = document.querySelectorAll("[data-reveal], [data-reveal-stagger], [data-draw]:not([data-draw-onload]), .statement__line");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add("is-in");
        if (el.hasAttribute("data-draw")) el.classList.add("is-drawn");
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-in", "is-drawn"); });
  }

  /* ---------- Count-up numbers ---------- */
  var counters = document.querySelectorAll("[data-count]");
  function runCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    if (isNaN(target)) return;
    var start = null, dur = 1200;
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (counters.length && "IntersectionObserver" in window && !reduceMotion) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { runCount(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* ---------- Gentle parallax on real photos ---------- */
  var parallax = document.querySelectorAll(".photo--parallax img");
  if (parallax.length && !reduceMotion) {
    var pTick = false;
    var update = function () {
      var vh = window.innerHeight;
      parallax.forEach(function (img) {
        var r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var progress = (r.top + r.height / 2 - vh / 2) / vh; // -1 … 1
        img.style.transform = "scale(1.08) translateY(" + (progress * -24).toFixed(1) + "px)";
      });
      pTick = false;
    };
    window.addEventListener("scroll", function () { if (!pTick) { pTick = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ---------- Testimonial slider ---------- */
  document.querySelectorAll("[data-slider]").forEach(function (slider) {
    var slides = slider.querySelectorAll(".quote__slide");
    var status = slider.querySelector("[data-slider-status]");
    var prev = slider.querySelector("[data-slider-prev]");
    var next = slider.querySelector("[data-slider-next]");
    var i = 0;
    if (slides.length < 2) {
      var controls = slider.querySelector(".quote__controls");
      if (controls) controls.hidden = true;
      return;
    }
    function show(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.hidden = k !== i; s.setAttribute("aria-hidden", k !== i ? "true" : "false"); });
      if (status) status.textContent = (i + 1) + " / " + slides.length;
    }
    prev && prev.addEventListener("click", function () { show(i - 1); });
    next && next.addEventListener("click", function () { show(i + 1); });
    // swipe
    var x0 = null;
    slider.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) show(dx < 0 ? i + 1 : i - 1);
      x0 = null;
    });
    slider.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(i - 1);
      if (e.key === "ArrowRight") show(i + 1);
    });
    show(0);
  });

  /* ---------- Contact form ---------- */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var statusEl = form.querySelector(".form__status");
    var messages = {
      name: "Please tell us your name.",
      company: "Which company or studio are you with?",
      email: "We need an email address to reply.",
      message: "A few lines about what’s going on helps us prepare.",
      consent: "Please confirm we can store your details to reply."
    };
    function setError(field, msg) {
      var input = form.elements[field];
      var err = form.querySelector('[data-error-for="' + field + '"]');
      if (!input) return;
      if (msg) { input.setAttribute("aria-invalid", "true"); if (err) err.textContent = msg; }
      else { input.removeAttribute("aria-invalid"); if (err) err.textContent = ""; }
    }
    function validate() {
      var ok = true, firstBad = null;
      ["name", "company", "email", "message", "consent"].forEach(function (f) {
        var el = form.elements[f];
        if (!el) return;
        var valid = el.type === "checkbox" ? el.checked : el.value.trim() !== "";
        if (f === "email" && valid) valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
        setError(f, valid ? "" : (f === "email" && el.value.trim() ? "That email address doesn’t look right." : messages[f]));
        if (!valid) { ok = false; if (!firstBad) firstBad = el; }
      });
      if (firstBad) firstBad.focus();
      return ok;
    }
    form.addEventListener("input", function (e) { if (e.target.getAttribute("aria-invalid")) setError(e.target.name, ""); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      statusEl.textContent = "";
      if (form.elements._gotcha && form.elements._gotcha.value) return; // bot
      if (!validate()) return;

      var data = new FormData(form);
      var endpoint = form.getAttribute("action") || "";

      // Not configured yet: fall back to the visitor's email app so no message is lost.
      if (!endpoint || endpoint.indexOf("YOUR_FORM_ID") !== -1) {
        var body = "Name: " + data.get("name") + "\nCompany: " + data.get("company") +
          "\nEmail: " + data.get("email") + "\nPhone: " + (data.get("phone") || "—") + "\n\n" + data.get("message");
        window.location.href = "mailto:hello@niceops.work?subject=" +
          encodeURIComponent("Website enquiry from " + data.get("name")) + "&body=" + encodeURIComponent(body);
        statusEl.textContent = "Your email app should open with the message ready to send.";
        return;
      }

      var btn = form.querySelector('[type="submit"]');
      btn.disabled = true;
      statusEl.textContent = "Sending…";
      fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
        .then(function (res) {
          if (!res.ok) throw new Error("Request failed");
          form.reset();
          statusEl.textContent = "Thanks, message received. We’ll reply within two working days.";
        })
        .catch(function () {
          statusEl.innerHTML = 'Something went wrong. Please email us at <a class="email" href="mailto:hello@niceops.work">hello@niceops.work</a>.';
        })
        .finally(function () { btn.disabled = false; });
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
