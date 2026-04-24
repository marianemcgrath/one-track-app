from flask import Flask, request, jsonify
from flask_cors import CORS
import onetrack_dao as dao

app = Flask(__name__)
CORS(app)


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
    return jsonify({"status": "claimed", "reward": result})


# Milestone endpoints
@app.route('/api/milestone', methods=['POST'])
def add_milestone():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    result = dao.add_milestone(
        habit_id=data['habit_id'],
        days_required=data['days_required'],
        label=data['label']
    )
    if "error" in result:
        return jsonify(result), 400
    return jsonify({"status": "created", "milestone": result}), 201


@app.route('/api/milestone/<int:milestone_id>/achieve', methods=['PATCH'])
def achieve_milestone(milestone_id):
    result = dao.achieve_milestone(milestone_id)
    if "error" in result:
        return jsonify(result), 400
    return jsonify({"status": "achieved", "milestone": result})


# Run
if __name__ == '__main__':
    app.run(debug=True)