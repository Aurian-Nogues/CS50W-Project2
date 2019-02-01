import os

import requests
from flask import Flask, session, render_template, redirect, request, url_for, jsonify
from flask_session import Session
from flask_socketio import SocketIO, emit

app = Flask(__name__)
""" app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")"""
app.config["SECRET_KEY"] = 'super_secret_key'
socketio = SocketIO(app)


@app.route("/")
def index():
    return render_template("index.html")

@socketio.on("add channel")
def channel(data):
    channel = data["channel"]
    emit("announce channel", {"channel": channel}, broadcast=True)
    
