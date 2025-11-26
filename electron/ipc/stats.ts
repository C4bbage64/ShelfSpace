import type { IpcMain } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import { IPC_CHANNELS } from '../../shared/types/ipc';
import type { ReadingSession, ReadingStats, BookReadingStats } from '../../shared/types/stats';
import { getDatabase } from '../db';

export function registerStatsHandlers(ipcMain: IpcMain): void {
  // Start a reading session
  ipcMain.handle(
    IPC_CHANNELS.STATS_START_SESSION,
    async (_event, bookId: string): Promise<ReadingSession> => {
      const db = getDatabase();
      const id = uuidv4();
      const now = new Date().toISOString();
      
      const stmt = db.prepare(`
        INSERT INTO reading_sessions (id, bookId, startTime, durationMinutes)
        VALUES (?, ?, ?, 0)
      `);
      stmt.run(id, bookId, now);
      
      return {
        id,
        bookId,
        startTime: now,
        endTime: null,
        durationMinutes: 0,
      };
    }
  );

  // End a reading session
  ipcMain.handle(
    IPC_CHANNELS.STATS_END_SESSION,
    async (_event, sessionId: string): Promise<ReadingSession | null> => {
      const db = getDatabase();
      const now = new Date().toISOString();
      
      // Get the session to calculate duration
      const getStmt = db.prepare('SELECT * FROM reading_sessions WHERE id = ?');
      const session = getStmt.get(sessionId) as ReadingSession | undefined;
      
      if (!session) return null;
      
      // Calculate duration in minutes
      const startTime = new Date(session.startTime);
      const endTime = new Date(now);
      const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
      
      // Update the session
      const updateStmt = db.prepare(`
        UPDATE reading_sessions 
        SET endTime = ?, durationMinutes = ?
        WHERE id = ?
      `);
      updateStmt.run(now, durationMinutes, sessionId);
      
      return {
        ...session,
        endTime: now,
        durationMinutes,
      };
    }
  );

  // Get reading stats for a specific book
  ipcMain.handle(
    IPC_CHANNELS.STATS_GET_BOOK,
    async (_event, bookId: string): Promise<BookReadingStats> => {
      const db = getDatabase();
      
      const stmt = db.prepare(`
        SELECT 
          COUNT(*) as totalSessions,
          COALESCE(SUM(durationMinutes), 0) as totalMinutes,
          MAX(endTime) as lastReadAt
        FROM reading_sessions
        WHERE bookId = ?
      `);
      
      const result = stmt.get(bookId) as {
        totalSessions: number;
        totalMinutes: number;
        lastReadAt: string | null;
      };
      
      return {
        bookId,
        totalMinutes: result.totalMinutes,
        totalSessions: result.totalSessions,
        lastReadAt: result.lastReadAt,
      };
    }
  );

  // Get overall reading stats
  ipcMain.handle(
    IPC_CHANNELS.STATS_GET_OVERALL,
    async (): Promise<ReadingStats> => {
      const db = getDatabase();
      
      // Get overall stats
      const overallStmt = db.prepare(`
        SELECT 
          COALESCE(SUM(durationMinutes), 0) as totalMinutes,
          COUNT(DISTINCT bookId) as totalBooks,
          COALESCE(AVG(durationMinutes), 0) as averageSessionMinutes,
          COALESCE(MAX(durationMinutes), 0) as longestSessionMinutes
        FROM reading_sessions
        WHERE endTime IS NOT NULL
      `);
      
      const overall = overallStmt.get() as {
        totalMinutes: number;
        totalBooks: number;
        averageSessionMinutes: number;
        longestSessionMinutes: number;
      };
      
      // Get this week's stats
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const weekStmt = db.prepare(`
        SELECT 
          COUNT(*) as sessionsThisWeek,
          COALESCE(SUM(durationMinutes), 0) as minutesThisWeek
        FROM reading_sessions
        WHERE startTime >= ? AND endTime IS NOT NULL
      `);
      
      const week = weekStmt.get(weekAgo.toISOString()) as {
        sessionsThisWeek: number;
        minutesThisWeek: number;
      };
      
      // Get recent sessions
      const recentStmt = db.prepare(`
        SELECT * FROM reading_sessions
        WHERE endTime IS NOT NULL
        ORDER BY startTime DESC
        LIMIT 10
      `);
      
      const recentSessions = recentStmt.all() as ReadingSession[];
      
      return {
        totalMinutes: overall.totalMinutes,
        totalBooks: overall.totalBooks,
        averageSessionMinutes: Math.round(overall.averageSessionMinutes),
        longestSessionMinutes: overall.longestSessionMinutes,
        sessionsThisWeek: week.sessionsThisWeek,
        minutesThisWeek: week.minutesThisWeek,
        recentSessions,
      };
    }
  );
}
