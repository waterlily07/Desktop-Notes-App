const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const { randomUUID } = require("crypto");

const notesFile = () => path.join(app.getPath("userData"), "notes.json");

function readNotes() {
  try {
    return JSON.parse(fs.readFileSync(notesFile(), "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Unable to read notes:", error);
    }
    return [];
  }
}

function writeNotes(notes) {
  fs.mkdirSync(path.dirname(notesFile()), { recursive: true });
  fs.writeFileSync(notesFile(), JSON.stringify(notes, null, 2), "utf8");
}

function registerIpcHandlers() {
  ipcMain.handle("notes:load", () => readNotes());

  ipcMain.handle("notes:save", (_event, note) => {
    const notes = readNotes();
    const now = new Date().toISOString();
    const existingIndex = notes.findIndex((item) => item.id === note.id);
    const savedNote = {
      id: note.id || randomUUID(),
      title: String(note.title || "").trim() || "Untitled note",
      content: String(note.content || ""),
      category: String(note.category || "General").trim() || "General",
      createdAt: existingIndex >= 0 ? notes[existingIndex].createdAt : now,
      updatedAt: now,
    };

    if (existingIndex >= 0) {
      notes[existingIndex] = savedNote;
    } else {
      notes.unshift(savedNote);
    }
    writeNotes(notes);
    return savedNote;
  });

  ipcMain.handle("notes:delete", (_event, noteId) => {
    const notes = readNotes().filter((note) => note.id !== noteId);
    writeNotes(notes);
    return notes;
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1120,
    height: 760,
    minWidth: 780,
    minHeight: 560,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.removeMenu();
  win.loadFile(path.join(__dirname, "index.html"));
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});