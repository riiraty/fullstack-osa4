const totalLikes =require('../utils/list_helper').totalLikes
const favoriteBlog =require('../utils/list_helper').favoriteBlog
const mostBlogs =require('../utils/list_helper').mostBlogs
const mostLikes =require('../utils/list_helper').mostLikes

describe('list_helper functions work', () => {
  const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5,
      __v: 0
    }
  ]

  const blogs = [
    {
      _id: '5a422a851b54a676234d17f7',
      title: 'React patterns',
      author: 'Michael Chan',
      url: 'https://reactpatterns.com/',
      likes: 7,
      __v: 0
    },
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5,
      __v: 0
    },
    {
      _id: '5a422b3a1b54a676234d17f9',
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12,
      __v: 0
    },
    {
      _id: '5a422b891b54a676234d17fa',
      title: 'First class tests',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
      likes: 10,
      __v: 0
    },
    {
      _id: '5a422ba71b54a676234d17fb',
      title: 'TDD harms architecture',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
      likes: 0,
      __v: 0
    },
    {
      _id: '5a422bc61b54a676234d17fc',
      title: 'Type wars',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
      likes: 2,
      __v: 0
    }
  ]

  describe('total likes', () => {
    test('when list has only one blog equals the likes of that', () => {
      const result = totalLikes(listWithOneBlog)
      expect(result).toBe(5)
    })

    test('when list has many blogs equals the likes combined', () => {
      const result = totalLikes(blogs)
      expect(result).toBe(36)
    })

    test('when list has no blogs equals the likes zero', () => {
      expect(totalLikes([])).toBe(0)
    })
  })

  describe('favorite blog', () => {
    test('when list has only one blog it is favorite', () => {
      const result = favoriteBlog(listWithOneBlog)
      const formattedExpected = {
        title: listWithOneBlog[0].title,
        author: listWithOneBlog[0].author,
        likes: listWithOneBlog[0].likes
      }
      expect(result).toEqual(formattedExpected)
    })

    test('when list has many blogs equals the one with most likes', () => {
      const expected = {
        title: 'Canonical string reduction',
        author: 'Edsger W. Dijkstra',
        likes: 12
      }
      const result = favoriteBlog(blogs)
      expect(result).toEqual(expected)
    })

    test('when list has no blogs favorite is empty object', () => {
      expect(favoriteBlog([])).toEqual({})
    })

  })

  describe('most blogs', () => {
    test('when list has only one blog that author has most blogs', () => {
      const result = mostBlogs(listWithOneBlog)
      const formattedExpected = {
        author: listWithOneBlog[0].author,
        blogs: 1
      }

      expect(result).toEqual(formattedExpected)
    })

    test('when list has many blogs expected author with most blogs', () => {
      const expected = {
        author: 'Robert C. Martin',
        blogs: 3
      }
      const result = mostBlogs(blogs)
      expect(result).toEqual(expected)
    })

    test('when list has no blogs answer is empty object', () => {
      expect(mostBlogs([])).toEqual({})
    })
  })

  describe('most likes', () => {
    test('the function does not work', () => {
      const returned = mostLikes(blogs)

      const author = returned.author

      expect(author).toEqual('Mikki Hiiri')
    })
  })


})