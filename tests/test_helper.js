const Blog = require('../models/blog')
const User = require('../models/user')


const initialBlogs = [
  {
    title: 'This title is for testing',
    author: 'My Name',
    url: 'url.com',
    likes: 4
  },
  {
    title: 'Another testing title',
    author: 'Some Name',
    url: 'url.org',
    likes: 42
  }
]

const nonExistingId = async () => {
  const blog = new Blog({ title: 'willremovethissoon', author: 'tester', url: 'url.net', likes: 0 })
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
  usersInDb
}