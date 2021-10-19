const bcrypt = require('bcryptjs')
const { User, Favorite, Like, Followship, Comment, Restaurant, Sequelize } = require('../models')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const helpers = require('../_helpers')

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    // confirm password
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      // confirm unique user
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('error_messages', '信箱重複！')
          return res.redirect('/signup')
        } else {
          const { file } = req
          if (file) {
            imgur.setClientID(IMGUR_CLIENT_ID)
            imgur.upload(file.path, (err, img) => {
              return User.create({
                name: req.body.name,
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null),
                image: file ? img.data.link : null
              }).then(user => {
                req.flash('success_messages', '成功註冊帳號！')
                return res.redirect('/signin')
              })
            })
          } else {
            return User.create({
              name: req.body.name,
              email: req.body.email,
              password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null),
              image: null
            }).then(user => {
              req.flash('success_messages', '成功註冊帳號！')
              return res.redirect('/signin')
            })
          }
        }
      })
    }
  },

  getUser: async (req, res) => {
    const UserId = helpers.getUser(req).id
    
    try {
      const [user, comments] = await Promise.all([
        User.findByPk(UserId, { raw: true }),
        Comment.findAndCountAll({
          where: { UserId },
          include: [{model: Restaurant, attributes:['id', 'image']}],
          attributes: [[Sequelize.literal('DISTINCT `UserId`'), 'UserId']],
          raw: true,
          nest: true
        })
      ])
      return res.render('user', { user, comments })
    } catch (err) {
      console.log(err)
    }
  },

  editUser: (req, res) => {
    return User.findByPk(helpers.getUser(req).id, { raw: true })
      .then(user => {
        return res.render('editUser', { user })
      })
  },

  putUser: (req, res) => {
    // confirm name
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    } else {
      const { file } = req
      const userId = helpers.getUser(req).id
      if (file) {
        imgur.setClientID(IMGUR_CLIENT_ID)
        imgur.upload(file.path, (err, img) => {
          return User.findByPk(userId)
            .then((user) => {
              user.update({
                name: req.body.name,
                image: file ? img.data.link : user.image
              }).then(user => {
                req.flash('success_messages', 'user was successfully to update')
                return res.redirect(`/users/${userId}`)
              })
            })
        })
      } else {
        return User.findByPk(userId)
          .then((user) => {
            user.update({
              name: req.body.name,
              image: user.image
            }).then(user => {
              req.flash('success_messages', 'user was successfully to update')
              return res.redirect(`/users/${userId}`)
            })
          })
      }
    }
  },

  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },

  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: helpers.getUser(req).id,
      RestaurantId: req.params.restaurantId
    })
      .then((restaurant) => {
        return res.redirect('back')
      })
  },
  removeFavorite: (req, res) => {
    return Favorite.findOne({
      where: {
        UserId: helpers.getUser(req).id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then((favorite) => {
        favorite.destroy()
          .then((restaurant) => {
            return res.redirect('back')
          })
      })
  },

  addLike: (req, res) => {
    return Like.create({
      UserId: helpers.getUser(req).id,
      RestaurantId: req.params.restaurantId
    })
      .then((restaurant) => {
        return res.redirect('back')
      })
  },
  removeLike: (req, res) => {
    return Like.findOne({
      where: {
        UserId: helpers.getUser(req).id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then((like) => {
        like.destroy()
          .then((restaurant) => {
            return res.redirect('back')
          })
      })
  },

  getTopUser: (req, res) => {
    // 撈出所有 User 與 followers 資料
    return User.findAll({
      include: [
        { model: User, as: 'Followers' }
      ]
    }).then(users => {
      // 整理 users 資料
      users = users.map(user => ({
        ...user.dataValues,
        // 計算追蹤者人數
        FollowerCount: user.Followers.length,
        // 判斷目前登入使用者是否已追蹤該 User 物件
        isFollowed: helpers.getUser(req).Followings.map(d => d.id).includes(user.id)
      }))
      // 依追蹤者人數排序清單
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      console.log(users)
      return res.render('topUser', { users: users })
    })
  },

  addFollowing: (req, res) => {
    return Followship.create({
      followerId: helpers.getUser(req).id,
      followingId: req.params.userId
    })
      .then((followship) => {
        return res.redirect('back')
      })
  },

  removeFollowing: (req, res) => {
    return Followship.findOne({
      where: {
        followerId: helpers.getUser(req).id,
        followingId: req.params.userId
      }
    })
      .then((followship) => {
        followship.destroy()
          .then((followship) => {
            return res.redirect('back')
          })
      })
  }

}

module.exports = userController
