from flask import Flask, request, jsonify

app = Flask(__name__)
data = {}

def booleanMapper(input_value, if_true_convert_to, if_false_convert_to):
    #only saving lowercase string, cause im just gonna compare insensitively anyway (i.e. TrUe == true)
    possible_true_values = ["true",1,True]
    possible_false_values = ["false",1,False]

    if type(input_value) == str:
        input_value = input_value.lower()

    if input_value in possible_true_values:
        return if_true_convert_to
    elif input_value in possible_false_values:
        return if_false_convert_to
    else:
        raise ValueError("Input value must be part of ['true',1,True] or ['false',1,False]")



@app.route("/update-crafts", methods=["POST"])
def update_crafts():
    global data 
    data = request.json

    return jsonify({"status":"Success", "message":"Received data."})


@app.route("/get-crafts", methods=["GET"])
def get_crafts():
    #setting up possible filters
    isBusy = request.args.get("isBusy")

    raw_data = data
    #filtering the data to be sent back
    if isBusy != None:
        raw_data = [cpu for cpu in raw_data if cpu["isBusy"] == booleanMapper(isBusy)]


    return jsonify(raw_data)


if __name__ == "__main__":
    app.run(debug=True)