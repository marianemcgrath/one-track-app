# This file contains all the functions that interact with the database.
# It is used by the other files to get and update data in the database.
# Also, it's used to create the database and tables if they do not exist.


import sqlite3
from datetime import date

DB = "onetrack.db"

def get_connection():
    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row  # access columns by name
    return con

# Habit functions

def can_add_new_habit():
    con = sqlite3.connect(DB)
    cur = con.cursor()
    row = cur.execute("""
        SELECT quit_date FROM habits WHERE is_active = 1 LIMIT 1
    """).fetchone()
    con.close()

    if row is None:
        return True  # No habit yet, free to add

    quit_date = date.fromisoformat(row[0])
    days_elapsed = (date.today() - quit_date).days
    return days_elapsed >= 28

def add_habit(name, quit_date, cost_per_day, reason=""):
    if not can_add_new_habit():
        return {"error": "You must complete 28 days before starting a new habit"}
    
    con = sqlite3.connect(DB)
    cur = con.cursor()
    # Archive the old one
    cur.execute("UPDATE habits SET is_active = 0 WHERE is_active = 1")
    # Add the new one
    cur.execute("""
        INSERT INTO habits (name, quit_date, cost_per_day, reason)
        VALUES (?, ?, ?, ?)
    """, (name, quit_date, cost_per_day, reason))
    con.commit()
    con.close()
    return {
        "name": name,
        "quit_date": quit_date,
        "cost_per_day": cost_per_day,
        "reason": reason
    }

# Reward functions 


# Milestone functions

