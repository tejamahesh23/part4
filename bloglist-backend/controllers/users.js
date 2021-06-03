const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const Blog = require('../models/blog')

usersRouter.get('/', async (req, res) => {
    const users = await User.find({}).populate('blogs')
    res.json(users.map(u => u.toJSON()))
})

usersRouter.post('/', async (req, res) => {
    const body = req.body

    if (!req.body.password || !req.body.username) {
        return res.status(400).json({
            error: 'content missing'
        })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)
    const user = new User({
        username: body.username,
        name: body.name,
        passwordHash: passwordHash,
    })

    const savedUser = await user.save()

    res.json(savedUser)
})

module.exports = usersRouter