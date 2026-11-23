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
})();
