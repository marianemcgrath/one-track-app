# OneTrack DAO
import sqlite3
from datetime import date

from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)

from onetrack_database import get_db_connection


# User functions

def add_user(username, email, password):

    if not username:
        return {"error": "Username is required"}

    if not email:
        return {"error": "Email is required"}

    if not password:
        return {"error": "Password is required"}

    password_hash = generate_password_hash(password)

    with get_db_connection() as con:
        cur = con.cursor()

        try:

            cur.execute("""
                INSERT INTO users (
                    username,
                    email,
                    password_hash
                )
                VALUES (?, ?, ?)
            """, (
                username,
                email,
                password_hash
            ))

            user_id = cur.lastrowid

        except sqlite3.IntegrityError:

            return {
                "error": "Username or email already exists"
            }

    return {
        "id": user_id,
        "username": username,
        "email": email
    }


def login_user(email, password):

    with get_db_connection() as con:
        cur = con.cursor()
        user = cur.execute("""
            SELECT *
            FROM users
            WHERE email = ?
        """, (email,)).fetchone()

        if user is None:
            return {"error": "Invalid email or password"}

        if not check_password_hash(
            user["password_hash"],
            password
        ):
            return {"error": "Invalid email or password"}

    return {
        "id": user["id"],
        "username": user["username"],
        "email": user["email"]
    }


def get_user_by_id(user_id):

    with get_db_connection() as con:
        cur = con.cursor()
        user = cur.execute("""
            SELECT id, username, email, created_at
            FROM users
            WHERE id = ?
        """, (user_id,)).fetchone()

        if user is None:
            return None

    return dict(user)


def get_all_users():

    with get_db_connection() as con:
        cur = con.cursor()
        cur.execute("""
            SELECT id, username
            FROM users
            ORDER BY username
        """)

        users = [
            dict(row)
            for row in cur.fetchall()
        ]

    return users


# Habit functions

def can_add_new_habit(user_id):
    with get_db_connection() as con:
        cur = con.cursor()
        row = cur.execute("""
            SELECT start_date
            FROM habits
            WHERE is_active = 1
            AND user_id = ?
            LIMIT 1
        """, (user_id,)).fetchone()

    if row is None:
        return True

    start_date = date.fromisoformat(
        row["start_date"]
    )

    days_elapsed = (
        date.today() - start_date
    ).days

    return days_elapsed >= 28


def add_habit(
    user_id,
    name,
    start_date,
    cost_per_day,
    reason=""
):

    if not name:
        return {"error": "Habit name is required"}

    if cost_per_day < 0:
        return {"error": "Cost per day cannot be negative"}

    if not can_add_new_habit(user_id):
        return {
            "error":
            "You must complete 28 days before starting a new habit"
        }

    with get_db_connection() as con:
        cur = con.cursor()

        # Archive old active habit

        cur.execute("""
            UPDATE habits
            SET is_active = 0
            WHERE is_active = 1
            AND user_id = ?
        """, (user_id,))

        # Add new habit

        cur.execute("""
            INSERT INTO habits (
                user_id,
                name,
                start_date,
                cost_per_day,
                reason,
                is_active
            )
            VALUES (?, ?, ?, ?, ?, 1)
        """, (
            user_id,
            name,
            start_date,
            cost_per_day,
            reason
        ))

        habit_id = cur.lastrowid

    return {
        "id": habit_id,
        "user_id": user_id,
        "name": name,
        "start_date": start_date,
        "cost_per_day": cost_per_day,
        "reason": reason
    }


def get_active_habit(user_id):

    with get_db_connection() as con:

        cur = con.cursor()

        row = cur.execute("""
            SELECT *
            FROM habits
            WHERE is_active = 1
            AND user_id = ?
            LIMIT 1
        """, (user_id,)).fetchone()

        if row is None:
            return None
        
        habit = dict(row)
    return habit


def update_habit(
    habit_id,
    name=None,
    cost_per_day=None,
    reason=None
):

    with get_db_connection() as con:

        cur = con.cursor()

        habit = cur.execute("""
            SELECT *
            FROM habits
            WHERE id = ?
        """, (habit_id,)).fetchone()

        if habit is None:
            return {"error": "Habit not found"}

        updated_name = (
            name
            if name is not None
            else habit["name"]
        )

        updated_cost = (
            cost_per_day
            if cost_per_day is not None
            else habit["cost_per_day"]
        )

        updated_reason = (
            reason
            if reason is not None
            else habit["reason"]
        )

        if updated_cost < 0:
            return {
                "error": "Cost per day cannot be negative"
            }

        cur.execute("""
            UPDATE habits
            SET
                name = ?,
                cost_per_day = ?,
                reason = ?
            WHERE id = ?
        """, (
            updated_name,
            updated_cost,
            updated_reason,
            habit_id
        ))

    return {
        "id": habit_id,
        "name": updated_name,
        "cost_per_day": updated_cost,
        "reason": updated_reason
    }


def delete_habit(habit_id):

    with get_db_connection() as con:
        cur = con.cursor()
        habit = cur.execute("""
            SELECT id
            FROM habits
            WHERE id = ?
        """, (habit_id,)).fetchone()

        if habit is None:
            return {"error": "Habit not found"}

        cur.execute("""
            DELETE FROM habits
            WHERE id = ?
        """, (habit_id,))

    return {
        "status": "deleted",
        "id": habit_id
    }