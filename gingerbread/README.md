# 姜饼屋 / Gingerbread Builder

This static, bilingual page occupies `/gingerbread/` and uses the existing `snow-pine-language-v1` preference. It retains the V12 actual game geometry; its only new gameplay-adjacent features are the finale, locale, and share UI.

To quickly see the finale, leave the cart centered until the arch attaches (~4.5 seconds). Move all the way right, wait for the cart to reach the edge, then hold Drop until three misses. For a four-piece house with both windows, roof beam, seam wafer and frosting, leave the cart centered for about 26 seconds before moving to the edge. On losing all hearts the exact retained shape remains throughout the movie and the share PNG. Escape/Skip goes straight to the same result; reduced-motion preference skips automatically. Saved PNG is local; a file-share fallback downloads it. Canonical QR/link: https://kendrick-stein.github.io/christmas-elf-game/gingerbread/.

QA: `node gingerbread/checks.cjs` (invariants, app control wiring, locale, skip/save/share) and `node --test tests/*.test.js workshop/tests/*.test.js` (existing modes).
