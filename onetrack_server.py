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


@app.route('/support.html')
def support():
    return send_from_directory('static', 'support.html')


@app.route('/distract.html')
def distraction():
    return send_from_directory('static', 'distract.html')


# SESSION ENDPOINT
@app.route('/api/users', methods=['GET'])
def get_users():
    users = dao.get_all_users()
    return jsonify(users)


# USER ENDPOINTS
@app.route('/api/user', methods=['POST'])
def add_user():
    data = request.get_json()
    if not data:
        return jsonify({
            "error": "No data provided"
        }), 400

    result = dao.add_user(
        username=data.get('username'),
        email=data.get('email'),
        password=data.get('password')
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

    if habit is None:
        return jsonify({
            "error": "Habit not found"
        }), 404

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
        user_id=data.get('user_id'),
        name=data.get('name'),
        start_date=data.get('start_date'),
        cost_per_day=data.get('cost_per_day'),
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

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

# RUN SERVER
if __name__ == '__main__':
    app.run()