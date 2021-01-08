const express = require('express')
const { Mongoose } = require('mongoose')
const router = express.Router()
const CList = require('../models/clist')
const Chore = require('../models/chore')
const User = require('../models/user')
const Room = require('../models/room')

router.get('/:id',async (req,res) => {
    let users
    let room
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
        let user = new User(req.session.user)
        room = await Room.findById(req.params.id)
        user = await User.findById(user.id)
        user.roomid = req.params.id
        await user.save()
        users = await User.find({roomid: req.params.id})
        /*let arr = []
        if(users[0])
        {
            arr.push(new User(User.findById(users[0])))
        }
        if(users[1])
        {
            arr.push(new User(User.findById(users[1])))
        }
        if(users[2])
        {
            arr.push(new User(User.findById(users[2])))
        }
        if(users[3])
        {
            arr.push(new User(User.findById(users[3])))
        }*/



        res.render('games/index', {users: users})
    }
    }catch(e){
        console.error(e)
        res.redirect('/')
    }
})

router.post('/',async (req,res) => {
    let user =new User({
        name: req.body.nickname,
        gamesplayed: 0,
        gameswon: 0,
        place1: 0,
        place2: 0,
        place3: 0,
        place4: 0
    })
    let session = req.session
    try {
        let loadUser = await User.findOne({name: user.name})
        if(!loadUser){
            loadUser = await user.save()
        }


        req.session.user = loadUser
        
        res.redirect(`/clists`)
    } catch (e){
        console.error(e)
        res.render('index',{ 
            session: session,
            errorMessage: 'Napaka pri vpisu!'
        }) 
    }

})


router.delete('/',async (req,res) => {
    let user
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
            user = new User(req.session.user)
            user = await User.findById(user.id)
            user.roomid = null
            await user.save()
            res.redirect('/rooms/index')
        }
        }catch(e){
            console.error(e)
            res.redirect('/')
        }
    })

router.delete('/',async (req,res) => {
    let users
    let room
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
        let user = new User(req.session.user)
        user = await User.findById(user.id)
        user.roomid = null
        await user.save()
        res.redirect('/rooms/index')
    }
    }catch(e){
        console.error(e)
        res.redirect('/')
    }
})

module.exports = router