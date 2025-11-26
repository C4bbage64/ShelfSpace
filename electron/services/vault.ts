import { app } from 'electron';
import path from 'path';
import fs from 'fs';

let vaultPath: string;

export function getVaultPath(): string {
  if (!vaultPath) {
    const userDataPath = app.getPath('userData');
    vaultPath = path.join(userDataPath, 'shelfspace', 'books');
  }
  return vaultPath;
}

export function getBookDir(bookId: string): string {
  return path.join(getVaultPath(), bookId);
}

export function getBookFilePath(bookId: string, extension: string): string {
  return path.join(getBookDir(bookId), `book.${extension}`);
}

export function getCoverPath(bookId: string): string {
  return path.join(getBookDir(bookId), 'cover.png');
}

export function getMetaPath(bookId: string): string {
  return path.join(getBookDir(bookId), 'meta.json');
}

export async function initializeVault(): Promise<void> {
  const vaultDir = getVaultPath();
  
  if (!fs.existsSync(vaultDir)) {
    fs.mkdirSync(vaultDir, { recursive: true });
    console.log('Book vault initialized at:', vaultDir);
  }
}

export async function createBookDirectory(bookId: string): Promise<string> {
  const bookDir = getBookDir(bookId);
  
  if (!fs.existsSync(bookDir)) {
    fs.mkdirSync(bookDir, { recursive: true });
  }
  
  return bookDir;
}

export async function copyBookToVault(
  sourcePath: string,
  bookId: string,
  extension: string
): Promise<string> {
  await createBookDirectory(bookId);
  const destPath = getBookFilePath(bookId, extension);
  
  fs.copyFileSync(sourcePath, destPath);
  
  return destPath;
}

export async function deleteBookFromVault(bookId: string): Promise<void> {
  const bookDir = getBookDir(bookId);
  
  if (fs.existsSync(bookDir)) {
    fs.rmSync(bookDir, { recursive: true, force: true });
  }
}

export async function saveBookMeta(
  bookId: string,
  meta: object
): Promise<void> {
  const metaPath = getMetaPath(bookId);
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
}

export async function saveCover(
  bookId: string,
  coverBuffer: Buffer
): Promise<string> {
  const coverPath = getCoverPath(bookId);
  fs.writeFileSync(coverPath, coverBuffer);
  return coverPath;
}
