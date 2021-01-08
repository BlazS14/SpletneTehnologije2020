if(process.env.NODE_ENV !== 'production')
{
    require('dotenv').config()
}

const express = require('express')
const app = express()
const session = require('express-session');
const io = require("socket.io")(4000, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
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
    secret: 'tojeskrivnost',
    resave: false,
    saveUninitialized: false
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



io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res || {}, next);
});




io.on('connection',socket => {
    socket.emit('init-msg',{msg: 'hellou'})

    socket.on('gameinit-msg',data => {
       
        /*console.debug(data.msg)  
        console.debug(socket.request.session.user)*/
    })

})















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
}