const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

describe('when there are initially some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body.length).toBe(helper.initialBlogs.length)
  })

  describe('data is defined', () => {
    test('returned id is not undefined', async () => {
      const response = await api.get('/api/blogs')

      expect(response.body[0].id).toBeDefined()
    })

    test('if amount of likes is not given it will be zero', async () => {
      const newBlog = {
        title: 'This new blog is added',
        author: 'Testy testersson',
        url: 'test.net'
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd[2].likes).toBe(0)
    })

  })

  describe('addition of a new note', () => {
    test('a valid blog can be added ', async () => {
      const newBlog = {
        title: 'This new blog is added',
        author: 'Testy testersson',
        url: 'test.net',
        likes: 1
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)


      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd.length).toBe(helper.initialBlogs.length + 1)

      const titles = blogsAtEnd.map(b => b.title)
      expect(titles).toContain(
        'This new blog is added'
      )
    })

    test('blog without title or url is not added', async () => {
      const noTitle = {
        author: 'Ghost',
        url: 'spooky',
        likes: 789
      }

      await api
        .post('/api/blogs')
        .send(noTitle)
        .expect(400)

      const noUrl = {
        title: 'Spooky title',
        author: 'Ghost',
        likes: 789
      }

      await api
        .post('/api/blogs')
        .send(noUrl)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()

      expect(blogsAtEnd.length).toBe(helper.initialBlogs.length)
    })
  })

  describe('deletion of a note', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()

      expect(blogsAtEnd.length).toBe(helper.initialBlogs.length - 1)

      const titles = blogsAtEnd.map(b => b.title)

      expect(titles).not.toContain(blogToDelete.title)
    })
  })

  describe('updating a blog', () => {
    test('amount of likes is updated if data is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      const updated = {
        title: blogToUpdate.title,
        author: blogToUpdate.author,
        url: blogToUpdate.url,
        likes: 666
      }

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updated)

      const blogsAtEnd = await helper.blogsInDb()

      expect(blogsAtEnd[0].likes).toBe(666)
    })
  })

})

afterAll(() => {
  mongoose.connection.close()
})