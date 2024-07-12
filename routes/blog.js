const express = require('express')
const { runQuery } = require('../utils')
const router = express.Router()

// create a new blog post
router.get('/add-post', (req, res) => {
  if (!req.user) {
    res.redirect('/')
    return
  }

  res.render('post/add-post.ejs', { user: req.user, post: {} })
})

router.post('/create-post', async (req, res, next) => {
  // Define the query
  query =
    'INSERT INTO blog_posts (title, description, content, published, created_at, user_id) VALUES( ?, ?, ?, ?, ?, ? );'
  query_parameters = [
    req.body.title,
    req.body.description,
    req.body.content,
    req.body.published,
    new Date(),
    req.user.id,
  ]

  try {
    await runQuery(query, query_parameters)

    // redirect to the list of posts
    res.redirect('/blog/my-posts')
  } catch (err) {
    next(err)
  }
})

router.post('/delete-post/:id', async (req, res, next) => {
  // Define the query
  query = 'DELETE FROM blog_posts WHERE blog_post_id = ?;'
  query_parameters = [req.params.id]

  try {
    await runQuery(query, query_parameters)

    res.redirect('/blog/my-posts')
  } catch (err) {
    next(err)
  }
})

router.get('/edit-post/:id', async (req, res, next) => {
  if (!req.user) {
    res.redirect('/')
    return
  }

  // Define the query
  query = 'SELECT * FROM blog_posts WHERE blog_post_id = ?;'
  query_parameters = [req.params.id]

  try {
    const post = await runQuery(query, query_parameters)

    res.render('edit-post.ejs', { post: post[0] })
  } catch (err) {
    next(err)
  }
})

router.post('/update-post', async (req, res, next) => {
  // Define the query
  query =
    'UPDATE blog_posts SET title = ?, description = ?, content = ?, published = ?, updated_at = ? WHERE id = ?;'
  query_parameters = [
    req.body.title,
    req.body.description,
    req.body.content,
    req.body.published,
    new Date(),
    req.body.id,
  ]

  try {
    await runQuery(query, query_parameters)

    // redirect to the list of posts
    res.redirect('/')
  } catch (err) {
    next(err)
  }
})

router.post('/like-post', async (req, res, next) => {
  // check if the user has already liked the post
  query = 'SELECT * FROM likes WHERE user_id = ? AND post_id = ?;'
  query_parameters = [req.user.id, req.body.id]

  try {
    const likes = await runQuery(query, query_parameters)

    if (likes.length > 0) {
      // unlike the post
      query = 'DELETE FROM likes WHERE user_id = ? AND post_id = ?;'
      query_parameters = [req.user.id, req.body.id]

      try {
        await runQuery(query, query_parameters)

        res.json({ message: 'Post unliked' })
      } catch (err) {
        next(err)
      }
    }
  } catch (err) {
    next(err)
  }

  // Define the query
  query = 'UPDATE blog_posts SET likes = likes + 1 WHERE id = ?;'
  query_parameters = [req.body.id]

  try {
    await runQuery(query, query_parameters)

    res.json({ message: 'Post liked' })
  } catch (err) {
    next(err)
  }
})

router.post('/comment-post', async (req, res, next) => {
  // Define the query
  query = 'INSERT INTO comments (user_id, post_id, content) VALUES( ?, ?, ? );'
  query_parameters = [req.user.id, req.body.id, req.body.content]

  try {
    await runQuery(query, query_parameters)

    res.json({ message: 'Comment added' })
  } catch (err) {
    next(err)
  }
})

router.get('/my-posts', async (req, res, next) => {
  if (!req.user) {
    res.redirect('/')
    return
  }
  //   Define the query
  query = 'SELECT * FROM blog_posts WHERE user_id = ?;'
  query_parameters = [req.user.id]

  try {
    const posts = await runQuery(query, query_parameters)

    res.render('post/my-posts.ejs', { user: req.user, posts: posts })
  } catch (err) {
    next(err)
  }
})

module.exports = router
