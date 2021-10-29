const express = require('express');
const app = express()
const cors  =require('cors')
const User = require('./models/user.models')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

app.use(express.json())
app.use(cors())

mongoose.connect('mongodb://localhost:27017/mernstack')
.then(res => console.log('Connected to DB'))
.catch(err => console.log(err, 'Connected to db error'))

app.post('/api/register', async (req, res) => {
    console.log(req.body)
    try {
        const user = await User.create(req.body)
        res.json({status: 'ok'})
    } catch (error) {
        res.json({status: 'error', error: 'duplicate email'})
    }
});

app.post('/api/login', async (req, res) => {
    const user = await User.findOne({
        email: req.body.email,
        password: req.body.password,
    })
    if(user) {
        const token = jwt.sign({name: user.name, email: user.email},
            'secret123')
        return res.json({status: 'ok', user: token})
    } else {
        return res.json({status: 'error', user: false})
    }
});

app.get('/api/quote', async (req, res) => {

    const token = req.headers['x-access-token']
    try {
        const decode = jwt.verify(token, 'secret123')
        const email = decode.email
        const user = await User.findOne({email: email})

        return {status: 'ok', quote: user.quote}
    } catch (error) {
        console.log(error)
        res.json({status: 'error', error: 'invalid token'})
    }
    
});

app.post('/api/quote', async (req, res) => {

    const token = req.headers['x-access-token']
    try {
        const decode = jwt.verify(token, 'secret123')
        const email = decode.email
        await User.updateOne(
            {email: email},
            {$set: {quote: req.body.quote}}
        )

        return res.json({status: 'ok'})
    } catch (error) {
        console.log(error)
        res.json({status: 'error', error: 'invalid token'})
    }
    
});

app.listen(5000, () => {
    console.log('Server has started')
});