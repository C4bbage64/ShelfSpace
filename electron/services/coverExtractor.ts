import fs from 'fs';
import path from 'path';
import { getDocument } from 'pdfjs-dist';

export async function extractPdfCover(pdfPath: string): Promise<Buffer | null> {
  try {
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const pdf = await getDocument({ data }).promise;
    
    // For cover extraction, we would need node-canvas in the main process
    // For now, cover extraction is handled in the renderer process
    await pdf.destroy();
    return null;
  } catch (error) {
    console.error('Error extracting PDF cover:', error);
    return null;
  }
}

export async function extractPdfMetadata(
  pdfPath: string
): Promise<{ title?: string; author?: string; pages?: number }> {
  try {
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const pdf = await getDocument({ data }).promise;
    const metadata = await pdf.getMetadata();
    const numPages = pdf.numPages;
    
    await pdf.destroy();
    
    const info = metadata.info as Record<string, unknown> | undefined;
    
    return {
      title: info?.Title as string | undefined,
      author: info?.Author as string | undefined,
      pages: numPages,
    };
  } catch (error) {
    console.error('Error extracting PDF metadata:', error);
    return {};
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
