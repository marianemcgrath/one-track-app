from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

import requests
import os
import onetrack_dao as dao

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)


# User endpoints

@app.route('/api/user', methods=['POST'])
def add_user():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    result = dao.add_user(
        username=data['username'],
        email=data['email'],
        password=data['password']
    )
    if "error" in result:
        return jsonify(result), 400
    return jsonify({"status": "created", "user": result}), 201


# Habit endpoints

@app.route('/api/habit', methods=['GET'])
def get_habit():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    habit = dao.get_active_habit(user_id)
    if habit is None:
        return jsonify({"habit": None})
    return jsonify({"habit": habit})


@app.route('/api/habit', methods=['POST'])
def add_habit():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    result = dao.add_habit(
        user_id=data['user_id'],
        name=data['name'],
        start_date=data['start_date'],
        cost_per_day=data['cost_per_day'],
        reason=data.get('reason', '')
    )
    if "error" in result:
        return jsonify(result), 400
    return jsonify({"status": "created", "habit": result}), 201

@app.route('/api/habit/<int:habit_id>', methods=['DELETE'])
def delete_habit(habit_id):
    result = dao.delete_habit(habit_id)
    if "error" in result:
        return jsonify(result), 404
    return jsonify(result), 200


@app.route('/api/habit/<int:habit_id>', methods=['PUT'])
def update_habit(habit_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    result = dao.update_habit(
        habit_id=habit_id,
        name=data.get('name'),
        cost_per_day=data.get('cost_per_day'),
        reason=data.get('reason')
    )
    if "error" in result:
        return jsonify(result), 404
    return jsonify({"status": "updated", "habit": result}), 200

# Reward endpoints
@app.route('/api/reward', methods=['POST'])
def add_reward():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    result = dao.add_reward(
        habit_id=data['habit_id'],
        title=data['title'],
        days_target=data['days_target']
    )
    if "error" in result:
        return jsonify(result), 400
    return jsonify({"status": "created", "reward": result}), 201


@app.route('/api/reward/<int:reward_id>/claim', methods=['PATCH'])
def claim_reward(reward_id):
    result = dao.claim_reward(reward_id)
    if "error" in result:
        return jsonify(result), 400
    return jsonify({"status": "claimed", "reward": result}), 200


@app.route('/api/reward/<int:reward_id>', methods=['DELETE'])
def delete_reward(reward_id):
    result = dao.delete_reward(reward_id)
    if "error" in result:
        return jsonify(result), 404
    return jsonify(result), 200

# Milestone endpoints

# AI Support endpoint

@app.route('/api/support', methods=['POST'])
def ai_support():

    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    message = data.get("message", "").strip()
    system_prompt = data.get("system_prompt", "")

    if not message:
        return jsonify({"error": "Message is required"}), 400

    api_key = os.environ.get("ANTHROPIC_API_KEY")

    if not api_key:
        return jsonify({"error": "Missing API key"}), 500

    try:

        response = requests.post(
            "https://api.anthropic.com/v1/messages",

            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            },

            json={
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 500,
                "system": system_prompt,
                "messages": [
                    {"role": "user",
                    "content": message
                    }]
            },

            timeout=20)

        data = response.json()

        if response.status_code != 200:
            return jsonify({"error": data}), 500

        reply = data["content"][0]["text"]

        return jsonify({"reply": reply})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run
if __name__ == '__main__':
    app.run(debug=True)