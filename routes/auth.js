const express = require('express')
const { runQuery } = require('../utils')
const router = express.Router()

const crypto = require('crypto')
const passport = require('passport')
const LocalStrategy = require('passport-local')

passport.use(
  new LocalStrategy(
    {
      usernameField: 'user_name',
      passwordField: 'password',
    },
    async function verify(user_name, password, done) {
      try {
        const user = await runQuery('SELECT * FROM users WHERE user_name = ?', [
          user_name,
        ]).then((rows) => {
          return rows[0]
        })

        if (!user) {
          return done(null, false, {
            message: 'Incorrect username or password.',
          })
        }

        crypto.pbkdf2(
          password,
          user.salt,
          310000,
          32,
          'sha256',
          (err, hashedPassword) => {
            if (err) return done(err)

            if (
              !crypto.timingSafeEqual(
                Buffer.from(user.password, 'hex'),
                hashedPassword
              )
            ) {
              return done(null, false, {
                message: 'Incorrect username or password.',
              })
            }

            return done(null, user)
          }
        )
      } catch (err) {
        return done(err)
      }
    }
  )
)

passport.serializeUser(function (user, done) {
  done(null, user.user_name)
})

passport.deserializeUser(async (user_name, done) => {
  const user = await runQuery('SELECT * FROM users WHERE user_name = ?', [
    user_name,
  ]).then((rows) => {
    return rows[0]
  })

  done(null, user)
})

router.get('/login', (req, res, next) => {
  const failed = req.query.failed
  res.render('login.ejs', { failed: failed })
})

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err)

    if (!user) return res.redirect('/auth/login?failed=1')

    req.logIn(user, (err) => {
      if (err) return next(err)

      return res.redirect('/')
    })
  })(req, res, next)
})

router.get('/signup', (req, res, next) => {
  const failed = req.query.failed
  res.render('signup.ejs', { failed: failed })
})

router.post('/signup', async (req, res, next) => {
  const { user_name, password } = req.body
  const salt = crypto.randomBytes(16).toString('hex')
  crypto.pbkdf2(
    password,
    salt,
    310000,
    32,
    'sha256',
    async (err, derivedKey) => {
      if (err) res.redirect('/auth/signup?failed=1')

      const hashedPassword = derivedKey.toString('hex')

      try {
        await runQuery(
          'INSERT INTO users (user_name, password, salt) VALUES (?, ?, ?)',
          [user_name, hashedPassword, salt]
        )

        req.login({ user_name, password }, (err) => {
          if (err) res.redirect('/auth/signup?failed=3')
          res.redirect('/')
        })
      } catch (err) {
        res.redirect('/auth/signup?failed=2')
      }
    }
  )
})

router.post('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err)
    res.redirect('/')
  })
})

module.exports = router
