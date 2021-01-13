//socket = io('http://localhost:4000')

socket.on('init-msg', data => {
    console.log(data.msg)
})

if (document.querySelector('.textchat') !== null) {

    let userid = document.getElementById('id').textContent
    socket.emit("add-user", {userid: userid});
    document.getElementById("sendmsg").addEventListener("click", sendMsg, false);
      // Chat form
       // Send the message to the server

       // Empty the form
       //$(this).find("input:first, textarea").val('');
      

    
     // Whenever we receieve a message, append it to the <ul>
    socket.on("add-message", function(data){
        console.log("RECIEVED MSG: " + data)
        var node = document.createElement("LI");
        var textnode = document.createTextNode(data.msg);
        node.appendChild(textnode);
        document.getElementById("messages").appendChild(node);
     });

     function sendMsg(){
        let msg = document.getElementById('message').value
        console.log("SENDING MSG: " + msg)
        socket.emit("message", {
            msg: msg,
            userid: userid
           });
           document.getElementById('message').value = ''
        // Tell the server about it
        return false;
      }
}

