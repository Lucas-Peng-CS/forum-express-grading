const pageLimit = 10
const { Restaurant, Category, Comment, User, Client, Favorite,  Sequelize } = require('../models')
const helpers = require('../_helpers')

const restController = {

  getRestaurants: (req, res) => {
    let offset = 0
    const whereQuery = {}
    let categoryId = ''
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery.categoryId = categoryId
    }
    Restaurant.findAndCountAll({
      include: Category,
      where: whereQuery,
      offset: offset,
      limit: pageLimit
    }).then(result => {
      // data for pagination
      const page = Number(req.query.page) || 1
      const pages = Math.ceil(result.count / pageLimit)
      const totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      const prev = page - 1 < 1 ? 1 : page - 1
      const next = page + 1 > pages ? pages : page + 1

      // clean up restaurant data
      const data = result.rows.map(r => ({
        // 需要展開的是第二層 dataValues 裡面的物件
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50),
        categoryName: r.dataValues.Category.name,
        isFavorited: helpers.getUser(req).FavoritedRestaurants.map(d => d.id).includes(r.id),
        isLiked: helpers.getUser(req).LikedRestaurants.map(d => d.id).includes(r.id)
      }))
      Category.findAll({
        raw: true,
        nest: true
      }).then(categories => {
        return res.render('restaurants', {
          restaurants: data,
          categories: categories,
          categoryId: categoryId,
          page: page,
          totalPage: totalPage,
          prev: prev,
          next: next
        })
      })
    })
  },

  getRestaurant: async (req, res) => {
    const { session, ip } = req
    const RestaurantId = req.params.id
    const UserId = helpers.getUser(req).id

    try {
      const [restaurant, [client, created]] = await Promise.all([
        Restaurant.findByPk(RestaurantId, {
          include: [
            Category,
            { model: User, as: 'FavoritedUsers' },
            { model: User, as: 'LikedUsers' },
            { model: Comment, include: [User] }
          ]
        }),
        Client.findOrCreate({
          where: {UserId, IP: ip, RestaurantId }
        })
      ])
        
      if (!session.restaurantId) {
        session.restaurantId = []
      }
 
      if (created && !session.restaurantId.includes(RestaurantId)) {
        session.restaurantId.push(RestaurantId)
        await restaurant.increment('viewCounts')
      }

      const isFavorited = restaurant.FavoritedUsers.find(d => d.id === UserId) !== undefined // 找出收藏此餐廳的 user
      const isLiked = restaurant.LikedUsers.find(d => d.id === UserId) !== undefined
      
      return res.render('restaurant', {
      restaurant: restaurant.toJSON(),
      isFavorited, // 將資料傳到前端
      isLiked
    })
    } catch (err) {
      console.log('getRestaurant', err)
    }
  },

  getFeeds: (req, res) => {
    return Promise.all([
      Restaurant.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [Category]
      }),
      Comment.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant]
      })
    ]).then(([restaurants, comments]) => {
      return res.render('feeds', {
        restaurants: restaurants,
        comments: comments
      })
    })
  },

  getDashboard: async (req, res) => {
    const { id } = req.params
    try {
      const restaurant = await Restaurant.findByPk(id, {
        attributes:[
          'name',
          'viewCounts',
          [Sequelize.literal(`(SELECT COUNT(*) FROM Comments WHERE Comments.RestaurantId = ${id})`), 'commentCounts'],
          [Sequelize.literal(`(SELECT COUNT(*) FROM Favorites WHERE Favorites.RestaurantId = ${id})`), 'favoriteCounts']
        ],
        include: [{model: Category, attributes:['name']}]
      })
      //  請問助教上面和下面2種寫法，哪一種執行的速度會比較快呢?
      // const [restaurant, commentCounts, favoriteCounts] = await Promise.all([
      //   Restaurant.findByPk(id, {
      //     attributes:[
      //       'name',
      //       'viewCounts',
      //     ],
      //     include: [{model: Category, attributes:['name']}]
      //   }),
      //   Comment.count({where: { RestaurantId: id }}),
      //   Favorite.count({where: { RestaurantId: id }})
      // ])
 
      res.render('dashboard', {
        restaurant: restaurant.toJSON()
      })
    } catch (err) {
      console.log('getDashboard', err)
    }
  }
}

module.exports = restController
