import { useEffect, useState } from 'react';
import { useShelvesStore } from '../stores/shelvesStore';
import '../styles/Modal.css';
import './AddToShelfModal.css';

interface AddToShelfModalProps {
  isOpen: boolean;
  bookId: string;
  bookTitle: string;
  onClose: () => void;
}

export function AddToShelfModal({ isOpen, bookId, bookTitle, onClose }: AddToShelfModalProps) {
  const { shelves, loadShelves, addBookToShelf } = useShelvesStore();
  const [selectedShelfId, setSelectedShelfId] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadShelves();
    }
  }, [isOpen, loadShelves]);

  if (!isOpen) return null;

  const filteredShelves = shelves.filter((shelf) =>
    shelf.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToShelf = async () => {
    if (!selectedShelfId) return;

    setIsAdding(true);
    try {
      await addBookToShelf(selectedShelfId, bookId);
      onClose();
    } catch (error) {
      console.error('Failed to add book to shelf:', error);
      alert('Failed to add book to shelf');
    } finally {
      setIsAdding(false);
    }
  };

  const handleShelfClick = (shelfId: string) => {
    setSelectedShelfId(shelfId);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-to-shelf-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add to Shelf</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="book-title-preview">
            <strong>{bookTitle}</strong>
          </p>

          {shelves.length === 0 ? (
            <div className="no-shelves-message">
              <p>You don't have any shelves yet.</p>
              <p className="hint">Create a shelf first to organize your books.</p>
            </div>
          ) : (
            <>
              <div className="search-shelves">
                <input
                  type="text"
                  placeholder="Search shelves..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input"
                />
              </div>

              <div className="shelves-list">
                {filteredShelves.length === 0 ? (
                  <p className="no-results">No shelves found</p>
                ) : (
                  filteredShelves.map((shelf) => (
                    <div
                      key={shelf.id}
                      className={`shelf-item ${selectedShelfId === shelf.id ? 'selected' : ''}`}
                      onClick={() => handleShelfClick(shelf.id)}
                    >
                      <span className="shelf-icon">{shelf.icon}</span>
                      <span className="shelf-name">{shelf.name}</span>
                      <span className="shelf-count">{shelf.bookCount} books</span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={isAdding}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleAddToShelf}
            disabled={!selectedShelfId || isAdding || shelves.length === 0}
          >
            {isAdding ? 'Adding...' : 'Add to Shelf'}
          </button>
        </div>
      </div>
    </div>
  );
}
