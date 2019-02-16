import os

import requests
from flask import Flask, session, render_template, redirect, request, url_for, jsonify
from flask_session import Session
from flask_socketio import SocketIO, emit
import sys

app = Flask(__name__)
""" app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")"""
app.config["SECRET_KEY"] = 'super_secret_key'
socketio = SocketIO(app)

channels = [] #list of all channels
conversations = dict() #global variable to store conversations
users = dict() #keeps track of connected users and in which channel they are

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


#check is username already in use
@app.route("/checkduplicates", methods=["POST"])
def checkduplicates():
    print("")
    print("logging in")
    username = request.form.get("username")
    print(username)
    #print("")
    #print("here")
    #print(username)
    #print("")
    global users 

    if username in users:
        #print("")
        #print("here 2")
        #print(users)
        #print(username)
        print(users)
        print("user with name")
        #print("")
        status = "failure"
        print(status)
        return jsonify({"status": status})
    else:
        #print("")
        #print("here 2")
        print(users)    
        print("no user")
        #print("")
        status = "success"
        print(status)
        return jsonify({"status": status})


#websocket to add new channel
@socketio.on("add channel")
def channel(data):
    channel = data["channel"]
    channels.append(channel)
    emit("announce channel", {"channel": channel}, broadcast=True)

#websocket to keep track of users when they connect / disconnect or change channels
@socketio.on("user connection")
def connection(data):
    user = data["username"]
    channel = data["channel"]
    global users
    users[user] = channel
    emit("update users", broadcast=True)

#remove user from table when disconnecting
@socketio.on("user disconnection")
def disconnection(data):
    user = data["username"]
    global users
    print("")
    print("disconnect")
    print(users)
    users.pop(user)
    print("")
    print(users)
    emit("update users", broadcast=True)

#websocket to update users list
@app.route("/update", methods=["GET"])
def update():
    global users
    users_list = list(users.keys())
    channels_list = list(users.values())
    return jsonify({"users": users_list, "channels": channels_list})

#receive private popup message and broadcast it
@socketio.on("send private message")
def receive(data):
    username = data["username"]
    message = data["message"]
    sender = data["sender"]
    emit("receive private message", {"username": username, "message": message, "sender": sender}, broadcast = True)

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
        

