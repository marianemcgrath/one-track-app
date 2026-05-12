import sqlite3

DB = "onetrack.db"

def get_db_connection():
    con = sqlite3.connect(DB)
    con.execute("PRAGMA foreign_keys = ON")
    con.row_factory = sqlite3.Row
    return con

def create_tables():
    con = sqlite3.connect(DB)
    con.execute("PRAGMA foreign_keys = ON")
    cur = con.cursor()

    # Enable foreign keys for SQLite, prevents invalid references and ensures cascading deletes work properly
    cur.execute("PRAGMA foreign_keys = ON")

# Source: https://www.sqlitetutorial.net/sqlite-foreign-key/

    # Users table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        username      TEXT    NOT NULL UNIQUE CHECK(username <> ''),
        email         TEXT    NOT NULL UNIQUE CHECK(email <> ''),
        password_hash TEXT    NOT NULL,
        created_at    DATETIME DEFAULT CURRENT_TIMESTAMP)
    """)

    # Habits table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS habits (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id       INTEGER NOT NULL,
            name          TEXT    NOT NULL CHECK(name <> ''),
            start_date    DATE    NOT NULL,
            created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
            cost_per_day  REAL    NOT NULL CHECK(cost_per_day >= 0),
            reason        TEXT,
            is_active     INTEGER DEFAULT 1 CHECK(is_active IN (0,1)),
            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        )
    """)

    # Ensure only ONE active habit at a time per user
    cur.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_habit
        ON habits(user_id, is_active)
        WHERE is_active = 1
    """)
   
    con.commit()
    con.close()
    print("✅ Database upgraded successfully!")


if __name__ == '__main__':
    create_tables()