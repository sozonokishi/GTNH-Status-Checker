from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import os
from datetime import datetime, UTC, timedelta


app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
db = SQLAlchemy(app)

data = {}

#db structure
class Crafts(db.Model):
    __tablename__ = "crafts"

    id = db.Column(db.Integer, primary_key=True)
    final_label = db.Column(db.String(50), nullable=False)
    final_size = db.Column(db.Integer, nullable=False)
    created_time = db.Column(db.DateTime, default=datetime.now(UTC), nullable=False)

    pending = db.relationship("PendingItems", back_populates="crafts", cascade="all, delete-orphan")
    active = db.relationship("ActiveItems", back_populates="crafts", cascade="all, delete-orphan")


class PendingItems(db.Model):
    __tablename__ = "pending_items"

    id = db.Column(db.Integer, primary_key=True)
    pending_label = db.Column(db.String(50), nullable=False)
    pending_size = db.Column(db.Integer, nullable=False)
    created_time = db.Column(db.DateTime, default=datetime.now(UTC), nullable=False)

    craft_id = db.Column(db.Integer, db.ForeignKey("crafts.id"), nullable=False)

    craft = db.relationship("Crafts", back_populates="pending")

    
class ActiveItems(db.Model):
    __tablename__ = "active_items"

    id = db.Column(db.Integer, primary_key=True)
    active_label = db.Column(db.String(50), nullable=False)
    active_size = db.Column(db.Integer, nullable=False)
    created_time = db.Column(db.DateTime, default=datetime.now(UTC), nullable=False)

    craft_id = db.Column(db.Integer, db.ForeignKey("crafts.id"), nullable=False)

    craft = db.relationship("Crafts", back_populates="active")


with app.app_context():
    db.create_all()


#Some functions
def booleanMapper(input_value, if_true_convert_to, if_false_convert_to):
    #only saving lowercase string, cause im just gonna compare insensitively anyway (i.e. TrUe == true)
    possible_true_values = ["true","1"]
    possible_false_values = ["false","0"]

    if type(input_value) == str:
        input_value = input_value.lower()

    if input_value in possible_true_values:
        return if_true_convert_to
    elif input_value in possible_false_values:
        return if_false_convert_to
    else:
        raise ValueError("Input value must be part of ['true','1'] or ['false','1'] case insensitive")


#APIs
@app.route("/update-crafts", methods=["POST"])
def update_crafts():
    data = request.json

    cpus = [cpu for cpu in data if cpu.get("isBusy")==True]

    #gather data from final outputs
    for cpu in cpus:
        #for Craft table
        final_label = cpu.get("finalOutput")["label"]
        final_size = cpu.get("finalOutput")["size"]
        craft_row = Crafts(final_label=final_label, final_size=final_size)

        db.session.add(craft_row)

        #for Pending table
        for pending_item in cpu.get("pendingItems"):
            pending_label = pending_item["label"]
            pending_size = pending_item["size"]
            pending_item_row = PendingItems(pending_label=pending_label, pending_size=pending_size)

            db.session.add(pending_item_row)

        #for Active table
        for active_item in cpu.get("activeItems"):
            active_label = active_item["label"]
            active_size = active_item["size"]
            active_item_row = ActiveItems(active_label=active_label, active_size=active_size)

            db.session.add(active_item_row)

    db.session.commit()

    return jsonify({"status":"Success", "message":"Received data."})


@app.route("/get-crafts", methods=["GET"])
def get_crafts():
    #setting up possible filters
    created_to = request.args.get("to",datetime.now(UTC))
    created_from = request.args.get("from",created_to - timedelta(hours=24)) #going to just have whatever created_to - 24 if there is no value

    #filter and query for all
    crafts_query = Crafts.query.filter(Crafts.created_time <= created_to, Crafts.created_time >= created_from).all()

    #creating the items to be returned.
    data = []
    for craft in crafts_query:
        pending_items = []
        active_items = []

        for pending_item in craft.pending:
            pending_items.append(
                {
                    "label": pending_item.pending_label,
                    "size": pending_item.pending_size
                }
            )

        for active_item in craft.active:
            active_items.append(
                {
                    "label": active_item.active_label,
                    "size": active_item.active_size
                }
            )

        data.append(
            {
                "output_label": craft.final_label,
                "output_size": craft.final_size,
                "pending_items": pending_items,
                "active_items": active_items
            }
        )


    return jsonify({
        "from": created_from.isoformat(),
        "to": created_to.isoformat(),
        "data": data
    })


if __name__ == "__main__":
    app.run(debug=True)