import sqlite3

DB = "onetrack.db"

def create_tables():
    con = sqlite3.connect(DB)
    cur = con.cursor()

    # -----------------------------------------------
    # habits table
    # -----------------------------------------------
    cur.execute("""
        CREATE TABLE IF NOT EXISTS habits (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT    NOT NULL,
            quit_date   DATE    NOT NULL,
            cost_per_day REAL   NOT NULL,
            reason      TEXT,
            is_active   INTEGER DEFAULT 1
        )
    """)

    # -----------------------------------------------
    # rewards table
    # -----------------------------------------------
    cur.execute("""
        CREATE TABLE IF NOT EXISTS rewards (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_id    INTEGER NOT NULL,
            title       TEXT    NOT NULL,
            days_target INTEGER NOT NULL,
            claimed     INTEGER DEFAULT 0,
            FOREIGN KEY (habit_id) REFERENCES habits(id)
        )
    """)

    # -----------------------------------------------
    # milestones table
    # -----------------------------------------------
    cur.execute("""
        CREATE TABLE IF NOT EXISTS milestones (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_id      INTEGER NOT NULL,
            days_required INTEGER NOT NULL,
            label         TEXT    NOT NULL,
            achieved      INTEGER DEFAULT 0,
            FOREIGN KEY (habit_id) REFERENCES habits(id)
        )
    """)

    con.commit()
    con.close()
    print("✅ Database and tables created successfully!")

if __name__ == '__main__':
    create_tables()