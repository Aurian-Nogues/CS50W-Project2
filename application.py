import os

import requests
from flask import Flask, session, render_template, redirect, request, url_for, jsonify
from flask_session import Session
from flask_socketio import SocketIO, emit

app = Flask(__name__)
""" app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")"""
app.config["SECRET_KEY"] = 'super_secret_key'
socketio = SocketIO(app)

channels = [] #list of all channels
conversations = dict() #global variable to store conversations

@app.route("/")
def index():
    return render_template("index.html", channels=channels)

#loads existing messages when loading a channel
@app.route("/load", methods=["POST"])
def load():
    channel = request.form.get("channel")
    if conversations.get(channel) == None :
        return jsonify({"success": False})
    else:
        messages = conversations[channel]
        return jsonify({"success": True, "messages": messages})


#websocket to add new channel
@socketio.on("add channel")
def channel(data):
    channel = data["channel"]
    channels.append(channel)
    emit("announce channel", {"channel": channel}, broadcast=True)

#websocket to announce user connection
@socketio.on("user connection")
def connection(data):
    user = data["username"]
    channel = data["channel"]
    emit("user connection", {"user": user, "channel":channel}, broadcast=True)



#websocket to broadcast new messages
@socketio.on("new message")
def message(data):
    message = data["message"]
    channel = data["channel"]
    conversations.setdefault(channel, []).append(message) #store message in appropriate channel dict entry
    
    #If there are more than 100 messages in the channel delete the last one
    if len(conversations[channel]) > 100 :
        del conversations[channel][0]

    emit("announce message", {"message": message, "channel": channel}, broadcast=True)
        

