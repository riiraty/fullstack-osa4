const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1 })
  response.json(blogs.map(blog => blog.toJSON()))
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog.toJSON())
  } else {
    response.status(404).end()
  }
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body
  console.log(body)

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const user = await User.findById(decodedToken.id)

  //const user = await User.findById(body.userId === undefined ? '5e492eaa92cc1d43880426e6' : body.userId)

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes === undefined ? 0 : body.likes,
    comments: body.comments,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.json(savedBlog.toJSON())

})

blogsRouter.post('/:id/comments', async (request, response) => {
  const blog = request.body
  console.log(request.params.id)

  const forDB = {
    ...blog,
    user: blog.user.id
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, forDB, { new: true })
  return response.json(updatedBlog.toJSON())
})

blogsRouter.delete('/:id', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  const deleterId = decodedToken.id.toString()
  const deleter = await User.findById(deleterId)

  const blog = await Blog.findById(request.params.id)
  const saverId = blog.user.toString()

  if (deleterId === saverId) {
    await Blog.findByIdAndRemove(request.params.id)
    deleter.blogs = deleter.blogs.filter(b => b.id.toString() !== request.params.id.toString())
    await deleter.save()
    response.status(204).end()
  } else {
    return response.status(401).json({ error: 'only the creator can delete blogs' })
  }

})

blogsRouter.put('/:id', async (request, response) => {
  const blog = request.body

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  response.json(updatedBlog.toJSON())
})

// blogsRouter.put('/:id', async (request, response) => {
//   const body = request.body

//   const updated = {
//     title: body.title,
//     author: body.author,
//     url: body.url,
//     likes: body.likes
//   }

//   const updatedBlog = await Blog.findByIdAndUpdate(
//     request.params.id,
//     updated,
//     { new: true }
//   )
//   response.json(updatedBlog.toJSON)
// })

module.exports = blogsRouter