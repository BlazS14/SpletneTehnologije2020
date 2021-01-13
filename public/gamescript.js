const socket = io('http://localhost:4000')

socket.on('init-msg', data => {
    console.log(data.msg)
})
//0-56
if (document.querySelector('.game') !== null) {
    
    let userid = document.getElementById('id').textContent
    let roomid = document.getElementById('roomid').textContent

    document.getElementById("buttonroll").addEventListener("click", sendRoll, false);
    document.getElementById("buttonspawn").addEventListener("click", sendSpawn, false);
    document.getElementById("buttonfig1").addEventListener("click", sendFig1, false);
    document.getElementById("buttonfig2").addEventListener("click", sendFig2, false);
    document.getElementById("buttonfig3").addEventListener("click", sendFig3, false);
    document.getElementById("buttonfig4").addEventListener("click", sendFig4, false);

    socket.emit('auth',{userid: userid})

    socket.on('roll',data => {
    console.log("GOT ROLL")
    document.getElementById("buttonroll").classList.add('buttongame');
    document.getElementById("buttonroll").classList.remove('buttongamedisabled');
   })
   

   socket.on('get-roll',data => {
    console.log("GOT ROLL" + data.roll)

    if(data.figs.length == 0 && data.roll != 6)
    {
        socket.emit('do-none',{userid: userid, roomid: roomid})
    }else{
        

        if(data.roll == 6 && data.figs.length < 4)
        {
            document.getElementById("buttonspawn").classList.add('buttongame');
            document.getElementById("buttonspawn").classList.remove('buttongamedisabled');
        }


        if(data.figs[0] != null){
            if(data.figs[0] + data.roll < 57){
                document.getElementById("buttonfig1").classList.add('buttongame');
                document.getElementById("buttonfig1").classList.remove('buttongamedisabled');
            }
        }

        if(data.figs[1] != null){
            if(data.figs[1] + data.roll < 57){
                document.getElementById("buttonfig2").classList.add('buttongame');
                document.getElementById("buttonfig2").classList.remove('buttongamedisabled');
            }
        }

        if(data.figs[2] != null){
            if(data.figs[2] + data.roll < 57){
                document.getElementById("buttonfig3").classList.add('buttongame');
                document.getElementById("buttonfig3").classList.remove('buttongamedisabled');
            }
        }

        if(data.figs[3] != null){
            if(data.figs[3] + data.roll < 57){
                document.getElementById("buttonfig4").classList.add('buttongame');
                document.getElementById("buttonfig4").classList.remove('buttongamedisabled');
            }
        }
    }
   })

   function sendRoll()
   {
        document.getElementById("buttonroll").classList.add('buttongamedisabled');
        document.getElementById("buttonroll").classList.remove('buttongame');
        
        socket.emit('do-roll',{userid: userid, roomid: roomid})
   }

   function sendSpawn()
   {
        socket.emit('do-spawn',{userid: userid, roomid: roomid})
   }

   function sendFig1()
   {
        socket.emit('do-fig1',{userid: userid, roomid: roomid})
   }

   function sendFig2()
   {
        socket.emit('do-fig2',{userid: userid, roomid: roomid})
   }

   function sendFig3()
   {
        socket.emit('do-fig3',{userid: userid, roomid: roomid})
   }

   function sendFig4()
   {
        socket.emit('do-fig4',{userid: userid, roomid: roomid})
   }






























   
}else if (document.querySelector('.lobby') !== null) {

    setTimeout(function(){
        window.location.reload(1);
        }, 2000);

}