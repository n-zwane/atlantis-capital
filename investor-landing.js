/**
 * Atlantis Connect — Investor Landing Page
 * investor-landing.js
 * Vanilla JS — no frameworks
 */

// ═══════════════════════════════════════════════════ INIT
document.addEventListener("DOMContentLoaded", () => {
    feather.replace({ "stroke-width": 1.75 });
    initNav();
    initScrollSpy();
    initAnimations();
    initCounters();
    initCharts();
    initProgressBars();
    initVideoControl();
    initMapTooltips();
    initTimeline();
});

// ═══════════════════════════════════════════════════ NAVIGATION
function initNav() {
    const nav = document.getElementById("invNav");
    const hamburger = document.getElementById("invHamburger");
    const overlay = document.getElementById("invMobileOverlay");

    // Scroll: solidify nav background
    window.addEventListener(
        "scroll",
        () => {
            nav.classList.toggle("scrolled", window.scrollY > 80);
        },
        { passive: true },
    );

    // Hamburger toggle
    hamburger.addEventListener("click", () => {
        const open = hamburger.classList.toggle("open");
        overlay.classList.toggle("open", open);
        hamburger.setAttribute("aria-expanded", open);
        overlay.setAttribute("aria-hidden", !open);
        document.body.style.overflow = open ? "hidden" : "";
    });

    // Close overlay on escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && overlay.classList.contains("open")) {
            closeMobileNav();
        }
    });

    // Close overlay when clicking outside the drawer
    document.addEventListener("click", (e) => {
        const nav = document.getElementById("invNav");
        const isInsideNav = nav && nav.contains(e.target);
        const isInsideOverlay = overlay.contains(e.target);
        if (
            !isInsideNav &&
            !isInsideOverlay &&
            overlay.classList.contains("open")
        ) {
            closeMobileNav();
        }
    });
}

function closeMobileNav() {
    const hamburger = document.getElementById("invHamburger");
    const overlay = document.getElementById("invMobileOverlay");
    hamburger.classList.remove("open");
    overlay.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

// ═══════════════════════════════════════════════════ SCROLL SPY
function initScrollSpy() {
    const sections = ["story", "data", "sustainability", "opportunity", "zone"];
    const links = document.querySelectorAll(".inv-nav-link");

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    links.forEach((l) => {
                        l.classList.toggle(
                            "active",
                            l.getAttribute("data-section") === id,
                        );
                    });
                }
            });
        },
        { rootMargin: "-40% 0px -40% 0px", threshold: 0 },
    );

    sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
    });
}

// ═══════════════════════════════════════════════════ SCROLL ANIMATIONS
function initAnimations() {
    const els = document.querySelectorAll(".animate-up");
    if (!els.length) return;

    const isReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;
    if (isReduced) {
        els.forEach((el) => el.classList.add("in-view"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    // Stagger siblings
                    const siblings =
                        entry.target.parentElement?.querySelectorAll(
                            ".animate-up",
                        );
                    let delay = 0;
                    if (siblings && siblings.length > 1) {
                        siblings.forEach((sib, idx) => {
                            if (sib === entry.target) delay = idx * 80;
                        });
                    }
                    setTimeout(
                        () => entry.target.classList.add("in-view"),
                        delay,
                    );
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );

    els.forEach((el) => observer.observe(el));
}

// ═══════════════════════════════════════════════════ COUNTING ANIMATIONS
function initCounters() {
    const counters = document.querySelectorAll("[data-target]");
    if (!counters.length) return;

    const isReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;
    if (isReduced) {
        counters.forEach((el) => {
            const target = parseFloat(el.getAttribute("data-target"));
            const prefix = el.getAttribute("data-prefix") || "";
            const suffix = el.getAttribute("data-suffix") || "";
            el.textContent =
                prefix +
                (Number.isInteger(target) ? target.toLocaleString() : target) +
                suffix;
        });
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = parseFloat(el.getAttribute("data-target"));
                const prefix = el.getAttribute("data-prefix") || "";
                const suffix = el.getAttribute("data-suffix") || "";
                const isFloat = !Number.isInteger(target);
                const duration = 1800;
                const start = performance.now();

                function update(now) {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
                    const current = eased * target;
                    el.textContent =
                        prefix +
                        (isFloat
                            ? current.toFixed(1)
                            : Math.floor(current).toLocaleString()) +
                        suffix;
                    if (progress < 1) requestAnimationFrame(update);
                    else
                        el.textContent =
                            prefix +
                            (isFloat
                                ? target.toFixed(1)
                                : target.toLocaleString()) +
                            suffix;
                }

                requestAnimationFrame(update);
                observer.unobserve(el);
            });
        },
        { threshold: 0.5 },
    );

    counters.forEach((el) => observer.observe(el));
}

