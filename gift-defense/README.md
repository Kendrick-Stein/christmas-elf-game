# 礼物仓保卫战 / Gift Depot Defense

An original short winter tactics game for the Pine & Snow arcade. Play at /gift-defense/ on the same static host. Use ./gift-defense/ for the home card.

Choose one of three lanes and buy a snow post (fast, poor against armor), a frost tower (slows groups), or a lantern tower (slow attack, pierces armor). Each lane has one slot; buying the current tower again upgrades it once, and a different tower replaces it. The cocoa stove builds or upgrades shared income, not a lane. Launch each wave when ready. The two star-bell charges are shared across waves and affect only active raiders. Hold as many waves as you can; every fifth wave is a milestone, not a finish. The next wave mixes routes and raider types using a fresh seed each run. Retry resets all towers, resources, and bells. Only the best number of cleared waves persists. All actions are buttons, including an explicit pause.

Graphics and logic are original; the Santa and Green Prankster sprites and audio are the arcade's existing original assets. Root dependencies: ../audio.js, ../assets/sprite-santa.svg, ../assets/sprite-green-mischief.svg, and the shared workshop track referenced by the audio helper. Language uses the arcade's snow-pine-language-v1 preference. No network or backend beyond static assets, and no change to existing game storage or gameplay.

Run node --test gift-defense/checks.cjs from the arcade root. This checks win/loss progression, affordability, armor counters, a mixed five-wave checkpoint strategy and multiple seeded routes, and the UI entry in a browser-compatible VM.
