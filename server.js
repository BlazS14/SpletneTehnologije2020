if(process.env.NODE_ENV !== 'production')
{
    require('dotenv').config()
}

const express = require('express')
const app = express()
const session = require('express-session');
var MemoryStore = require('memorystore')(session)
var cookie = require("cookies");
var ios = require('socket.io-express-session');




const io = require("socket.io")(4000, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  })







const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
var sharedsession = require("express-socket.io-session")
var RedisStore = require("connect-redis")(session);

//const cors = require('cors')

const indexRouter = require('./routes/index')
const listsRouter = require('./routes/clists')
const choreRouter = require('./routes/chores')
const roomRouter = require('./routes/rooms')
const gameRouter = require('./routes/games')

const sessionMiddleware = session({
  cookie: { maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: 'tojeskrivnost',
    resave: false,
    saveUninitialized: true
})

app.use(sessionMiddleware)
app.set('view engine','ejs')
app.set('views',__dirname+'/views')
app.set('layout','layouts/layout')
app.use(expressLayouts)
app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}))
//app.use(cors())

const mongoose = require('mongoose');
const { Socket } = require('socket.io');
mongoose.connect(process.env.DATABASE_URL,{ useNewUrlParser: true,  useUnifiedTopology: true })
const db = mongoose.connection
db.on('error',error => console.error(error))
db.once('open',error => console.error('Connected to Mongoose'))


app.use('/',indexRouter)
app.use('/clists',listsRouter)
app.use('/clists/chores',choreRouter)
app.use('/rooms',roomRouter)
app.use('/rooms/games',gameRouter)
app.use(express.static('public'))

app.listen(process.env.PORT || 3000)


io.use(ios(sessionMiddleware))
io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res || {}, next);
});








const CList = require('./models/clist')
const Chore = require('./models/chore')
const User = require('./models/user')
const Room = require('./models/room')
const Game = require('./models/game')



/*io.on('connection',socket => {
    socket.emit('init-msg',{msg: 'hellou'})

    socket.on('auth',async data => {
       
        var cookief = socket.handshake.headers.cookie; 
        //var cookies = cookie.parse(socket.handshake.headers.cookie);
        let  user = await User.findById(data.userid);

        console.debug(user) 
        socket.join(user.roomid);
        user.socketid= socket.id
        await user.save()
        let size = io.sockets.adapter.rooms.get(user.roomid).size
        //console.debug(socket.request.session.user)
        if(size == 4)
          startGame(users.roomid)

    })



})*/

async function startGame(roomid)
{
  let room = await Room.findById(roomid)
  let game = await Game.findOne({roomid: roomid})
  let redp = await User.findById(game.redplayer)
  let greenp = await User.findById(game.greenplayer)
  let yellowp = await User.findById(game.yellowplayer)
  let bluep = await User.findById(game.blueplayer)

  if(game.gamecounter % 4 == 0){
    
    io.to(redp.socketid).emit('roll',{})

  }else if(game.gamecounter % 4 == 1){

  }else if(game.gamecounter % 4 == 2){

  }else if(game.gamecounter % 4 == 3){

  }



}


var clients = {};

