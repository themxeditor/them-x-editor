# MX Performance Editor

**Version 0.0.1**

A browser-based editor for the performances, voices and effects of Yamaha MX49, MX61 and MX88 keyboards. It talks to the keyboard over USB using the Web MIDI API, so there is nothing to install: open one HTML file in Chrome or Edge.

> **Not affiliated with Yamaha.** This is an independent project. It is not associated with, authorized by, or endorsed by Yamaha Corporation or Yamaha Inc. Yamaha, MX49, MX61 and MX88 are trademarks of their respective owners and are used here only to describe compatibility.

> **Use at your own risk.** This software sends system exclusive (SysEx) data that can overwrite performances and user voices on your keyboard. It is provided "as is", without warranty of any kind. You use it entirely at your own risk, and the authors are not liable for lost data or damage. Back up your keyboard (**Export everything**) before writing to it.

## What it does

An MX keyboard stores 128 user performances. Each performance is a stored setup of up to 16 parts. Each part plays a voice, and the performance adds a keyboard mode (single, layer or split), reverb, chorus, a master EQ and arpeggio settings. The keyboard's own front panel makes this slow to edit. This editor gives you a full-screen view of all of it.

- **Performance list.** The first screen lists all 128 performances (A01 to H16) with their mode and voices. Search by name, slot or voice.
- **Drill down.** Open a performance to see its parts. Add, change or delete voices from a searchable list of about 1,100 voices. Set each part's volume, pan, reverb and chorus send, note range, transpose and receive channel.
- **Split and layer setup.** Choose the keyboard mode and split point, and limit each part to a note range.
- **Effects and EQ.** Choose the performance's reverb and chorus types and edit every parameter of each, with values shown in real units. Edit the five-band master EQ.
- **Voice editor.** Open any normal voice from a part or from the voice picker. Edit its general settings, controllers and LFO, insertion effect, and all eight elements (wave, key range, amplitude and pitch envelopes, filter, filter envelope, LFO). Try it on a part, or save it as a user voice.
- **User voices.** All 128 user voice slots are listed by name. When you save a voice, a slot chooser shows every slot and its current name before you overwrite anything.
- **Follow.** Selecting a performance in the editor switches the keyboard to it. Unsaved edits go to the keyboard's edit buffer so you hear them immediately.
- **Read and write.** Read one or all performances from the keyboard, audition edits in the edit buffer, and write them back to a slot.
- **Backup and sharing.** Export and import `.syx` files. Export everything (all performances and all user voices) in a single file, and import it again later.
- **Bulk interval.** Set the keyboard's Bulk Dump Interval (0 to 900 ms) from the header. Lower values make reading from the keyboard much faster.
- **Works offline.** You can browse and edit without a keyboard connected. The list starts from the factory performance list, and imported or previously read data is kept in the browser.

## Requirements

- An MX49, MX61 or MX88 connected to the computer with a USB cable (USB TO HOST).
- **Chrome or Edge** on a computer. Firefox and Safari do not support Web MIDI with SysEx.
- Open the file from your computer (double-click it) or from `localhost`. Pages served over plain `http` from other addresses are blocked from MIDI by the browser.
- On the keyboard, turn **Bulk Protect off**. While it is on, the keyboard ignores every write.
- Close other MIDI software (a DAW, another editor) that has the MX's USB port open.

## Getting started

1. Open `mx-performance-editor.html` in Chrome or Edge.
2. Click **Connect MIDI** and allow the permission prompt, including system exclusive access.
3. Pick the MX in both port drop-downs. Check that **Dev#** matches the keyboard's device number (default 1).
4. Optionally lower **Bulk interval** to speed up reading.
5. Click **Read all from keyboard** to load your real performances. This runs once. The data is kept in the browser.
6. Click a performance, edit it, then **Audition** to hear it and **Write to** its slot to keep it.

Read the full guide for step-by-step help with each feature.

## Header controls

| Control | What it does |
| --- | --- |
| Port drop-downs | Choose the MIDI input and output. The MX is picked automatically when its name contains "MX". |
| Dev# | The keyboard's device number (1 to 16). |
| Follow | When ticked, the keyboard switches to whichever performance you open. |
| Ch | The MIDI channel the keyboard receives program changes on (used by Follow). |
| Bulk interval | The pause the keyboard leaves between SysEx messages it sends, 0 to 900 ms. Read from the keyboard on connect. |
| About | Version, license and disclaimers. |

