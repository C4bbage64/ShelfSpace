import { useState } from 'react';
import type { Shelf } from '../../shared/types/shelf';
import '../styles/Modal.css';

interface AddShelfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, color: string, icon: string) => Promise<void>;
}

const COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Orange', value: '#f59e0b' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Indigo', value: '#6366f1' },
];

const ICONS = ['📚', '📖', '📕', '📗', '📘', '📙', '📓', '📔', '📒', '📑', '🔖', '⭐', '💼', '🎯', '🏆', '🎨'];

export function AddShelfModal({ isOpen, onClose, onSubmit }: AddShelfModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [icon, setIcon] = useState('📚');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Shelf name is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit(name.trim(), color, icon);
      setName('');
      setColor('#3b82f6');
      setIcon('📚');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create shelf');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setName('');
      setColor('#3b82f6');
      setIcon('📚');
      setError('');
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Shelf</h2>
          <button className="modal-close" onClick={handleClose} disabled={isSubmitting}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="shelf-name">Shelf Name</label>
            <input
              id="shelf-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Science Fiction"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Icon</label>
            <div className="icon-picker">
              {ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  className={`icon-option ${icon === i ? 'selected' : ''}`}
                  onClick={() => setIcon(i)}
                  disabled={isSubmitting}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Color</label>
            <div className="color-picker">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`color-option ${color === c.value ? 'selected' : ''}`}
                  style={{ backgroundColor: c.value }}
                  onClick={() => setColor(c.value)}
                  disabled={isSubmitting}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="primary">
              {isSubmitting ? 'Creating...' : 'Create Shelf'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
