const state = {
  platformData: null
};

const elements = {
  featuredMenu: document.getElementById("featuredMenu"),
  vendorList: document.getElementById("vendorList"),
  submissionList: document.getElementById("submissionList"),
  testimonialGrid: document.getElementById("testimonialGrid"),
  navToggle: document.getElementById("navToggle"),
  siteNav: document.getElementById("siteNav"),
  filterBar: document.getElementById("filterBar"),
  showcaseCards: Array.from(document.querySelectorAll(".showcase-card")),
  faqItems: Array.from(document.querySelectorAll(".faq-item")),
  contactForm: document.getElementById("contactForm"),
  formNote: document.getElementById("formNote"),
  reveals: Array.from(document.querySelectorAll(".reveal")),
  ordersTodayValue: document.getElementById("ordersTodayValue"),
  activeVendorsValue: document.getElementById("activeVendorsValue"),
  satisfactionValue: document.getElementById("satisfactionValue"),
  uptimeValue: document.getElementById("uptimeValue"),
  counters: Array.from(document.querySelectorAll("[data-counter]"))
};

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || "Request failed.");
  }

  return payload;
}

function renderFeaturedMenu(menu) {
  if (!elements.featuredMenu) return;

  elements.featuredMenu.innerHTML = menu
    .slice(0, 3)
    .map(
      (item) => `
        <div class="menu-item">
          <div>
            <strong>${item.name}</strong>
            <small>${item.meta}</small>
          </div>
          <span class="price">${item.price}</span>
        </div>
      `
    )
    .join("");
}

function renderVendors(vendors) {
  if (!elements.vendorList) return;

  elements.vendorList.innerHTML = vendors
    .map(
      (vendor) => `
        <div class="backend-item">
          <strong>${vendor.name}</strong>
          <p>${vendor.focus}</p>
          <small>${vendor.serviceTime}</small>
        </div>
      `
    )
    .join("");
}

function renderTestimonials(testimonials) {
  if (!elements.testimonialGrid) return;

  elements.testimonialGrid.innerHTML = testimonials
    .map(
      (item) => `
        <article class="testimonial-card reveal visible">
          <p>"${item.quote}"</p>
          <strong>${item.name}</strong>
          <small>${item.organization}</small>
        </article>
      `
    )
    .join("");
}

function renderSubmissions(submissions) {
  if (!elements.submissionList) return;

  if (!submissions.length) {
    elements.submissionList.innerHTML = '<p class="backend-empty">No inquiries yet.</p>';
    return;
  }

  elements.submissionList.innerHTML = submissions
    .map(
      (submission) => `
        <div class="backend-item">
          <strong>${submission.name}</strong>
          <p>${submission.message}</p>
          <small>${submission.organization || submission.email}</small>
        </div>
      `
    )
    .join("");
}

function applyPlatformStats(stats) {
  if (elements.ordersTodayValue) {
    elements.ordersTodayValue.textContent = Number(stats.ordersToday).toLocaleString();
  }

  if (elements.activeVendorsValue) {
    elements.activeVendorsValue.textContent = String(stats.activeVendors);
  }

  if (elements.satisfactionValue) {
    elements.satisfactionValue.textContent = `${stats.satisfaction}/5 rating`;
  }

  if (elements.uptimeValue) {
    elements.uptimeValue.textContent = stats.uptime;
  }

  const [locationsCounter, sessionsCounter, speedCounter] = elements.counters;
  if (locationsCounter) locationsCounter.dataset.counter = String(stats.serviceLocations);
  if (sessionsCounter) sessionsCounter.dataset.counter = String(stats.dailySessionsCapacity);
  if (speedCounter) speedCounter.dataset.counter = String(stats.fasterDiscovery);
}

async function loadPlatformData() {
  const payload = await requestJson("/api/platform-data");
  state.platformData = payload;

  applyPlatformStats(payload.stats);
  renderFeaturedMenu(payload.featuredMenu);
  renderVendors(payload.vendors);
  renderTestimonials(payload.testimonials);
  renderSubmissions(payload.recentSubmissions);
  startCounters();
}

function setupNavigation() {
  if (!elements.navToggle || !elements.siteNav) return;

  elements.navToggle.addEventListener("click", () => {
    const expanded = elements.navToggle.getAttribute("aria-expanded") === "true";
    elements.navToggle.setAttribute("aria-expanded", String(!expanded));
    elements.siteNav.classList.toggle("open");
  });

  elements.siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      elements.navToggle.setAttribute("aria-expanded", "false");
      elements.siteNav.classList.remove("open");
    });
  });
}

function setupFilters() {
  if (!elements.filterBar) return;

  elements.filterBar.addEventListener("click", (event) => {
    const trigger = event.target.closest(".filter-chip");
    if (!trigger) return;

    const activeFilter = trigger.dataset.filter;
    elements.filterBar.querySelectorAll(".filter-chip").forEach((chip) => chip.classList.remove("active"));
    trigger.classList.add("active");

    elements.showcaseCards.forEach((card) => {
      const categories = card.dataset.category || "";
      const matches = activeFilter === "all" || categories.includes(activeFilter);
      card.classList.toggle("hidden", !matches);
    });
  });
}

function setupFaqs() {
  elements.faqItems.forEach((item) => {
    const button = item.querySelector(".faq-question");
    if (!button) return;

    button.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      elements.faqItems.forEach((entry) => entry.classList.remove("open"));
      if (!isOpen) item.classList.add("open");
    });
  });
}

async function handleContactSubmit(event) {
  event.preventDefault();
  if (!elements.contactForm || !elements.formNote) return;

  const formData = new FormData(elements.contactForm);
  const payload = Object.fromEntries(formData.entries());

  elements.formNote.textContent = "Sending request...";

  try {
    const response = await requestJson("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    elements.formNote.textContent = `Thanks ${response.submission.name}. Your request has been saved.`;
    elements.contactForm.reset();

    const nextSubmissions = [response.submission, ...(state.platformData?.recentSubmissions || [])].slice(0, 5);
    renderSubmissions(nextSubmissions);
  } catch (error) {
    elements.formNote.textContent = error.message;
  }
}

function setupContactForm() {
  if (!elements.contactForm) return;
  elements.contactForm.addEventListener("submit", handleContactSubmit);
}

function setupRevealAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );

  elements.reveals.forEach((item) => observer.observe(item));
}

let countersStarted = false;

function startCounters() {
  if (countersStarted) return;
  countersStarted = true;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const element = entry.target;
        const target = Number(element.dataset.counter);
        const duration = 1200;
        const startTime = performance.now();

        const animate = (time) => {
          const progress = Math.min((time - startTime) / duration, 1);
          const value = Math.floor(progress * target);
          element.textContent = target >= 1000 ? value.toLocaleString() : String(value);
          if (progress < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
        observer.unobserve(element);
      });
    },
    { threshold: 0.4 }
  );

  elements.counters.forEach((counter) => observer.observe(counter));
}

async function init() {
  setupNavigation();
  setupFilters();
  setupFaqs();
  setupContactForm();
  setupRevealAnimations();

  try {
    await loadPlatformData();
  } catch (error) {
    if (elements.formNote) {
      elements.formNote.textContent = "Backend connection failed. Start the Node server to enable live data.";
    }
  }
}

init();
