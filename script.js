// Заглушки URL_... показывают неактивные элементы макета. Замените их реальными адресами,
// чтобы соответствующие карточки и соцсети стали ссылками.
const siteConfig = {
  bookingUrl: "https://dikidi.ru/#widget=201607",
  catalogUrl: "https://vk.ru/market-153256844?screen=group",
  socialLinks: {
    vk: "https://vk.ru/piercing.perm",
    telegram: "https://t.me/PiercingTochkaPerm"
  }
};

const root = document.documentElement;
const themeToggle = document.querySelector("#themeToggle");
const themeText = themeToggle.querySelector(".theme-toggle__text");
const themeIcon = themeToggle.querySelector(".theme-icon");
const themeColor = document.querySelector('meta[name="theme-color"]');
const menuToggle = document.querySelector("#menuToggle");
const quickMenu = document.querySelector("#quickMenu");

function getSavedTheme() {
  try {
    return localStorage.getItem("piercing-tochka-theme");
  } catch {
    return null;
  }
}

function setTheme(theme, save = false) {
  const dark = theme === "dark";
  root.dataset.theme = dark ? "dark" : "light";
  themeText.textContent = dark ? "Светлая тема" : "Тёмная тема";
  themeToggle.setAttribute("aria-label", dark ? "Переключить на светлую тему" : "Переключить на тёмную тему");
  themeToggle.setAttribute("aria-pressed", String(dark));
  themeIcon.innerHTML = dark
    ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>'
    : '<path d="M20.2 15.1A8.3 8.3 0 0 1 8.9 3.8 8.7 8.7 0 1 0 20.2 15.1Z"/>';
  themeColor.content = dark ? "#101612" : "#f3ece2";

  if (save) {
    try {
      localStorage.setItem("piercing-tochka-theme", dark ? "dark" : "light");
    } catch {
      // The page remains usable when browser storage is unavailable.
    }
  }
}

const initialTheme = getSavedTheme() || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
setTheme(initialTheme);
themeToggle.addEventListener("click", () => setTheme(root.dataset.theme === "light" ? "dark" : "light", true));

menuToggle.addEventListener("click", () => {
  const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(willOpen));
  menuToggle.setAttribute("aria-label", willOpen ? "Закрыть меню" : "Открыть меню");
  quickMenu.hidden = !willOpen;
});
quickMenu.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    quickMenu.hidden = true;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Открыть меню");
  }
});

function applyLink(element, url, openInNewTab = true) {
  if (!element) return false;
  const value = url?.trim();
  if (!value) return false;
  if (value.startsWith("URL_")) {
    element.hidden = false;
    element.classList.add("is-unconfigured");
    element.setAttribute("aria-disabled", "true");
    element.title = "Ссылка будет добавлена позже";
    const notice = document.createElement("span");
    notice.className = "visually-hidden";
    notice.textContent = "Ссылка пока не указана";
    element.append(notice);
    return false;
  }
  element.href = value;
  if (openInNewTab) {
    element.target = "_blank";
    element.rel = "noopener noreferrer";
  }
  element.hidden = false;
  return true;
}

const bookingLink = document.querySelector("#bookingLink");
applyLink(bookingLink, siteConfig.bookingUrl, false);
applyLink(document.querySelector("#catalogLink"), siteConfig.catalogUrl);

const vpnDialog = document.querySelector("#vpnDialog");
const continueBooking = document.querySelector("#continueBooking");
if (bookingLink && vpnDialog && continueBooking) {
  let continueToWidget = false;
  let visitorCountry = null;

  fetch("https://ipapi.co/country/", { headers: { Accept: "text/plain" }, referrerPolicy: "no-referrer" })
    .then((response) => {
      if (!response.ok) throw new Error("Не удалось определить страну посетителя");
      return response.text();
    })
    .then((country) => {
      const countryCode = country.trim().toUpperCase();
      visitorCountry = /^[A-Z]{2}$/.test(countryCode) ? countryCode : null;
    })
    .catch(() => {
      visitorCountry = null;
    });

  bookingLink.addEventListener("click", (event) => {
    if (continueToWidget) {
      continueToWidget = false;
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    if (visitorCountry && visitorCountry !== "RU") {
      vpnDialog.hidden = false;
      continueBooking.focus();
      return;
    }

    continueToWidget = true;
    bookingLink.click();
  }, true);

  function openBookingWidget() {
    vpnDialog.hidden = true;
    continueToWidget = true;
    bookingLink.click();
  }

  document.querySelector("#closeVpnDialog").addEventListener("click", openBookingWidget);
  continueBooking.addEventListener("click", openBookingWidget);
  vpnDialog.addEventListener("click", (event) => {
    if (event.target === vpnDialog) openBookingWidget();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !vpnDialog.hidden) openBookingWidget();
  });
}

const socialMeta = {
  vk: { label: "ВКонтакте", icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.5 7.1c.15-.48 0-.83-.7-.83h-2.3c-.59 0-.86.3-1 .64 0 0-1.18 2.86-2.84 4.72-.54.55-.78.72-1.07.72-.15 0-.36-.17-.36-.65V7.1c0-.58-.17-.83-.65-.83H9c-.37 0-.6.27-.6.53 0 .55.83.67.92 2.21v3.35c0 .73-.13.86-.42.86-.78 0-2.66-2.87-3.78-6.15-.22-.64-.44-.8-1.03-.8h-2.3c-.66 0-.8.3-.8.63 0 .6.77 3.63 3.6 7.62 1.88 2.7 4.52 4.16 6.93 4.16 1.45 0 1.63-.33 1.63-.88v-2.04c0-.66.14-.79.61-.79.35 0 .96.18 2.37 1.55 1.61 1.61 1.88 2.34 2.79 2.34h2.3c.67 0 1.01-.33.81-.97-.22-.64-.97-1.57-1.98-2.67-.55-.62-1.37-1.3-1.62-1.64-.35-.44-.25-.62 0-1 .01 0 2.8-3.94 3.07-5.27Z"/></svg>' },
  telegram: { label: "Telegram", icon: '<svg class="stroke" viewBox="0 0 24 24" aria-hidden="true"><path d="m21 3-7.2 18-3.7-7.1L3 10.2 21 3Z"/><path d="m10.1 13.9 5.1-5.1"/></svg>' }
};

const socialLinks = document.querySelector("#socialLinks");
let socialCount = 0;
for (const [network, url] of Object.entries(siteConfig.socialLinks)) {
  const value = url?.trim();
  if (!value) continue;
  const meta = socialMeta[network];
  if (!meta) continue;
  const isUnconfigured = value.startsWith("URL_");
  const link = document.createElement(isUnconfigured ? "span" : "a");
  link.className = "social-link";
  if (isUnconfigured) {
    link.classList.add("is-unconfigured");
    link.setAttribute("role", "img");
    link.setAttribute("aria-label", `${meta.label} — ссылка пока не добавлена`);
    link.title = "Ссылка будет добавлена позже";
  } else {
    link.href = value;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", meta.label);
  }
  link.innerHTML = `<span class="social-icon">${meta.icon}</span><span>${meta.label}</span>`;
  socialLinks.append(link);
  socialCount += 1;
}
if (socialCount) document.querySelector("#socialSection").hidden = false;
