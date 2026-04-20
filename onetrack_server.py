from flask import Flask, url_for, request, redirect, abort, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# -----------------------------------------------
# Endpoints
# -----------------------------------------------
@app.route('/api/habit', methods=['GET'])
def get_habit():
    habit = dao.get_active_habit()
    if habit is None:
        return jsonify({"habit": None})
    return jsonify({"habit": habit})

@app.route('/api/habit', methods=['POST'])
def add_habit():
    data = request.get_json()
    result = dao.add_habit(
        name=data['name'],
        quit_date=data['quit_date'],
        cost_per_day=data['cost_per_day'],
        reason=data.get('reason', '')
    )
    if result and "error" in result:
        return jsonify(result), 400
    return jsonify({"status": "created"}), 201

# -----------------------------------------------
# Run
# -----------------------------------------------
if __name__ == '__main__':
    app.run(debug=True)