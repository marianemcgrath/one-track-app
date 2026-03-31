# This file contains all the functions that interact with the database.
# It is used by the other files to get and update data in the database.
# Also, it's used to create the database and tables if they do not exist.


import sqlite3

DB = "onetrack.db"

def get_connection():
    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row  # lets us access columns by name
    return con


# Habit functions 


# Reward functions 


# Milestone functions

