import { useEffect, useRef, useState, useCallback } from 'react';
import './TXTReader.css';

interface TXTReaderProps {
  fileData: string; // base64 encoded
  initialProgress?: number;
  onProgressUpdate: (location: string, percentage: number) => void;
}

function TXTReader({ fileData, initialProgress = 0, onProgressUpdate }: TXTReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load text file
  useEffect(() => {
    try {
      setIsLoading(true);
      setError(null);

      // Decode base64 to string
      const binaryString = atob(fileData);
      // Convert to UTF-8
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(bytes);
      
      setContent(text);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load text file:', err);
      setError('Failed to load text file');
      setIsLoading(false);
    }
  }, [fileData]);

  // Restore scroll position after content loads
  useEffect(() => {
    if (!isLoading && containerRef.current && initialProgress > 0) {
      const scrollHeight = containerRef.current.scrollHeight - containerRef.current.clientHeight;
      containerRef.current.scrollTop = (initialProgress / 100) * scrollHeight;
    }
  }, [isLoading, initialProgress]);

  // Track scroll progress
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const maxScroll = scrollHeight - clientHeight;
    const percentage = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;

    onProgressUpdate(scrollTop.toString(), percentage);
  }, [onProgressUpdate]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (isLoading) {
    return (
      <div className="txt-reader">
        <div className="txt-loading">
          <div className="spinner" />
          <p>Loading text file...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="txt-reader">
        <div className="txt-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="txt-reader">
      <div className="txt-container" ref={containerRef}>
        <div className="txt-content">
          {content.split('\n').map((line, index) => (
            <p key={index} className={line.trim() === '' ? 'empty-line' : ''}>
              {line || '\u00A0'}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TXTReader;
