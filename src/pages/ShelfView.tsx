import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShelvesStore } from '../stores/shelvesStore';
import { BookGrid } from '../components/BookGrid';
import { SearchBar } from '../components/SearchBar';
import type { Book } from '../../shared/types/book';
import type { SortOption, ViewMode } from '../../shared/types/book';
import './ShelfView.css';

export function ShelfView() {
  const { shelfId } = useParams<{ shelfId: string }>();
  const navigate = useNavigate();
  const { shelves, smartShelves, currentShelfBooks, loadShelfBooks, removeBookFromShelf } = useShelvesStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const currentShelf = [...shelves, ...smartShelves].find((s) => s.id === shelfId);
  const isSmart = currentShelf?.isSmart || false;

  useEffect(() => {
    if (shelfId) {
      loadShelfBooks(shelfId, isSmart);
    }
  }, [shelfId, loadShelfBooks, isSmart]);

  if (!currentShelf) {
    return (
      <div className="shelf-view">
        <div className="shelf-not-found">
          <h2>Shelf not found</h2>
          <button onClick={() => navigate('/library')}>Back to Library</button>
        </div>
      </div>
    );
  }

  const filteredBooks = currentShelfBooks.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'author':
        return a.author.localeCompare(b.author);
      case 'recent':
      default:
        return new Date(b.importedAt).getTime() - new Date(a.importedAt).getTime();
    }
  });

  const handleRemoveFromShelf = async (bookId: string) => {
    if (isSmart) return; // Can't remove from smart shelves
    
    if (confirm('Remove this book from the shelf?')) {
      await removeBookFromShelf(shelfId!, bookId);
    }
  };

  return (
    <div className="shelf-view">
      <div className="shelf-header">
        <div className="shelf-title-section">
          <span className="shelf-icon" data-color={currentShelf.color}>
            {currentShelf.icon}
          </span>
          <div>
            <h1>{currentShelf.name}</h1>
            <p className="shelf-count">
              {currentShelfBooks.length} {currentShelfBooks.length === 1 ? 'book' : 'books'}
            </p>
          </div>
        </div>
      </div>

      <div className="shelf-controls">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={`Search in ${currentShelf.name}...`}
        />

        <div className="shelf-actions">
          <div className="sort-controls">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
              <option value="recent">Recently Added</option>
              <option value="title">Title</option>
              <option value="author">Author</option>
            </select>
          </div>

          <div className="view-toggle">
            <button
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              ⊞
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      <div className="shelf-content">
        {sortedBooks.length === 0 ? (
          <div className="empty-shelf">
            <p>
              {searchQuery
                ? 'No books match your search'
                : isSmart
                ? 'No books in this smart shelf yet'
                : 'This shelf is empty. Drag books here to add them.'}
            </p>
          </div>
        ) : (
          <BookGrid
            books={sortedBooks}
            viewMode={viewMode}
            onBookClick={(bookId) => navigate(`/reader/${bookId}`)}
            onEditBook={() => {}}
            onDeleteBook={isSmart ? (() => {}) : handleRemoveFromShelf}
            enableDragDrop={!isSmart}
          />
        )}
      </div>
    </div>
  );
}
