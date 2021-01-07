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
    })
    let session = req.session
    try {
        let loadUser = await User.find({name: user.name})
        if(loadUser.length == 0){
            loadUser = await user.save()
        }


        req.session.name = loadUser.name
        
        res.redirect(`/clists`)
    } catch (e){
        console.error(e)
        res.render('index',{ 
            session: session,
            errorMessage: 'Napaka pri vpisu!'
        }) 
    }

})

module.exports = router