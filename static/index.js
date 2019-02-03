
//////////////Wrapper for to be executed only when page finished loading
document.addEventListener('DOMContentLoaded', () => {

    //Check if user is logged in and render login buttons apropriately
    if (localStorage.getItem('username') != null) {
        username = localStorage.getItem('username');
        document.getElementById('username').innerHTML = username;
        $("#login").removeClass("btn btn-success").addClass("btn btn-danger");
        document.getElementById('login').innerHTML = "Logout";
    }

    //check if there is a channel in local storage and load it if there is
    if (localStorage.getItem('channel') != null) {
        channel = localStorage.getItem('channel');
        loadChannel();
    }
        
    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected to websocket
    socket.on('connect', () =>{
        //emit channel additions
        document.getElementById('addChannel').onclick = () => {
            const channel = prompt("Enter channel name");
            
            //prevent channel duplication
            var ul = document.getElementById("channels");
            var items = ul.getElementsByTagName("li");
            for (var i = 0;i < items.length; i++){
                if (items[i].innerHTML == channel){
                    alert("Channel already exist, please choose another name");
                    return;
                }
            }

            //emit new channel through websocket
            socket.emit('add channel', {'channel': channel});
        }    
        //call function that sends message when clicking send or pressing enter
        document.getElementById('sendMessage').onclick = sendMessage;
        $('#newMessage').keyup(function(e){
        var enterkey = 13;
        if (e.which == enterkey){
            sendMessage();
        }
        });
    });

    //when new channel is announced, add to unordered list
    socket.on('announce channel', data => {
        const li = document.createElement('li');
        li.innerHTML = data.channel;
        li.className = "channel";
        document.querySelector('#channels').append(li);
    });

    //when new message is announced, add to unordered list if in the right channel
    socket.on('announce message', data => {
        activeChannel = document.getElementById('activeChannel').innerHTML;
        messageChannel = data.channel;
        if (activeChannel == messageChannel){
            const li = document.createElement('li');
            li.innerHTML = data.message;
            document.querySelector('#chat').append(li);
        }
    });

    //when clicking on a channel load the channel
    $(document).on("click",".channel",loadChannel);

    /*login button */
    document.getElementById('login').onclick = login;
});

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

//broadcast message through websocket
function sendMessage() {
    //prepare websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    const message = document.querySelector('#newMessage').value;
    username = localStorage.getItem('username');
    timestamp = new Date().toLocaleTimeString();
 
    //put message together with timestamp and channel and send through websocket
    const contents = `${timestamp} || ${username}: ${message}`;
    const channel = document.getElementById('activeChannel').innerHTML;
    document.querySelector('#newMessage').value = ""
    socket.emit('new message', {'message': contents, 'channel': channel});
};

//handles the channel loading when clicking on a channel or loading the page
function loadChannel(){

//clear chat
var chat = document.querySelector('#chat');
if (chat){
    while(chat.firstChild){
        chat.removeChild(chat.firstChild);
    }
}

//get channel from click (if clicked on channel) or localStorage (if page just loaded)
if (this.innerHTML != null){
    channel = this.innerHTML;
    localStorage.setItem('channel', channel);
} else {
    channel = localStorage.getItem('channel');
}

//display channel on page
document.getElementById('activeChannel').innerHTML = channel;

//initialize request
const request = new XMLHttpRequest();
request.open('POST', '/load');  

// Callback function for when request completes
request.onload = () => {
    const data = JSON.parse(request.responseText);
    if (data.success){
        //extract JSON from request
        messages = data.messages;
        //append server messages in chat window
        for (i = 0; i < messages.length; ++i){
            const li = document.createElement('li');
            li.innerHTML = messages[i]
            document.querySelector('#chat').append(li);
        }
    }
}      

//add data to send with request
const data = new FormData();
data.append('channel', channel);

//send request
request.send(data);
return false;
};