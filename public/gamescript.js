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
    if(data.score != 0 && data.score != null)
    {
        console.log("ROLL SKIPPED")
        socket.emit('do-none',{userid: userid, roomid: roomid})
    }else{
        document.getElementById("buttonroll").classList.add('buttongame');
        document.getElementById("buttonroll").classList.remove('buttongamedisabled');
    }
    
   })
   

   socket.on('get-roll',data => {
    console.log("GOT ROLL" + data.roll)

    let nooptions = 0;

    if(data.figs.length == 0 && data.roll != 6)
    {
        socket.emit('do-none',{userid: userid, roomid: roomid})
    }else{
        

        if(data.roll == 6 && data.figs.length < 4)
        {
            nooptions = 1
            document.getElementById("buttonspawn").classList.add('buttongame');
            document.getElementById("buttonspawn").classList.remove('buttongamedisabled');
        }


        if(data.figs[0] != null){
            if(data.figs[0] + data.roll < 57){
                nooptions = 1
                document.getElementById("buttonfig1").classList.add('buttongame');
                document.getElementById("buttonfig1").classList.remove('buttongamedisabled');
            }
        }

        if(data.figs[1] != null){
            if(data.figs[1] + data.roll < 57){
                nooptions = 1
                document.getElementById("buttonfig2").classList.add('buttongame');
                document.getElementById("buttonfig2").classList.remove('buttongamedisabled');
            }
        }

        if(data.figs[2] != null){
            if(data.figs[2] + data.roll < 57){
                nooptions = 1
                document.getElementById("buttonfig3").classList.add('buttongame');
                document.getElementById("buttonfig3").classList.remove('buttongamedisabled');
            }
        }

        if(data.figs[3] != null){
            if(data.figs[3] + data.roll < 57){
                nooptions = 1
                document.getElementById("buttonfig4").classList.add('buttongame');
                document.getElementById("buttonfig4").classList.remove('buttongamedisabled');
            }
        }

        if(nooptions == 0)
        {
            socket.emit('do-none',{userid: userid, roomid: roomid})
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
        document.getElementById("buttonspawn").classList.add('buttongamedisabled');
        document.getElementById("buttonspawn").classList.remove('buttongame');
        document.getElementById("buttonfig1").classList.add('buttongamedisabled');
        document.getElementById("buttonfig1").classList.remove('buttongame');
        document.getElementById("buttonfig2").classList.add('buttongamedisabled');
        document.getElementById("buttonfig2").classList.remove('buttongame');
        document.getElementById("buttonfig3").classList.add('buttongamedisabled');
        document.getElementById("buttonfig3").classList.remove('buttongame');
        document.getElementById("buttonfig4").classList.add('buttongamedisabled');
        document.getElementById("buttonfig4").classList.remove('buttongame');
    
        socket.emit('do-spawn',{userid: userid, roomid: roomid})
   }

   function sendFig1()
   {
        document.getElementById("buttonspawn").classList.add('buttongamedisabled');
        document.getElementById("buttonspawn").classList.remove('buttongame');
        document.getElementById("buttonfig1").classList.add('buttongamedisabled');
        document.getElementById("buttonfig1").classList.remove('buttongame');
        document.getElementById("buttonfig2").classList.add('buttongamedisabled');
        document.getElementById("buttonfig2").classList.remove('buttongame');
        document.getElementById("buttonfig3").classList.add('buttongamedisabled');
        document.getElementById("buttonfig3").classList.remove('buttongame');
        document.getElementById("buttonfig4").classList.add('buttongamedisabled');
        document.getElementById("buttonfig4").classList.remove('buttongame');

        socket.emit('do-fig1',{userid: userid, roomid: roomid})
   }

   function sendFig2()
   {
        document.getElementById("buttonspawn").classList.add('buttongamedisabled');
        document.getElementById("buttonspawn").classList.remove('buttongame');
        document.getElementById("buttonfig1").classList.add('buttongamedisabled');
        document.getElementById("buttonfig1").classList.remove('buttongame');
        document.getElementById("buttonfig2").classList.add('buttongamedisabled');
        document.getElementById("buttonfig2").classList.remove('buttongame');
        document.getElementById("buttonfig3").classList.add('buttongamedisabled');
        document.getElementById("buttonfig3").classList.remove('buttongame');
        document.getElementById("buttonfig4").classList.add('buttongamedisabled');
        document.getElementById("buttonfig4").classList.remove('buttongame');

        socket.emit('do-fig2',{userid: userid, roomid: roomid})
   }

   function sendFig3()
   {
        document.getElementById("buttonspawn").classList.add('buttongamedisabled');
        document.getElementById("buttonspawn").classList.remove('buttongame');
        document.getElementById("buttonfig1").classList.add('buttongamedisabled');
        document.getElementById("buttonfig1").classList.remove('buttongame');
        document.getElementById("buttonfig2").classList.add('buttongamedisabled');
        document.getElementById("buttonfig2").classList.remove('buttongame');
        document.getElementById("buttonfig3").classList.add('buttongamedisabled');
        document.getElementById("buttonfig3").classList.remove('buttongame');
        document.getElementById("buttonfig4").classList.add('buttongamedisabled');
        document.getElementById("buttonfig4").classList.remove('buttongame');

        socket.emit('do-fig3',{userid: userid, roomid: roomid})
   }

   function sendFig4()
   {
        document.getElementById("buttonspawn").classList.add('buttongamedisabled');
        document.getElementById("buttonspawn").classList.remove('buttongame');
        document.getElementById("buttonfig1").classList.add('buttongamedisabled');
        document.getElementById("buttonfig1").classList.remove('buttongame');
        document.getElementById("buttonfig2").classList.add('buttongamedisabled');
        document.getElementById("buttonfig2").classList.remove('buttongame');
        document.getElementById("buttonfig3").classList.add('buttongamedisabled');
        document.getElementById("buttonfig3").classList.remove('buttongame');
        document.getElementById("buttonfig4").classList.add('buttongamedisabled');
        document.getElementById("buttonfig4").classList.remove('buttongame');
        socket.emit('do-fig4',{userid: userid, roomid: roomid})
   }





   socket.on('update-state',data => {
    console.log("GOT UPDATE" + data.rfigs.length)

    
    let clearvar = ["red1","red2","red3","red4","yellow1","yellow2","yellow3","yellow4","blue1","blue2","blue3","blue4","green1","green2","green3","green4","r1","r2","r3","r4","r5","y1","y2","y3","y4","y5","b1","b2","b3","b4","b5","g1","g2","g3","g4","g5","0","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","32","33","34","35","36","37","38","39","40","41","42","43","44","45","46","47","48","49","50","51"]

    let c = 0
    for(c = 0; c != clearvar.length; c++)
    {
        console.log("clearing " + clearvar[c] + " " + typeof(clearvar[c]))
        document.getElementById(clearvar[c]).innerHTML = ''
    }


    //ADD UPDATE STATE

    //every player gen for himself. if null spawn, else set on board.
    //if over 51, set on team finish

    //if  pos == 56 score++

    let figs = data.rfigs
        var count = 0
        let fig
        let posdata
        for(count = 0; count != 4; count++)
        {
            if(figs.length != 0)
            fig = figs[count]
            else
            fig = null
            posdata = getFigPos(fig,count+1,"r")
            document.getElementById(posdata.index).innerHTML += posdata.text
            console.log(figs.length + "settext " + posdata.index + " " + posdata.text)
        }

        figs = data.yfigs

        for(count = 0; count != 4; count++)
        {
            if(figs.length != 0)
            fig = figs[count]
            else
            fig = null
            posdata = getFigPos(fig,count+1,"y")
            document.getElementById(posdata.index).innerHTML += posdata.text
            console.log(figs.length + "settext " + posdata.index + " " + posdata.text)
        }

        figs = data.bfigs

        for(count = 0; count != 4; count++)
        {
            if(figs.length != 0)
            fig = figs[count]
            else
            fig = null
            posdata = getFigPos(fig,count+1,"b")
            document.getElementById(posdata.index).innerHTML += posdata.text
            console.log(figs.length + "settext " + posdata.index + " " + posdata.text)
        }

        figs = data.gfigs

        for(count = 0; count != 4; count++)
        {
            if(figs.length != 0)
            fig = figs[count]
            else
            fig = null
            posdata = getFigPos(fig,count+1,"g")
            document.getElementById(posdata.index).innerHTML += posdata.text
            console.log(figs.length + "settext " + posdata.index + " " + posdata.text)
        }

        if(data.redscore != null)
        document.getElementById("redscore").innerHTML = data.redscore.toString()
        else
        document.getElementById("redscore").innerHTML = "0"

        if(data.redscore != null)
        document.getElementById("yellowscore").innerHTML = data.yellowscore.toString()
        else
        document.getElementById("yellowscore").innerHTML = "0"

        if(data.redscore != null)
        document.getElementById("bluescore").innerHTML = data.bluescore.toString()
        else
        document.getElementById("bluescore").innerHTML = "0"

        if(data.redscore != null)
        document.getElementById("greenscore").innerHTML = data.greenscore.toString()
        else
        document.getElementById("greenscore").innerHTML = "0"


        /*let fig = figs.getFigPos
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
        }*/
    
   })



   function getFigPos(fig,index,color)
   {
        if(color=="r")
        {
            
            if(fig == null)
            {
                console.log("red fig null")
                return {index: "red"+index.toString(), text: index.toString()}
            }else if(fig <= 51)
            {
                console.log("red fig pos " + fig)
                return {index: fig.toString(), text: '<div style="color: red; font-size: 1.2vw;display: inline; font-weight: bolder;">' + index.toString() + '</div>'}
            }else
            {
                console.log("red fig win " + fig)
                return {index: "r"+(fig-51).toString(), text: '<div style="color: red; font-size: 1.2vw;display: inline; font-weight: bolder;">' + index.toString() + '</div>'}
            }

        }else if(color=="y")
        {
            if(fig == null)
            {
                console.log("yellow fig null")
                return {index: "yellow"+index.toString(), text: index.toString()}
            }else if(fig <= 51)
            {
                console.log("yellow fig pos " + fig)
                return {index: ((fig+39)%52).toString(), text: '<div style="color: yellow; font-size: 1.2vw;display: inline; font-weight: bolder;">' + index.toString() + '</div>'}
            }else
            {
                console.log("yellow fig win " + fig)
                return {index: "y"+(fig-51).toString(), text: '<div style="color: yellow; font-size: 1.2vw;display: inline; font-weight: bolder;">' + index.toString() + '</div>'}
            }

        }else if(color=="b")
        {
            if(fig == null)
            {
                console.log("blue fig null")
                return {index: "blue"+index.toString(), text: index.toString()}
            }else if(fig <= 51)
            {
                console.log("blue fig pos " + fig)
                return {index: ((fig+26)%52).toString(), text: '<div style="color: blue; font-size: 1.2vw;display: inline; font-weight: bolder;">' + index.toString() + '</div>'}
            }else
            {
                console.log("blue fig win " + fig)
                return {index: "b"+(fig-51).toString(), text: '<div style="color: blue; font-size: 1.2vw;display: inline; font-weight: bolder;">' + index.toString() + '</div>'}
            }

        }else if(color=="g")
        {
            if(fig == null)
            {
                console.log("green fig null")
                return {index: "green"+index.toString(), text: index.toString()}
            }else if(fig <= 51)
            {
                console.log("green fig pos " + fig)
                return {index: ((fig+13)%52).toString(), text: '<div style="color: green; font-size: 1.2vw;display: inline; font-weight: bolder;">' + index.toString() + '</div>'}
            }else
            {
                console.log("green fig win " + fig)
                return {index: "g"+(fig-51).toString(), text: '<div style="color: green; font-size: 1.2vw;display: inline; font-weight: bolder;">' + index.toString() + '</div>'}
            }

        }

   }

   socket.on("win", function(data){
    console.log("!!!!!!!!!!!WIN!!!!!!!!!!!")
    alert("GAME ENDED!\n\n1. " + data.place1 + "\n2. " + data.place2 + "\n3. " + data.place3 + "\n4. " + data.place4);
    location.reload()
    });

   function setIndexData(index, data, color){

   }




















   
}else if (document.querySelector('.lobby') !== null) {

    setTimeout(function(){
        window.location.reload(1);
        }, 2000);

}