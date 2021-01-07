const express = require('express')
const { Mongoose } = require('mongoose')
const router = express.Router()
const CList = require('../models/clist')
const Chore = require('../models/chore')
const User = require('../models/user')
const Room = require('../models/room')

router.get('/',async (req,res) => {
    let user = new User(req.session.user)
    let rooms
    try{
        sesh = req.session;
        if(!sesh.user)
        {
           res.render('index',{
               session: sesh,
               errorMessage: 'Access denied!'
           })
           //throw new Error('Missing session user')
        }else{
        rooms = await Room.find({})
        res.render('rooms/index', {rooms: rooms})
    }
    }catch(e){
        console.error(e)
        res.render('rooms/index', {clist: clist,errorMessage: 'Napaka pri nalaganju opravil!'})
    }
})

router.get('/new',(req,res) => {
    sesh = req.session;
        if(!sesh.user)
        {
           res.render('index',{
               session: sesh,
               errorMessage: 'Access denied!'
           })
           //throw new Error('Missing session user')
        }else{
    res.render('rooms/new',{ rooms: new Room()})
}})

router.post('/',async (req,res) => {
    let user = new User(req.session.user)
    const room = new Room({
        name: req.body.name,
    })
    try {
        sesh = req.session;
        if(!sesh.user)
        {
           res.render('index',{
               session: sesh,
               errorMessage: 'Access denied!'
           })
           //throw new Error('Missing session user')
        }else{
        const newRoom = await room.save()
        res.redirect(`/rooms/${room.id}`)
    }} catch (e){
        //console.error(e)
        res.render('rooms/new',{
            rooms: room,
            errorMessage: 'Napaka pri kreaciji seznama!'
        }) 
    }

})

router.get('/:id',async (req,res) => {
    try{
        sesh = req.session;
        if(!sesh.user)
        {
           res.render('index',{
               session: sesh,
               errorMessage: 'Access denied!'
           })
           //throw new Error('Missing session user')
        }else{
        const room = await Room.findById(req.params.id)
        res.render('rooms/room',{ 
            rooms: room
        })
    }}catch(e){
        console.error(e)
        res.redirect('/clists/', {clist: clist,errorMessage: 'Napaka pri nalaganju opravila!'})
    }
    
})

/*router.put('/:id',async (req,res) => {
    let clist
    try {
        sesh = req.session;
        if(!sesh.user)
        {
           res.render('index',{
               session: sesh,
               errorMessage: 'Access denied!'
           })
           //throw new Error('Missing session user')
        }else{
        clist = await CList.findById(req.params.id)
        newClist = clist
        newClist.name = req.body.name
        newClist.tags = req.body.tags
        clist = await newClist.save()
        res.redirect(`/clists/chores/${clist.id}`)
    }} catch (e){
        console.error(e)
        if(clist != null)
        {
            clist = await CList.findById(clist.id)
            res.render('clists/edit', {clist: clist, errorMessage: 'Napaka pri urejanju opravila!'})
        }else{
            res.redirect('/clist')
        }
    }
})*/

router.delete('/:id',async (req,res) => {
    let room
    try {
        sesh = req.session;
        if(!sesh.user)
        {
           res.render('index',{
               session: sesh,
               errorMessage: 'Access denied!'
           })
           //throw new Error('Missing session user')
        }else{
            room = await Room.findById(req.params.id)
        await room.remove()
        res.redirect('/rooms/')
    }} catch (e){
        console.error(e)
        if(!room){
            res.redirect('/')
        }else{
                res.render(`/rooms/${room.id}`,{
                    room: room,
                errorMessage: 'Napaka pri brisanju seznama!'
            }) 
        }

    }
})


module.exports = router