const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Shared navigation
const header = document.getElementById("siteHeader");
const mobileNav = document.getElementById("mobileNav");
const openButton = document.querySelector("[data-menu-open]");
const closeButton = document.querySelector("[data-menu-close]");
const menuLinks = [...document.querySelectorAll("[data-menu-link]")];
let returnFocus = null;

function setMenu(open) {
  if (!mobileNav || !openButton) return;
  mobileNav.classList.toggle("open", open);
  mobileNav.setAttribute("aria-hidden", String(!open));
  openButton.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);
  if (open) {
    returnFocus = document.activeElement;
    closeButton.focus();
  } else if (returnFocus) {
    returnFocus.focus();
  }
}

function updateHeader() {
  header?.classList.toggle("scrolled", window.scrollY > 28);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth > 1060 && mobileNav?.classList.contains("open")) setMenu(false);
});
openButton?.addEventListener("click", () => setMenu(true));
closeButton?.addEventListener("click", () => setMenu(false));
menuLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mobileNav?.classList.contains("open")) setMenu(false);
  if (event.key !== "Tab" || !mobileNav?.classList.contains("open")) return;
  const focusable = [closeButton, ...menuLinks].filter(Boolean);
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

// Reveal animations
const revealItems = document.querySelectorAll(".reveal");
if (reducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("visible"));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
}

// Current section indicator on the homepage
const anchorLinks = [...document.querySelectorAll(".nav-links a[href^='#']")];
const homeSections = document.querySelectorAll("main section[id]");
if (anchorLinks.length && "IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      anchorLinks.forEach((link) => {
        const current = link.hash === `#${entry.target.id}`;
        if (current) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-35% 0px -54% 0px" });
  homeSections.forEach((section) => sectionObserver.observe(section));
}

// Material filters
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const resources = [...document.querySelectorAll(".resource[data-category]")];
const filterStatus = document.getElementById("filterStatus");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.filter;
    let total = 0;
    filterButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    resources.forEach((resource) => {
      const show = category === "todos" || resource.dataset.category.split(" ").includes(category);
      resource.hidden = !show;
      if (show) total += 1;
    });
    if (filterStatus) filterStatus.textContent = `${total} materiais exibidos.`;
  });
});

// Testimonial slider
document.querySelectorAll("[data-slider]").forEach((slider) => {
  const slides = [...slider.querySelectorAll("[data-slide]")];
  const dots = [...slider.querySelectorAll("[data-dot]")];
  const status = slider.querySelector("[data-slider-status]");
  let current = 0;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => { slide.hidden = slideIndex !== current; });
    dots.forEach((dot, dotIndex) => {
      const selected = dotIndex === current;
      dot.classList.toggle("active", selected);
      dot.setAttribute("aria-pressed", String(selected));
    });
    if (status) status.textContent = `Experiência ${current + 1} de ${slides.length}`;
  }

  slider.querySelector("[data-prev]")?.addEventListener("click", () => showSlide(current - 1));
  slider.querySelector("[data-next]")?.addEventListener("click", () => showSlide(current + 1));
  dots.forEach((dot) => dot.addEventListener("click", () => showSlide(Number(dot.dataset.dot))));
});

// Contact form sent to the server-side Supabase endpoint
const contactForm = document.getElementById("contactForm");
const contactStatus = document.getElementById("contactStatus");

function showError(field, text) {
  field.classList.toggle("invalid", Boolean(text));
  field.setAttribute("aria-invalid", String(Boolean(text)));
  const output = contactForm?.querySelector(`[data-error-for="${field.id}"]`);
  if (output) output.textContent = text;
  return !text;
}

function validateContactField(field) {
  const value = field.value.trim();
  if (!value) return showError(field, "Este campo é obrigatório.");
  if (field.type === "email" && !field.validity.valid) return showError(field, "Digite um e-mail válido.");
  if (field.minLength > 0 && value.length < field.minLength) return showError(field, `Use pelo menos ${field.minLength} caracteres.`);
  return showError(field, "");
}

if (contactForm) {
  const fields = ["contactName", "contactEmail", "contactMessage"].map((id) => document.getElementById(id));
  fields.forEach((field) => {
    field.addEventListener("blur", () => validateContactField(field));
    field.addEventListener("input", () => {
      if (field.classList.contains("invalid")) validateContactField(field);
    });
  });

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const invalidField = fields.find((field) => !validateContactField(field));
    if (invalidField) {
      invalidField.focus();
      return;
    }

    const submitButton = contactForm.querySelector("button[type='submit']");
    const payload = Object.fromEntries(new FormData(contactForm).entries());
    submitButton.disabled = true;
    contactStatus.hidden = true;
    contactStatus.classList.remove("error");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível enviar a mensagem.");
      contactForm.reset();
      contactStatus.textContent = "Mensagem recebida! A equipe poderá responder pelo e-mail informado.";
      contactStatus.hidden = false;
    } catch (error) {
      contactStatus.textContent = error.message || "Não foi possível enviar agora. Tente novamente.";
      contactStatus.classList.add("error");
      contactStatus.hidden = false;
    } finally {
      submitButton.disabled = false;
    }
  });
}

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

document.querySelectorAll("[data-print]").forEach((button) => {
  button.addEventListener("click", () => window.print());
});
