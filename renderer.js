const state = {
  notes: [],
  selectedNoteId: null,
  search: "",
  category: "all",
};

const elements = {};

function formatDate(dateString) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(dateString));
}

function getFilteredNotes() {
  const query = state.search.toLowerCase().trim();
  return state.notes.filter((note) => {
    const matchesCategory = state.category === "all" || note.category === state.category;
    const matchesSearch = !query || `${note.title} ${note.content} ${note.category}`.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });
}

function renderCategoryControls() {
  const categories = [...new Set(state.notes.map((note) => note.category).filter(Boolean))].sort();
  const selectedCategory = state.category;
  elements.categoryFilter.innerHTML = `<option value="all">All categories</option>${categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("")}`;
  elements.categoryFilter.value = categories.includes(selectedCategory) ? selectedCategory : "all";
  state.category = elements.categoryFilter.value;
  elements.categoryOptions.innerHTML = categories.map((category) => `<option value="${escapeHtml(category)}"></option>`).join("");
}

function renderNoteList() {
  const notes = getFilteredNotes();
  elements.noteCount.textContent = notes.length;
  elements.noteList.innerHTML = notes.length
    ? notes.map((note) => `<button class="note-item ${note.id === state.selectedNoteId ? "active" : ""}" data-note-id="${escapeHtml(note.id)}" type="button">
        <span class="note-item-title">${escapeHtml(note.title || "Untitled note")}</span>
        <span class="note-item-meta"><span class="note-item-category">${escapeHtml(note.category || "General")}</span><span>${formatDate(note.updatedAt)}</span></span>
      </button>`).join("")
    : `<div class="empty-list">No notes match this view.<br />Create a new note to get started.</div>`;

  elements.noteList.querySelectorAll("[data-note-id]").forEach((button) => {
    button.addEventListener("click", () => selectNote(button.dataset.noteId));
  });
}

function renderEditor() {
  const note = state.notes.find((item) => item.id === state.selectedNoteId);
  elements.titleInput.value = note?.title || "";
  elements.categoryInput.value = note?.category || "General";
  elements.contentInput.value = note?.content || "";
  elements.deleteButton.disabled = !note;
  elements.saveStatus.textContent = note ? `Last saved ${formatDate(note.updatedAt)}` : "Draft note";
  updateWordCount();
}

function render() {
  renderCategoryControls();
  renderNoteList();
  renderEditor();
  elements.viewTitle.textContent = state.category === "all" ? "All notes" : state.category;
}

function selectNote(noteId) {
  state.selectedNoteId = noteId;
  render();
}

function createNote() {
  state.selectedNoteId = null;
  state.search = "";
  state.category = "all";
  elements.searchInput.value = "";
  render();
  elements.titleInput.focus();
}

async function saveCurrentNote() {
  const note = {
    id: state.selectedNoteId,
    title: elements.titleInput.value,
    category: elements.categoryInput.value,
    content: elements.contentInput.value,
  };
  elements.saveButton.disabled = true;
  elements.saveStatus.textContent = "Saving...";
  try {
    const savedNote = await window.electronAPI.saveNote(note);
    state.selectedNoteId = savedNote.id;
    state.notes = state.notes.filter((item) => item.id !== savedNote.id);
    state.notes.unshift(savedNote);
    render();
    elements.saveStatus.textContent = "Saved just now";
  } catch (error) {
    elements.saveStatus.textContent = "Could not save note";
    console.error(error);
  } finally {
    elements.saveButton.disabled = false;
  }
}

async function deleteCurrentNote() {
  const note = state.notes.find((item) => item.id === state.selectedNoteId);
  if (!note || !window.confirm(`Delete “${note.title || "Untitled note"}”?`)) return;

  state.notes = await window.electronAPI.deleteNote(note.id);
  state.selectedNoteId = state.notes[0]?.id || null;
  render();
}

function updateWordCount() {
  const words = elements.contentInput.value.trim() ? elements.contentInput.value.trim().split(/\s+/).length : 0;
  elements.wordCount.textContent = `${words} ${words === 1 ? "word" : "words"}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

async function initialize() {
  elements.searchInput = document.querySelector("#search-input");
  elements.noteList = document.querySelector("#note-list");
  elements.noteCount = document.querySelector("#note-count");
  elements.categoryFilter = document.querySelector("#category-filter");
  elements.categoryOptions = document.querySelector("#category-options");
  elements.titleInput = document.querySelector("#title-input");
  elements.categoryInput = document.querySelector("#category-input");
  elements.contentInput = document.querySelector("#content-input");
  elements.saveButton = document.querySelector("#save-button");
  elements.deleteButton = document.querySelector("#delete-button");
  elements.saveStatus = document.querySelector("#save-status");
  elements.wordCount = document.querySelector("#word-count");
  elements.viewTitle = document.querySelector("#view-title");

  state.notes = await window.electronAPI.loadNotes();
  state.selectedNoteId = state.notes[0]?.id || null;
  elements.searchInput.addEventListener("input", (event) => { state.search = event.target.value; renderNoteList(); });
  elements.categoryFilter.addEventListener("change", (event) => { state.category = event.target.value; render(); });
  elements.saveButton.addEventListener("click", saveCurrentNote);
  elements.deleteButton.addEventListener("click", deleteCurrentNote);
  document.querySelector("#new-note-button").addEventListener("click", createNote);
  elements.contentInput.addEventListener("input", updateWordCount);
  render();
}

document.addEventListener("DOMContentLoaded", initialize);
