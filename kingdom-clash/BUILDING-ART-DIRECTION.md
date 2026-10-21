# Kingdom Chess — Fantasy Building Art Direction

## Visual reference

Use the supplied fantasy-building concept image as the visual target: a collection of compact, polished, stylized 3D game buildings with chunky silhouettes, hand-painted textures, bevelled stone, layered timber, ornate roofs, warm glowing windows, small props, and grounded shadows.

## Non-negotiable art goals

- Preserve the detailed, toy-like 3D fantasy look; do not replace the building art with flat 2D geometric SVGs.
- Buildings should read clearly at small board scale, with a distinct silhouette and one memorable detail each.
- Use dimensional lighting, material highlights, contact shadows, textured stone/wood, and selective emissive glow.
- Keep buildings visually smaller than the chessboard and character/UI cards.
- Avoid a generic recolor-only approach: kingdom identity must affect architecture, props, surface materials, and environmental details.

## Kingdom identity

- **Farmer / harvest:** warm timber, thatch, stone foundations, crop bundles, grain, vines, windmill blades, orchard greenery.
- **Ice:** frosted blue stone, clear ice, snow caps, crystalline trim, cool shadows, cyan light, frozen accents.
- **Captain / beach:** weathered ship timber, rope, sails, anchors, coral, shells, tide pools, turquoise water accents, lantern light.
- **Medieval:** heavy stone, timber framing, banners, battlements, iron fittings, gold trim, warm torchlight.

## Existing implementation

`model-assets.js` defines the building atlas and `paintModel()` draws the atlas sprites for live battlefield entities. `art.js` routes building illustrations through `modelMarkup()` when an atlas model is available. Keep this detailed atlas rendering as the preferred path; only use code-drawn fallback art when an atlas sprite is unavailable.

`building-details.js` contains per-building tactical labels and personality. Those details should remain compatible with the battle engine and card UI.

## Acceptance checks

1. Building atlas sprites remain the preferred building rendering path.
2. Each kingdom's structures match its materials and environment.
3. No change to standard game rules or building gameplay effects is required just to change art direction.
4. Check card art and live battlefield miniatures separately after visual changes.
