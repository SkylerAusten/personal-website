(() => {
  const ISLAND_CLASS = "tile-island";
  const BLOCK_CLASS = "tile-island-block";
  const TILE_PX = 8;

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function clearIslands(container) {
    const existing = container.querySelectorAll(`.${ISLAND_CLASS}`);
    for (const el of existing) el.remove();
  }

  function key(x, y) {
    return `${x},${y}`;
  }

  function growIslandTiles(targetCount) {
    // Creates a jagged cluster by repeatedly adding neighbor tiles.
    const tiles = new Map();
    const order = [];

    let x = 0;
    let y = 0;
    tiles.set(key(x, y), { x, y });
    order.push({ x, y });

    const dirs = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ];

    while (order.length < targetCount) {
      // Bias growth toward the most recently added tile to create juts.
      const useTail = Math.random() < 0.65;
      const anchor = useTail
        ? order[order.length - 1]
        : order[randInt(0, order.length - 1)];

      const { dx, dy } = dirs[randInt(0, dirs.length - 1)];
      const nx = anchor.x + dx;
      const ny = anchor.y + dy;
      const k = key(nx, ny);
      if (tiles.has(k)) continue;

      tiles.set(k, { x: nx, y: ny });
      order.push({ x: nx, y: ny });
    }

    return order;
  }

  function createIsland(container, gridW, gridH) {
    // Choose island size in tiles.
    const areaTiles = gridW * gridH;
    const minTiles = clamp(Math.round(areaTiles * 0.004), 20, 60);
    const maxTiles = clamp(Math.round(areaTiles * 0.018), 80, 260);
    const tileCount = randInt(minTiles, maxTiles);

    const tiles = growIslandTiles(tileCount);

    // Compute bounding box in tile coords.
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const t of tiles) {
      minX = Math.min(minX, t.x);
      minY = Math.min(minY, t.y);
      maxX = Math.max(maxX, t.x);
      maxY = Math.max(maxY, t.y);
    }

    const islandW = (maxX - minX + 1) * TILE_PX;
    const islandH = (maxY - minY + 1) * TILE_PX;

    // Place island on the viewport tile grid with slight offscreen bleed.
    const bleedTiles = 6;
    const pxLeft = randInt(-bleedTiles, gridW - (maxX - minX + 1) + bleedTiles) * TILE_PX;
    const pxTop = randInt(-bleedTiles, gridH - (maxY - minY + 1) + bleedTiles) * TILE_PX;

    const island = document.createElement("div");
    island.className = ISLAND_CLASS;
    island.setAttribute("aria-hidden", "true");
    island.style.left = `${pxLeft}px`;
    island.style.top = `${pxTop}px`;
    island.style.width = `${islandW}px`;
    island.style.height = `${islandH}px`;

    for (const t of tiles) {
      const block = document.createElement("div");
      block.className = BLOCK_CLASS;
      block.style.left = `${(t.x - minX) * TILE_PX}px`;
      block.style.top = `${(t.y - minY) * TILE_PX}px`;
      island.appendChild(block);
    }

    container.appendChild(island);
  }

  function generateIslands(container) {
    if (!container) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gridW = Math.ceil(vw / TILE_PX);
    const gridH = Math.ceil(vh / TILE_PX);

    clearIslands(container);

    // Density: scale by viewport area, but keep it modest.
    const area = vw * vh;
    const count = clamp(Math.round(area / 220000), 5, 14);

    for (let i = 0; i < count; i++) {
      createIsland(container, gridW, gridH);
    }
  }

  function debounce(fn, waitMs) {
    let timeoutId;
    return (...args) => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => fn(...args), waitMs);
    };
  }

  document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".page");
    generateIslands(container);

    // Expose a tiny hook for UI buttons.
    window.regenerateIslands = () => generateIslands(container);

    const seasonToTile = {
      winter: 'url("./images/spring - dark.png")',
      spring: 'url("./images/spring-light-center.png")',
      summer: 'url("./images/spring.png")',
      fall: 'url("./images/spring path - dark.png")',
    };

    const controls = document.querySelector(".season-buttons");
    if (controls) {
      controls.addEventListener("click", (e) => {
        const target = e.target;
        if (!(target instanceof HTMLElement)) return;

        const action = target.getAttribute("data-action");
        if (action === "refresh") {
          generateIslands(container);
          return;
        }

        const season = target.getAttribute("data-season");
        if (!season || !(season in seasonToTile)) return;
        document.documentElement.style.setProperty("--tile-image", seasonToTile[season]);
      });
    }

    window.addEventListener(
      "resize",
      debounce(() => generateIslands(container), 150)
    );
  });
})();
