/**
 * index.js
 * This is your main app entry point
 */

// Set up express, bodyparser and EJS
const express = require('express')
const app = express()
const port = 3000
const passport = require('passport')
const session = require('express-session')
const { runQuery } = require('./utils')

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs') // set the app to use ejs for rendering
app.use(express.static(__dirname + '/public')) // set location of static files

// Set up SQLite
// Items in the global namespace are accessible throught out the node application
const sqlite3 = require('sqlite3').verbose()
global.db = new sqlite3.Database('./database.db', function (err) {
  if (err) {
    console.error(err)
    process.exit(1) // bail out we can't connect to the DB
  } else {
    console.log('Database connected')
    global.db.run('PRAGMA foreign_keys=ON') // tell SQLite to pay attention to foreign key constraints
  }
})

app.use(
  session({
    secret: 'SECRETKEY',
    resave: true,
    saveUninitialized: true,
  })
)
app.use(passport.initialize())
app.use(passport.session())

// Handle requests to the home page
app.get('/', async (req, res) => {
  if (req.user) {
    const query =
      'SELECT * FROM blog_posts WHERE published = "on" ORDER BY created_at DESC;'
    const posts = await runQuery(query)

    res.render('index.ejs', { user: req.user, posts: posts })
  } else {
    res.redirect('/auth/login')
  }
})

// Add all the route handlers in usersRoutes to the app under the path /users
const usersRoutes = require('./routes/users')
app.use('/users', usersRoutes)

const authRoutes = require('./routes/auth')
app.use('/auth', authRoutes)

const blogRoutes = require('./routes/blog')
app.use('/blog', blogRoutes)

// Make the web application listen for HTTP requests
app.listen(port, (error) => {
  if (error) {
    console.log('The server did not start: ', port)
  }
  console.log(`Example app listening on port ${port}`)
})
