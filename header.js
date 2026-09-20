document.addEventListener("DOMContentLoaded", async () => {
  const mount = document.querySelector("[data-site-header]");
  if (!mount) return;

  // 1. Tải header.html tự động
  try {
    const response = await fetch("header.html");
    if (!response.ok) throw new Error(`Header request failed: ${response.status}`);
    mount.innerHTML = await response.text();
  } catch (error) {
    mount.innerHTML =
      '<p class="hl-header-load-error">Unable to load the navigation. Please refresh the page.</p>';
    console.error(error);
    return;
  }

  const headerWrapper = mount.querySelector(".hl-header-wrapper");

  // Tự động tính chiều cao Header để bù padding-top cho trang
  const updatePageOffset = () => {
    if (!headerWrapper) return;
    const headerHeight = headerWrapper.offsetHeight;
    const targetElement = document.querySelector(".page") || document.body;
    targetElement.style.paddingTop = `${headerHeight}px`;
    document.documentElement.style.scrollPaddingTop = `${headerHeight + 20}px`;
  };

  updatePageOffset();
  window.addEventListener("resize", updatePageOffset);

  // 2. Toggle Menu trên Mobile
  const menuButton = mount.querySelector(".hl-menu-toggle");
  const nav = mount.querySelector(".hl-primary-nav");

  menuButton?.addEventListener("click", () => {
    const isOpen = mount.classList.toggle("hl-menu-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mount.classList.remove("hl-menu-open");
      menuButton?.setAttribute("aria-expanded", "false");
    });
  });

  // 3. Logic Active Tab thông minh
  const navLinks = mount.querySelectorAll("[data-nav]");
  const setActiveNav = (navKey) => {
    navLinks.forEach((link) => {
      if (link.getAttribute("data-nav") === navKey) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  };

  // Nhận diện đường dẫn trang hiện tại
  const currentFileName = window.location.pathname.split("/").pop() || "home.html";
  const currentHash = window.location.hash.replace("#", "");

  if (currentFileName === "about.html") {
    setActiveNav("about");
  } else if (currentFileName === "home.html" || currentFileName === "index.html" || currentFileName === "") {
    if (currentHash) {
      setActiveNav(currentHash);
    } else {
      setActiveNav("new-arrivals"); // Mặc định active tab đầu tiên ở trang chủ
    }
  }

  // 4. Intersection Observer cho Landing Page
  const sections = document.querySelectorAll("section[id]");
  if (sections.length > 0 && (currentFileName === "home.html" || currentFileName === "index.html" || currentFileName === "")) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveNav(entry.target.getAttribute("id"));
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
  }

  // 5. Đồng bộ giỏ hàng
  const cartCount = mount.querySelector(".hl-cart-count");
  const storedCount = Number.parseInt(
    localStorage.getItem("herluxe-cart-count") || "0",
    10
  );
  if (cartCount)
    cartCount.textContent = String(Number.isNaN(storedCount) ? 0 : storedCount);

  // 6. Logic Chanel-Style: Trượt NGUYÊN KHỐI HEADER khi Cuộn
  let lastScrollY = window.scrollY;

  window.addEventListener(
    "scroll",
    () => {
      if (!headerWrapper) return;

      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;

      if (currentScrollY <= 15) {
        headerWrapper.classList.remove("hl-header-hidden");
        headerWrapper.classList.remove("hl-header-scrolled");
        lastScrollY = currentScrollY;
        return;
      }

      headerWrapper.classList.add("hl-header-scrolled");

      if (delta < -2) {
        headerWrapper.classList.remove("hl-header-hidden");
      } else if (delta > 2 && !mount.classList.contains("hl-menu-open")) {
        headerWrapper.classList.add("hl-header-hidden");
      }

      lastScrollY = currentScrollY;
    },
    { passive: true }
  );

  // 7. Logic Toggle Inline Search
  const inlineSearch = mount.querySelector("#hl-inline-search");
  const searchTrigger = mount.querySelector("#hl-search-trigger");
  const searchInput = mount.querySelector("#hl-search-input");
  const searchClear = mount.querySelector("#hl-search-clear");

  const closeSearch = () => {
    if (!inlineSearch) return;

    inlineSearch.classList.remove("is-open");

    if (searchInput) {
      searchInput.value = "";
    }

    if (searchClear) {
      searchClear.style.display = "none";
    }

    searchTrigger?.setAttribute("aria-label", "Open search");
  };

  const openSearch = () => {
    if (!inlineSearch) return;

    inlineSearch.classList.add("is-open");

    searchTrigger?.setAttribute("aria-label", "Close search");

    setTimeout(() => {
      searchInput?.focus();
    }, 180);
  };

  searchTrigger?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (inlineSearch.classList.contains("is-open")) {
      closeSearch();
    } else {
      openSearch();
    }
  });


  /* Hiện nút X khi có chữ */

  searchInput?.addEventListener("input", () => {
    if (!searchClear) return;

    searchClear.style.display =
      searchInput.value.length > 0 ? "flex" : "none";
  });


  /* Xóa chữ */

  searchClear?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (searchInput) {
      searchInput.value = "";
      searchInput.focus();
    }

    if (searchClear) {
      searchClear.style.display = "none";
    }
  });


  /* Click ra ngoài */

  document.addEventListener("click", (e) => {
    if (
      inlineSearch &&
      inlineSearch.classList.contains("is-open") &&
      !inlineSearch.contains(e.target)
    ) {
      closeSearch();
    }
  });


  /* ESC */

  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      inlineSearch?.classList.contains("is-open")
    ) {
      closeSearch();
    }
  });


});