import sqlite3

DB = "onetrack.db"


def create_tables():
    con = sqlite3.connect(DB)
    cur = con.cursor()

    # Enable foreign keys for SQLite, prevents invalid references and ensures cascading deletes work properly
    cur.execute("PRAGMA foreign_keys = ON")

# Source: https://www.sqlitetutorial.net/sqlite-foreign-key/


    # Habits table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS habits (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            name          TEXT    NOT NULL CHECK(name <> ''),
            quit_date     DATE    NOT NULL,
            cost_per_day  REAL    NOT NULL CHECK(cost_per_day >= 0),
            reason        TEXT,
            is_active     INTEGER DEFAULT 1 CHECK(is_active IN (0,1))
        )
    """)

    # Ensure only ONE active habit at a time
    cur.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_habit
        ON habits(is_active)
        WHERE is_active = 1
    """) 

   
    # Rewards table

    cur.execute("""
        CREATE TABLE IF NOT EXISTS rewards (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_id      INTEGER NOT NULL,
            title         TEXT    NOT NULL CHECK(title <> ''),
            days_target   INTEGER NOT NULL CHECK(days_target > 0),
            claimed       INTEGER DEFAULT 0 CHECK(claimed IN (0,1)),
            FOREIGN KEY (habit_id) 
                REFERENCES habits(id)
                ON DELETE CASCADE) 
    """) # If we delete habit, then rewards & milestones auto-delete
    

    # Milestones table    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS milestones (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_id        INTEGER NOT NULL,
            days_required   INTEGER NOT NULL CHECK(days_required > 0),
            label           TEXT    NOT NULL CHECK(label <> ''),
            achieved        INTEGER DEFAULT 0 CHECK(achieved IN (0,1)),
            FOREIGN KEY (habit_id) 
                REFERENCES habits(id)
                ON DELETE CASCADE
        )
    """)

    con.commit()
    con.close()
    print("✅ Database upgraded successfully!")


if __name__ == '__main__':
    create_tables()