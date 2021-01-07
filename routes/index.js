const express = require('express')
const { Mongoose } = require('mongoose')
const router = express.Router()
const User = require('../models/user')

router.get('/',(req,res) => {
    res.render('index',{ session: req.session})
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
        req.session.user = null
        res.render('index', {session: req.session})
})

module.exports = router