if(process.env.NODE_ENV !== 'production')
{
    require('dotenv').config()
}

const express = require('express')
const app = express()
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

const indexRouter = require('./routes/index')
const listsRouter = require('./routes/clists')
const choreRouter = require('./routes/chores')

app.use(session({
    secret: 'tojeskrivnost',
    resave: false,
    saveUninitialized: false
}));
app.set('view engine','ejs')
app.set('views',__dirname+'/views')
app.set('layout','layouts/layout')
app.use(expressLayouts)
app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}))

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL,{ useNewUrlParser: true,  useUnifiedTopology: true })
const db = mongoose.connection
db.on('error',error => console.error(error))
db.once('open',error => console.error('Connected to Mongoose'))


app.use('/',indexRouter)
app.use('/clists',listsRouter)
app.use('/clists/chores',choreRouter)

app.listen(process.env.PORT || 3000)