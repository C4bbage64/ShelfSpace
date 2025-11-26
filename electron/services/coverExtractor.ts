import fs from 'fs';
import path from 'path';

// Note: pdfjs-dist requires browser APIs (DOMMatrix, canvas)
// For the Electron main process, we extract basic metadata from the file itself
// Full PDF parsing is done in the renderer process

export async function extractPdfCover(_pdfPath: string): Promise<Buffer | null> {
  // Cover extraction requires canvas, which is browser-only
  // Handle in renderer process instead
  return null;
}

export async function extractPdfMetadata(
  pdfPath: string
): Promise<{ title?: string; author?: string; pages?: number }> {
  try {
    // Read file and try to extract basic PDF metadata from the header
    const buffer = fs.readFileSync(pdfPath);
    const content = buffer.toString('latin1', 0, Math.min(buffer.length, 50000));
    
    // Try to find title in PDF info dictionary
    let title: string | undefined;
    let author: string | undefined;
    
    const titleMatch = content.match(/\/Title\s*\(([^)]+)\)/);
    if (titleMatch) {
      title = titleMatch[1];
    }
    
    const authorMatch = content.match(/\/Author\s*\(([^)]+)\)/);
    if (authorMatch) {
      author = authorMatch[1];
    }
    
    // Count pages approximately by looking for /Type /Page entries
    const pageMatches = content.match(/\/Type\s*\/Page[^s]/g);
    const pages = pageMatches ? pageMatches.length : undefined;
    
    // Fallback to filename if no title found
    if (!title) {
      title = path.basename(pdfPath, '.pdf');
    }
    
    return { title, author, pages };
  } catch (error) {
    console.error('Error extracting PDF metadata:', error);
    return {
      title: path.basename(pdfPath, '.pdf'),
    };
  }
}

export async function extractEpubCover(_epubPath: string): Promise<Buffer | null> {
  // EPUB cover extraction would require parsing the EPUB container
  // and extracting the cover image from the package
  // For MVP, we'll handle this in the renderer process with epub.js
  return null;
}

export async function extractEpubMetadata(
  epubPath: string
): Promise<{ title?: string; author?: string }> {
  // Basic EPUB metadata extraction
  // Full implementation would parse META-INF/container.xml and content.opf
  try {
    const fileName = path.basename(epubPath, '.epub');
    return {
      title: fileName,
    };
  } catch (error) {
    console.error('Error extracting EPUB metadata:', error);
    return {};
  }
}

export async function extractTxtMetadata(
  txtPath: string
): Promise<{ title?: string }> {
  const fileName = path.basename(txtPath, '.txt');
  return {
    title: fileName,
  };
}
