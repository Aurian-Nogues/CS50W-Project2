
//////////////Wrapper for to be executed only when page finished loading
document.addEventListener('DOMContentLoaded', () => {

    //Check if user is logged in and render login buttons apropriately
    if (localStorage.getItem('username') != null) {
        username = localStorage.getItem('username');
        document.getElementById('username').innerHTML = username;
        $("#login").removeClass("btn btn-success").addClass("btn btn-danger");
        document.getElementById('login').innerHTML = "Logout";
    }
    
    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);



    // When connected to websocket
    socket.on('connect', () =>{
        document.getElementById('addChannel').onclick = () => {
            var channel = prompt("Enter channel name");
            socket.emit('add channel', {'channel': channel});
        }    
    });

    //when new channel is announced, add to unordered list
    socket.on('announce channel', data => {
        const li = document.createElement('li');
        li.innerHTML = data.channel;
        document.querySelector('#channels').append(li);

    });

    /*login button */
    document.getElementById('login').onclick = login;
});

//handles username storage in localStorage and changes login/logout button */
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

