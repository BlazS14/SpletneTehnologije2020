const socket = io('http://localhost:4000')

socket.on('init-msg', data => {
    console.log(data.msg)
})

if (document.querySelector('.game') !== null) {
   socket.emit('gameinit-msg',{msg: 'GAME STARTEDDDDDD'})
   setTimeout(function(){
    window.location.reload(1);
    }, 2000);
}