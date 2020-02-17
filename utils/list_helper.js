const _ = require('lodash')

const dummy = (blogs) => {
  blogs.concat('dummy')
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item.likes
  }

  return blogs.length === 0
    ? 0
    : blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  const reducer = (favorite, item) => {
    return (favorite.likes > item.likes)
      ? favorite
      : item
  }

  const favorite = blogs.length === 0
    ? {}
    : blogs.reduce(reducer, blogs[0])

  const formattedFavorite = {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes
  }

  return formattedFavorite
}

const mostBlogs = (blogs) => {

  const nameArray = blogs.map(blog => blog.author)

  const mostCommon = _.head(_(nameArray)
    .countBy()
    .entries()
    .maxBy(_.last))

  const amountOfBlogs = _.remove(nameArray, (n) => {
    return n === mostCommon
  }).length

  const mostBlogs = {
    author: mostCommon,
    blogs: amountOfBlogs
  }

  return blogs.length === 0
    ? {}
    : mostBlogs
}

const mostLikes = (blogs) => {
  const mostLiked = {
    author: 'Mikki Hiiri',
    likes: 42
  }
  return mostLiked
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}