// ═══════════════════════════════════════════════════ CHARTS
let chartsInitialised = false;

function initCharts() {
    const chartSection = document.getElementById("data");
    if (!chartSection) return;

    const observer = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting && !chartsInitialised) {
                chartsInitialised = true;
                renderCharts();
                observer.unobserve(chartSection);
            }
        },
        { threshold: 0.15 },
    );

    observer.observe(chartSection);
}

function renderCharts() {
    const darkPalette = {
        teal: "#0f9f68",
        tealMid: "#0c7a50",
        tealDim: "#084a30",
        amber: "#fbbf24",
        amberDim: "#92400e",
        blue: "#3b82f6",
        slate: "rgba(255,255,255,0.1)",
        text: "rgba(255,255,255,0.5)",
        grid: "rgba(255,255,255,0.05)",
    };

    const chartDefaults = {
        color: "rgba(255,255,255,0.7)",
        font: { family: "Inter", size: 11 },
    };

    Chart.defaults.color = chartDefaults.color;
    Chart.defaults.font.family = chartDefaults.font.family;
    Chart.defaults.font.size = chartDefaults.font.size;

    // ── Placement by sector (bar)
    const placementCtx = document.getElementById("placementChart");
    if (placementCtx) {
        new Chart(placementCtx, {
            type: "bar",
            data: {
                labels: [
                    "Solar & Wind Mfg",
                    "Green Construction",
                    "Electrical & Mech",
                    "Logistics",
                    "Business Svcs",
                ],
                datasets: [
                    {
                        data: [412, 284, 231, 198, 122],
                        backgroundColor: [
                            darkPalette.teal,
                            darkPalette.tealMid,
                            darkPalette.tealMid,
                            darkPalette.tealDim,
                            darkPalette.tealDim,
                        ],
                        borderRadius: 4,
                        borderSkipped: false,
                    },
                ],
            },
            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false, // Obeys CSS wrap heights perfectly now
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: { label: (ctx) => ` ${ctx.raw} placements` },
                    },
                },
                scales: {
                    x: {
                        grid: { color: darkPalette.grid },
                        ticks: { color: darkPalette.text },
                    },
                    y: {
                        grid: { display: false },
                        ticks: { color: "rgba(255,255,255,0.7)" },
                    },
                },
                animation: { duration: 1200, easing: "easeOutQuart" },
            },
        });
    }

    // ── Residency donut
    const residencyCtx = document.getElementById("residencyChart");
    if (residencyCtx) {
        new Chart(residencyCtx, {
            type: "doughnut",
            data: {
                datasets: [
                    {
                        data: [73, 27],
                        backgroundColor: [
                            darkPalette.teal,
                            "rgba(255,255,255,0.1)",
                        ],
                        borderColor: "transparent",
                        borderWidth: 0,
                        hoverOffset: 4,
                    },
                ],
            },
            options: {
                cutout: "72%",
                responsive: true, // Switched to true to scale on mobile viewports safely
                maintainAspectRatio: true, // Keeps circles circular
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false },
                },
                animation: {
                    animateRotate: true,
                    duration: 1400,
                    easing: "easeOutQuart",
                },
            },
        });
    }

    // ── SMME sector donut
    const smmeCtx = document.getElementById("smmeChart");
    if (smmeCtx) {
        new Chart(smmeCtx, {
            type: "doughnut",
            data: {
                labels: [
                    "Green Mfg",
                    "Construction",
                    "Electrical",
                    "Logistics",
                    "Services",
                ],
                datasets: [
                    {
                        data: [34, 22, 18, 14, 12],
                        backgroundColor: [
                            darkPalette.teal,
                            darkPalette.tealMid,
                            darkPalette.tealDim,
                            darkPalette.amber,
                            "rgba(255,255,255,0.2)",
                        ],
                        borderColor: "rgba(26,35,50,0.5)",
                        borderWidth: 2,
                        hoverOffset: 6,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "55%",
                plugins: {
                    legend: {
                        position: "right",
                        labels: {
                            boxWidth: 10,
                            padding: 12,
                            color: "rgba(255,255,255,0.6)",
                            font: { size: 11 },
                        },
                    },
                },
                animation: {
                    animateRotate: true,
                    duration: 1400,
                    easing: "easeOutQuart",
                },
            },
        });
    }

    // ── Skills completions (horizontal bar)
    const skillsCtx = document.getElementById("skillsChart");
    if (skillsCtx) {
        new Chart(skillsCtx, {
            type: "bar",
            data: {
                labels: [
                    "Solar PV",
                    "Electrical Systems",
                    "CNC/Automation",
                    "Green Construction",
                    "Digital Skills",
                ],
                datasets: [
                    {
                        data: [348, 287, 214, 176, 143],
                        backgroundColor: [
                            darkPalette.amber,
                            darkPalette.teal,
                            darkPalette.tealMid,
                            darkPalette.tealDim,
                            "rgba(255,255,255,0.15)",
                        ],
                        borderRadius: 4,
                        borderSkipped: false,
                    },
                ],
            },
            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => ` ${ctx.raw} completions`,
                        },
                    },
                },
                scales: {
                    x: {
                        grid: { color: darkPalette.grid },
                        ticks: { color: darkPalette.text },
                    },
                    y: {
                        grid: { display: false },
                        ticks: { color: "rgba(255,255,255,0.7)" },
                    },
                },
                animation: { duration: 1200, easing: "easeOutQuart" },
            },
        });
    }
}

