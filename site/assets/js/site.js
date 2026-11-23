(function () {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-menu-toggle]");
  const drawer = document.getElementById("drawer");
  if (toggle && drawer) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      drawer.hidden = !open;
      document.body.style.overflow = open ? "hidden" : "";
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  }

  // Quote form: opens a prefilled email to the published address, then goes to thank-you.
  // Preview builds have no backend; wire Formspree/PocketBase before launch (see HANDOFF.md).
  const form = document.querySelector("[data-quote-form]");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const val = (name) => (fd.get(name) || "").toString().trim();
      const errs = {};
      if (!val("name")) errs.name = "Please enter your name.";
      if (!val("phone")) errs.phone = "Please enter a phone number.";
      if (!val("message")) errs.message = "Please describe the project.";
      const email = val("email");
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Please enter a valid email, or leave it blank.";
      form.querySelectorAll("[data-err]").forEach((el) => { el.textContent = ""; });
      form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
      const keys = Object.keys(errs);
      if (keys.length) {
        keys.forEach((k) => {
          const field = form.querySelector("#" + k);
          const err = form.querySelector("[data-err='" + k + "']");
          if (field) field.setAttribute("aria-invalid", "true");
          if (err) err.textContent = errs[k];
        });
        const first = form.querySelector("#" + keys[0]);
        if (first) first.focus();
        return;
      }
      const body = [
        "Project enquiry from the Southern Star Plumbing website.",
        "",
        "Name: " + val("name"),
        "Phone: " + val("phone"),
        "Email: " + (val("email") || "(not provided)"),
        "Location: " + (val("location") || "(not provided)"),
        "Type of work: " + (val("work_type") || "(not provided)"),
        "Timeline: " + (val("timeline") || "(not provided)"),
        "",
        "Project details:",
        val("message"),
      ].join("\n");
      const mailto = "mailto:southernstarplumbing@outlook.com?subject=" +
        encodeURIComponent("Project enquiry from " + val("name")) +
        "&body=" + encodeURIComponent(body);
      window.location.href = mailto;
      window.setTimeout(() => { window.location.href = "/thank-you/"; }, 600);
    });
  }

  /* Hero background slideshow — 6s hold, 1.5s CSS crossfade; reduced-motion stays on slide 1 */
  (function () {
    var root = document.querySelector("[data-hero-slideshow]");
    if (!root) return;
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    if (!slides.length) return;

    var loadRest = function () {
      slides.forEach(function (slide, i) {
        if (i === 0) return;
        var img = slide.querySelector("img");
        if (!img || img.getAttribute("src")) return;
        var src = img.getAttribute("data-src");
        var srcset = img.getAttribute("data-srcset");
        if (srcset) img.setAttribute("srcset", srcset);
        if (src) img.setAttribute("src", src);
      });
    };

    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      slides.forEach(function (s, i) { s.classList.toggle("is-active", i === 0); });
      return;
    }

    var i = slides.findIndex(function (s) { return s.classList.contains("is-active"); });
    if (i < 0) { i = 0; slides[0].classList.add("is-active"); }

    var timer = null;
    var INTERVAL = 6000;
    var tick = function () {
      slides[i].classList.remove("is-active");
      i = (i + 1) % slides.length;
      slides[i].classList.add("is-active");
    };
    var start = function () {
      if (timer) return;
      timer = window.setInterval(tick, INTERVAL);
    };
    var stop = function () {
      if (timer) { window.clearInterval(timer); timer = null; }
    };
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });

    var kickoff = function () {
      loadRest();
      start();
    };
    if (document.readyState === "complete") kickoff();
    else window.addEventListener("load", kickoff);
  })();
})();
