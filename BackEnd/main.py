from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from dotenv import load_dotenv

import os
import jwt
import bcrypt
import uuid
from datetime import datetime, timedelta, timezone
from pymongo import MongoClient

from core_agent import agent

# ==============================
# 🔧 INIT
# ==============================
load_dotenv()

app = Flask(__name__)

# ✅ FIXED CORS (important for React)
CORS(
    app,
    origins=["http://localhost:5173"],
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "DELETE", "OPTIONS"]
)

SECRET_KEY = os.getenv("JWT_SECRET_KEY")

if not SECRET_KEY:
    raise Exception("❌ JWT_SECRET_KEY missing")

mongo = MongoClient(os.getenv("MONGO_URI"))
db = mongo["ai_agent"]

# ==============================
# 🔐 AUTH HELPER
# ==============================
def get_user_id():
    auth = request.headers.get("Authorization")

    if not auth:
        return None

    try:
        token = auth.split(" ")[1]
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return decoded["user_id"]
    except:
        return None

# ==============================
# 🔐 REGISTER
# ==============================
@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.json

        if db.users.find_one({"email": data["email"]}):
            return jsonify({"error": "User already exists"}), 400

        hashed = bcrypt.hashpw(data["password"].encode(), bcrypt.gensalt())

        db.users.insert_one({
            "name": data["name"],
            "email": data["email"],
            "password": hashed
        })

        return jsonify({"message": "Registered successfully"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==============================
# 🔐 LOGIN
# ==============================
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.json

        user = db.users.find_one({"email": data["email"]})

        if not user:
            return jsonify({"error": "Invalid credentials"}), 400

        if not bcrypt.checkpw(data["password"].encode(), user["password"]):
            return jsonify({"error": "Invalid credentials"}), 400

        token = jwt.encode({
            "user_id": str(user["_id"]),
            "exp": datetime.now(timezone.utc) + timedelta(days=1)
        }, SECRET_KEY, algorithm="HS256")

        return jsonify({
            "token": token,
            "name": user["name"]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==============================
# 🤖 NORMAL AGENT (NON-STREAM)
# ==============================
@app.route("/agent", methods=["POST"])
def agent_api():
    try:
        user_id = get_user_id()
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401

        data = request.json
        message = data.get("message")
        chat_id = data.get("chat_id")

        if not message:
            return jsonify({"error": "Message required"}), 400

        # 🔥 Create chat if new
        if not chat_id:
            chat_id = str(uuid.uuid4())

            db.chats.insert_one({
                "chat_id": chat_id,
                "user_id": user_id,
                "messages": [],
                "created_at": datetime.utcnow()
            })

        result = agent.invoke({
            "messages": [{"role": "user", "content": message}]
        })

        answer = result["messages"][-1].content

        db.chats.update_one(
            {"chat_id": chat_id},
            {
                "$push": {
                    "messages": {
                        "$each": [
                            {"role": "user", "text": message},
                            {"role": "ai", "text": answer}
                        ]
                    }
                }
            }
        )

        return jsonify({"response": answer, "chat_id": chat_id})

    except Exception as e:
        print("AGENT ERROR:", str(e))
        return jsonify({"error": str(e)}), 500

# ==============================
# 🤖 STREAMING AGENT (FIXED)
# ==============================
# ==============================
# 🤖 STREAMING AGENT (UPDATED)
# ==============================
@app.route("/agent-stream", methods=["POST", "OPTIONS"])
def agent_stream():

    if request.method == "OPTIONS":
        return jsonify({"message": "OK"}), 200

    try:
        user_id = get_user_id()
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401

        data = request.json
        message = data.get("message")
        chat_id = data.get("chat_id")

        if not message:
            return jsonify({"error": "Message required"}), 400

        if "stock" in message.lower() or "price of" in message.lower():
            symbol = message.split()[-1].upper()

            return jsonify({
                "type": "stock_chart",
                "symbol": symbol
            })
        
        # 🔥 CREATE CHAT IF NEW
        if not chat_id:
            chat_id = str(uuid.uuid4())

            # 👉 AUTO TITLE (first 6 words)
            title = " ".join(message.split()[:6])

            db.chats.insert_one({
                "chat_id": chat_id,
                "user_id": user_id,
                "title": title,
                "messages": [],
                "created_at": datetime.utcnow()
            })

        def generate():
            try:
                result = agent.invoke({
                    "messages": [{"role": "user", "content": message}]
                })

                full_text = result["messages"][-1].content

                # 🔥 STREAM CHARACTER BY CHARACTER
                for char in full_text:
                    yield char

                # 💾 SAVE CHAT
                db.chats.update_one(
                    {"chat_id": chat_id},
                    {
                        "$push": {
                            "messages": {
                                "$each": [
                                    {"role": "user", "text": message},
                                    {"role": "ai", "text": full_text}
                                ]
                            }
                        },
                        "$set": {
                            "updated_at": datetime.utcnow()
                        }
                    }
                )

            except Exception as e:
                print("STREAM ERROR:", str(e))
                yield "Error generating response"

        return Response(generate(), mimetype="text/plain")

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==============================
# 🔍 SEARCH CHAT
# ==============================
@app.route("/search", methods=["GET"])
def search_chat():
    try:
        user_id = get_user_id()
        query = request.args.get("q", "")

        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401

        chats = list(db.chats.find({
            "user_id": user_id,
            "messages.text": {"$regex": query, "$options": "i"}
        }, {"_id": 0}))

        return jsonify(chats)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
# ==============================
# 📂 GET ALL CHATS
# ==============================
@app.route("/chats", methods=["GET"])
def get_chats():
    user_id = get_user_id()

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    chats = list(db.chats.find({"user_id": user_id}, {"_id": 0}))
    return jsonify(chats)

# ==============================
# 📂 GET SINGLE CHAT
# ==============================
@app.route("/chat/<chat_id>", methods=["GET"])
def get_chat(chat_id):
    user_id = get_user_id()

    chat = db.chats.find_one(
        {"chat_id": chat_id, "user_id": user_id},
        {"_id": 0}
    )

    if not chat:
        return jsonify({"error": "Not found"}), 404

    return jsonify(chat)


# ==============================
# 🗑️ DELETE CHAT
# ==============================
@app.route("/chat/<chat_id>", methods=["DELETE"])
def delete_chat(chat_id):
    user_id = get_user_id()

    db.chats.delete_one({
        "chat_id": chat_id,
        "user_id": user_id
    })

    return jsonify({"message": "Deleted"})


@app.route("/stock-history", methods=["GET"])
def stock_history():
    try:
        symbol = request.args.get("symbol", "AAPL")

        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d&range=1mo"
        res = requests.get(url)
        data = res.json()

        result = data["chart"]["result"][0]

        timestamps = result["timestamp"]
        prices = result["indicators"]["quote"][0]["close"]

        # convert timestamps → readable dates
        from datetime import datetime
        labels = [
            datetime.fromtimestamp(t).strftime("%d %b")
            for t in timestamps
        ]

        return jsonify({
            "timestamps": labels,
            "prices": prices
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==============================
# 🏠 HEALTH CHECK
# ==============================
@app.route("/")
def home():
    return jsonify({"status": "Running"})

# ==============================
# 🚀 RUN
# ==============================
# if __name__ == "__main__":
#     app.run(debug=True)
