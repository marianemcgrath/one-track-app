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
    con = get_connection()
    cur = con.cursor()
    row = cur.execute("""
        SELECT quit_date FROM habits WHERE is_active = 1 LIMIT 1
    """).fetchone()
    con.close()

    if row is None:
        return True  # No habit yet

    quit_date = date.fromisoformat(row["quit_date"])
    days_elapsed = (date.today() - quit_date).days

    return days_elapsed >= 28

def add_habit(name, quit_date, cost_per_day, reason=""):
    if not name:
        return {"error": "Habit name is required"}

    if cost_per_day < 0:
        return {"error": "Cost per day cannot be negative"}

    if not can_add_new_habit():
        return {"error": "You must complete 28 days before starting a new habit"}

    with get_connection() as con:
        cur = con.cursor()

        # Archive old habit
        cur.execute("""
            UPDATE habits SET is_active = 0 WHERE is_active = 1
        """)
   
    # Add the new habit
        cur.execute("""
            INSERT INTO habits (name, quit_date, cost_per_day, reason, is_active)
            VALUES (?, ?, ?, ?, 1)
        """, (name, quit_date, cost_per_day, reason))

        habit_id = cur.lastrowid

    return {
        "id": habit_id,
        "name": name,
        "quit_date": quit_date,
        "cost_per_day": cost_per_day,
        "reason": reason
    }

# Reward functions 

def add_reward(habit_id, title, days_target):
    if not title:
        return {"error": "Reward title is required"}

    if days_target <= 0:
        return {"error": "Days target must be positive"}

    with get_connection() as con:
        cur = con.cursor()

        # Optional: ensure habit exists
        habit = cur.execute("""
            SELECT id FROM habits WHERE id = ?
        """, (habit_id,)).fetchone()

        if habit is None:
            return {"error": "Habit not found"}

        cur.execute("""
            INSERT INTO rewards (habit_id, title, days_target)
            VALUES (?, ?, ?)
        """, (habit_id, title, days_target))

        reward_id = cur.lastrowid

    return {
        "id": reward_id,
        "habit_id": habit_id,
        "title": title,
        "days_target": days_target
    }

# Milestone functions

def add_milestone(habit_id, days_required, label):
    if not label:
        return {"error": "Milestone label is required"}

    if days_required <= 0:
        return {"error": "Days required must be positive"}

    with get_connection() as con:
        cur = con.cursor()

        # Optional: ensure habit exists
        habit = cur.execute("""
            SELECT id FROM habits WHERE id = ?
        """, (habit_id,)).fetchone()

        if habit is None:
            return {"error": "Habit not found"}

        cur.execute("""
            INSERT INTO milestones (habit_id, days_required, label)
            VALUES (?, ?, ?)
        """, (habit_id, days_required, label))

        milestone_id = cur.lastrowid # Get the ID of the newly inserted milestone

    return {
        "id": milestone_id,
        "habit_id": habit_id,
        "days_required": days_required,
        "label": label
    }
