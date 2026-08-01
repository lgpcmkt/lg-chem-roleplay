import Database from 'better-sqlite3';
import path from 'path';

// Define DB path
const dbPath = path.join(process.cwd(), 'lg_roleplay.db');
const db = new Database(dbPath);

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    track TEXT NOT NULL,
    scenarioId TEXT NOT NULL,
    grade TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id)
  );
`);

export interface User {
  id: string;
  name: string;
}

export interface Session {
  id: string;
  userId: string;
  track: 'hospital' | 'local';
  scenarioId: string;
  grade: 'S' | 'A' | 'B' | 'C';
  timestamp?: string;
}

export const dbService = {
  // Login / Create User
  loginUser: (id: string, name: string): User => {
    const stmt = db.prepare('INSERT OR IGNORE INTO users (id, name) VALUES (?, ?)');
    stmt.run(id, name);
    // Fetch the user to ensure we return the stored name
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User;
  },

  // Save a roleplay session
  saveSession: (session: Session) => {
    const stmt = db.prepare(
      'INSERT INTO sessions (id, userId, track, scenarioId, grade) VALUES (?, ?, ?, ?, ?)'
    );
    stmt.run(session.id, session.userId, session.track, session.scenarioId, session.grade);
  },

  // Get user progress (count of A or S grades per track)
  getUserProgress: (userId: string) => {
    // A grade or S grade counts as a clear.
    const stmt = db.prepare(`
      SELECT track, COUNT(DISTINCT scenarioId) as clearCount 
      FROM sessions 
      WHERE userId = ? AND grade IN ('S', 'A') 
      GROUP BY track
    `);
    const rows = stmt.all(userId) as { track: string; clearCount: number }[];
    
    const progress = {
      hospital: 0,
      local: 0
    };
    
    rows.forEach(r => {
      if (r.track === 'hospital' || r.track === 'local') {
        progress[r.track] = r.clearCount;
      }
    });
    
    return progress;
  }
};
