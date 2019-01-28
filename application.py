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

    #here is for when you press a button
    if request.method == 'POST' :
        #route from login button
        if request.form['action'] == 'login':
             session['user'] = request.form['username']
             return render_template("chatroom.html")
        elif request.form['action'] == 'logout':
            session['logged_in'] = None
            session['user'] = None
            return render_template("index.html")
    
    else :
        if session.get('logged_in') == None:
            return render_template("index.html")
        else:
            return render_template("chatroom.html")


