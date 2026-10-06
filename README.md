# The Home Bar

A local, touch-friendly drink matcher for Windows, Linux (including Omarchy), and modern Android browsers. No accounts, paid services, network recipe lookup, or third-party JavaScript dependencies. Includes the 264 cocktail notes already collected for this project and the 29 photographed inventory products.

## Run on Omarchy / Linux

Clone or copy the project, open a terminal in its root folder, and check `node --version`. Node.js 20 or later is required. The app has no third-party packages to install, so `npm install` is unnecessary.

If Node.js is missing, the Arch package is [nodejs](https://archlinux.org/packages/extra/x86_64/nodejs/):

```sh
sudo pacman -Syu --needed nodejs
```

Start the local server:

```sh
node scripts/serve.mjs
```

Open **http://localhost:4173** in your browser. Keep the terminal open; Ctrl+C stops the server. Alternatively, `sh scripts/start.sh` runs the same server and also works when invoked by its path from another directory. It accepts server arguments, for example `sh scripts/start.sh --lan --port=4174` for a tablet on your home Wi-Fi.

The Windows `.cmd` launchers are optional conveniences. Linux uses the system Node.js installation; the project does not require Codex or the Windows Node runtime.

## Example inventory and moving saved stock

[data/example-inventory.json](data/example-inventory.json) is an importable copy of the 28 stocked types displayed at `http://localhost:4173` in the Codex in-app browser on October 6, 2026. It matches the photographed seed inventory. The remaining 155 ingredient types were unconfirmed and are omitted, preserving that state.

On the new machine, open **Inventory → Import stock**, select `data/example-inventory.json` from the checkout, and confirm the import. This replaces stock in that browser. A fresh browser already starts with the photographed seed inventory, but importing the file explicitly restores this saved example.

Each browser and URL has separate saved stock and settings. This example does not include changes saved in another browser or through another URL, such as the tablet's LAN address. To transfer those changes, export stock from that specific browser and import that export on Linux. Keep later personal backups in `data/inventory-backups/`, which Git ignores; copy or export them separately when moving machines.

The inventory photos are included in [docs/inventory/](docs/inventory/). The app and its standard build use the bundled recipe snapshot; the original Obsidian vault is needed only to import newer notes. The historical `COCKTAIL-MATCHES.md` report retains links to its original Windows vault location.

## Add to Git and continue development

For the first commit in this project's existing Git repository, review and commit the project:

```sh
git status --short
git add .
git diff --cached --stat
git commit -m "Add Home Bar app and portable inventory example"
```

If you have not configured `origin`, connect your chosen remote and push the current branch (replace the URL placeholder):

```sh
git remote add origin <your-repository-url>
git push -u origin HEAD
```

Then clone that repository on Omarchy and follow the Linux run steps above. `.gitattributes` keeps source and shell scripts in LF format and Windows launchers in CRLF format. `.gitignore` excludes temporary research files, server logs/PIDs, local stock backups, environment files, and operating-system metadata. The example stock, recipe snapshot, generated app data, documentation, and inventory photos are included.

After editing the app or importing recipes, run the build and tests below so the offline cache updates too. The main development files are `public/app.mjs` (UI), `public/style.css` (styles), `public/matcher.mjs` (availability rules), and `scripts/catalog.mjs` (ingredient types and product aliases). The existing feature and hardware plans are in `PROJECT-PLAN.md` and `FRAME-PLAN.md`.

## Run on this PC

Double-click **Start Bar Menu.cmd**, then open **http://localhost:4173**. The launcher finds Node.js on PATH or the bundled Codex Node runtime on this machine. Node.js 20 or later is required on another computer.

From a terminal, run `node scripts/serve.mjs`. This foreground version stops with Ctrl+C. The double-click launcher runs quietly in the background; closing a browser tab does not stop it. It starts manually, not automatically at Windows login. Its PID and logs are in `.local/`.

Only `public/` is served. The vault, project notes, source snapshots and Git directory are not exposed by the server.

## Use it

- **Missing alcohol types allowed:** an inclusive maximum. 0 requires every mandatory alcoholic type; 1 includes both zero-missing and one-missing recipes. Repeated pours of one type count once. A source's explicit alternatives need only one option.
- **Require non-alcoholic ingredients:** off assumes mixers, citrus, ice, syrups and garnishes are available. On requires each mandatory type in inventory. Optional ingredients never block a match. This is not a mocktail toggle or an alcohol-free certification.
- **Inventory:** check or uncheck ingredient types. Any brand of the listed type can supply it. The 29 photographed products seed 28 distinct stocked types, since two are orange liqueurs. Other ingredients start unconfirmed, which does not count as stocked.
- **Recipe details:** see amounts, instructions, source notes, and the photographed bottles matching each requirement.
- **Export / import stock:** transfer inventory between browsers or devices. Imports are validated before replacing stock. Export before clearing browser data. Each browser/device has independent inventory; there is no automatic cross-device or Obsidian synchronization.

The initial inventory produces **45 matches at 0**, or **157 at 1**, with the non-alcoholic toggle off. With it on, only the Angostura Bitters Shot initially matches: fresh ingredients, mixers and ice have not been confirmed. These are recipe-note counts, including variations, not unique drink families or serving quantities.

## Type rules and data review

Brands are aliases for explicitly defined types in `scripts/catalog.mjs`. The app does not use AI for each query. Light, aged/gold, Jamaican aged, Demerara, dark Jamaican, spiced, black and overproof rum have separate types. Blanco, reposado and añejo tequila remain separate. Dry/sweet/blanc vermouth, green/yellow Chartreuse, white/dark cacao liqueur, blue curaçao and brandy-based orange liqueur remain distinct. Ordinary triple sec and orange curaçao share one substitution type. Proof/flavor can differ within a type; brand identity does not establish exact strength.

This is stricter than the older `COCKTAIL-MATCHES.md`, which allowed several broader substitutions. It explains the different counts. That earlier report is preserved as a historical comparison.

All garnishes are required unless explicitly optional. Alcoholic bitters count as alcohol. Known component recipes (Jasper's Mix, Chartreuse whipped cream, Tom & Jerry batter) expand into ingredient requirements, so their alcohol cannot disappear from the match. Prepared syrup strengths are separate types. The photographed Master of Mixes bottle supplies only the general/simple syrup entry; its concentration is not established as semi-rich or rich.

Four recipes are held out of results until their ambiguous components are resolved: Juliet & Romeo (unspecified garnish bitters), Golden Cadillac (Blended) (unprovided cacao whipped cream formula), Corn 'n' Oil (unprovided homemade falernum formula), and The Psycho Killer (unprovided Campari infusion formula). They can still be inspected under **Recipes needing ingredient review**. `data/import-review.json` records the exact unresolved lines. Unknown ingredients must be reviewed, not classified as alcohol-free by default.

The source's quantities, methods and cautions are preserved; source errors are not silently corrected. Vanilla extract is treated as a pantry ingredient, so this inventory model does not certify a drink free from trace alcohol. Stock tracks presence, not remaining volume, freshness, or portions.

## Android 14

The interface uses browser standards supported by current Chrome on Android. It is a web app, not an APK. The portrait/narrow layout and browser flows have been checked locally; physical Android 14 hardware still needs a hands-on check.

**On your home Wi-Fi:** double-click **Start Bar Menu for Tablet.cmd**. This uses port 4174 separately from the PC-only server. In PowerShell, `node scripts/serve.mjs --lan --port=4174` prints the PC's local network address. Open that address (such as `http://192.168.x.x:4174`) in Chrome on the tablet. The PC must remain awake and reachable. If Windows asks about Node's firewall access, private-network access is the relevant setting. The LAN server has no login and is intended for your trusted home network. Stock edited through the LAN URL is separate from stock at `localhost`; use export/import to copy it.

**Installed/offline use:** the app includes a web manifest, icons and service worker. It caches all recipes and interface assets. Browser installation and offline service workers require HTTPS or a browser-recognized local development origin; a plain HTTP home-network address does not provide them. A trusted HTTPS deployment or local HTTPS setup is the next step for a standalone installed tablet experience. No cloud publication or Android installation has been performed. [MDN installation requirements](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable).

On this machine, `localhost` supports the offline cache. Supported browsers offer installation in their browser menu or the app's **Install app** button. Once loaded, the cached app works even while the server is stopped. External source-recipe links still need the internet. **Update menu** appears when a newly built version is ready; applying it keeps saved stock.

## Maintain and verify

```
node scripts/build.mjs
node --test
```

The build reads the committed snapshot in `data/recipes-source.json`, validates references, writes `public/data/bar.json`, and assigns a new offline cache version. Runtime dependencies do not need installation.

To import current cocktail notes read-only from the vault, pass its location on the machine you are using. For example, on Linux (replace this example path):

```
node scripts/build.mjs --vault "$HOME/path/to/vault/Recipes/Cocktails"
```

This accepts checklist ingredients under different Markdown heading depths and original notes without headings. It excludes notes without ingredient lists, such as the recipe index. Review `data/import-review.json` after every import. New aliases or types belong in `scripts/catalog.mjs`; inspect their generated requirements before relying on new recipes. Vault import updates the generated collection but does not overwrite the committed source snapshot or the Obsidian files. A later build without `--vault` intentionally returns to the committed snapshot.

Core logic: `public/matcher.mjs`. Browser UI: `public/app.mjs`. Validated stock backups: `public/storage.mjs`. Thirteen automated tests cover type distinctions, alternatives, missing limits, stock changes, mixer requirements, unresolved components, import validation, the example inventory, performance and server isolation.