## Backing up

- **Export .syx** on a performance saves that one performance.
- **Export everything (.syx)** saves all 128 performances and every user voice the editor has read, in one file. Performances you have not read from the keyboard are factory-list approximations, and the editor asks whether to include them.
- **Import .syx** accepts one or several files containing performances, user voices or both. Files with many items go into the slots named inside them. A file with a single item asks which slot to use. Preset and edit-buffer voice dumps are skipped, because they cannot be stored.
- Imported items are marked *modified* and exist only in the editor until you press **Write all modified to keyboard** (or write a single performance). A full set takes a few minutes.

## Limitations

- **Untested on hardware at this version.** The SysEx handling follows the Yamaha MX49/MX61/MX88 Data List and passes automated tests against a simulated keyboard, but it has not been verified on every model and firmware. Expect rough edges.
- New effect types start from neutral parameter values, because the factory effect presets are not in the Data List.
- Only normal voices can be edited. Drum kits cannot yet.
- Preset voices cannot be overwritten. Edits to a preset voice are saved as a user voice.
- User voices are assumed to be at bank 63 / LSB 8, as given in the Data List.
- A part counts as "in use" when its receive channel is not off.
- The list shows only factory-list approximations (three voices per performance) until you read the real data from the keyboard.

## How it works

The MX uses Yamaha's SysEx bulk dump protocol (model ID `7F 17`). A performance is a group of blocks (common, reverb, chorus, master EQ, arpeggio, 16 parts, 16 arpeggio parts) between a bulk header and footer. A normal voice is a common block, an insertion effect, controller and LFO settings, and eight pairs of element blocks. The editor builds and parses these messages, including the checksum, and uses parameter-change messages for the Bulk Dump Interval.

## Repository layout

| File | Purpose |
| --- | --- |
| `core.js` | SysEx library: message building and parsing, checksums, performance and voice models. Works in the browser and in Node. |
| `template.html` | The editor's user interface. |
| `build.js` | Inlines `core.js` and the data files into `template.html` and writes the single-file `mx-performance-editor.html`. |
| `data.json` | Voice list and factory performance list. |
| `fxdata.json` | Effect types, their parameters and value tables. |
| `vspec.json` | Voice parameter definitions. |
| `test.js` | Node tests for the SysEx round trip and the data. |
| `tests/` | Browser tests (Playwright) that drive the built editor against a simulated MIDI keyboard. |

The data files were derived from the *Yamaha MX49/MX61/MX88 Data List* so that the editor shows the same voice names, effect parameters and ranges as the keyboard.

## Building and testing

```sh
node build.js     # writes mx-performance-editor.html
node test.js      # runs the Node tests
```

Only Node.js is needed. The built HTML file has no external dependencies.

### Browser tests

The scripts in `tests/` open the built `mx-performance-editor.html` in headless Chromium with a simulated MIDI keyboard, and exercise editing, effects, the voice editor, user voices, following the selected performance, import and export, and the bulk interval. They print what they observed and any page errors (the last line should be an empty list). They need [Playwright](https://playwright.dev/) (`npm install playwright`, then `npx playwright install chromium`):

```sh
node build.js
node tests/01-basic-editing.js
```

Test 06 writes a full set of 256 items to the simulated keyboard and takes a couple of minutes.

## Contributing

Issues and pull requests are welcome at <https://github.com/YamMXEditor/yammxeditor>. Reports from real keyboards (model, firmware, what worked, what did not) are especially useful at this stage.

## License

This program is free software: you can redistribute it and modify it under the terms of the **GNU General Public License, version 3** as published by the Free Software Foundation. It is distributed in the hope that it will be useful, but **without any warranty**, without even the implied warranty of merchantability or fitness for a particular purpose.

Read the license: <https://www.gnu.org/licenses/gpl-3.0.html>

## Links

- Source code: <https://github.com/YamMXEditor/yammxeditor>
- GNU GPL v3: <https://www.gnu.org/licenses/gpl-3.0.html>
