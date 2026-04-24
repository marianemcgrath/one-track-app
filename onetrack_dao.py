# This file contains all the functions that interact with the database.
# It is used by the other files to get and update data in the database.
# Also, it's used to create the database and tables if they do not exist.

import sqlite3
from datetime import date
import hashlib

DB = "onetrack.db"


def get_connection():
    con = sqlite3.connect(DB)
    con.execute("PRAGMA foreign_keys = ON")
    con.row_factory = sqlite3.Row  # Allows dict-style access to rows
    return con
def get_active_habit(user_id):
    con = get_connection()
    cur = con.cursor()
    row = cur.execute("""
        SELECT * FROM habits WHERE is_active = 1 AND user_id = ? LIMIT 1
    """, (user_id,)).fetchone()
    con.close()

    if row is None:
        return None
    return dict(row)


def claim_reward(reward_id):
    with get_connection() as con:
        cur = con.cursor()

        reward = cur.execute("""
            SELECT * FROM rewards WHERE id = ?
        """, (reward_id,)).fetchone()

        if reward is None:
            return {"error": "Reward not found"}

        if reward["claimed"]:
            return {"error": "Reward already claimed"}

        cur.execute("""
            UPDATE rewards SET claimed = 1, claimed_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (reward_id,))

    return {
        "id": reward_id,
        "status": "claimed"
    }


def achieve_milestone(milestone_id):
    with get_connection() as con:
        cur = con.cursor()

        milestone = cur.execute("""
            SELECT * FROM milestones WHERE id = ?
        """, (milestone_id,)).fetchone()

        if milestone is None:
            return {"error": "Milestone not found"}

        if milestone["achieved"]:
            return {"error": "Milestone already achieved"}

        cur.execute("""
            UPDATE milestones SET achieved = 1, achieved_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (milestone_id,))

    return {
        "id": milestone_id,
        "status": "achieved"
    }
def add_user(username, email, password):
    if not username:
        return {"error": "Username is required"}
    if not email:
        return {"error": "Email is required"}
    if not password:
        return {"error": "Password is required"}

    # Hash the password before storing it
    password_hash = hashlib.sha256(password.encode()).hexdigest()

    with get_connection() as con:
        cur = con.cursor()
        try:
            cur.execute("""
                INSERT INTO users (username, email, password_hash)
                VALUES (?, ?, ?)
            """, (username, email, password_hash))
            user_id = cur.lastrowid
        except sqlite3.IntegrityError:
            return {"error": "Username or email already exists"}

    return {
        "id": user_id,
        "username": username,
        "email": email
    }

# ── Habit functions ──────────────────────────────────────────────────────────

def can_add_new_habit(user_id):
    con = get_connection()
    cur = con.cursor()
    row = cur.execute("""
        SELECT start_date FROM habits WHERE is_active = 1 AND user_id = ? LIMIT 1
    """, (user_id,)).fetchone()
    con.close()

    if row is None:
        return True  # No active habit yet

    start_date = date.fromisoformat(row["start_date"])
    days_elapsed = (date.today() - start_date).days

    return days_elapsed >= 28


def add_habit(user_id, name, start_date, cost_per_day, reason=""):
    if not name:
        return {"error": "Habit name is required"}

    if cost_per_day < 0:
        return {"error": "Cost per day cannot be negative"}

    if not can_add_new_habit(user_id):
        return {"error": "You must complete 28 days before starting a new habit"}

    with get_connection() as con:
        cur = con.cursor()

        # Archive old habit
        cur.execute("""
            UPDATE habits SET is_active = 0 WHERE is_active = 1 AND user_id = ?
        """, (user_id,))

        # Add the new habit
        cur.execute("""
            INSERT INTO habits (user_id, name, start_date, cost_per_day, reason, is_active)
            VALUES (?, ?, ?, ?, ?, 1)
        """, (user_id, name, start_date, cost_per_day, reason))

        habit_id = cur.lastrowid

    return {
        "id": habit_id,
        "user_id": user_id,
        "name": name,
        "start_date": start_date,
        "cost_per_day": cost_per_day,
        "reason": reason
    }


# ── Reward functions ─────────────────────────────────────────────────────────

def add_reward(habit_id, title, days_target):
    if not title:
        return {"error": "Reward title is required"}

    if days_target <= 0:
        return {"error": "Days target must be positive"}

    with get_connection() as con:
        cur = con.cursor()

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


# ── Milestone functions ──────────────────────────────────────────────────────

def add_milestone(habit_id, days_required, label):
    if not label:
        return {"error": "Milestone label is required"}

    if days_required <= 0:
        return {"error": "Days required must be positive"}

    with get_connection() as con:
        cur = con.cursor()

        habit = cur.execute("""
            SELECT id FROM habits WHERE id = ?
        """, (habit_id,)).fetchone()

        if habit is None:
            return {"error": "Habit not found"}

        cur.execute("""
            INSERT INTO milestones (habit_id, days_required, label)
            VALUES (?, ?, ?)
        """, (habit_id, days_required, label))

        milestone_id = cur.lastrowid  # ID of new milestone

    return {
        "id": milestone_id,
        "habit_id": habit_id,
        "days_required": days_required,
        "label": label
    }