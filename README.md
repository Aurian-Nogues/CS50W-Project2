# Project 2

Web Programming with Python and JavaScript

This is Project 2 for CS50W. The goal is to create a website that replicates Flask using Python, JavaScript, HTML and CSS in a Flask framework. The website should use WebsocketIO to allow users to interact with the server without reloading the page.

application.py contains the python code to be used server side with Flask. It stores the different channels, and conversations and keeps track of connected users. It also broadcast information sent by clients and answers requests using Ajax and websocket methods.

Templates contains two HTML documents: layout that defines the structure of the web page and index that populates this structure with the different elements of the page.

Static contains 2 files:
    styles.css contains all the CSS code to format the HTML pages
    index.js contains all the Javascript code used to animate the website and communicate with the server.