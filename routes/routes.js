const helpers = require('../_helpers')
const restController = require('../controllers/restController.js')
const adminController = require('../controllers/adminController.js')
const userController = require('../controllers/userController.js')
const commentController = require('../controllers/commentController.js')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })
const categoryController = require('../controllers/categoryController.js')
const express = require('express')
const router = express.Router()
const passport = require('../config/passport')

const authenticated = (req, res, next) => {
  // if(req.isAuthenticated)
  if (helpers.ensureAuthenticated(req)) {
    return next()
  }
  res.redirect('/signin')
}
const authenticatedAdmin = (req, res, next) => {
  // if(req.isAuthenticated)
  if (helpers.ensureAuthenticated(req)) {
    if (helpers.getUser(req).isAdmin) { return next() }
    return res.redirect('/')
  }
  res.redirect('/signin')
}

router.get('/', authenticated, (req, res) => res.redirect('/restaurants'))

router.get('/restaurants', authenticated, restController.getRestaurants)

router.get('/admin', authenticatedAdmin, (req, res) => res.redirect('/admin/restaurants'))

router.get('/admin/restaurants', authenticatedAdmin, adminController.getRestaurants)

router.get('/admin/restaurants/create', authenticatedAdmin, adminController.createRestaurant)

router.post('/admin/restaurants', authenticatedAdmin, upload.single('image'), adminController.postRestaurant)

router.get('/admin/restaurants/:id', authenticatedAdmin, adminController.getRestaurant)

router.get('/admin/restaurants/:id/edit', authenticatedAdmin, adminController.editRestaurant)

router.put('/admin/restaurants/:id', authenticatedAdmin, upload.single('image'), adminController.putRestaurant)

router.delete('/admin/restaurants/:id', authenticatedAdmin, adminController.deleteRestaurant)
// 使用者權限管理
router.get('/admin/users', authenticatedAdmin, adminController.getUsers)

router.put('/admin/users/:id/toggleAdmin', authenticatedAdmin, adminController.toggleAdmin)

router.get('/admin/categories', authenticatedAdmin, categoryController.getCategories)

router.post('/admin/categories', authenticatedAdmin, categoryController.postCategory)

router.get('/admin/categories/:id', authenticatedAdmin, categoryController.getCategories)

router.put('/admin/categories/:id', authenticatedAdmin, categoryController.putCategory)

router.delete('/admin/categories/:id', authenticatedAdmin, categoryController.deleteCategory)

router.get('/restaurants/feeds', authenticated, restController.getFeeds)

router.get('/restaurants/:id', authenticated, restController.getRestaurant)

router.post('/comments', authenticated, commentController.postComment)

router.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)

router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)

router.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)

router.post('/like/:restaurantId', authenticated, userController.addLike)

router.delete('/like/:restaurantId', authenticated, userController.removeLike)

router.get('/users/top', authenticated, userController.getTopUser)
// 建立 User Profile
router.get('/users/:id', authenticated, userController.getUser)

router.get('/users/:id/edit', authenticated, userController.editUser)

router.put('/users/:id', authenticated, upload.single('image'), userController.putUser)

router.post('/following/:userId', authenticated, userController.addFollowing)

router.delete('/following/:userId', authenticated, userController.removeFollowing)

router.get('/signup', userController.signUpPage)

router.post('/signup', upload.single('image'), userController.signUp)

router.get('/signin', userController.signInPage)

router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)

router.get('/logout', userController.logout)

module.exports = router
