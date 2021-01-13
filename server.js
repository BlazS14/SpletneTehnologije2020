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

  socket.on('add-user', function(data){
    let user = User.findById(data.userid)

    clients[data.userid] = {
      name: user.name,
      socket: socket.id
    };
  });

  socket.on('message', function(data){
    console.log("Sending: " + data.msg);
    let user = User.findById(data.userid)
    if (clients[data.userid]){
      socket.emit("add-message", {msg: data.msg, username: user.name});
    } else {
      console.log("Error in messaging" + data); 
    }
  });

  //Removing the socket on disconnect
  socket.on('disconnect', function() {
  	for(var name in clients) {
  		if(clients[name].socket === socket.id) {
  			delete clients[name];
  			break;
  		}
  	}	
  })

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