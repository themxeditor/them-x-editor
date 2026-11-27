# THEM-X Performance Editor

**Version 0.1.1**

A browser-based editor for the performances, voices, drum kits, effects and arpeggios of Yamaha MX49, MX61 and MX88 keyboards. It talks to the keyboard over USB using the Web MIDI API, so there is nothing to install: open one HTML file in Chrome or Edge.

> **Experimental software.** This editor is experimental. Before you use it, back up your keyboard's data (use **Export everything**) and copy the backup file to a USB drive or other safe storage. No guarantee of correctness or suitability for any purpose is expressed or implied.

> **Bug reports and contributions.** Bug reports are welcome, but there is no guarantee, expressed or implied, that any fix will be made or will be forthcoming. You are encouraged to clone the repository and use Claude or another AI tool to improve and extend the software as you see fit, as long as you follow the terms of the GPL-3.0 license.

> **Not affiliated with Yamaha.** This is an independent project. It is not associated with, authorized by, or endorsed by Yamaha Corporation or Yamaha Inc. Yamaha, MX49, MX61 and MX88 are trademarks of their respective owners and are used here only to describe compatibility.

> **Use at your own risk.** This software sends system exclusive (SysEx) data that can overwrite performances and user voices on your keyboard. It is provided "as is", without warranty of any kind. You use it entirely at your own risk, and the authors are not liable for lost data or damage. Back up your keyboard (**Export everything**) before writing to it.

## What it does

An MX keyboard stores 128 user performances. Each performance is a stored setup of up to 16 parts. Each part plays a voice, and the performance adds a keyboard mode (single, layer or split), reverb, chorus, a master EQ and arpeggio settings. The keyboard's own front panel makes this slow to edit. This editor gives you a full-screen view of all of it.

### Performances

