const express = require('express')
const { Mongoose } = require('mongoose')
const router = express.Router()
const CList = require('../models/clist')
const Chore = require('../models/chore')
const clist = require('../models/clist')
const chore = require('../models/chore')

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
        const clist = await CList.findById(req.params.id)
        const chores = await Chore.find({clist: clist.id})
        res.render('chores/index', {chores: chores, clist: clist})
    }}catch{
        res.redirect('/clists/', {clist: clist,errorMessage: 'Napaka pri nalaganju opravil!'})
    }
})

router.get('/:id/new',async (req,res) => {
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
        const clist = await CList.findById(req.params.id)
        const chore = new Chore()
        res.render('chores/new', {chore: chore,clist: clist})
    }}catch(e){
        console.error(e)
        res.redirect('/clists/', {errorMessage: 'Napaka pri nalaganju opravil!'})
    }
})

router.post('/:id',async (req,res) => {
    let clist
    let chore
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
        clist = await CList.findById(req.params.id)
        chore = new Chore({
            name: req.body.name,
            tags: req.body.tags,
            clist: clist,
            date: req.body.date,
            reminder: req.body.reminder,
            completed: false
            })
        const newChore = await chore.save()
        res.redirect(`/clists/chores/${clist.id}`)
    }}catch(e){
        console.error(e)
        if(clist != null)
        {
            res.render(`chores/new`,{
                clist: clist,
                chore: chore,
                errorMessage: 'Napaka pri kreaciji opravila!'
            }) 
        }else{
            res.render(`clists/`,{
                clist: clist,
                errorMessage: 'Napaka pri nalaganju starša opravila!'
            })
        }
        
    }

})

router.get('/:id/:idc/edit',async (req,res) => {
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
        const clist = await CList.findById(req.params.id)
        const chore = await Chore.findById(req.params.idc)
        res.render('chores/edit', {chore: chore,clist: clist})
    }}catch(e){
        console.error(e)
        res.redirect('/clists/', {errorMessage: 'Napaka pri nalaganju opravil!'})
    }
    
})

router.put('/:id/:idc',async (req,res) => {
    let clist = new CList()
    let chore = new Chore()
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
        chore = await Chore.findById(req.params.idc)
        const newChore = chore
        newChore.name = req.body.name
        newChore.tags = req.body.tags
        newChore.date = req.body.date
        newChore.reminder = req.body.reminder
        chore = await newChore.save()
        res.redirect(`/clists/chores/${clist.id}`)
    }} catch (e){
        console.error(e)
        if(clist==null && chore == null){
            res.redirect('/clists/index')
        }else if(clist != null && chore == null){
            res.redirect(`/clists/chores/${clist.id}`)
        }else{
            chore = await Chore.findById(req.params.idc)
                res.render('chores/edit',{
                clist: clist,
                chore: chore,
                errorMessage: 'Napaka pri posodabljanju seznama!'
            }) 
        }

    }
})

router.put('/:id/:idc/check',async (req,res) => {
    let clist = new CList()
    let chore = new Chore()
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
        chore = await Chore.findById(req.params.idc)
        const newChore = chore
        console.debug(newChore)
        newChore.completed = !chore.completed
        console.debug(req.body.completed)
        console.debug(newChore)
        chore = await newChore.save()
        res.redirect(`/clists/chores/${clist.id}`)
    }} catch (e){
        console.error(e)
        if(clist==null){
            res.redirect('/clists/index')
        }else if(clist != null){
            res.redirect(`/clists/chores/${clist.id}`)
        }
    }
})

router.delete('/:id/:idc',async (req,res) => {
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
        const clist = await CList.findById(req.params.id)
        const chore = await Chore.findById(req.params.idc)
        await chore.remove()
        res.redirect(`/clists/chores/${clist.id}`)
    }} catch (e){
        console.error(e)
        if(clist==null){
            res.redirect('/')
        }else{
            clist = await CList.findById(req.params.id)
                res.render(`/clists/${clist.id}`,{
                clist: clist,
                errorMessage: 'Napaka pri brisanju seznama!'
            }) 
        }

    }
})

module.exports = router