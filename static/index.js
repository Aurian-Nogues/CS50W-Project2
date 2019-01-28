/* function addChannel() {
    const content = 'test'
    document.querySelector('#channels').innerHTML = content;
    alert('added channel');

} */
document.addEventListener('DOMContentLoaded', () => {
    var button = document.getElementById('addChannel');
    button.onclick = addChannel;
    /* alert('page loaded'); */
});

function addChannel() {

    // create new object and assign user input to it
    var channel = prompt("Enter channel name");
    const li = document.createElement('li');
    li.innerHTML = channel;
   
    // add new channel to channel list
    document.querySelector('#channels').append(li);
};