// ═══════════════════════════════════════════════════ PROGRESS BARS
function initProgressBars() {
    const bars = document.querySelectorAll(
        ".inv-progress-fill, .inv-bench-fill",
    );
    if (!bars.length) return;

    const isReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;
    if (isReduced) {
        bars.forEach((bar) => {
            bar.style.width = (bar.getAttribute("data-width") || "0") + "%";
        });
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const target = bar.getAttribute("data-width") || "0";
                    requestAnimationFrame(() => {
                        bar.style.width = target + "%";
                    });
                    observer.unobserve(bar);
                }
            });
        },
        { threshold: 0.5 },
    );

    bars.forEach((bar) => observer.observe(bar));
}

// ═══════════════════════════════════════════════════ VIDEO CONTROL
function initVideoControl() {
    const video = document.querySelector(".inv-hero-video");
    const pauseBtn = document.getElementById("videoPauseBtn");
    if (!video || !pauseBtn) return;

    let paused = false;

    pauseBtn.addEventListener("click", () => {
        paused = !paused;
        if (paused) {
            video.pause();
            pauseBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><polygon points="5,3 19,12 5,21"/></svg>`;
            pauseBtn.setAttribute("aria-label", "Play background video");
        } else {
            video.play();
            pauseBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
            pauseBtn.setAttribute("aria-label", "Pause background video");
        }
    });

    // Respect reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        video.pause();
        paused = true;
    }
}

// ═══════════════════════════════════════════════════ MAP TOOLTIPS
function initMapTooltips() {
    const plots = document.querySelectorAll(".inv-map-plot");
    const tooltip = document.getElementById("mapTooltip");
    const mapWrap = document.getElementById("zoneMap");
    if (!plots.length || !tooltip || !mapWrap) return;

    plots.forEach((plot) => {
        plot.addEventListener("mouseenter", (e) => {
            const name = plot.getAttribute("data-name");
            const status = plot.getAttribute("data-status");
            const size = plot.getAttribute("data-size");
            tooltip.innerHTML = `<strong>${name}</strong><br/><span style="color:rgba(255,255,255,0.6);font-size:0.75rem;">${status} · ${size}</span>`;
            tooltip.style.display = "block";
        });

        plot.addEventListener("mousemove", (e) => {
            const rect = mapWrap.getBoundingClientRect();
            const x = e.clientX - rect.left + 12;
            const y = e.clientY - rect.top + 12;
            tooltip.style.left = x + "px";
            tooltip.style.top = y + "px";
        });

        plot.addEventListener("mouseleave", () => {
            tooltip.style.display = "none";
        });
    });
}

// ═══════════════════════════════════════════════════ TIMELINE ANIMATION
// ═══════════════════════════════════════════════════ TIMELINE ANIMATION (AUTO-SCROLL)
function initTimeline() {
    const timeline = document.getElementById("zoneTimeline");
    if (!timeline) return;

    const isReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;

    // 1. Entrance Fade-in Animations
    const items = timeline.querySelectorAll(".inv-tl-item");
    const observer = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting) {
                items.forEach((item, i) => {
                    setTimeout(() => {
                        item.style.opacity = item.classList.contains(
                            "projected",
                        )
                            ? "0.6"
                            : "1";
                        item.style.transform = "translateY(0)";
                    }, i * 120);
                });
                observer.unobserve(timeline);
            }
        },
        { threshold: 0.2 },
    );

    items.forEach((item) => {
        item.style.opacity = "0";
        item.style.transform = "translateY(12px)";
        item.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    });

    observer.observe(timeline);

    // 2. Automated Horizontal Scroll Engine
    if (isReduced) return; // Halt automation for motion-sensitive users

    let scrollInterval = setInterval(autoAdvanceTimeline, 5000); // 5s Interval

    function autoAdvanceTimeline() {
        const firstItem = timeline.querySelector(".inv-tl-item");
        if (!firstItem) return;

        // Calculate exact track card step size (card layout width + column gap)
        const itemWidth = firstItem.getBoundingClientRect().width;
        const computedGap =
            parseFloat(window.getComputedStyle(timeline).gap) || 24;
        const stepSize = itemWidth + computedGap;

        const currentScroll = timeline.scrollLeft;
        const maxScroll = timeline.scrollWidth - timeline.clientWidth;

        // Safety check: if content doesn't overflow, don't attempt to scroll
        if (maxScroll <= 0) return;

        // If at or very near the end of the track, loop smoothly back to start
        if (currentScroll >= maxScroll - 15) {
            timeline.scrollTo({
                left: 0,
                behavior: "smooth",
            });
        } else {
            // Otherwise, advance by exactly one track column step
            timeline.scrollTo({
                left: currentScroll + stepSize,
                behavior: "smooth",
            });
        }
    }

    // 3. UX Safety Net: Pause ONLY when a human explicitly touches/interacts with the track
    let userInteractionTimeout;

    function handleUserInteraction() {
        clearInterval(scrollInterval);
        clearTimeout(userInteractionTimeout);

        // Resume auto-scrolling only after 15 seconds of total human radio silence
        userInteractionTimeout = setTimeout(() => {
            scrollInterval = setInterval(autoAdvanceTimeline, 5000);
        }, 15000);
    }

    // Listen directly to physical inputs, preventing the auto-scroll from tripping itself
    timeline.addEventListener("wheel", handleUserInteraction, {
        passive: true,
    });
    timeline.addEventListener("mousedown", handleUserInteraction, {
        passive: true,
    });
    timeline.addEventListener("touchstart", handleUserInteraction, {
        passive: true,
    });
}

// ═══════════════════════════════════════════════════ LOGIN PANEL
function toggleLoginPanel() {
    const form = document.getElementById("loginForm");
    const chevron = document.getElementById("loginChevron");
    const isHidden = form.style.display === "none" || !form.style.display;

    if (isHidden) {
        form.style.display = "block";
        form.style.opacity = "0";
        requestAnimationFrame(() => {
            form.style.transition = "opacity 0.3s ease";
            form.style.opacity = "1";
        });
        chevron.classList.add("rotated");
    } else {
        form.style.opacity = "0";
        setTimeout(() => {
            form.style.display = "none";
        }, 300);
        chevron.classList.remove("rotated");
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail");
    const password = document.getElementById("loginPassword");
    const emailErr = document.getElementById("loginEmailErr");
    const passErr = document.getElementById("loginPassErr");
    let valid = true;

    emailErr.textContent = "";
    passErr.textContent = "";
    email.classList.remove("error");
    password.classList.remove("error");

    if (!email.value.includes("@")) {
        emailErr.textContent = "Please enter a valid email address.";
        email.classList.add("error");
        valid = false;
    }
    if (password.value.length < 6) {
        passErr.textContent = "Password must be at least 6 characters.";
        password.classList.add("error");
        valid = false;
    }
    if (valid) {
        // Prototype: redirect to portal
        window.location.href = "portal.html";
    }
}

// ═══════════════════════════════════════════════════ CONTACT MODAL
function openContactModal(prefill) {
    const modal = document.getElementById("contactModal");
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
    if (prefill) {
        const messageField = document.getElementById("cfMessage");
        if (messageField)
            messageField.value = `I am interested in ${prefill} at the Atlantis SEZ. Please send me further details.`;
    }
    // Only replace feather icons that haven't been replaced yet to avoid duplicates
    modal.querySelectorAll("[data-feather]").forEach((el) => {
        feather.replace({ "stroke-width": 1.75 });
    });
}

function closeContactModal() {
    const modal = document.getElementById("contactModal");
    modal.style.display = "none";
    document.body.style.overflow = "";
}

// Close on overlay click
document.getElementById("contactModal")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeContactModal();
});

function openContactForm(opportunity) {
    openContactModal(opportunity);
}

function submitContactForm(e) {
    e.preventDefault();
    const name = document.getElementById("cfName");
    const email = document.getElementById("cfEmail");
    const message = document.getElementById("cfMessage");
    const nameErr = document.getElementById("cfNameErr");
    const emailErr = document.getElementById("cfEmailErr");
    const messageErr = document.getElementById("cfMessageErr");

    [nameErr, emailErr, messageErr].forEach((el) => (el.textContent = ""));
    [name, email, message].forEach((el) => el.classList.remove("error"));

    let valid = true;
    if (name.value.trim().length < 2) {
        nameErr.textContent = "Please enter your full name.";
        name.classList.add("error");
        valid = false;
    }
    if (!email.value.includes("@")) {
        emailErr.textContent = "Please enter a valid email.";
        email.classList.add("error");
        valid = false;
    }
    if (message.value.trim().length < 10) {
        messageErr.textContent = "Please provide a brief message.";
        message.classList.add("error");
        valid = false;
    }

    if (valid) {
        const btn = e.target.querySelector("[type=submit]");
        btn.textContent = "Sending…";
        btn.disabled = true;
        setTimeout(() => {
            closeContactModal();
            showToast(
                "Your enquiry has been sent. The ASEZCo investment team will be in touch within two business days.",
            );
            e.target.reset();
            btn.textContent = "Send Enquiry";
            btn.disabled = false;
        }, 1200);
    }
}

// ═══════════════════════════════════════════════════ TOAST
function showToast(message) {
    const toast = document.createElement("div");
    toast.textContent = message;
    Object.assign(toast.style, {
        position: "fixed",
        bottom: "2rem",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(15,159,104,0.95)",
        color: "#fff",
        padding: "1rem 1.75rem",
        borderRadius: "10px",
        fontFamily: "Inter, -apple-system, sans-serif",
        fontSize: "0.9rem",
        fontWeight: "500",
        maxWidth: "480px",
        textAlign: "center",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        zIndex: "9999",
        opacity: "0",
        transition: "opacity 0.3s ease, transform 0.3s ease",
        backdropFilter: "blur(8px)",
    });
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateX(-50%) translateY(-4px)";
    });
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(-50%) translateY(0)";
        setTimeout(() => document.body.removeChild(toast), 400);
    }, 5000);
}

// ═══════════════════════════════════════════════════ CSV EXPORT
const CSV_DATA = {
    employment: {
        filename: "atlantis-employment-data.csv",
        headers: ["Metric", "Value"],
        rows: [
            ["Total Registered Job Seekers", "3842"],
            ["Total Placements Facilitated", "1247"],
            ["Youth (Under 35) Percentage", "68%"],
            ["Local Hire Rate (Atlantis Residents)", "73%"],
            ["Average Time to First Placement", "6.2 weeks"],
            ["Solar & Wind Manufacturing Placements", "412"],
            ["Green Construction Placements", "284"],
            ["Electrical & Mechanical Placements", "231"],
            ["Logistics Placements", "198"],
            ["Business Services Placements", "122"],
        ],
    },
    smme: {
        filename: "atlantis-smme-data.csv",
        headers: ["Metric", "Value"],
        rows: [
            ["Total Registered SMMEs", "284"],
            ["Local Procurement Value (12 months)", "R142,000,000"],
            ["Businesses Formalised with Platform Support", "89"],
            ["Total Procurement Contracts Facilitated", "1840+"],
            ["Unique Employer-SMME Relationships", "612"],
            ["Green Manufacturing SMME Share", "34%"],
            ["Construction SMME Share", "22%"],
            ["Electrical SMME Share", "18%"],
        ],
    },
    skills: {
        filename: "atlantis-skills-data.csv",
        headers: ["Metric", "Value"],
        rows: [
            ["Active Training Programmes", "38"],
            ["Total Enrolments", "2140"],
            ["Impact Passports Issued", "1684"],
            ["Graduate Placement Rate", "74%"],
            ["Solar PV Completions", "348"],
            ["Electrical Systems Completions", "287"],
            ["CNC/Automation Completions", "214"],
            ["Green Construction Completions", "176"],
            ["Digital Skills Completions", "143"],
        ],
    },
    zone: {
        filename: "atlantis-zone-data.csv",
        headers: ["Metric", "Value"],
        rows: [
            ["Companies Established in Zone", "47"],
            ["Total Committed Investment", "R8,200,000,000"],
            ["Projected Direct Jobs at Full Build-Out", "12400"],
            ["Development-Ready Land Available (ha)", "89"],
            ["Active Construction Projects", "11"],
            ["Renewable Energy Capacity (current)", "84 MW"],
            ["Renewable Energy Target", "120 MW"],
            ["Land Utilised (ha)", "62"],
        ],
    },
};

function exportCSV(key) {
    const data = CSV_DATA[key];
    if (!data) return;
    const rows = [data.headers, ...data.rows]
        .map((r) => r.map((c) => `"${c}"`).join(","))
        .join("\n");
    const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = data.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function downloadReport(e) {
    if (e) e.preventDefault();
    // In production this would link to a real PDF.
    // For prototype, show a toast indicating this would download.
    showToast(
        "Downloading the ASEZCo Annual Impact Report (2026). In production, this links to a pre-generated PDF.",
    );
}
