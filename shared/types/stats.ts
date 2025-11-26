// Reading session types
export interface ReadingSession {
  id: string;
  bookId: string;
  startTime: string;
  endTime: string | null;
  durationMinutes: number;
}

export interface ReadingStats {
  totalMinutes: number;
  totalBooks: number;
  averageSessionMinutes: number;
  longestSessionMinutes: number;
  sessionsThisWeek: number;
  minutesThisWeek: number;
  recentSessions: ReadingSession[];
}

export interface BookReadingStats {
  bookId: string;
  totalMinutes: number;
  totalSessions: number;
  lastReadAt: string | null;
}
