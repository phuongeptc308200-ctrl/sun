"use strict";

document.documentElement.classList.add("js-enabled");

const revealElements = document.querySelectorAll(
  ".section-heading, .story-copy, .interactive-label, .journey__feature, .milestone-timeline__header, .tl-item, .network-map, .network__feature, .wings__image, .flight-experience, .ambassadors__visual, .ecosystem__quote, .ecosystem__closing",
);

revealElements.forEach((element, index) => {
  element.classList.add("scroll-reveal");
  element.style.setProperty("--reveal-delay", `${(index % 3) * 70}ms`);
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

document.querySelectorAll(".timeline").forEach((timeline) => {
  const items = timeline.querySelectorAll(".tl-item");

  items.forEach((item) => {
    const card = item.querySelector(".tl-card");

    card.addEventListener("click", () => {
      const willActivate = !item.classList.contains("is-active");

      items.forEach((otherItem) => {
        const otherCard = otherItem.querySelector(".tl-card");
        const isSelected = otherItem === item && willActivate;

        otherItem.classList.toggle("is-active", isSelected);
        otherCard.setAttribute("aria-pressed", String(isSelected));
      });
    });
  });
});

document.querySelectorAll("[data-flight-tabs]").forEach((tabs) => {
  const buttons = tabs.querySelectorAll("[data-flight-target]");
  const panels = tabs.querySelectorAll(".flight-panel");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.flightTarget;

      buttons.forEach((item) => {
        item.setAttribute("aria-selected", String(item === button));
      });

      panels.forEach((panel) => {
        const isActive = panel.id === targetId;
        panel.hidden = !isActive;
        panel.classList.toggle("is-active", isActive);

        if (isActive && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          panel.animate(
            [
              { opacity: 0, transform: "translateY(12px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            { duration: 420, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
          );
        }
      });
    });
  });
});

/* ============ AVIATION STATISTICS ============ */
(() => {
  const cards = document.querySelectorAll(".aviation-stats__card");
  if (!cards.length) return;

  const easeOutExpo = (value) => (value === 1 ? 1 : 1 - Math.pow(2, -10 * value));

  const formatValue = (value, element) => {
    const decimals = Number(element.dataset.decimals || 0);
    const fixed = Number(value).toFixed(decimals);

    if (element.dataset.format === "vi-decimal") {
      return Number(fixed).toLocaleString("vi-VN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    }

    return fixed;
  };

  const animateCount = (element, duration = 1600) => {
    if (element.dataset.done === "1") return;
    element.dataset.done = "1";

    const target = Number(element.dataset.target || 0);
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      element.textContent = formatValue(target * easeOutExpo(progress), element);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const showCard = (card, index = 0) => {
    window.setTimeout(() => {
      card.classList.add("is-visible");
      card.querySelectorAll(".aviation-count").forEach((counter, counterIndex) => {
        window.setTimeout(() => animateCount(counter), counterIndex * 80);
      });
    }, (index % 2) * 90);
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          showCard(entry.target, Array.from(cards).indexOf(entry.target));
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" },
    );

    cards.forEach((card) => observer.observe(card));
  } else {
    cards.forEach(showCard);
  }
})();


/* ============ INTEGRATED ROUTE MAP ============ */
(function () {
    const mapRoot = document.querySelector('.network-map');
    if (!mapRoot) return;

    const tabs = Array.from(mapRoot.querySelectorAll('.tab-button'));
    const panels = Array.from(mapRoot.querySelectorAll('[role="tabpanel"]'));

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activateTab(tab));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const next = tabs[(index + direction + tabs.length) % tabs.length];
        activateTab(next);
        next.focus();
      });
    });

    function activateTab(activeTab) {
      tabs.forEach(tab => tab.setAttribute('aria-selected', String(tab === activeTab)));
      panels.forEach(panel => { panel.hidden = panel.id !== activeTab.dataset.tab; });
    }

    mapRoot.querySelectorAll('.route').forEach(path => {
      const length = path.getTotalLength();
      path.style.setProperty('--route-length', length);
      path.style.strokeDasharray = length + ' ' + length;
      path.style.strokeDashoffset = length;
    });

    mapRoot.querySelectorAll('.map-card').forEach(card => {
      const routes = Array.from(card.querySelectorAll('.route'));
      const links = Array.from(card.querySelectorAll('.route-link'));

      function clearHighlight() {
        routes.forEach(route => route.classList.remove('is-active', 'is-dimmed'));
        links.forEach(link => link.classList.remove('is-active'));
      }

      function highlight(routeId) {
        routes.forEach(route => {
          route.classList.toggle('is-active', route.id === routeId);
          route.classList.toggle('is-dimmed', route.id !== routeId);
        });
        links.forEach(link => link.classList.toggle('is-active', link.dataset.route === routeId));
      }

      links.forEach(link => {
        link.addEventListener('mouseenter', () => highlight(link.dataset.route));
        link.addEventListener('focus', () => highlight(link.dataset.route));
        link.addEventListener('mouseleave', clearHighlight);
        link.addEventListener('blur', clearHighlight);
      });

      routes.forEach(route => {
        route.addEventListener('mouseenter', () => highlight(route.id));
        route.addEventListener('mouseleave', clearHighlight);
      });
    });
  })();
