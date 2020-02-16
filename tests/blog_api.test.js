const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')

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

  test('returned id is not undefined', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body[0].id).toBeDefined()
  })

  describe('when a user is logged in', () => {

    describe('addition of a new blog', () => {
      test('if amount of likes is not given it will be zero', async () => {
      //create new user
        await User.deleteMany({})

        await api
          .post('/api/users')
          .send(helper.initialUser)

        //log user in
        let r = await api
          .post('/api/login')
          .send({ username: 'initialUser', password: 'salasana' })

        const token = 'bearer ' + r.body.token
        // and so we have token

        const newBlog = {
          title: 'This new blog is added',
          author: 'Testy Testersson',
          url: 'test.net',
          user: '5e496a442d90197c38786ec1'
        }

        await api
          .post('/api/blogs')
          .set('Authorization', ('bearer ', token))
          .send(newBlog)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd[2].likes).toBe(0)
      })
      test('a valid blog can be added ', async () => {
      //create new user
        await User.deleteMany({})

        await api
          .post('/api/users')
          .send(helper.initialUser)

        //log user in
        let r = await api
          .post('/api/login')
          .send({ username: 'initialUser', password: 'salasana' })

        const token = 'bearer ' + r.body.token
        // and so we have token

        const newBlog = {
          title: 'This new blog is added',
          author: 'Testy testersson',
          url: 'test.net',
          likes: 1
        }

        await api
          .post('/api/blogs')
          .set('Authorization', token)
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
      //create new user
        await User.deleteMany({})

        await api
          .post('/api/users')
          .send(helper.initialUser)

        //log user in
        let r = await api
          .post('/api/login')
          .send({ username: 'initialUser', password: 'salasana' })

        const token = 'bearer ' + r.body.token
        // and so we have token

        const noTitle = {
          author: 'Ghost',
          url: 'spooky',
          likes: 789
        }

        await api
          .post('/api/blogs')
          .set('Authorization', token)
          .send(noTitle)
          .expect(400)

        const noUrl = {
          title: 'Spooky title',
          author: 'Ghost',
          likes: 789
        }

        await api
          .post('/api/blogs')
          .set('Authorization', token)
          .send(noUrl)
          .expect(400)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd.length).toBe(helper.initialBlogs.length)
      })
    })

    describe('deletion of a blog', () => {
    //FIX
      test('succeeds with status code 204 if id is valid', async () => {
      //create new user
        await User.deleteMany({})

        await api
          .post('/api/users')
          .send(helper.initialUser)

        //log user in
        let r = await api
          .post('/api/login')
          .send({ username: 'initialUser', password: 'salasana' })

        const token = 'bearer ' + r.body.token
        // and so we have token
        // post new blog logged in
        const willDelete = {
          title: 'This new blog is added and deleted by same user',
          author: 'Test Delete',
          url: 'test.net',
          likes: 4
        }

        let d = await api
          .post('/api/blogs')
          .set('Authorization', token)
          .send(willDelete)
          .expect(200)
          .expect('Content-Type', /application\/json/)

        const amountNow = await helper.blogsInDb()
        expect(amountNow.length).toBe(3)

        const blogToDelete = d.body

        await api
          .delete(`/api/blogs/${blogToDelete.id}`)
          .set('Authorization', token)
          .expect(204)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd.length).toBe(helper.initialBlogs.length)

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

})

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    await User.insertMany(helper.initialUser)
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'rraty',
      name: 'Riikka Räty',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'initialUser',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if username is not given', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` is required')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if username is too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'op',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('minimum allowed length (3)')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if password is too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'originalUser',
      name: 'Superuser',
      password: 'ha',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('minimum allowed length (3)')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if password is not given', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'originalUser',
      name: 'Superuser'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`password` is required')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})