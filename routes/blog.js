const express = require('express')
const { runQuery } = require('../utils')
const router = express.Router()

const marked = require('marked')
const createDomPurify = require('dompurify')
const { JSDOM } = require('jsdom')
const dompurify = createDomPurify(new JSDOM().window)

// create a new blog post
router.get('/add-post', (req, res) => {
  if (!req.user) {
    res.redirect('/')
    return
  }

  res.render('post/add-post.ejs', {
    user: req.user,
    post: {},
  })
})

router.post('/create-post', async (req, res, next) => {
  if (!req.user) {
    res.redirect('/')
    return
  }
  req.body.published = req.body.published ? 'on' : 'off'
  const sanitizedHtml = dompurify.sanitize(marked.parse(req.body.content))
  // Define the query
  query =
    'INSERT INTO blog_posts (title, description, content, published, created_at, user_id, sanitized_content) VALUES( ?, ?, ?, ?, ?, ?, ? );'
  query_parameters = [
    req.body.title,
    req.body.description,
    req.body.content,
    req.body.published,
    new Date(),
    req.user.id,
    sanitizedHtml,
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
  if (!req.user) {
    res.redirect('/')
    return
  }

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

    res.render('post/edit-post.ejs', { user: req.user, post: post[0] })
  } catch (err) {
    next(err)
  }
})

router.post('/update-post/:id', async (req, res, next) => {
  if (!req.user) {
    res.redirect('/')
    return
  }
  req.body.published = req.body.published ? 'on' : 'off'
  const sanitizedHtml = dompurify.sanitize(marked.parse(req.body.content))
  // Define the query
  query =
    'UPDATE blog_posts SET title = ?, description = ?, content = ?, published = ?, updated_at = ?, sanitized_content = ? WHERE blog_post_id = ?;'
  query_parameters = [
    req.body.title,
    req.body.description,
    req.body.content,
    req.body.published,
    new Date(),
    sanitizedHtml,
    req.params.id,
  ]

  try {
    await runQuery(query, query_parameters)

    // redirect to the list of posts
    res.redirect('/blog/my-posts')
  } catch (err) {
    console.log(err)
    next(err)
  }
})

router.post('/like-post/:id', async (req, res, next) => {
  if (!req.user) {
    res.redirect('/')
    return
  }
  // check if the user has already liked the post
  query = 'SELECT * FROM likes WHERE user_id = ? AND blog_post_id = ?;'
  query_parameters = [req.user.id, req.params.id]

  try {
    const likes = await runQuery(query, query_parameters)
    console.log(likes.length)

    if (likes.length > 0) {
      // unlike the post
      query = 'DELETE FROM likes WHERE user_id = ? AND blog_post_id = ?;'
      query_parameters = [req.user.id, req.params.id]

      try {
        await runQuery(query, query_parameters)
        res.redirect(`/blog/${req.params.id}`)
      } catch (err) {
        console.log(err)
        next(err)
      }
    } else {
      // like the post
      query = 'INSERT INTO likes (user_id, blog_post_id) VALUES( ?, ? );'
      query_parameters = [req.user.id, req.params.id]

      try {
        await runQuery(query, query_parameters)
        res.redirect(`/blog/${req.params.id}`)
      } catch (err) {
        console.log(err)
        next(err)
      }
    }
  } catch (err) {
    console.log(err)
    next(err)
  }
})

router.post('/comment-post/:id', async (req, res, next) => {
  if (!req.user) {
    res.redirect('/')
    return
  }

  // Define the query
  query =
    'INSERT INTO comments (content, user_id, user_name, blog_post_id) VALUES( ?, ?, ?, ? );'
  query_parameters = [
    req.body.comment,
    req.user.id,
    req.user.user_name,
    req.params.id,
  ]

  try {
    await runQuery(query, query_parameters)

    res.redirect(`/blog/${req.params.id}`)
  } catch (err) {
    console.log(err)
    next(err)
  }
})

router.post('/delete-comment/:id', async (req, res, next) => {
  if (!req.user) {
    res.redirect('/')
    return
  }

  console.log(req.params.id)
  // Define the query
  query = 'DELETE FROM comments WHERE comment_id = ?;'
  query_parameters = [req.params.id]

  try {
    await runQuery(query, query_parameters)
    // refresh the page
    res.redirect('back')
  } catch (err) {
    next(err)
  }
})

router.get('/my-posts', async (req, res, next) => {
  if (!req.user) {
    res.redirect('/')
    return
  }

  // Define the query
  query = 'SELECT * FROM blog_posts WHERE user_id = ?;'
  query_parameters = [req.user.id]

  try {
    const posts = await runQuery(query, query_parameters)

    res.render('post/my-posts.ejs', { user: req.user, posts: posts })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  if (!req.user) {
    res.redirect('/')
    return
  }
  // Define the query
  query = 'SELECT * FROM blog_posts WHERE blog_post_id = ?;'
  query_parameters = [req.params.id]

  queryLike = 'SELECT * FROM likes WHERE blog_post_id = ?;'
  queryComment = 'SELECT * FROM comments WHERE blog_post_id = ?;'

  try {
    const [post, likeCount, comments] = await Promise.all([
      runQuery(query, query_parameters),
      runQuery(queryLike, query_parameters),
      runQuery(queryComment, query_parameters),
    ])

    res.render('post/post-details.ejs', {
      user: req.user,
      post: post[0],
      likeCount: likeCount.length,
      comments: comments,
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
