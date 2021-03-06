const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../models/user')
const Post = require('../models/post')

module.exports = {
  loginUser: async (req, res, next) => {
    const user = req.user
    const token = jwt.sign({
      iss: 'Chnirthgram',
      sub: user._id,
    },
      process.env.SECRET_KEY, {
        expiresIn: '30d'
      })
    res.status(200).json({
      message: 'Auth successfully',
      token: token
    })
  },
  getUsers: async (req, res, next) => {
    const users = await User.find()
    res.status(200).json(users)
  },
  createUser: async (req, res, next) => {
    const user = await User.findOne({
      email: req.value.body.email
      // email: req.body.email
    })
    if (user) {
      res.status(409).json({
        message: 'Mail exists'
      })
    } else {
      const newUser = new User(req.value.body)
      const user = await newUser.save()
      res.status(201).json(user)
    }
  },
  getUser: async (req, res, next) => {
    const {
      userId
    } = req.value.params
    const user = await User.findById(userId)
    if (!user) {
      res.status(404).json({
        message: 'No valid entry found for provided ID'
      })
    }
    res.status(200).json(user)
  },
  replaceUser: async (req, res, next) => {
    const {
      userId
    } = req.value.params
    const newUser = req.value.body
    // newUser.avatarImage = req.file.path
    const result = await User.findByIdAndUpdate(userId, newUser)
    if (!result) {
      res.status(404).json({
        message: 'No valid entry found for provided ID'
      })
    }
    res.status(200).json({
      success: 'Success'
    })
  },
  updateUser: async (req, res, next) => {
    const {
      userId
    } = req.value.params
    const newUser = req.value.body
    if (newUser.password) {
      newUser.password = bcrypt.hashSync(newUser.password, 10);
    }
    // newUser.avatarImage = req.file.path
    const result = await User.findByIdAndUpdate(userId, newUser)
    if (!result) {
      res.status(404).json({
        message: 'No valid entry found for provided ID'
      })
    }
    res.status(200).json({
      success: 'Success'
    })
  },
  deleteUser: async (req, res, next) => {
    const {
      userId
    } = req.params
    const result = await User.findByIdAndDelete(userId)
    if (!result) {
      res.status(404).json({
        message: 'No valid entry found for provided ID'
      })
    }
    res.status(200).json({
      success: 'Success'
    })
  },
  getUserPosts: async (req, res, next) => {
    const {
      userId
    } = req.value.params
    const user = await User.findById(userId).populate('posts')
    res.status(200).json(user.posts)
  },
  createUserPost: async (req, res, next) => {
    const {
      userId
    } = req.value.params
    // Get user
    const user = await User.findById(userId)
    // Create a new Post
    const newPost = new Post(req.value.body)
    // Assign user as a post's user
    newPost.poster = user
    // Save the post
    await newPost.save()
    // Add post to the user's posting array 'posts'
    user.posts.push(newPost)
    // Save the user
    await user.save()
    res.status(201).json(newPost)
  }
}