io.sockets.on('connection', function (socket) {

  socket.on('add-user', async function(data){
    let user = await User.findById(data.userid)

    clients[data.userid] = {
      roomid: data.roomid,
      name: user.name,
      socket: socket.id
    };
    let game = await Game.findOne({roomid: user.roomid})
    let redplayer = await User.findById(game.redplayer)
    for(var userid in clients) {
  		if(clients[userid].roomid === data.roomid) {
  			socket.to(clients[userid].socket).emit("user-connected", {username: clients[data.userid].name});
        socket.to(clients[userid].socket).emit("update-state", {rfigs: [], yfigs: [], bfigs: [], gfigs: [], rscore: 0, yscore: 0, bscore: 0, gscore: 0});
      }
    }
    socket.emit("update-state", {rfigs: [], yfigs: [], bfigs: [], gfigs: [], rscore: 0, yscore: 0, bscore: 0, gscore: 0});
    if(user.id == redplayer.id)
    {
      socket.emit("roll",{username: user.name});
    }

  });

  socket.on('message', async function(data){
    console.log("Sending: " + data.msg);
    let user = await User.findById(data.userid)
    for(var userid in clients) {
  		if(clients[userid].roomid === data.roomid) {
        socket.to(clients[userid].socket).emit("add-message", {msg: data.msg, username: clients[data.userid].name});
  		}
    }
    socket.emit("add-message", {msg: data.msg, username: clients[data.userid].name});
    
  });

  //Removing the socket on disconnect
  socket.on('disconnect', async function() {
  	for(var name in clients) {
  		if(clients[name].socket === socket.id) {
        
        for(var userid in clients) {
          if(clients[userid].roomid === clients[name].roomid) {
            socket.to(clients[userid].socket).emit("user-disconnected");
          }
        }


        
        let user = await User.findById(name)
        await Game.deleteMany({roomid: user.roomid})
        user.roomid = null
        await user.save()
  			delete clients[name];
  			break;
  		}
  	}	
  })

  






  socket.on('do-roll', async function(data){
    let user = await User.findById(data.userid)
    let room = await Room.findById(data.roomid)
    let game = await Game.findOne({roomid: user.roomid})
    let redplayer = await User.findById(game.redplayer)
    let yellowplayer = await User.findById(game.yellowplayer)
    let blueplayer = await User.findById(game.blueplayer)
    let greenplayer = await User.findById(game.greenplayer)
    
    game.roll = Math.floor(Math.random() * 6) + 1
    await game.save()

    if(user.id == redplayer.id)
    {
      socket.emit("get-roll",{roll: game.roll, figs: game.redpos});
    }else if(user.id == yellowplayer.id)
    {
      socket.emit("get-roll",{roll: game.roll, figs: game.yellowpos});
    }else if(user.id == blueplayer.id)
    {
      socket.emit("get-roll",{roll: game.roll, figs: game.bluepos});
    }else if(user.id == greenplayer.id)
    {
      socket.emit("get-roll",{roll: game.roll, figs: game.greenpos});
    }
  });



  socket.on('do-spawn', async function(data){
    let user = await User.findById(data.userid)
    let room = await Room.findById(data.roomid)
    let game = await Game.findOne({roomid: user.roomid})
    let redplayer = await User.findById(game.redplayer)
    let yellowplayer = await User.findById(game.yellowplayer)
    let blueplayer = await User.findById(game.blueplayer)
    let greenplayer = await User.findById(game.greenplayer)

    let i = 0
            
      if(user.id == redplayer.id)
      {
        for(; i != 4; i++)
    {
      if(game.redpos[i] == null)
      {
        game.redpos[i] = 0
        game.markModified('redpos')
        getKill(0,"r",game)
        break
      }
    }
      }else if(user.id == yellowplayer.id)
      {
        for(; i != 4; i++)
    {
      if(game.yellowpos[i] == null)
      {
        game.yellowpos[i] = 0
        game.markModified('yellowpos')
        getKill(0,"y",game)
        break
      }
    }
      }else if(user.id == blueplayer.id)
      {
        for(; i != 4; i++)
    {
      if(game.bluepos[i] == null)
      {
        game.bluepos[i] = 0
        game.markModified('bluepos')
        getKill(0,"b",game)
        break
      }
    }
      }else if(user.id == greenplayer.id)
      {
        for(; i != 4; i++)
    {
      if(game.greenpos[i] == null)
      {
        game.greenpos[i] = 0
        game.markModified('greenpos')
        getKill(0,"g",game)
        break
      }
    }
      }
    
    
    
    

    await game.save()

    for(var userid in clients) {
  		if(clients[userid].roomid === data.roomid) {
  			socket.to(clients[userid].socket).emit("update-state",{rfigs: game.redpos, yfigs: game.yellowpos, bfigs: game.bluepos, gfigs: game.greenpos, redscore: game.redscore, yellowscore: game.yellowscore, bluescore: game.bluescore, greenscore: game.greenscore});
  		}
    }
    socket.emit("update-state",{rfigs: game.redpos, yfigs: game.yellowpos, bfigs: game.bluepos, gfigs: game.greenpos, redscore: game.redscore, yellowscore: game.yellowscore, bluescore: game.bluescore, greenscore: game.greenscore});
  
    game.gamecounter++
    await game.save()


    if(checkWin(game) == true)
    {
      let place1
      let place2
      let place3
      let place4

      redplayer.gamesplayed++
      yellowplayer.gamesplayed++
      blueplayer.gamesplayed++
      greenplayer.gamesplayed++

      if(game.redscore == 1)
      {
        redplayer.gameswon++
        redplayer.place1++
        place1 = redplayer.name
      }else if(game.redscore == 2)
      {
        redplayer.place2++
        place2 = redplayer.name
      }else if(game.redscore == 3)
      {
        redplayer.place3++
        place3 = redplayer.name
      }else if(game.redscore == 4)
      {
        place4 = redplayer.name
        redplayer.place4++
      }

      if(game.yellowscore == 1)
      {
        place1 = yellowplayer.name
        yellowplayer.gameswon++
        yellowplayer.place1++
      }else if(game.yellowscore == 2)
      {
        yellowplayer.place2++
        place2 = yellowplayer.name
      }else if(game.yellowscore == 3)
      {
        place3 = yellowplayer.name
        yellowplayer.place3++
      }else if(game.yellowscore == 4)
      {
        place4 = yellowplayer.name
        yellowplayer.place4++
      }

      if(game.bluescore == 1)
      {
        place1 = blueplayer.name
        blueplayer.gameswon++
        blueplayer.place1++
      }else if(game.bluescore == 2)
      {
        place2 = blueplayer.name
        blueplayer.place2++
      }else if(game.bluescore == 3)
      {
        place3 = blueplayer.name
        blueplayer.place3++
      }else if(game.bluescore == 4)
      {
        place4 = blueplayer.name
        blueplayer.place4++
      }

      if(game.greenscore == 1)
      {
        place1 = greenplayer.name
        greenplayer.gameswon++
        greenplayer.place1++
      }else if(game.greenscore == 2)
      {
        place2 = greenplayer.name
        greenplayer.place2++
      }else if(game.greenscore == 3)
      {
        place3 = greenplayer.name
        greenplayer.place3++
      }else if(game.greenscore == 4)
      {
        place4 = greenplayer.name
        greenplayer.place4++
      }

      await redplayer.save()
      await yellowplayer.save()
      await blueplayer.save()
      await greenplayer.save()

      await game.save()
      await room.remove()

      for(var userid in clients) {
        if(clients[userid].roomid === data.roomid) {
          socket.to(clients[userid].socket).emit("win",{place1: place1, place2: place2, place3: place3, place4: place4, redscore: game.redscore, yellowscore: game.yellowscore, bluescore: game.bluescore, greenscore: game.greenscore});
        }
      }
      socket.emit("win",{place1: place1, place2: place2, place3: place3, place4: place4, redscore: game.redscore, yellowscore: game.yellowscore, bluescore: game.bluescore, greenscore: game.greenscore});
  


    }else{
      if(game.gamecounter%4 == 0)
      {
        socket.to(clients[redplayer.id].socket).emit("roll",{username: user.name, score: game.redscore});
      }else if(game.gamecounter%4 == 1)
      {
        socket.to(clients[yellowplayer.id].socket).emit("roll",{username: user.name, score: game.yellowscore});
      }else if(game.gamecounter%4 == 2)
      {
        socket.to(clients[blueplayer.id].socket).emit("roll",{username: user.name, score: game.bluescore});
      }else if(game.gamecounter%4 == 3)
      {
        socket.to(clients[greenplayer.id].socket).emit("roll",{username: user.name, score: game.greenscore});
      }

    }

  });



  socket.on('do-fig1', async function(data){
    let user = await User.findById(data.userid)
    let room = await Room.findById(data.roomid)
    let game = await Game.findOne({roomid: user.roomid})
    let redplayer = await User.findById(game.redplayer)
    let yellowplayer = await User.findById(game.yellowplayer)
    let blueplayer = await User.findById(game.blueplayer)
    let greenplayer = await User.findById(game.greenplayer)

    if(user.id == redplayer.id)
    {
      game.redpos[0] += game.roll
      getKill(game.redpos[0],"r",game)
      game.markModified('redpos')
    }else if(user.id == yellowplayer.id)
    {
      game.yellowpos[0] += game.roll
      getKill(game.yellowpos[0],"y",game)
      game.markModified('yellowpos')

    }else if(user.id == blueplayer.id)
    {
      game.bluepos[0] += game.roll
      getKill(game.bluepos[0],"b",game)
      game.markModified('bluepos')

    }else if(user.id == greenplayer.id)
    {
      game.greenpos[0] += game.roll
      getKill(game.greenpos[0],"g",game)
      game.markModified('greenpos')

    }



    await game.save()

    for(var userid in clients) {
  		if(clients[userid].roomid === data.roomid) {
  			socket.to(clients[userid].socket).emit("update-state",{rfigs: game.redpos, yfigs: game.yellowpos, bfigs: game.bluepos, gfigs: game.greenpos, redscore: game.redscore, yellowscore: game.yellowscore, bluescore: game.bluescore, greenscore: game.greenscore});
  		}
    }
    socket.emit("update-state",{rfigs: game.redpos, yfigs: game.yellowpos, bfigs: game.bluepos, gfigs: game.greenpos, redscore: game.redscore, yellowscore: game.yellowscore, bluescore: game.bluescore, greenscore: game.greenscore});

    game.gamecounter++
    await game.save()

    if(checkWin(game) == true)
    {
      let place1
      let place2
      let place3
      let place4

      redplayer.gamesplayed++
      yellowplayer.gamesplayed++
      blueplayer.gamesplayed++
      greenplayer.gamesplayed++

      if(game.redscore == 1)
      {
        redplayer.gameswon++
        redplayer.place1++
        place1 = redplayer.name
      }else if(game.redscore == 2)
      {
        redplayer.place2++
        place2 = redplayer.name
      }else if(game.redscore == 3)
      {
        redplayer.place3++
        place3 = redplayer.name
      }else if(game.redscore == 4)
      {
        place4 = redplayer.name
        redplayer.place4++
      }

      if(game.yellowscore == 1)
      {
        place1 = yellowplayer.name
        yellowplayer.gameswon++
        yellowplayer.place1++
      }else if(game.yellowscore == 2)
      {
        yellowplayer.place2++
        place2 = yellowplayer.name
      }else if(game.yellowscore == 3)
      {
        place3 = yellowplayer.name
        yellowplayer.place3++
      }else if(game.yellowscore == 4)
      {
        place4 = yellowplayer.name
        yellowplayer.place4++
      }

      if(game.bluescore == 1)
      {
        place1 = blueplayer.name
        blueplayer.gameswon++
        blueplayer.place1++
      }else if(game.bluescore == 2)
      {
        place2 = blueplayer.name
        blueplayer.place2++
      }else if(game.bluescore == 3)
      {
        place3 = blueplayer.name
        blueplayer.place3++
      }else if(game.bluescore == 4)
      {
        place4 = blueplayer.name
        blueplayer.place4++
      }

      if(game.greenscore == 1)
      {
        place1 = greenplayer.name
        greenplayer.gameswon++
        greenplayer.place1++
      }else if(game.greenscore == 2)
      {
        place2 = greenplayer.name
        greenplayer.place2++
      }else if(game.greenscore == 3)
      {
        place3 = greenplayer.name
        greenplayer.place3++
      }else if(game.greenscore == 4)
      {
        place4 = greenplayer.name
        greenplayer.place4++
      }

      await redplayer.save()
      await yellowplayer.save()
      await blueplayer.save()
      await greenplayer.save()

      await game.save()
      await room.remove()

      for(var userid in clients) {
        if(clients[userid].roomid === data.roomid) {
          socket.to(clients[userid].socket).emit("win",{place1: place1, place2: place2, place3: place3, place4: place4, redscore: game.redscore, yellowscore: game.yellowscore, bluescore: game.bluescore, greenscore: game.greenscore});
        }
      }
      socket.emit("win",{place1: place1, place2: place2, place3: place3, place4: place4, redscore: game.redscore, yellowscore: game.yellowscore, bluescore: game.bluescore, greenscore: game.greenscore});
  


    }else{
      if(game.gamecounter%4 == 0)
      {
        socket.to(clients[redplayer.id].socket).emit("roll",{username: user.name, score: game.redscore});
      }else if(game.gamecounter%4 == 1)
      {
        socket.to(clients[yellowplayer.id].socket).emit("roll",{username: user.name, score: game.yellowscore});
      }else if(game.gamecounter%4 == 2)
      {
        socket.to(clients[blueplayer.id].socket).emit("roll",{username: user.name, score: game.bluescore});
      }else if(game.gamecounter%4 == 3)
      {
        socket.to(clients[greenplayer.id].socket).emit("roll",{username: user.name, score: game.greenscore});
      }

    }

    
  });


  socket.on('do-fig2', async function(data){
    let user = await User.findById(data.userid)
    let room = await Room.findById(data.roomid)
    let game = await Game.findOne({roomid: user.roomid})
    let redplayer = await User.findById(game.redplayer)
    let yellowplayer = await User.findById(game.yellowplayer)
    let blueplayer = await User.findById(game.blueplayer)
    let greenplayer = await User.findById(game.greenplayer)

    if(user.id == redplayer.id)
    {
      game.redpos[1] += game.roll
      getKill(game.redpos[1],"r",game)
      game.markModified('redpos')
    }else if(user.id == yellowplayer.id)
    {
      game.yellowpos[1] += game.roll
      getKill(game.yellowpos[1],"y",game)
      game.markModified('yellowpos')

    }else if(user.id == blueplayer.id)
    {
      game.bluepos[1] += game.roll
      getKill(game.bluepos[1],"b",game)
      game.markModified('bluepos')

    }else if(user.id == greenplayer.id)
    {
      game.greenpos[1] += game.roll
      getKill(game.greenpos[1],"g",game)
      game.markModified('greenpos')

    }

    await game.save()

    for(var userid in clients) {
  		if(clients[userid].roomid === data.roomid) {
  			socket.to(clients[userid].socket).emit("update-state",{rfigs: game.redpos, yfigs: game.yellowpos, bfigs: game.bluepos, gfigs: game.greenpos, redscore: game.redscore, yellowscore: game.yellowscore, bluescore: game.bluescore, greenscore: game.greenscore});
  		}
    }
    socket.emit("update-state",{rfigs: game.redpos, yfigs: game.yellowpos, bfigs: game.bluepos, gfigs: game.greenpos, redscore: game.redscore, yellowscore: game.yellowscore, bluescore: game.bluescore, greenscore: game.greenscore});

    game.gamecounter++
    await game.save()

    if(checkWin(game) == true)
    {
      let place1
      let place2
      let place3
      let place4

      redplayer.gamesplayed++
      yellowplayer.gamesplayed++
      blueplayer.gamesplayed++
      greenplayer.gamesplayed++

      if(game.redscore == 1)
      {
        redplayer.gameswon++
        redplayer.place1++
        place1 = redplayer.name
      }else if(game.redscore == 2)
      {
        redplayer.place2++
        place2 = redplayer.name
      }else if(game.redscore == 3)
      {
        redplayer.place3++
        place3 = redplayer.name
      }else if(game.redscore == 4)
      {
        place4 = redplayer.name
        redplayer.place4++
      }

      if(game.yellowscore == 1)
      {
        place1 = yellowplayer.name
        yellowplayer.gameswon++
        yellowplayer.place1++
      }else if(game.yellowscore == 2)
      {
        yellowplayer.place2++
        place2 = yellowplayer.name
      }else if(game.yellowscore == 3)
      {
        place3 = yellowplayer.name
        yellowplayer.place3++
      }else if(game.yellowscore == 4)
      {
        place4 = yellowplayer.name
        yellowplayer.place4++
      }

      if(game.bluescore == 1)
      {
        place1 = blueplayer.name
        blueplayer.gameswon++
        blueplayer.place1++
      }else if(game.bluescore == 2)
      {
        place2 = blueplayer.name
        blueplayer.place2++
      }else if(game.bluescore == 3)
      {
        place3 = blueplayer.name
        blueplayer.place3++
      }else if(game.bluescore == 4)
      {
        place4 = blueplayer.name
        blueplayer.place4++
      }

      if(game.greenscore == 1)
      {
        place1 = greenplayer.name
        greenplayer.gameswon++
        greenplayer.place1++
      }else if(game.greenscore == 2)
      {
        place2 = greenplayer.name
        greenplayer.place2++
      }else if(game.greenscore == 3)
      {
        place3 = greenplayer.name
        greenplayer.place3++
      }else if(game.greenscore == 4)
      {
        place4 = greenplayer.name
        greenplayer.place4++
      }

      await redplayer.save()
      await yellowplayer.save()
      await blueplayer.save()
      await greenplayer.save()

      await game.save()
      await room.remove()

      for(var userid in clients) {
        if(clients[userid].roomid === data.roomid) {
          socket.to(clients[userid].socket).emit("win",{place1: place1, place2: place2, place3: place3, place4: place4, redscore: game.redscore, yellowscore: game.yellowscore, bluescore: game.bluescore, greenscore: game.greenscore});
        }
      }
      socket.emit("win",{place1: place1, place2: place2, place3: place3, place4: place4, redscore: game.redscore, yellowscore: game.yellowscore, bluescore: game.bluescore, greenscore: game.greenscore});
  


    }else{
      if(game.gamecounter%4 == 0)
      {
        socket.to(clients[redplayer.id].socket).emit("roll",{username: user.name, score: game.redscore});
      }else if(game.gamecounter%4 == 1)
      {
        socket.to(clients[yellowplayer.id].socket).emit("roll",{username: user.name, score: game.yellowscore});
      }else if(game.gamecounter%4 == 2)
      {
        socket.to(clients[blueplayer.id].socket).emit("roll",{username: user.name, score: game.bluescore});
      }else if(game.gamecounter%4 == 3)
      {
        socket.to(clients[greenplayer.id].socket).emit("roll",{username: user.name, score: game.greenscore});
      }

    }

    
  });



  socket.on('do-fig3', async function(data){
    let user = await User.findById(data.userid)
    let room = await Room.findById(data.roomid)
    let game = await Game.findOne({roomid: user.roomid})
    let redplayer = await User.findById(game.redplayer)
    let yellowplayer = await User.findById(game.yellowplayer)
    let blueplayer = await User.findById(game.blueplayer)
    let greenplayer = await User.findById(game.greenplayer)

    if(user.id == redplayer.id)
    {
      game.redpos[2] += game.roll
      getKill(game.redpos[2],"r",game)
      game.markModified('redpos')
    }else if(user.id == yellowplayer.id)
    {
      game.yellowpos[2] += game.roll
      getKill(game.yellowpos[2],"y",game)
      game.markModified('yellowpos')

    }else if(user.id == blueplayer.id)
    {
      game.bluepos[2] += game.roll
      getKill(game.bluepos[2],"b",game)
      game.markModified('bluepos')

    }else if(user.id == greenplayer.id)
    {
      game.greenpos[2] += game.roll
      getKill(game.greenpos[2],"g",game)
      game.markModified('greenpos')

    }

    game = await game.save()

    for(var userid in clients) {
  		if(clients[userid].roomid === data.roomid) {
  			socket.to(clients[userid].socket).emit("update-state",{rfigs: game.redpos, yfigs: game.yellowpos, bfigs: game.bluepos, gfigs: game.greenpos, redscore: game.redscore, yellowscore: game.yellowscore, bluescore: game.bluescore, greenscore: game.greenscore});
  		}
    }
    socket.emit("update-state",{rfigs: game.redpos, yfigs: game.yellowpos, bfigs: game.bluepos, gfigs: game.greenpos, redscore: game.redscore, yellowscore: game.yellowscore, bluescore: game.bluescore, greenscore: game.greenscore});

    game.gamecounter++
    await game.save()

    if(checkWin(game) == true)
    {
      let place1
      let place2
      let place3
      let place4

      redplayer.gamesplayed++
      yellowplayer.gamesplayed++
      blueplayer.gamesplayed++
      greenplayer.gamesplayed++

      if(game.redscore == 1)
      {
        redplayer.gameswon++
        redplayer.place1++
        place1 = redplayer.name
      }else if(game.redscore == 2)
      {
        redplayer.place2++
        place2 = redplayer.name
      }else if(game.redscore == 3)
      {
        redplayer.place3++
        place3 = redplayer.name
      }else if(game.redscore == 4)
      {
        place4 = redplayer.name
        redplayer.place4++
      }

      if(game.yellowscore == 1)
      {
        place1 = yellowplayer.name
        yellowplayer.gameswon++
        yellowplayer.place1++
      }else if(game.yellowscore == 2)
      {
        yellowplayer.place2++
        place2 = yellowplayer.name
      }else if(game.yellowscore == 3)
      {
        place3 = yellowplayer.name
        yellowplayer.place3++
      }else if(game.yellowscore == 4)
      {
        place4 = yellowplayer.name
        yellowplayer.place4++
      }

      if(game.bluescore == 1)
      {
        place1 = blueplayer.name
        blueplayer.gameswon++
        blueplayer.place1++
      }else if(game.bluescore == 2)
      {
        place2 = blueplayer.name
        blueplayer.place2++
      }else if(game.bluescore == 3)
      {
        place3 = blueplayer.name
        blueplayer.place3++
      }else if(game.bluescore == 4)
      {
        place4 = blueplayer.name
        blueplayer.place4++
      }

      if(game.greenscore == 1)
      {
        place1 = greenplayer.name
        greenplayer.gameswon++
        greenplayer.place1++
      }else if(game.greenscore == 2)
      {
        place2 = greenplayer.name
        greenplayer.place2++
      }else if(game.greenscore == 3)
      {
        place3 = greenplayer.name
        greenplayer.place3++
      }else if(game.greenscore == 4)
      {
        place4 = greenplayer.name
        greenplayer.place4++
      }

      await redplayer.save()
      await yellowplayer.save()
      await blueplayer.save()
      await greenplayer.save()

      await game.save()
      await room.remove()

      for(var userid in clients) {
        if(clients[userid].roomid === data.roomid) {
          socket.to(clients[userid].socket).emit("win",{place1: place1, place2: place2, place3: place3, place4: place4, redscore: game.redscore, yellowscore: game.yellowscore, bluescore: game.bluescore, greenscore: game.greenscore});
        }
      }
      socket.emit("win",{place1: place1, place2: place2, place3: place3, place4: place4, redscore: game.redscore, yellowscore: game.yellowscore, bluescore: game.bluescore, greenscore: game.greenscore});
  


    }else{
      if(game.gamecounter%4 == 0)
      {
        socket.to(clients[redplayer.id].socket).emit("roll",{username: user.name, score: game.redscore});
      }else if(game.gamecounter%4 == 1)
      {
        socket.to(clients[yellowplayer.id].socket).emit("roll",{username: user.name, score: game.yellowscore});
      }else if(game.gamecounter%4 == 2)
      {
        socket.to(clients[blueplayer.id].socket).emit("roll",{username: user.name, score: game.bluescore});
      }else if(game.gamecounter%4 == 3)
      {
        socket.to(clients[greenplayer.id].socket).emit("roll",{username: user.name, score: game.greenscore});
      }

    }

    
  });



  socket.on('do-fig4', async function(data){
    let user = await User.findById(data.userid)
    let room = await Room.findById(data.roomid)
    let game = await Game.findOne({roomid: user.roomid})
    let redplayer = await User.findById(game.redplayer)
    let yellowplayer = await User.findById(game.yellowplayer)
    let blueplayer = await User.findById(game.blueplayer)
    let greenplayer = await User.findById(game.greenplayer)

    if(user.id == redplayer.id)
    {
      game.redpos[3] += game.roll
      getKill(game.redpos[3],"r",game)
      game.markModified('redpos')
    }else if(user.id == yellowplayer.id)
    {
      game.yellowpos[3] += game.roll
      getKill(game.yellowpos[3],"y",game)
      game.markModified('yellowpos')

    }else if(user.id == blueplayer.id)
    {
      game.bluepos[3] += game.roll
      getKill(game.bluepos[3],"b",game)
      game.markModified('bluepos')

    }else if(user.id == greenplayer.id)
    {
      game.greenpos[3] += game.roll
      getKill(game.greenpos[3],"g",game)
      game.markModified('greenpos')

    }

    game = await game.save()

    for(var userid in clients) {
  		if(clients[userid].roomid === data.roomid) {
  			socket.to(clients[userid].socket).emit("update-state",{rfigs: game.redpos, yfigs: game.yellowpos, bfigs: game.bluepos, gfigs: game.greenpos, redscore: game.redscore, yellowscore: game.yellowscore, bluescore: game.bluescore, greenscore: game.greenscore});
  		}
    }
    socket.emit("update-state",{rfigs: game.redpos, yfigs: game.yellowpos, bfigs: game.bluepos, gfigs: game.greenpos, redscore: game.redscore, yellowscore: game.yellowscore, bluescore: game.bluescore, greenscore: game.greenscore});

    game.gamecounter++
    await game.save()

    if(checkWin(game) == true)
    {
      let place1
      let place2
      let place3
      let place4

      redplayer.gamesplayed++
      yellowplayer.gamesplayed++
      blueplayer.gamesplayed++
      greenplayer.gamesplayed++

      if(game.redscore == 1)
      {
        redplayer.gameswon++
        redplayer.place1++
        place1 = redplayer.name
      }else if(game.redscore == 2)
      {
        redplayer.place2++
        place2 = redplayer.name
      }else if(game.redscore == 3)
      {
        redplayer.place3++
        place3 = redplayer.name
      }else if(game.redscore == 4)
      {
        place4 = redplayer.name
        redplayer.place4++
      }

      if(game.yellowscore == 1)
      {
        place1 = yellowplayer.name
        yellowplayer.gameswon++
        yellowplayer.place1++
      }else if(game.yellowscore == 2)
      {
        yellowplayer.place2++
        place2 = yellowplayer.name
      }else if(game.yellowscore == 3)
      {
        place3 = yellowplayer.name
        yellowplayer.place3++
      }else if(game.yellowscore == 4)
      {
        place4 = yellowplayer.name
        yellowplayer.place4++
      }

      if(game.bluescore == 1)
      {
        place1 = blueplayer.name
        blueplayer.gameswon++
        blueplayer.place1++
      }else if(game.bluescore == 2)
      {
        place2 = blueplayer.name
        blueplayer.place2++
      }else if(game.bluescore == 3)
      {
        place3 = blueplayer.name
        blueplayer.place3++
      }else if(game.bluescore == 4)
      {
        place4 = blueplayer.name
        blueplayer.place4++
      }

      if(game.greenscore == 1)
      {
        place1 = greenplayer.name
        greenplayer.gameswon++
        greenplayer.place1++
      }else if(game.greenscore == 2)
      {
        place2 = greenplayer.name
        greenplayer.place2++
      }else if(game.greenscore == 3)
      {
        place3 = greenplayer.name
        greenplayer.place3++
      }else if(game.greenscore == 4)
      {
        place4 = greenplayer.name
        greenplayer.place4++
      }

      await redplayer.save()
      await yellowplayer.save()
      await blueplayer.save()
      await greenplayer.save()

      await game.save()
      await room.remove()

      for(var userid in clients) {
        if(clients[userid].roomid === data.roomid) {
          socket.to(clients[userid].socket).emit("win",{place1: place1, place2: place2, place3: place3, place4: place4, redscore: game.redscore, yellowscore: game.yellowscore, bluescore: game.bluescore, greenscore: game.greenscore});
        }
      }
      socket.emit("win",{place1: place1, place2: place2, place3: place3, place4: place4, redscore: game.redscore, yellowscore: game.yellowscore, bluescore: game.bluescore, greenscore: game.greenscore});
  


    }else{
      if(game.gamecounter%4 == 0)
      {
        socket.to(clients[redplayer.id].socket).emit("roll",{username: user.name, score: game.redscore});
      }else if(game.gamecounter%4 == 1)
      {
        socket.to(clients[yellowplayer.id].socket).emit("roll",{username: user.name, score: game.yellowscore});
      }else if(game.gamecounter%4 == 2)
      {
        socket.to(clients[blueplayer.id].socket).emit("roll",{username: user.name, score: game.bluescore});
      }else if(game.gamecounter%4 == 3)
      {
        socket.to(clients[greenplayer.id].socket).emit("roll",{username: user.name, score: game.greenscore});
      }

    }

  });


  socket.on('do-none', async function(data){
    let user = await User.findById(data.userid)
    let room = await Room.findById(data.roomid)
    let game = await Game.findOne({roomid: user.roomid})
    let redplayer = await User.findById(game.redplayer)
    let yellowplayer = await User.findById(game.yellowplayer)
    let blueplayer = await User.findById(game.blueplayer)
    let greenplayer = await User.findById(game.greenplayer)


    game.gamecounter++
    await game.save()


    if(checkWin(game) == true)
    {
      let place1
      let place2
      let place3
      let place4

      redplayer.gamesplayed++
      yellowplayer.gamesplayed++
      blueplayer.gamesplayed++
      greenplayer.gamesplayed++

      if(game.redscore == 1)
      {
        redplayer.gameswon++
        redplayer.place1++
        place1 = redplayer.name
      }else if(game.redscore == 2)
      {
        redplayer.place2++
        place2 = redplayer.name
      }else if(game.redscore == 3)
      {
        redplayer.place3++
        place3 = redplayer.name
      }else if(game.redscore == 4)
      {
        place4 = redplayer.name
        redplayer.place4++
      }

      if(game.yellowscore == 1)
      {
        place1 = yellowplayer.name
        yellowplayer.gameswon++
        yellowplayer.place1++
      }else if(game.yellowscore == 2)
      {
        yellowplayer.place2++
        place2 = yellowplayer.name
      }else if(game.yellowscore == 3)
      {
        place3 = yellowplayer.name
        yellowplayer.place3++
      }else if(game.yellowscore == 4)
      {
        place4 = yellowplayer.name
        yellowplayer.place4++
      }

      if(game.bluescore == 1)
      {
        place1 = blueplayer.name
        blueplayer.gameswon++
        blueplayer.place1++
      }else if(game.bluescore == 2)
      {
        place2 = blueplayer.name
        blueplayer.place2++
      }else if(game.bluescore == 3)
      {
        place3 = blueplayer.name
        blueplayer.place3++
      }else if(game.bluescore == 4)
      {
        place4 = blueplayer.name
        blueplayer.place4++
      }

      if(game.greenscore == 1)
      {
        place1 = greenplayer.name
        greenplayer.gameswon++
        greenplayer.place1++
      }else if(game.greenscore == 2)
      {
        place2 = greenplayer.name
        greenplayer.place2++
      }else if(game.greenscore == 3)
      {
        place3 = greenplayer.name
        greenplayer.place3++
      }else if(game.greenscore == 4)
      {
        place4 = greenplayer.name
        greenplayer.place4++
      }

      await redplayer.save()
      await yellowplayer.save()
      await blueplayer.save()
      await greenplayer.save()

      await game.save()
      await room.remove()

      for(var userid in clients) {
        if(clients[userid].roomid === data.roomid) {
          socket.to(clients[userid].socket).emit("win",{place1: place1, place2: place2, place3: place3, place4: place4, redscore: game.redscore, yellowscore: game.yellowscore, bluescore: game.bluescore, greenscore: game.greenscore});
        }
      }
      socket.emit("win",{place1: place1, place2: place2, place3: place3, place4: place4, redscore: game.redscore, yellowscore: game.yellowscore, bluescore: game.bluescore, greenscore: game.greenscore});


    }else{
      if(game.gamecounter%4 == 0)
      {
        socket.to(clients[redplayer.id].socket).emit("roll",{username: user.name, score: game.redscore});
      }else if(game.gamecounter%4 == 1)
      {
        socket.to(clients[yellowplayer.id].socket).emit("roll",{username: user.name, score: game.yellowscore});
      }else if(game.gamecounter%4 == 2)
      {
        socket.to(clients[blueplayer.id].socket).emit("roll",{username: user.name, score: game.bluescore});
      }else if(game.gamecounter%4 == 3)
      {
        socket.to(clients[greenplayer.id].socket).emit("roll",{username: user.name, score: game.greenscore});
      }

    }


    

  });






















  async function checkWin(game){
    let sum1=0
    let sum2=0
    let sum3=0
    let sum4=0

    for(let i = 0; i != 4; i++)
    {
      if(game.redpos[i] != null)
      {
        sum1 = sum1 + game.redpos[i]
      }
    }
    for(let i = 0; i != 4; i++)
    {
      if(game.yellowpos[i] != null)
      {
        sum2 = sum2 + game.yellowpos[i]
      }
    }
    for(let i = 0; i != 4; i++)
    {
      if(game.bluepos[i] != null)
      {
        sum3 = sum3 + game.bluepos[i]
      }
    }
    for(let i = 0; i != 4; i++)
    {
      if(game.greenpos[i] != null)
      {
        sum4 = sum4 + game.greenpos[i]
      }
    }

    if(sum1 >= 224 && game.redscore == 0)
    {
      game.wincount++
      game.redscore = game.wincount 
    }
    if(sum2 >= 224 && game.yellowscore == 0)
    {
      game.wincount++
      game.yellowscore = game.wincount 
    }
    if(sum3 >= 224 && game.bluescore == 0)
    {
      game.wincount++
      game.bluescore = game.wincount 
    }
    if(sum4 >= 224 && game.greenscore == 0)
    {
      game.wincount++
      game.greenscore = game.wincount 
    }

    await game.save()

    if(sum1+sum2+sum3+sum4 >= 896)
    {
      return true
    }
    return false
  }










  async function getKill(pos,color,game)
  {
    if(pos <= 51)
    {
      let abs = 0
      if(color == "r")
      {
        abs = pos
      }else if(color == "y")
      {
        abs = (pos+39)%51
      }else if(color == "b")
      {
        abs = (pos+26)%51
      }else if(color == "g")
      {
        abs = (pos+13)%51
      }


      let i = 0
      for(i = 0; i != 4; i++ )
      {
        if(color != "r" && game.redpos[i] != null)
        {
          if(game.redpos[i] == abs && game.redpos[i] < 52)
          {
            game.redpos[i] = null
            game.markModified('redpos')
          }
        }
        if(color != "y" && game.yellowpos[i] != null)
        {
          if((game.yellowpos[i]+39)%52 == abs && game.yellowpos[i] < 52)
          {
            game.yellowpos[i] = null
            game.markModified('yellowpos')
          }
        }
        if(color != "b" && game.bluepos[i] != null)
        {
          if((game.bluepos[i]+26)%52 == abs && game.bluepos[i] < 52)
          {
            game.bluepos[i] = null
            game.markModified('bluepos')
          }
        }
        if(color != "g" && game.greenpos[i] != null)
        {
          if((game.greenpos[i]+13)%52 == abs && game.greenpos[i] < 52)
          {
            game.greenpos[i] = null
            game.markModified('greenpos')
          }
        }
      }

      //await game.save()
    }
  }

});












