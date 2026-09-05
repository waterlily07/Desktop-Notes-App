const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  loadNotes: () => ipcRenderer.invoke("notes:load"),
  saveNote: (note) => ipcRenderer.invoke("notes:save", note),
  deleteNote: (noteId) => ipcRenderer.invoke("notes:delete", noteId),
});