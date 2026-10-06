# Home bar electronic menu — research and project plan

Research date: September 27, 2026. Prices are listed US prices observed during research, before tax, shipping, framing, and accessories. Availability and the exact regional SKU must be checked before ordering. Cost ranges below are planning allowances, not supplier quotes.

## Direction

Build a framed, matte-looking menu with touch browsing and optional voice search. Keep the inventory and recipes in the existing Obsidian vault, which is also tracked in Git. Generate the menu from those files.

Room lighting can be relied upon, so a reflective display is a serious option. The hardware decision should follow an appearance and interaction test. A black background on a computer mockup cannot demonstrate a physical screen's black level, reflection, surface finish, or refresh behavior.

**Hardware decision: TCL NXTPAPER 14 selected.** The user wants a wood frame, preferably adapted from a ready-made frame, mounted in portrait. Power will come from an approximately 6–10-foot (2–3-metre) cable run to an outlet; the frame remains removable for service. See [FRAME-PLAN.md](FRAME-PLAN.md) for the enclosure concept, fit checks, candidate frame, and assembly plan. The research below is retained as background.

## Requirements recorded

- A hanging home bar menu that avoids the appearance of a conventional glossy tablet.
- A matte black/chalkboard direction, with recipes available now and recipes that are nearly possible.
- Touch input; potentially spoken requests.
- Existing inventory and recipes in an Obsidian vault and Git.
- Room lighting can support a reflective screen.
- Selected: TCL NXTPAPER 14; wood frame adapted from a ready-made frame if practical; portrait; longer permanent cable run to an outlet.
- Still open: exact cable route/length, final frame and finish, mounting budget, vault/repository location and file structure, viewing distance, and whether Git changes are pushed to a remote routinely.

## Display shortlist