/*
const state = {};
const clientRooms = {};

io.on('connection', client => {

  client.on('keydown', handleKeydown);
  client.on('newGame', handleNewGame);
  client.on('joinGame', handleJoinGame);

  function handleJoinGame(roomName) {
    const room = io.sockets.adapter.rooms[roomName];

    let allUsers;
    if (room) {
      allUsers = room.sockets;
    }

    let numClients = 0;
    if (allUsers) {
      numClients = Object.keys(allUsers).length;
    }

    if (numClients === 0) {
      client.emit('unknownCode');
      return;
    } else if (numClients > 1) {
      client.emit('tooManyPlayers');
      return;
    }

    clientRooms[client.id] = roomName;

    client.join(roomName);
    client.number = 2;
    client.emit('init', 2);
    
    startGameInterval(roomName);
  }

  function handleNewGame() {
    let roomName = makeid(5);
    clientRooms[client.id] = roomName;
    client.emit('gameCode', roomName);

    state[roomName] = initGame();

    client.join(roomName);
    client.number = 1;
    client.emit('init', 1);
  }

  function handleKeydown(keyCode) {
    const roomName = clientRooms[client.id];
    if (!roomName) {
      return;
    }
    try {
      keyCode = parseInt(keyCode);
    } catch(e) {
      console.error(e);
      return;
    }

    const vel = getUpdatedVelocity(keyCode);

    if (vel) {
      state[roomName].players[client.number - 1].vel = vel;
    }
  }
});

function startGameInterval(roomName) {
  const intervalId = setInterval(() => {
    const winner = gameLoop(state[roomName]);
    
    if (!winner) {
      emitGameState(roomName, state[roomName])
    } else {
      emitGameOver(roomName, winner);
      state[roomName] = null;
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
}

function emitGameState(room, gameState) {
  // Send this event to everyone in the room.
  io.sockets.in(room)
    .emit('gameState', JSON.stringify(gameState));
}

function emitGameOver(room, winner) {
  io.sockets.in(room)
    .emit('gameOver', JSON.stringify({ winner }));
}*/