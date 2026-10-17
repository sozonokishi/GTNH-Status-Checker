from flask import Flask, request, jsonify

app = Flask(__name__)
data = {}

@app.route("/update-crafts", methods=["POST"])
def update_crafts():
    global data 
    data = request.json


@app.route("/get-crafts", methods=["GET"])
def get_crafts():
    #setting up possible filters
    isBusy = request.args.get("isBusy")

    #filtering the data to be sent back
    if isBusy != None:
        data = [cpu for cpu in data if cpu["isBusy"] == isBusy]


    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True)