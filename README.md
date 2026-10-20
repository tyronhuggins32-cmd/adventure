# Kingdom Clash ⚔️

A free-to-play-in-your-browser fantasy tactical card battler. Battle against the Crimson Empire AI with a Kingdom Deck on a 16×16 battlefield. No account, installation, backend, or paid services needed.

## Play

**Website (after GitHub Pages is enabled and deployed):** https://tyronhuggins32-cmd.github.io/adventure/

Open the website on desktop or mobile. To run locally: run `npm start`, then open http://localhost:8000. Run `npm test` to check core strategy rules. Files are static HTML, CSS, and vanilla JavaScript modules, so no build step is required.

## How to play

1. Pick Farm, Ice, Beach, or Medieval Kingdom from the Kingdom Deck. Your chosen commander changes your half of the battlefield's terrain.
2. Tap a free square in the **bottom four rows** to place your Commander. The AI deploys its Commander on the other side, and each side gets a kingdom building.
3. Every turn, you have **two actions**. Select a character card to deploy a unit near your Commander or surviving building, or select a warrior already on the board to move or attack.
4. Each card costs gold; every turn you gain gold. Your Hay Field, Ice House, Dock, or Knight House provides income and unlocks tier 2 and 3 cards when upgraded. Protect it! You can rebuild a destroyed building when its square becomes clear.
5. Attacks fill the energy meter. At 100 energy, select a warrior and click **Power Attack** to hit a nearby enemy with a charged strike.
6. Defeat the enemy Commander to win. Your own Commander must survive.

| Kingdom | Commander | Building |
| --- | --- | --- |
| Farm | Harvest King | Hay Field |
| Ice | Frost Queen | Ice House |
| Beach | Tide Monarch | Dock |
| Medieval | Iron King | Knight House |

Each battlefield unit is displayed as a small animated character, while the full-size playable cards remain in the deck.

## Publishing on GitHub Pages

This repository includes `.github/workflows/pages.yml`, which deploys the website from `main` every time code is pushed.

**One-time setup (repo owner):**

1. Go to **Settings → Pages** in this repository.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. Open **Actions → Deploy Kingdom Clash** and check the latest deployment. If necessary, use **Run workflow**.
4. When the workflow succeeds, open https://tyronhuggins32-cmd.github.io/adventure/.

If Pages was not enabled before the workflow ran, selecting GitHub Actions and rerunning the workflow completes setup. GitHub may need a few minutes to publish the first deployment.

## Current scope

This is a playable single-player prototype with local browser AI, not online PvP. Animations are lightweight CSS, artwork is native emoji character sprites, and each half of the battlefield matches its commander's kingdom. More elaborate character animations, art, sound, and online multiplayer can be added later.
