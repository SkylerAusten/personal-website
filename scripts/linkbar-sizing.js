(() => {
  function debounce(fn, waitMs) {
    let timeoutId;
    return (...args) => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => fn(...args), waitMs);
    };
  }

  function fitLinkbar(linkbar) {
    if (!linkbar) return;

    // Reset to stylesheet defaults so it can grow again on larger screens.
    linkbar.style.removeProperty("--linkbar-font-size");
    linkbar.style.removeProperty("--linkbar-gap");
    linkbar.style.removeProperty("--linkbar-link-pad-x");

    // Prefer sizing up (when space allows), then shrink to fit.
    // This keeps the navbar from getting stuck at a tiny size after a narrow resize.
    const preferredFontSize = 24;
    const preferredGap = 12;

    linkbar.querySelector(".linkbar-link");
    const preferredPadX = 8;

    let fontSize = preferredFontSize;
    let gap = preferredGap;
    let padX = preferredPadX;

    const minFontSize = 12;
    const minGap = 2;
    const minPadX = 1;

    const apply = () => {
      linkbar.style.setProperty("--linkbar-font-size", `${fontSize}px`);
      linkbar.style.setProperty("--linkbar-gap", `${gap}px`);
      linkbar.style.setProperty("--linkbar-link-pad-x", `${padX}px`);
    };

    const overflows = () => linkbar.scrollWidth - linkbar.clientWidth > 1;

    apply();

    let i = 0;
    while (overflows() && i < 120) {
      if (padX > minPadX) {
        padX = Math.max(minPadX, padX - 0.5);
      } else if (gap > minGap) {
        gap = Math.max(minGap, gap - 0.5);
      } else if (fontSize > minFontSize) {
        fontSize = Math.max(minFontSize, fontSize - 0.5);
      } else {
        break;
      }
      apply();
      i++;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const linkbar = document.querySelector(".linkbar");
    if (linkbar) {
      const doFit = () => fitLinkbar(linkbar);
      doFit();

      if ("ResizeObserver" in window) {
        const ro = new ResizeObserver(() => doFit());
        ro.observe(linkbar);
      }

      window.addEventListener("resize", debounce(doFit, 50));
    }
  });
})();
