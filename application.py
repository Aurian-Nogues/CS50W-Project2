import os

import requests
from flask import Flask, session, render_template, redirect, request, url_for, jsonify
from flask_session import Session
from flask_socketio import SocketIO, emit

app = Flask(__name__)
""" app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")"""
app.config["SECRET_KEY"] = 'super_secret_key'
socketio = SocketIO(app)

channels = []

@app.route("/")
def index():
    return render_template("index.html", channels=channels)

@socketio.on("add channel")
def channel(data):
    channel = data["channel"]
    channels.append(channel)
    emit("announce channel", {"channel": channel}, broadcast=True)

@socketio.on("new message")
def message(data):
    message = data["message"]
    emit("announce message", {"message": message}, broadcast=True)
        

