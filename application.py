import os

import requests
from flask import Flask, session, render_template, redirect, request, url_for, jsonify
from flask_session import Session
from flask_socketio import SocketIO, emit

app = Flask(__name__)
""" app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")"""
app.config["SECRET_KEY"] = 'super_secret_key'
socketio = SocketIO(app)


@app.route("/", methods= ['GET', 'POST'])
def index():
    #session['logged_in'] = None
    return render_template("index.html")
