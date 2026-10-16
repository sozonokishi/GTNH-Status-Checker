from flask import Flask, request, jsonify

app = Flask(__name__)
data = {}

@app.route("/update-crafts", methods=["POST"])
def update_crafts():
    global data 
    data = request.json


@app.route("/get-crafts", methods=["GET"])
def get_crafts():
    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True)