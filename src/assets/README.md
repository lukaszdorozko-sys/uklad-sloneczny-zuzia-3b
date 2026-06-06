# Assets

Planet, moon, bump, normal and roughness surface details are generated in `src/utils/textures.ts`.
The app also loads selected local realistic WebP maps from `public/textures/real/` when available.

To replace procedural materials with NASA/ESA image maps later, place optimized texture files in `public/textures/real/` and update `REAL_TEXTURE_PATHS`.
