(() => {
  const TITLE_SELECTOR = '.identity-name';
  const IDENT_SELECTOR = '.portfolio-ident';
  const SIGN_SELECTOR = '.identity-sign';
  const META_SELECTOR = '.identity-info';

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function debounce(fn, waitMs) {
    let timerId;
    return (...args) => {
      window.clearTimeout(timerId);
      timerId = window.setTimeout(() => fn(...args), waitMs);
    };
  }

  function sizeTitleToFitSignWidth() {
    const title = document.querySelector(TITLE_SELECTOR);
    const ident = document.querySelector(IDENT_SELECTOR);
    const sign = document.querySelector(SIGN_SELECTOR);
    if (!title || !ident || !sign) return;

    // If the sign is currently hidden (e.g. display:none), measurements are 0.
    if (sign.getBoundingClientRect().width <= 0) return;

    const MIN_PX = 22;
    const MAX_PX = 110;

    // Binary search for the largest font size that still fits within the sign width.
    let low = MIN_PX;
    let high = MAX_PX;
    let best = MIN_PX;

    // Preserve line-height from CSS; only set font-size.
    for (let i = 0; i < 12; i++) {
      const mid = Math.round((low + high) / 2);
      title.style.fontSize = `${mid}px`;

      // Use the ident column width as the available width for the title text.
      // (It is centered, so overflow is visually obvious.)
      const available = ident.clientWidth;
      const needed = title.scrollWidth;

      if (needed > available) {
        high = mid - 1;
        continue;
      }

      best = mid;
      low = mid + 1;
    }

    title.style.fontSize = `${clamp(best, MIN_PX, MAX_PX)}px`;

    // Fit the meta line (email/location) to the available width.
    const meta = ident.querySelector(META_SELECTOR);
    if (!meta) return;

    const META_MIN_PX = 12;
    const META_MAX_PX = 26;

    let metaLow = META_MIN_PX;
    let metaHigh = META_MAX_PX;
    let metaBest = META_MIN_PX;

    for (let i = 0; i < 11; i++) {
      const metaMid = Math.round((metaLow + metaHigh) / 2);
      ident.style.setProperty('--identity-meta-font-size', `${metaMid}px`);

      const metaAvailable = ident.clientWidth;
      const metaNeeded = meta.scrollWidth;

      if (metaNeeded > metaAvailable) {
        metaHigh = metaMid - 1;
        continue;
      }

      metaBest = metaMid;
      metaLow = metaMid + 1;
    }

    ident.style.setProperty(
      '--identity-meta-font-size',
      `${clamp(metaBest, META_MIN_PX, META_MAX_PX)}px`
    );
  }

  const schedule = debounce(sizeTitleToFitSignWidth, 80);

  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('load', () => sizeTitleToFitSignWidth());

  // Run ASAP for typical deferred-script loading.
  sizeTitleToFitSignWidth();
})();
