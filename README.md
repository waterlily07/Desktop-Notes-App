# Notebook

A small, local-first desktop notes application built with Electron.

Notebook was created as a practical learning project to understand how a web interface can become a desktop application. It focuses on the everyday basics of a notes tool: writing, organizing, finding, and removing notes without needing an account or an internet connection.

## What it can do

- Create a note with a title, body, and category
- Edit and save existing notes
- Browse notes in a sidebar with updated dates and categories
- Search note titles, content, and categories
- Filter notes by category
- Delete notes with confirmation
- Show a live word count while writing
- Keep notes between launches using local JSON storage
- Build a Windows installer through Electron Forge

## Preview

The application is organized into two areas:

- A notes sidebar for creating, searching, and selecting notes
- An editor workspace for writing, categorizing, saving, and deleting the selected note

## Getting started

### Requirements

- Node.js LTS and npm
- Windows, macOS, or Linux for development

### Run the app

Clone the repository, open a terminal in the project folder, and run:

```bash
npm install
npm start
```

The app will open in an Electron window. To use it:

1. Select **New note**.
2. Add a title, category, and some content.
3. Select **Save note**.
4. Use the search field or category menu to find it later.

### Build a distributable

Create a platform-specific packaged application:

```bash
npm run package
```

Create an installer or distributable using the configured Electron Forge makers:

```bash
npm run make
```

Generated files are placed in `out/`, which is excluded from Git.

## How the app works

Notebook uses Electron's three-process model in a deliberately small way:

1. `index.js` runs in the main process. It creates the window, handles note storage, and responds to IPC requests.
2. `preload.js` exposes a small, controlled API to the renderer while keeping Node.js APIs out of the browser context.
3. `renderer.js` manages the user interface, note selection, search, filtering, and editor state.
4. `index.html` provides the structure and `styles.css` provides the visual design.

The renderer does not read or write files directly. It calls `loadNotes`, `saveNote`, and `deleteNote` through the preload bridge. The main process stores the notes as `notes.json` in Electron's user-data directory, so the location varies by operating system.

## Project structure

| File | Purpose |
| --- | --- |
| `index.js` | Electron window, IPC handlers, and JSON persistence |
| `preload.js` | Secure bridge between the renderer and main process |
| `index.html` | Notes workspace markup |
| `styles.css` | Layout, typography, colors, and responsive styling |
| `renderer.js` | Notes UI, editor behavior, search, and category filters |
| `forge.config.js` | Electron Forge packaging configuration |

## What I learned

This project helped me practice:

- Building a desktop app with Electron
- Separating the main process from the renderer process
- Using `contextIsolation` and a limited preload API
- Handling asynchronous IPC calls
- Reading and writing structured JSON data with Node.js
- Managing UI state with plain JavaScript
- Packaging an Electron application with Electron Forge

## Current limitations

This is an intentionally small single-device notes app. It currently does not provide cloud sync, user accounts, rich text or Markdown editing, automatic saving, attachments, or cross-device collaboration. Notes are stored locally, so deleting the application data can remove them.

## Roadmap

The next improvements I would make are:

- Add automatic saving with a clear unsaved-state indicator
- Add Markdown support and a preview mode
- Add note pinning, sorting, and archived notes
- Add import and export, including a backup-friendly JSON format
- Add automated tests for note storage and search behavior
- Improve accessibility and keyboard shortcuts
- Add application icons and publish release builds

## License

This project is available under the ISC license.
