
//////////////Wrapper for to be executed only when page finished loading
document.addEventListener('DOMContentLoaded', () => {

    //Check if user is logged in and render login buttons apropriately
    if (localStorage.getItem('username') != null) {
        username = localStorage.getItem('username');
        document.getElementById('username').innerHTML = username;
        $("#login").removeClass("btn btn-success").addClass("btn btn-danger");
        document.getElementById('login').innerHTML = "Logout";
    } else {
        //hide everything if user not logged in
        document.getElementById('inputBox').style.visibility='hidden';
        document.getElementById('channels').style.visibility='hidden';
        document.getElementById('addChannel').style.visibility='hidden';
        document.getElementById('chat').style.visibility='hidden';
        document.getElementById('sendMessage').style.visibility='hidden';
        document.getElementById('activeChannel').style.visibility='hidden';
        document.getElementById('channelLabel').style.visibility='hidden';
        document.getElementById('usersLabel').style.visibility='hidden';
        document.getElementById('connectedUsers').style.visibility='hidden';
    }

        //load channel in local storage or default channel
        loadChannel();
    
        
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

    //When private message is broadcasted, display it if appropriate
    socket.on('receive private message', data =>{
        user_username = localStorage.getItem('username');
        message_username = data.username;
        message_content = data.message;
        message_sender = data.sender;
        if(user_username == message_username){
            alert(message_sender + ' says: ' + message_content);
        }
    });


    //when user connects or changes channel, update the table
    socket.on('update users', data => {
        //clear all entries in users table
        var table = document.querySelector('#connectedUsers');
        if (table){
            while(table.firstChild){
                table.removeChild(table.firstChild);
            }
        }

        //add all users and channels to table
        //initialize request
        const request = new XMLHttpRequest();
        request.open('GET', '/update');  
        // Callback function for when request completes
        request.onload = () => {
            const data = JSON.parse(request.responseText);
            users = data.users;
            channels = data.channels;
            for (i=0; i < users.length; ++i){
                var newRow=document.getElementById('connectedUsers').insertRow();
                newRow.innerHTML = '<td class="user">'+users[i]+'</td><td>'+channels[i]+'</td>';
            }
        }   
        //send send request
        request.send();
        return false;
    });

    //when clicking on a channel load the channel
    $(document).on("click",".channel",loadChannel);

    //when clicking on a user send a pop-up message
    $(document).on("click",".user",popupMessage);

    /*login button */
    document.getElementById('login').onclick = login;

});


//remove from active users when closing window
window.addEventListener('beforeunload', () => {
    username = localStorage.getItem('username');
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    socket.emit('user disconnection', {'username': username});
});

    //handles username storage in localStorage and changes login/logout button, also loads channel and add connected user to table
    function login() {
        
        //if there is no username in local storage, start asking for login
        if (localStorage.getItem('username') === null) {
            var username = prompt("Enter user name");
            //prevent user from inputing empty string
            if(!username.match(/\S/)) {
                alert('Empty user name is not allowed');
                 return false;
                
            } else {
                
                //check here if there is another user with same name
                status = checkDuplicates(username);
                alert(status);
                if (status == "failure") {
                    alert("user name already taken, please choose another one");
                    return false;
                }
               
                //write user name in local storage and on html elements, update layout
                localStorage.setItem('username', username);
                document.getElementById('username').innerHTML = username;
                $("#login").removeClass("btn btn-success").addClass("btn btn-danger");
                document.getElementById('login').innerHTML = "Logout";

                //call functions to load channel and show connected users
                loadChannel();
                channel = localStorage.getItem('channel');

                //clear table from previous entries
                var table = document.querySelector('#connectedUsers');
                if (table){
                    while(table.firstChild){
                        table.removeChild(table.firstChild);
                    }
                }

                //show everything on login
                document.getElementById('inputBox').style.visibility='visible';
                document.getElementById('channels').style.visibility='visible';
                document.getElementById('addChannel').style.visibility='visible';
                document.getElementById('chat').style.visibility='visible';
                document.getElementById('sendMessage').style.visibility='visible';
                document.getElementById('activeChannel').style.visibility='visible';
                document.getElementById('channelLabel').style.visibility='visible';
                document.getElementById('usersLabel').style.visibility='visible';
                document.getElementById('connectedUsers').style.visibility='visible';

             }
         }

         //if there is already a user name in local storage initiate logout
        else {
            //remove everything from LocalStorage
            username = localStorage.getItem('username');
            localStorage.removeItem('username');
            localStorage.removeItem('channel');
            document.getElementById('username').innerHTML = "Login to start chatting";
            $("#login").removeClass("btn btn-danger").addClass("btn btn-success");
            document.getElementById('login').innerHTML = "Login";

            //call function to show connected users
            connectedUser(username);

            //hide everything on logout
            document.getElementById('inputBox').style.visibility='hidden';
            document.getElementById('channels').style.visibility='hidden';
            document.getElementById('addChannel').style.visibility='hidden';
            document.getElementById('chat').style.visibility='hidden';
            document.getElementById('sendMessage').style.visibility='hidden';
            document.getElementById('activeChannel').style.visibility='hidden';
            document.getElementById('channelLabel').style.visibility='hidden';
            document.getElementById('usersLabel').style.visibility='hidden';
            document.getElementById('connectedUsers').style.visibility='hidden';
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
            //if nothing in local storage load General by default
            if (localStorage.getItem('channel') != null){
                channel = localStorage.getItem('channel');
            } else {
                channel = "General";
                localStorage.setItem('channel', channel);
            }
        }
        //display channel on page
        document.getElementById('activeChannel').innerHTML = channel;
       
        //broadcast channel change to websocket
        username = localStorage.getItem('username');
        connectedUser(username, channel);

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

    //send popup messages to users
    function popupMessage(){
        //get reciptient username and message content
        username = this.innerHTML;
        const message = prompt("Enter private popup message");
        sender = localStorage.getItem("username");

        //check that message is not empty
        if(!message.match(/\S/)) {
             return false;
        } else {
            //prepare websocket and content
            var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
            socket.emit('send private message', {'username': username, 'message': message, "sender": sender});
        }
    }
    //Tracks when users connects, disconnects or joins a channel. Stores who's connected and in which channel they are
    function connectedUser(username, channel){
        //loging out
            if(localStorage.getItem("username") == null  ){
                var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
                socket.emit('user disconnection', {'username': username});
                        
            //logging in
            } else {
                //prepare websocket and send username + channel
                var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
                socket.emit('user connection', {'username': username, 'channel': channel});
            }
        };


    //when connecting check if username is already taken
    function checkDuplicates(username){

        //initialize request
        const request = new XMLHttpRequest();
        request.open('POST', '/checkduplicates');  

        // Callback function for when request completes
        request.onload = () => {
            const data = JSON.parse(request.responseText);
            //if username is free return success, if already taken return failure
            if (data.status){
                status = "succes";
                return status;
            } else {
                status = "failure";
                return status;
            }
        }      
        //add data to send with request
        const data = new FormData();
        data.append('username', username);

        //send request
        request.send(data);
        };