- **Performance list.** The first screen lists all 128 performances (A01 to H16) with their mode and voices. Search by name, slot or voice. A modified performance has a Restore from keyboard button that discards the edits and re-reads it.
- **Performance page.** Open a performance to see its parts. The breadcrumb, action buttons and the card with name, mode, split point, volume, arpeggio switch and tempo stay pinned under the top bar while you scroll.
- **Parts.** Add, change or remove voices from a searchable list of about 1,300 voices. Set each part's volume, pan, reverb and chorus send, note range, transpose and receive channel. Parts on the same channel are layered. When you add a voice you choose where it goes: the first free part, a specific part, before or after another voice, or replacing one. Small up and down arrows beside each part number move a voice one place. The Reorder button opens a panel where you drag voices into a new order; the parts are renumbered. The Add voice button and the insertion-effect summary (with links to each part and Turn all off) sit in the pinned panel.
- **Split and layer setup.** Choose the keyboard mode and split point, and limit each part to a note range.
- **Insertion effects.** Each part has a switch for its voice's own insertion effect, with the effect's name shown beside it. The keyboard allows only 4 parts at a time, so the editor refuses a fifth and warns if a performance read from the keyboard has more.
- **Effects and EQ.** Choose the performance's reverb and chorus types and edit every parameter of each, with values in real units. Edit the five-band master EQ.
- **Arpeggio.** Edit the common arpeggio settings and, for every part, the six arpeggio type slots (chosen from all 999 types by name or category, optionally adopting the type's original tempo) plus playback, range, timing, random and offset settings.
- **Rhythm pattern.** Pick the performance's rhythm pattern from all 208 patterns by category or search, and set Auto key-on start.
- **Knobs.** A Knobs tab edits the front-panel knob settings stored in each performance: the knob function page (Tone 1/2/3), Part 1-2 Link, the performance-wide Cutoff, Resonance, Chorus/Reverb send, Attack/Decay/Sustain/Release, Pan and Assign 1/2 values, and a per-part table with the same values plus whether each part follows the Assign 1/2 knobs.
- **Safe writing.** Before a performance is sent, the editor checks each part's voice: invalid banks, empty (initialized) user voices, user voices changed in the editor but not yet on the keyboard (it offers to write those first), unknown voices and more than 4 insertion effects. After sending, it reads the performance back and compares every part's voice, retrying more slowly up to 3 times, and tells you if the keyboard still differs. Reads are checked for missing blocks and retried. **Check keyboard** compares a slot on the keyboard with the editor at any time, and the editor warns when the MIDI connection is lost. User voices get the same care: the current contents of a keyboard slot are backed up before it is overwritten (More… → Restore previous), blanking a real voice with an empty one needs explicit confirmation, writes are read back and verified, and incomplete or stale voice reads are rejected.
- **Copy and clear.** Copy a performance to another slot chosen from a list, or clear one.

### Voices

- **Voice editor.** Open any normal voice from a part, the voice picker or the Voices screen. Edit its general settings, controllers and LFO, insertion effect, and all eight elements (wave, key range, amplitude and pitch envelopes, filter, filter envelope, LFO). Try it on a part, or save it as a user voice.
- **Drum kit editor.** Edit a kit's general settings, controllers and insertion effect, and every key from C0 to C6 (wave, level, pan, sends, envelope, pitch, filter). Play a key, copy one key's settings to another, and save as one of the 8 user drum kits.
- **Voices screen.** Browse every voice in the Data List with search, a category filter and paging (300 per page). It shows which performances use each voice, as links that open them. Edit a voice, or copy a normal voice into a user slot.
- **User voice manager.** A table of all 128 user voice slots with name, status and the performances that use each one (as links). Rename, copy, swap, edit, export and write voices. Changes are staged and marked modified until you write them to the keyboard.
- **List choosers.** Wherever you pick a destination (a performance slot, a user voice slot, a drum key, an arpeggio type), you choose from a list that shows what is there now. The only text field is the voice name, in a dialog that accepts up to 10 plain characters.

### Keyboard and files

- **Follow.** Selecting a performance in the editor switches the keyboard to it. Unsaved edits go to the keyboard's edit buffer so you hear them immediately.
- **Read and write.** Read one or all performances from the keyboard, audition edits in the edit buffer, and write them back to a slot.
- **Backup and sharing.** Export and import `.syx` files. Export everything (all performances and all user voices) in a single file, and import it again later.
- **Bulk interval.** Set the keyboard's Bulk Dump Interval (0 to 900 ms) from the top bar. Lower values make reading from the keyboard much faster.
- **Works offline.** You can browse and edit performances without a keyboard connected. The list starts from the factory performance list, and imported or previously read data is kept in the browser. Voice data for presets is read from the keyboard when you open the voice editor.
- **Guide.** The Guide button in the top bar opens the guide in a new tab. Keep the guide file in the same folder as the editor.

## Requirements

- An MX49, MX61 or MX88 connected to the computer with a USB cable (USB TO HOST).
- **Chrome or Edge** on a computer. Firefox and Safari do not support Web MIDI with SysEx.
- Open the file from your computer (double-click it) or from `localhost`. Pages served over plain `http` from other addresses are blocked from MIDI by the browser.
- On the keyboard, turn **Bulk Protect off**. While it is on, the keyboard ignores every write.
- Close other MIDI software (a DAW, another editor) that has the MX's USB port open.

## Getting started

1. Open `them-x-performance-editor.html` in Chrome or Edge.
2. Click **Connect MIDI** and allow the permission prompt, including system exclusive access.
3. Pick the MX in both port drop-downs. Check that **Dev#** matches the keyboard's device number (default 1).
4. Optionally lower **Bulk interval** to speed up reading.
5. Click **Read all from keyboard** to load your real performances. This runs once. The data is kept in the browser.
6. Click **Export everything (.syx)** and keep the file somewhere safe. This is your backup.
7. Click a performance, edit it, then **Audition** to hear it and **Write to** its slot to keep it.

Read the full guide, `THEM-X Performance Editor Guide.html`, for step-by-step help with each feature.

## Top bar controls

| Control | What it does |
| --- | --- |
| Connect MIDI | Opens the MIDI connection. It sits next to the title. |
| Port drop-downs | Choose the MIDI input and output. The MX is picked automatically when its name contains "MX". |
| Dev# | The keyboard's device number (1 to 16). |
| Ch | The MIDI channel the keyboard receives program changes on (used by Follow). |
| Bulk interval | The pause the keyboard leaves between SysEx messages it sends, 0 to 900 ms. Read from the keyboard on connect. |
| Guide | Opens the guide in a new tab. |
| Theme | Dark (default), Light or Blue (inspired by the blue MX49). Remembered in the browser. |
| About | Version, license and disclaimers. It opens automatically the first time you open the editor. Untick **Show this popup on startup** to stop that. |

The **Follow** checkbox is on the performance list, after the **Reset library** button. When ticked, the keyboard switches to whichever performance you open.

## Backing up

- **Export .syx** on a performance saves that one performance.
- **Export everything (.syx)** saves all 128 performances and every user voice the editor has read, in one file. Performances you have not read from the keyboard are factory-list approximations, and the editor asks whether to include them. **Export performances only** leaves the voices out.
- **Import .syx** accepts one or several files containing performances, user voices or both. Files with many items go into the slots named inside them. A file with a single item opens a list to choose the slot. Preset and edit-buffer voice dumps are skipped, because they cannot be stored.
- Imported items are marked *modified* and exist only in the editor until you press **Write all modified to keyboard** (or write a single performance). A full set takes a few minutes.

## Limitations

- **Untested on hardware at this version.** The SysEx handling follows the Yamaha MX49/MX61/MX88 Data List and passes automated tests against a simulated keyboard, but it has not been verified on every model and firmware. Expect rough edges.
- New effect types start from neutral parameter values, because the factory effect presets are not in the Data List.
- Preset voices and preset or GM drum kits cannot be overwritten. Edits to a preset voice are saved as a user voice, and edits to a drum kit are saved as a user drum kit.
- User voices are assumed to be at bank 63 / LSB 8, as given in the Data List. The user drum kit bank (63 / 40, kits 1 to 8) and sending a drum kit to a part's edit buffer follow the Data List but are untested on hardware.
- Verification compares the performance name and each part's on/off state and voice (bank and program), not every parameter. A keyboard that doesn't answer the read-back is reported as "not verified".
- A part counts as "in use" when its receive channel is not off.
- The list shows only factory-list approximations (three voices per performance) until you read the real data from the keyboard.
- Insertion effect names are read from each voice the first time it is needed, so they need a connection.

## How it works

The MX uses Yamaha's SysEx bulk dump protocol (model ID `7F 17`). A performance is a group of blocks (common, reverb, chorus, master EQ, arpeggio, 16 parts, 16 arpeggio parts) between a bulk header and footer. A normal voice is a common block, an insertion effect, controller and LFO settings, and eight pairs of element blocks. A drum kit is a common block, an insertion effect, controller settings and one block per key. The editor builds and parses these messages, including the checksum, and uses parameter-change messages for the Bulk Dump Interval.

## Repository layout

| File | Purpose |
| --- | --- |
| `them-x-performance-editor.html` | The built, single-file editor. Open this in the browser. |
| `THEM-X Performance Editor Guide.html` | The user guide. Keep it next to the editor. |
| `core.js` | SysEx library: message building and parsing, checksums, performance, voice and drum kit models. Works in the browser and in Node. |
| `template.html` | The editor's user interface. |
| `build.js` | Inlines `core.js` and the data files into `template.html` and writes the single-file editor. |
| `data.json` | Voice list and factory performance list. |
| `fxdata.json` | Effect types, their parameters and value tables. |
| `vspec.json` | Voice parameter definitions. |
| `arpdata.json` | Arpeggio type list (999) and rhythm pattern list (208). |
| `test.js` | Node tests for the SysEx round trip and the data. |
| `tests/` | Browser tests that drive the editor with a simulated keyboard (they need Playwright). |

The data files were derived from the *Yamaha MX49/MX61/MX88 Data List* so that the editor shows the same voice names, effect parameters and ranges as the keyboard.

## Building and testing

```sh
node build.js     # writes them-x-performance-editor.html
node test.js      # runs the Node tests
node tests/08-drum-editor-and-layout.js   # a browser test (needs Playwright)
```

Only Node.js is needed to build. The built HTML file has no external dependencies.

## Contributing

Issues and pull requests are welcome at <https://github.com/themxeditor/them-x-editor>, with the caveat above that no fixes are guaranteed. Reports from real keyboards (model, firmware, what worked, what did not) are especially useful at this stage. Forks that extend the editor, with or without an AI assistant, are encouraged as long as they follow the GPL-3.0.

## License

This program is free software: you can redistribute it and modify it under the terms of the **GNU General Public License, version 3** as published by the Free Software Foundation. It is distributed in the hope that it will be useful, but **without any warranty**, without even the implied warranty of merchantability or fitness for a particular purpose.

Read the license: <https://www.gnu.org/licenses/gpl-3.0.html>

## Links

- Source code: <https://github.com/themxeditor/them-x-editor>
- GNU GPL v3: <https://www.gnu.org/licenses/gpl-3.0.html>
