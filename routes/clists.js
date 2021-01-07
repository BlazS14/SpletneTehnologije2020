const express = require('express')
const { Mongoose } = require('mongoose')
const router = express.Router()
const CList = require('../models/clist')
const Chore = require('../models/chore')
const User = require('../models/user')
const user = require('../models/user')

router.get('/',async (req,res) => {
    try{
        console.debug(req.session.name)
        sesh = req.session;
        const clist = await CList.find({user: sesh.userid})
        res.render('clists/index', {clist: clist})
    }catch(e){
        console.error(e)
        res.redirect('clists/index', {clist: clist,errorMessage: 'Napaka pri nalaganju opravil!'})
    }
})

router.get('/new',(req,res) => {
    res.render('clists/new',{ clist: new CList()})
})

router.post('/',async (req,res) => {
    const clist = new CList({
        name: req.body.name,
        tags: req.body.tags
    })
    try {
        const newCList = await clist.save()
        res.redirect(`/clists/chores/${newCList.id}`)
    } catch (e){
        console.error(e)
        res.render('clists/new',{
            clist: clist,
            errorMessage: 'Napaka pri kreaciji seznama!'
        }) 
    }

})

router.get('/:id/edit',async (req,res) => {
    try{
        const clist = await CList.findById(req.params.id)
        res.render('clists/edit',{ 
            clist: clist
        })
    }catch(e){
        console.error(e)
        res.redirect('/clists/', {clist: clist,errorMessage: 'Napaka pri nalaganju opravila!'})
    }
    
})

router.put('/:id',async (req,res) => {
    let clist
    try {
        clist = await CList.findById(req.params.id)
        newClist = clist
        newClist.name = req.body.name
        newClist.tags = req.body.tags
        clist = await newClist.save()
        res.redirect(`/clists/chores/${clist.id}`)
    } catch (e){
        console.error(e)
        if(clist != null)
        {
            clist = await CList.findById(clist.id)
            res.render('clists/edit', {clist: clist, errorMessage: 'Napaka pri urejanju opravila!'})
        }else{
            res.redirect('/clist')
        }
    }
})

router.delete('/:id',async (req,res) => {
    let clist
    try {
        clist = await CList.findById(req.params.id)
        await clist.remove()
        res.redirect('/clists/')
    } catch (e){
        console.error(e)
        if(clist==null){
            res.redirect('/')
        }else{
                res.render(`/clists/${clist.id}`,{
                clist: clist,
                errorMessage: 'Napaka pri brisanju seznama!'
            }) 
        }

    }
})


module.exports = router