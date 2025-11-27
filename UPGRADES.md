# ShelfSpace Upgrades & Shelves System (Option B)

## Overview

ShelfSpace uses a **database-driven shelves system** inspired by Obsidian’s organizational model but designed for digital reading. Shelves act like playlists: books live in one central library while shelves organize them flexibly.

This document describes the architecture, storage system, workflows, and features for the shelves and upgrade systems.

---

## 1. Core Concept

A **shelf** is a user-defined collection of books. Books are stored once in a unified Library folder and assigned to shelves via a relational mapping.

* A book can belong to zero, one, or many shelves.
* Shelves can be user-defined or auto-generated (Smart Shelves).
* SQLite is the source of truth for organization.

---

## 2. Storage Architecture

### File Structure

```
ShelfSpace/
  Library/
    book1.pdf
    book2.epub
    ...
  shelfspace.db
  config.json
```

### SQLite Tables

#### shelves

* id (INTEGER, PK)
* name (TEXT)
* color (TEXT)
* icon (TEXT)
* created_at (TEXT)

#### books

* id (INTEGER, PK)
* title (TEXT)
* author (TEXT)
* file_path (TEXT)
* type (TEXT)
* created_at (TEXT)
* updated_at (TEXT)
* progress (REAL)

#### book_shelf (Many-to-Many)

* id (INTEGER, PK)
* book_id (INTEGER)
* shelf_id (INTEGER)

---

## 3. Electron IPC Architecture

### Shelf Channels

* `shelf:getAll`
* `shelf:create`
* `shelf:rename`
* `shelf:delete`
* `shelf:getBooks`

### Book Channels

* `book:getAll`
* `book:add`
* `book:assignToShelf`
* `book:removeFromShelf`
* `book:getShelves`
* `book:updateProgress`

### Config + Smart

* `shelf:getSmartShelves`
* `config:get`
* `config:set`

---

## 4. React UI Design (Vite + React)

### Sidebar

* Shelves list
* Smart Shelves
* Library access
* New Shelf button

### Pages

#### All Books View

* Grid of all books
* Drag-and-drop to shelves

#### Shelf View

* Header with shelf name
* Sort/filter
* Book grid

#### Add Shelf Modal

* Name
* Color
* Icon

---

## 5. Shelf Functionality

### User Shelves

* Create
* Rename
* Delete
* Assign books
* Remove books
* Multiple shelf membership

### Smart Shelves (Auto-generated)

| Name           | Condition             |
| -------------- | --------------------- |
| Recently Added | Most recent items     |
| In Progress    | progress > 0 and < 1  |
| Unread         | progress = 0          |
| Finished       | progress = 1          |
| Large Files    | file size > threshold |

---

## 6. Book Import Workflow

1. User selects file.
2. File is copied to Library folder.
3. Entry is inserted in books table.
4. UI updates Library and Smart Shelves.

---

## 7. Drag & Drop Workflow

* Drag book card
* Drop onto a shelf in sidebar
* IPC: `book:assignToShelf`
* UI updates shelf contents

---

## 8. Future Upgrades

### Cloud Sync

* Sync Library and DB via Dropbox/iCloud

### AI Tagging

* Auto-detect genres
* Automatic smart shelf suggestions

### Notes & Annotations

* Local annotation system
* Link notes to pages

### Layout Themes

* Obsidian-inspired themes
* Sepia, dark mode, book mode

---

## 9. Project Structure

```
shelfspace/
  electron/
    main.js
    preload.js
    db/
      shelfspace.db

  frontend/
    src/
      components/
      pages/
      hooks/
      utils/

  Library/
```

---

## 10. Summary

This architecture creates a powerful, future-proof organizational model using shelves and a unified SQLite database. It is optimized for offline-first performance and allows future expansion into sync, AI, and annotation features.
