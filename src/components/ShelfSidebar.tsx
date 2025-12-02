import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useShelvesStore } from '../stores/shelvesStore';
import type { ShelfWithBookCount } from '../../shared/types/shelf';
import './ShelfSidebar.css';

interface ShelfSidebarProps {
  onCreateShelf: () => void;
}

export function ShelfSidebar({ onCreateShelf }: ShelfSidebarProps) {
  const location = useLocation();
  const { shelves, smartShelves, loadShelves, loadSmartShelves, deleteShelf, addBookToShelf } = useShelvesStore();
  const [contextMenu, setContextMenu] = useState<{ shelfId: string; x: number; y: number } | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    loadShelves();
    loadSmartShelves();
  }, [loadShelves, loadSmartShelves]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, shelfId: string) => {
    e.preventDefault();
    setContextMenu({ shelfId, x: e.clientX, y: e.clientY });
  };

  const handleDelete = async (shelfId: string) => {
    if (confirm('Are you sure you want to delete this shelf? Books will not be deleted.')) {
      await deleteShelf(shelfId);
      setContextMenu(null);
    }
  };

  const handleDragOver = (e: React.DragEvent, shelfId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOver(shelfId);
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  const handleDrop = async (e: React.DragEvent, shelfId: string) => {
    e.preventDefault();
    setDragOver(null);
    
    const bookId = e.dataTransfer.getData('bookId');
    if (bookId) {
      try {
        await addBookToShelf(shelfId, bookId);
      } catch (error) {
        console.error('Failed to add book to shelf:', error);
      }
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={`shelf-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button 
        className="shelf-sidebar-collapse-btn" 
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? 'Expand shelves' : 'Collapse shelves'}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {isCollapsed ? (
            <path d="M9 18l6-6-6-6" />
          ) : (
            <path d="M15 18l-6-6 6-6" />
          )}
        </svg>
      </button>
      
      <div className="sidebar-section">
        <Link to="/library" className={`sidebar-item ${isActive('/library') ? 'active' : ''}`} title="All Books">
          <span className="sidebar-icon">📚</span>
          {!isCollapsed && <span className="sidebar-label">All Books</span>}
        </Link>
      </div>

      <div className="sidebar-section">
        {!isCollapsed && (
          <div className="sidebar-section-header">
            <h3>Smart Shelves</h3>
          </div>
        )}
        {smartShelves.map((shelf) => (
          <Link
            key={shelf.id}
            to={`/shelf/${shelf.id}`}
            className={`sidebar-item ${isActive(`/shelf/${shelf.id}`) ? 'active' : ''}`}
            title={shelf.name}
          >
            <span className="sidebar-icon">{shelf.icon}</span>
            {!isCollapsed && <span className="sidebar-label">{shelf.name}</span>}
            {!isCollapsed && <span className="sidebar-count">{shelf.bookCount}</span>}
          </Link>
        ))}
      </div>

      <div className="sidebar-section">
        {!isCollapsed && (
          <div className="sidebar-section-header">
            <h3>My Shelves</h3>
            <button className="add-shelf-btn" onClick={onCreateShelf} title="Create shelf">
              +
            </button>
          </div>
        )}
        {shelves.length === 0 ? (
          !isCollapsed && (
            <div className="empty-shelves">
              <p>No shelves yet</p>
              <button onClick={onCreateShelf} className="create-first-shelf">
                Create your first shelf
              </button>
            </div>
          )
        ) : (
          shelves.map((shelf) => (
            <Link
              key={shelf.id}
              to={`/shelf/${shelf.id}`}
              className={`sidebar-item ${isActive(`/shelf/${shelf.id}`) ? 'active' : ''} ${dragOver === shelf.id ? 'drag-over' : ''}`}
              onContextMenu={(e) => handleContextMenu(e, shelf.id)}
              onDragOver={(e) => handleDragOver(e, shelf.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, shelf.id)}
              data-color={shelf.color}
              title={shelf.name}
            >
              <span className="sidebar-icon">{shelf.icon}</span>
              {!isCollapsed && <span className="sidebar-label">{shelf.name}</span>}
              {!isCollapsed && <span className="sidebar-count">{shelf.bookCount}</span>}
            </Link>
          ))
        )}
      </div>

      {contextMenu && (
        <div
          className="context-menu"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
        >
          <button onClick={() => handleDelete(contextMenu.shelfId)}>Delete Shelf</button>
        </div>
      )}
    </div>
  );
}
