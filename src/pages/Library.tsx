import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooksStore } from '../stores/booksStore';
import BookGrid from '../components/BookGrid';
import SearchBar from '../components/SearchBar';
import './Library.css';

function Library() {
  const navigate = useNavigate();
  const { 
    books, 
    isLoading, 
    loadBooks, 
    importBooks, 
    deleteBook,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    getFilteredBooks,
  } = useBooksStore();
  
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const handleImportClick = async () => {
    const filePaths = await window.api.openFileDialog();
    if (filePaths && filePaths.length > 0) {
      await importBooks(filePaths);
    }
  };

  const handleBookClick = (bookId: string) => {
    navigate(`/reader/${bookId}`);
  };

  const handleDeleteBook = async (bookId: string) => {
    if (confirm('Are you sure you want to delete this book?')) {
      await deleteBook(bookId);
    }
  };

  // Drag and drop handling
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const validExtensions = ['.pdf', '.epub', '.txt'];
    const validFiles = files.filter((file) =>
      validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
    );

    if (validFiles.length > 0) {
      // In Electron, dataTransfer.files has path property
      const paths = validFiles.map((file) => (file as File & { path: string }).path);
      await importBooks(paths);
    }
  }, [importBooks]);

  const filteredBooks = getFilteredBooks();

  if (isLoading) {
    return (
      <div className="page library-page">
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading library...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="page library-page"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="page-header">
        <h1 className="page-title">Library</h1>
        <button className="btn btn-primary" onClick={handleImportClick}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Import Books
        </button>
      </div>

      <div className="library-toolbar">
        <SearchBar 
          value={searchQuery} 
          onChange={setSearchQuery} 
          placeholder="Search books..." 
        />
        
        <div className="toolbar-actions">
          <select 
            className="input sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            aria-label="Sort books by"
          >
            <option value="recent">Recent</option>
            <option value="title">Title</option>
            <option value="author">Author</option>
          </select>

          <div className="view-toggle">
            <button
              className={`btn btn-ghost ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>
            <button
              className={`btn btn-ghost ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <h3>Your library is empty</h3>
          <p>Import your first book by clicking the button above or drag and drop files here.</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <h3>No books found</h3>
          <p>Try adjusting your search query.</p>
        </div>
      ) : (
        <BookGrid 
          books={filteredBooks} 
          viewMode={viewMode}
          onBookClick={handleBookClick}
          onDeleteBook={handleDeleteBook}
        />
      )}

      <div className={`drop-zone ${isDragging ? 'active' : ''}`}>
        <div className="drop-zone-content">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17,8 12,3 7,8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p>Drop files to import</p>
        </div>
      </div>
    </div>
  );
}

export default Library;
