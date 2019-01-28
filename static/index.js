    /* alert('page loaded'); */


document.addEventListener('DOMContentLoaded', () => {
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

function login() {
    var username = document.queryselector('#inputUsername');
    localStorage.setitem('username', username);
    alert(username);

};