| Candidate | Verified characteristics / listed price | Project fit and limitation |
|---|---|---|
| **BOOX Note Max** | 13.3-inch monochrome E Ink; capacitive touch; Android 13; third-party apps; microphone; no front light. **$599.99**. | First appearance test if looking like a physical sign matters most. Room lighting fits this model. Test dark-background contrast, ghosting, keyboard behavior, and browser refresh modes. [BOOX specification](https://shop.boox.com/products/notemax). |
| **TCL NXTPAPER 14** | 14.3-inch, 2400 × 1600 IPS LCD, capacitive touch, Android 14, two microphones. US listing **$349.97**. | First usability/value test. Its surface is treated for reduced glare, but the screen remains backlit. Test minimum brightness and reflected room lights. [US specification and price](https://us.tcl.com/products/nxtpaper-14); [manufacturer matte-layer description](https://www.tcl.com/global/en/tablets/tcl-nxtpaper-14). |
| **BOOX Go 10.3 (Gen II) Lumi** | 10.3-inch monochrome E Ink, Android 15, touch, adjustable warm/cool front light. **$429.99**; unlit Gen II **$399.99**. | Smaller E Ink alternative with optional lighting. Best considered for close-up use rather than reading across a room. [BOOX comparison and specifications](https://shop.boox.com/products/go103gen2). |
| **Daylight DC-1** | 10.5-inch Live Paper display, 1600 × 1200, 60 Hz, Android apps, microphone, optional illumination. **$729**. | Interesting bridge between paper appearance and fluid interaction. Smaller and more expensive; verify contrast and finish under the bar's indoor lighting. [Specifications](https://daylightcomputer.com/product); [price](https://daylightcomputer.com/cart). |
| **Dell P2424HT + small computer** | 23.8-inch anti-glare touch LCD, 100 × 100 VESA mounting. Monitor listed at **$424.99**. | Larger wall-menu route. Requires a computer, more depth, separate voice hardware as needed, and confirmation of touch/orientation support on the chosen operating system. [Dell specification and price](https://www.dell.com/en-us/shop/monitors/apd/dell-pro-24-plus-touch-usb-c-hub-monitor-p2424ht/p2424ht_monitor/-). |

**What the materials change:** E Ink reflects ambient light and retains a static image without display power; the tablet's processor, Wi-Fi, microphone, and any illumination still consume power. LCD uses a backlight. Neither the word “paper” nor an anti-glare claim guarantees the black chalkboard effect. [E Ink's explanation](https://www.eink.com/tech/detail/Benefits).

For E Ink, use discrete pages, a Search button, and few animations. Fast update modes exist, with different visual compromises; do not assume all E Ink devices behave like inexpensive signage modules. [E Ink update-mode FAQ](https://www.eink.com/tech/detail/FAQ).

## Alternatives considered

- **Existing tablet + matte film + frame:** useful for cheaply testing layout, dimensions, and mounting. It will not establish whether a true reflective display is preferable. Film compatibility, haze, and touch feel require an actual sample.
- **DIY e-paper panel:** viable for a mostly static menu, but it adds controller, enclosure, input, and power work. For example, Waveshare's 13.3-inch K module lists 960 × 680 resolution and a five-second refresh, with specific refresh precautions. That is a different class of device from an Android E Ink tablet. [Module manual](https://www.waveshare.com/wiki/13.3inch_e-Paper_HAT_(K)_Manual).
- **Commercial e-paper signage:** Samsung has 13- and 32-inch offerings with app/content-management workflows. Attractive for a passive menu; the documented workflow does not establish suitability for an interactive browser and microphone. [Samsung announcement](https://news.samsung.com/us/samsung-debuts-13-inch-color-e-paper-world-first-display/).
- **Other reflective LCD products:** HANNspree's HannsNote2 documents a 10-inch reflective 60 Hz display. Keep this category in reserve; US availability and support were not established during this pass. [Manufacturer datasheet](https://www.hannspree.com/uploads/files/shares/product/HannsNote2/SN10HR1B%20Datasheet_EN.pdf).

## Physical appearance and mounting

Use a wood or matte-black frame with the bezel hidden and the active touch area accessible. Start with portrait orientation and a modest number of large entries. A wider screen can instead support two menu columns.

Use off-white text on charcoal, restrained chalk-style lettering for headings, and clear type for ingredients and instructions. Keep status text explicit: “Ready,” “Missing lime,” and “With substitution.” Avoid depending on color.

The enclosure must leave microphone openings, charging, buttons, and ventilation accessible. Keep the device removable for maintenance. Additional picture-frame glass could undermine the matte effect and interfere with touch; evaluate the screen exposed first. Route power from the outlet through a concealed frame exit and, where needed, a surface cable cover. Test charging and temperature with the actual cable and brightness setting before finalizing continuous use.

For touch, mounting height must be comfortably reachable. A high wall placement may favor voice, but that should be decided after testing speech recognition at the actual distance with music and conversation present.

## Data and software design

```text
Selected Obsidian recipe and inventory files
             |
       Parse and validate
             |
     Ingredient/recipe matching
             |
   Versioned menu data + recipe details
             |
    Touch menu with an offline cache
             |
 Optional voice search over the same data
```

Keep the vault as the authoring source. Inspect a small sample before choosing a schema or changing any notes. Existing Markdown tables, properties, and links may be enough; normalize into generated data outside the vault first. Avoid requiring a migration of the whole collection.

Candidate normalized records:

| Record | Fields to preserve or derive |
|---|---|
| Ingredient | Stable ID, display name, aliases, category, stock state, optional amount/unit, last verification date |
| Recipe | Stable ID, title, ingredient requirements, quantities, required/optional garnish, instructions, tags, source note path |
| Substitution | Explicitly permitted replacement, affected recipe/category, explanation |
| Published menu | Data version, source revision when available, generated time, last inventory verification, validation results |

Use repeatable matching rules for availability:

- **Ready:** all required ingredients are present; if quantities are tracked, sufficient quantities are required.
- **Almost:** one required ingredient is missing by default, with its name shown. A later option can expand to two.
- **With substitution:** a permitted swap makes the drink possible; display the swap separately from an exact match.
- **Unknown:** an ingredient name or stock record is unresolved. Do not quietly label it ready.

Do not equate all bottles in a spirit category. Dry and sweet vermouth, for example, remain distinct. Treat optional garnishes separately. Ice, citrus, mixers, and homemade syrups need an explicit tracking or always-stocked rule. Presence-only inventory should say “ingredients on hand,” without claiming a number of servings.

For the first version, show available recipes, one-away recipes, search, spirit/style filters, favorites, and a recipe detail page. Keep inventory editing in Obsidian. Do not decrement stock when someone merely views a recipe.

## Keeping the display updated

Start with a manual local export from selected vault folders. That proves the data mapping without adding another service.

After that, choose one synchronization path:

- **Local:** an always-on home machine watches or periodically reads the selected files and serves the generated menu on the home network. A laptop that is often off is not a dependable server.
- **Git-based:** if a remote is already used, generate the menu from a chosen branch after a successful push or read-only pull. Uncommitted or unpushed edits will not appear through this route; show the published revision and time.

Export only the selected bar data. Preserve the vault's privacy and avoid putting Git credentials on the public-facing screen. If hosting outside the house is later chosen, decide its access rules explicitly.

Keep the last valid menu when an import fails and mark it stale. Cache the app and data so an internet outage does not erase touch browsing. Show inventory freshness separately from connection status: a recently generated file can still contain old stock information.

The Android candidates can host the display interface themselves. A dedicated computer behind the screen is only necessary for the monitor route; a separate server is optional for a basic exported menu and useful later for synchronization or voice.

## Existing GPT project and voice

Reuse the existing recipe files, inventory, and any useful instructions as inputs. Its precise setup has not been inspected, so automatic access to its project context is not assumed. The menu should have a direct, inspectable data pipeline.

Add voice after touch and availability are reliable. Start with a microphone button and requests such as “Show gin drinks I can make” or “What am I missing for a Margarita?” Display the recognized query and let the user correct it. Use the same matching results as the touch interface.

A conversational implementation can use OpenAI's browser voice support, with session setup on a trusted server and short-lived client credentials. Keep permanent API credentials off the tablet. [Official Realtime API documentation](https://developers.openai.com/api/docs/guides/realtime).

If the existing assistant is a custom GPT, GPT Actions offer a possible later way for that assistant to query a shared recipe/inventory API. This is optional and does not establish a direct connection from the wall menu to an existing ChatGPT project's conversations. [Official GPT Actions documentation](https://developers.openai.com/api/docs/actions/introduction).

Treat always-listening wake-word interaction as a separate phase: microphone placement, background noise, accidental triggers, offline behavior, and service costs need testing. For cloud voice, budget usage separately; no monthly amount is estimated before the usage pattern and provider are chosen.

## Work sequence and acceptance criteria

| Phase | Concrete deliverable | Decision or acceptance check |
|---|---|---|
| 1. Inspect the source | Review representative inventory and recipe notes; document field mapping and ambiguities | No source-note changes required for the initial export; missing fields identified |
| 2. Test appearance | Same black/off-white menu on candidate hardware; paper/cardboard size mockups on the wall | Acceptable glare, black level, text size, viewing angle, tapping, and refresh in the real room |
| 3. Build a small working menu | Import a representative subset; touch search, ready/almost filters, recipe details | Compare matching against a manually reviewed set, including missing citrus, optional garnish, aliases, and substitutions |
| 4. Choose hardware and mount | Final bill of materials and removable enclosure dimensions | Device passes the appearance test; power, heat, cable route, and touch reach are acceptable |
| 5. Connect updates | Chosen local/Git update path, last-good data, freshness display, backups | A stock change updates results; failed import preserves the old menu visibly; restart recovers the app |
| 6. Add voice | Push-to-talk search and optional spoken answers | Repeated requests work at intended distance with normal bar noise; touch remains usable without voice |
| 7. Trial use | Several normal bar sessions | User can find a drink quickly; no unexplained availability, unexpected sleep, or repeated maintenance |

A planning allowance is 3–5 focused work sessions for a basic software prototype after the source files are available, plus separate hardware evaluation and frame fabrication. Voice and unattended operation can add several sessions. This is a scope estimate, not a delivery commitment; inconsistent recipe notes can dominate the effort.

## Preliminary hardware allowances

| Route | Planning allowance, excluding tax/shipping and labor |
|---|---:|
| Reuse an owned tablet, add film and simple mount | $50–$150 incremental |
| TCL NXTPAPER 14, frame/mount, power accessories | $450–$650 |
| BOOX Note Max, frame/mount, power accessories | $700–$900 |
| BOOX Go 10.3 Gen II/Lumi, frame/mount, power accessories | $500–$700 |
| Daylight DC-1, frame/mount, power accessories | $830–$1,030 |
| 24-inch touch monitor, small computer, frame/mount and power | $650–$1,000 |

These allowances include roughly $100–$300 for framing, mounting, and power on the tablet routes. A custom cabinetmaker's frame or new electrical work would be additional. Basic browsing and matching can be designed without per-query AI charges; external hosting, synchronization services, or voice may add recurring costs.

## Next decision

Finalize the TCL frame after measuring the actual tablet and plugged-in charging cable. Follow [FRAME-PLAN.md](FRAME-PLAN.md). The next software step remains a read-only look at the vault path or repository and a few representative notes.
