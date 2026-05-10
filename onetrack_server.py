from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import onetrack_dao as dao

app = Flask(__name__)
CORS(app)


# STATIC PAGE ROUTES
@app.route('/')
def index():
    return send_from_directory('static', 'index.html')


@app.route('/index.html')
def index_html():
    return send_from_directory('static', 'index.html')


@app.route('/rewards.html')
def rewards():
    return send_from_directory('static', 'rewards.html')


@app.route('/support.html')
def support():
    return send_from_directory('static', 'support.html')


@app.route('/distraction.html')
def distraction():
    return send_from_directory('static', 'distraction.html')


# Catch-all for CSS, JS, images
# MUST stay near bottom

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)


# SESSION ENDPOINT
@app.route('/api/session', methods=['GET'])
def get_session():

    # Demo session for development
    return jsonify({
        "user_id": 1,
        "username": "demo_user"
    })


# USER ENDPOINTS
@app.route('/api/user', methods=['POST'])
def add_user():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No data provided"
        }), 400

    result = dao.add_user(
        username=data['username'],
        email=data['email'],
        password=data['password']
    )

    if "error" in result:
        return jsonify(result), 400

    return jsonify({
        "status": "created",
        "user": result
    }), 201


# HABIT ENDPOINTS
@app.route('/api/habit', methods=['GET'])
def get_habit():

    user_id = request.args.get('user_id')

    if not user_id:
        return jsonify({
            "error": "user_id is required"
        }), 400

    habit = dao.get_active_habit(user_id)

    return jsonify({
        "habit": habit
    })


@app.route('/api/habit', methods=['POST'])
def add_habit():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No data provided"
        }), 400

    result = dao.add_habit(
        user_id=data['user_id'],
        name=data['name'],
        start_date=data['start_date'],
        cost_per_day=data['cost_per_day'],
        reason=data.get('reason', '')
    )

    if "error" in result:
        return jsonify(result), 400

    return jsonify({
        "status": "created",
        "habit": result
    }), 201


@app.route('/api/habit/<int:habit_id>', methods=['PUT'])
def update_habit(habit_id):

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No data provided"
        }), 400

    result = dao.update_habit(
        habit_id=habit_id,
        name=data.get('name'),
        cost_per_day=data.get('cost_per_day'),
        reason=data.get('reason')
    )

    if "error" in result:
        return jsonify(result), 404

    return jsonify({
        "status": "updated",
        "habit": result
    })


@app.route('/api/habit/<int:habit_id>', methods=['DELETE'])
def delete_habit(habit_id):

    result = dao.delete_habit(habit_id)

    if "error" in result:
        return jsonify(result), 404

    return jsonify(result)


# REWARD ENDPOINTS
@app.route('/api/reward', methods=['GET'])
def get_rewards():

    habit_id = request.args.get('habit_id')

    if not habit_id:
        return jsonify({
            "error": "habit_id is required"
        }), 400

    rewards = dao.get_rewards_by_habit(habit_id)

    return jsonify(rewards)


@app.route('/api/reward', methods=['POST'])
def add_reward():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No data provided"
        }), 400

    result = dao.add_reward(
        habit_id=data['habit_id'],
        title=data['title'],
        days_target=data['days_target']
    )

    if "error" in result:
        return jsonify(result), 400

    return jsonify({
        "status": "created",
        "reward": result
    }), 201


@app.route('/api/reward/<int:reward_id>/claim', methods=['PATCH'])
def claim_reward(reward_id):

    result = dao.claim_reward(reward_id)

    if "error" in result:
        return jsonify(result), 400

    return jsonify({
        "status": "claimed",
        "reward": result
    })


@app.route('/api/reward/<int:reward_id>', methods=['DELETE'])
def delete_reward(reward_id):

    result = dao.delete_reward(reward_id)

    if "error" in result:
        return jsonify(result), 404

    return jsonify(result)


# MILESTONE ENDPOINTS
@app.route('/api/milestone', methods=['POST'])
def add_milestone():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No data provided"
        }), 400

    result = dao.add_milestone(
        habit_id=data['habit_id'],
        days_required=data['days_required'],
        label=data['label']
    )

    if "error" in result:
        return jsonify(result), 400

    return jsonify({
        "status": "created",
        "milestone": result
    }), 201

@app.route('/api/milestone', methods=['GET'])
def get_milestones():

    habit_id = request.args.get('habit_id')

    if not habit_id:
        return jsonify({
            "error": "habit_id is required"
        }), 400

    milestones = dao.get_milestones_by_habit(habit_id)

    return jsonify(milestones)

@app.route('/api/milestone/<int:milestone_id>/achieve', methods=['PATCH'])
def achieve_milestone(milestone_id):

    result = dao.achieve_milestone(milestone_id)

    if "error" in result:
        return jsonify(result), 400

    return jsonify({
        "status": "achieved",
        "milestone": result
    })

# RUN SERVER
if __name__ == '__main__':
    app.run(debug=True)