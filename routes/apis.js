const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer({ dest: 'temp/' })
const passport = require('../config/passport')
const authenticated = passport.authenticate('jwt', { session: false })

const authenticatedAdmin = (req, res, next) => {
  if (req.user) {
    if (req.user.isAdmin) { return next() }
    return res.json({ status: 'error', message: 'permission denied' })
  } else {
    return res.json({ status: 'error', message: 'permission denied' })
  }
}

const adminController = require('../controllers/api/adminController.js')
const categoryController = require('../controllers/api/categoryController.js')
const userController = require('../controllers/api/userController.js')

router.get('/admin/restaurants', authenticated, authenticatedAdmin, adminController.getRestaurants)

router.get('/admin/restaurants/:id', authenticated, authenticatedAdmin, adminController.getRestaurant)

router.get('/admin/categories', authenticated, authenticatedAdmin, categoryController.getCategories)

router.delete('/admin/restaurants/:id', authenticated, authenticatedAdmin, adminController.deleteRestaurant)

router.post('/admin/restaurants', authenticated, authenticatedAdmin, upload.single('image'), adminController.postRestaurant)

router.post('/signup', userController.signUp)

// JWT signin
router.post('/signin', userController.signIn)
router.post('/signup', userController.signUp)

module.exports = router
