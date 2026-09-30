(function () {
  "use strict";

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---- Mobile menu ---- */
  var hamburger = $(".hamburger");
  var body = document.body;
  if (hamburger) {
    hamburger.addEventListener("click", function () {
      var open = body.classList.toggle("menu-open");
      hamburger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$(".mobile-nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        body.classList.remove("menu-open");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1024 && body.classList.contains("menu-open")) {
        body.classList.remove("menu-open");
        hamburger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---- Scroll reveal ---- */
  var revealEls = $$(".rv");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Generic accordion helper (services + FAQ) ---- */
  function setupAccordion(itemSelector, headSelector, options) {
    options = options || {};
    $$(itemSelector).forEach(function (item) {
      var head = $(headSelector, item);
      if (!head) return;
      head.addEventListener("click", function () {
        var isOpen = item.classList.contains("is-open");
        if (options.singleOpen) {
          $$(itemSelector).forEach(function (i) {
            i.classList.remove("is-open");
            var h = $(headSelector, i);
            if (h) h.setAttribute("aria-expanded", "false");
          });
        }
        if (!isOpen) {
          item.classList.add("is-open");
          head.setAttribute("aria-expanded", "true");
        } else {
          item.classList.remove("is-open");
          head.setAttribute("aria-expanded", "false");
        }
      });
    });
  }
  setupAccordion(".service-item", ".service-item__head", { singleOpen: true });
  setupAccordion(".faq-item", ".faq-item__head", { singleOpen: true });

  /* ---- Before / after slider ---- */
  var slider = $(".ba-slider");
  if (slider) {
    var afterImg = $(".ba-slider__after", slider);
    var handle = $(".ba-handle", slider);
    var dragging = false;

    var setPosition = function (clientX) {
      var rect = slider.getBoundingClientRect();
      var x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
      var pct = (x / rect.width) * 100;
      afterImg.style.clipPath = "inset(0 0 0 " + pct + "%)";
      handle.style.left = pct + "%";
    };

    var onMove = function (e) {
      if (!dragging) return;
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      setPosition(clientX);
    };
    var stop = function () { dragging = false; };

    handle.addEventListener("pointerdown", function (e) {
      dragging = true;
      handle.setPointerCapture && handle.setPointerCapture(e.pointerId);
    });
    slider.addEventListener("pointermove", onMove);
    slider.addEventListener("pointerup", stop);
    slider.addEventListener("pointerleave", stop);
    slider.addEventListener("pointercancel", stop);

    slider.addEventListener("click", function (e) {
      if (e.target === handle || handle.contains(e.target)) return;
      setPosition(e.clientX);
    });
  }

  /* ---- Estimate (price enquiry) form ---- */
  var estimateForm = $("#estimate-form");
  if (estimateForm) {
    estimateForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var service = $("#e-service", estimateForm);
      if (!service.value) {
        service.closest(".field").classList.add("has-error");
        service.focus();
        return;
      }
      service.closest(".field").classList.remove("has-error");
      $("#estimate-result").classList.add("is-visible");
    });
  }

  /* ---- Contact / booking form ---- */
  var form = $("#contact-form");
  if (form) {
    var successEl = $("#form-success");
    var validators = {
      name: function (v) { return v.trim().length >= 2; },
      phone: function (v) { return /^[0-9+()\-.\s]{7,}$/.test(v.trim()); },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); },
      brand: function (v) { return v.trim().length >= 1; },
      service: function (v) { return v.trim() !== ""; },
      message: function (v) { return v.trim().length >= 5; }
    };
    var setError = function (field, show) { field.closest(".field").classList.toggle("has-error", show); };
    var validateField = function (field) {
      var rule = validators[field.name];
      if (!rule) return true;
      var ok = rule(field.value);
      setError(field, !ok);
      return ok;
    };
    $$("input, select, textarea", form).forEach(function (field) {
      field.addEventListener("blur", function () { validateField(field); });
      field.addEventListener("input", function () {
        if (field.closest(".field").classList.contains("has-error")) validateField(field);
      });
      field.addEventListener("change", function () {
        if (field.closest(".field").classList.contains("has-error")) validateField(field);
      });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fields = $$("input, select, textarea", form).filter(function (f) { return validators[f.name]; });
      var allValid = fields.reduce(function (acc, f) { return validateField(f) && acc; }, true);
      if (!allValid) {
        var firstInvalid = $(".field.has-error input, .field.has-error select, .field.has-error textarea", form);
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      form.classList.add("is-hidden");
      successEl.classList.add("is-visible");
      form.reset();
    });
  }

  /* ---- Footer year ---- */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
