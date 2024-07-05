/**
 * users.js
 * These are example routes for user management
 * This shows how to correctly structure your routes for the project
 * and the suggested pattern for retrieving data by executing queries
 *
 * NB. it's better NOT to use arrow functions for callbacks with the SQLite library
 *
 */

const express = require('express')
const { runQuery } = require('../utils')
const router = express.Router()

/**
 * @desc Display all the users
 */
router.get('/list-users', async (req, res, next) => {
  let loading = true // Initialize loading to true
  try {
    const [users, emails] = await Promise.all([
      runQuery('SELECT * FROM users'),
      runQuery('SELECT * FROM email_accounts'),
    ])
    loading = false // Set loading to false once data is fetched

    res.render('list-users.ejs', { users, emails, loading })
  } catch (err) {
    next(err)
  }
})

/**
 * @desc Displays a page with a form for creating a user record
 */
router.get('/add-user', (req, res) => {
  res.render('add-user.ejs')
})

/**
 * @desc Add a new user to the database based on data from the submitted form
 */
router.post('/add-user', async (req, res, next) => {
  // Define the query
  query = 'INSERT INTO users (user_name) VALUES( ? );'
  query_parameters = [req.body.user_name]

  try {
    await runQuery(query, query_parameters)

    // redirect to the list of users
    res.redirect('/users/list-users')
  } catch (err) {
    next(err)
  }
})

/** @desc Display a page with form to delete user */
router.get('/delete-user', (req, res) => {
  res.render('delete-user.ejs')
})

/**
 * @desc Delete a user from the database
 * @user_name The name of the user to delete
 */
router.post('/delete-user', async (req, res, next) => {
  // Define the query
  query = 'DELETE FROM users WHERE user_name = ?'
  query_parameters = [req.body.user_name]

  try {
    await runQuery(query, query_parameters)

    // redirect to the list of users
    res.redirect('/users/list-users')
  } catch (err) {
    next(err)
  }
})

// Export the router object so index.js can access it
module.exports = router
