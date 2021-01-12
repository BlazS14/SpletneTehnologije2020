const socket = io('http://localhost:4000')

socket.on('init-msg', data => {
    console.log(data.msg)
})

if (document.querySelector('.game') !== null) {

    let userid = document.getElementById('id').textContent

   socket.emit('auth',{userid: userid})

   


   
}else if (document.querySelector('.lobby') !== null) {

    setTimeout(function(){
        window.location.reload(1);
        }, 2000);

}