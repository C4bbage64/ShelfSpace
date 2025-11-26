import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

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

export async function extractEpubCover(epubPath: string): Promise<Buffer | null> {
  try {
    const zip = new AdmZip(epubPath);
    const entries = zip.getEntries();
    
    // First, try to find cover from container.xml and content.opf
    const containerEntry = entries.find(e => e.entryName === 'META-INF/container.xml');
    if (!containerEntry) return null;
    
    const containerXml = containerEntry.getData().toString('utf8');
    const rootfileMatch = containerXml.match(/full-path="([^"]+\.opf)"/);
    if (!rootfileMatch) return null;
    
    const opfPath = rootfileMatch[1];
    const opfEntry = entries.find(e => e.entryName === opfPath);
    if (!opfEntry) return null;
    
    const opfContent = opfEntry.getData().toString('utf8');
    const opfDir = path.dirname(opfPath);
    
    // Look for cover image in manifest
    // First try meta cover
    const coverIdMatch = opfContent.match(/<meta[^>]*name="cover"[^>]*content="([^"]+)"/);
    let coverHref: string | null = null;
    
    if (coverIdMatch) {
      const coverId = coverIdMatch[1];
      const itemMatch = opfContent.match(new RegExp(`<item[^>]*id="${coverId}"[^>]*href="([^"]+)"`, 'i'));
      if (itemMatch) {
        coverHref = itemMatch[1];
      }
    }
    
    // If no cover meta, look for item with id containing "cover"
    if (!coverHref) {
      const coverItemMatch = opfContent.match(/<item[^>]*id="[^"]*cover[^"]*"[^>]*href="([^"]+\.(jpe?g|png|gif))"/i);
      if (coverItemMatch) {
        coverHref = coverItemMatch[1];
      }
    }
    
    // Try looking for image with "cover" in filename
    if (!coverHref) {
      const coverFileEntry = entries.find(e => 
        /cover\.(jpe?g|png|gif)$/i.test(e.entryName)
      );
      if (coverFileEntry) {
        return coverFileEntry.getData();
      }
    }
    
    if (coverHref) {
      // Resolve path relative to OPF file
      const coverPath = opfDir ? `${opfDir}/${coverHref}` : coverHref;
      const coverEntry = entries.find(e => e.entryName === coverPath || e.entryName === coverHref);
      if (coverEntry) {
        return coverEntry.getData();
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting EPUB cover:', error);
    return null;
  }
}

export async function extractEpubMetadata(
  epubPath: string
): Promise<{ title?: string; author?: string }> {
  try {
    const zip = new AdmZip(epubPath);
    const entries = zip.getEntries();
    
    // Find content.opf via container.xml
    const containerEntry = entries.find(e => e.entryName === 'META-INF/container.xml');
    if (!containerEntry) {
      return { title: path.basename(epubPath, '.epub') };
    }
    
    const containerXml = containerEntry.getData().toString('utf8');
    const rootfileMatch = containerXml.match(/full-path="([^"]+\.opf)"/);
    if (!rootfileMatch) {
      return { title: path.basename(epubPath, '.epub') };
    }
    
    const opfEntry = entries.find(e => e.entryName === rootfileMatch[1]);
    if (!opfEntry) {
      return { title: path.basename(epubPath, '.epub') };
    }
    
    const opfContent = opfEntry.getData().toString('utf8');
    
    // Extract title
    const titleMatch = opfContent.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i);
    const title = titleMatch ? titleMatch[1].trim() : path.basename(epubPath, '.epub');
    
    // Extract author
    const authorMatch = opfContent.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/i);
    const author = authorMatch ? authorMatch[1].trim() : undefined;
    
    return { title, author };
  } catch (error) {
    console.error('Error extracting EPUB metadata:', error);
    return {
      title: path.basename(epubPath, '.epub'),
    };
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
