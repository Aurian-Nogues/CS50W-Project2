
//////////////Wrapper for to be executed only when page finished loading
document.addEventListener('DOMContentLoaded', () => {

    //Check if user is logged in and render login buttons apropriately
    if (localStorage.getItem('username') != null) {
        alert("user logged in");
        username = localStorage.getItem('username');
        document.getElementById('username').innerHTML = username;
        $("#login").removeClass("btn btn-success").addClass("btn btn-danger");
        document.getElementById('login').innerHTML = "Logout";
    }
    
    
    /* channel button */
    document.getElementById('addChannel').onclick = addChannel;

    /*login button */
    document.getElementById('login').onclick = login;
});



/* Adds new channels to the list in the chatroom */
function addChannel() {
    // create new object and assign user input to it
    var channel = prompt("Enter channel name");
    const li = document.createElement('li');
    li.innerHTML = channel;
   
    // append new channel to channel list
    document.querySelector('#channels').append(li);
};

//handles username storage in localStorage and changes login/logout button
function login() {
    if (localStorage.getItem('username') === null) {
        var username = prompt("Enter user name");
        localStorage.setItem('username', username);
        document.getElementById('username').innerHTML = username;
        $("#login").removeClass("btn btn-success").addClass("btn btn-danger");
        document.getElementById('login').innerHTML = "Logout";
    }
    else {
        localStorage.removeItem('username');
        document.getElementById('username').innerHTML = "Not logged in";
        $("#login").removeClass("btn btn-danger").addClass("btn btn-success");
        document.getElementById('login').innerHTML = "Login";
    }
    };

