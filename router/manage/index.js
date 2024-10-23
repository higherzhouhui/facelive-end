const log4js = require('log4js')
const { errorResp, successResp } = require('../../middleware/request')
const Model = require('../../model/index')
const utils = require('../../utils/common')
const dataBase = require('../../model/database')

const moment = require('moment')

async function example(req, resp) {
  manager_logger().info('The migration was successful:')
  try {

  } catch (error) {
    manager_logger().info('The migration failed:', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}

/**
 * 
 * Log in
 */
async function login(req, resp) {
  manager_logger().info('Initiate login')
  try {
    const data = req.body
    const userInfo = await Model.Manager.findOne({
      where: {
        account: data.username
      }
    })
    if (!userInfo) {
      return errorResp(resp, 400, `This account does not exist!`)
    }
    if (userInfo.dataValues.password == data.password) {
      let token = new Date().getTime() + 15 * 24 * 60 * 60 * 1000
      await Model.Manager.update(
        { token: token },
        { where: { id: userInfo.id } }
      )
      token = utils.createToken({ username: userInfo.dataValues.account, user_id: token })
      return successResp(resp, { ...userInfo.dataValues, token }, 'Login successful!')
    } else {
      return errorResp(resp, 400, `Incorrect password!`)
    }
  } catch (error) {
    manager_logger().info('Login failed', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}
/**
 * 
 * Get personal information
 */
async function userInfo(req, resp) {
  manager_logger().info('Query personal information')
  try {
    const token = req.id
    const userInfo = await Model.Manager.findOne({
      where: {
        token: token
      }
    })
    if (!userInfo) {
      return errorResp(resp, 400, `Login expired!`)
    }
    return successResp(resp, userInfo.dataValues, 'Login successful!')
  } catch (error) {
    manager_logger().info('Failed to retrieve personal information', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}

/**
 * 
 * View member list
 */
async function getUserList(req, resp) {
  manager_logger().info('View member list')
  try {
    const data = req.query
    let where = {}
    if (data.username) {
      where.username = {
        [dataBase.Op.like]: `%${data.username}%`
      }
    }
    if (data.user_id) {
      where.user_id = {
        [dataBase.Op.like]: `%${data.user_id}%`
      }
    }

    if (data.startParam) {
      where.startParam = {
        [dataBase.Op.like]: `%${data.startParam}%`
      }
    }

    if (data.wallet) {
      where.wallet = {
        [dataBase.Op.like]: `%${data.wallet}%`
      }
    }

    const countAll = await Model.User.findAndCountAll({
      order: [['createdAt', 'desc']],
      where,
      offset: (data.pageNum - 1) * data.pageSize,
      limit: parseInt(data.pageSize),
    })
    const list = JSON.parse(JSON.stringify(countAll))
    for (let i = 0; i < list.rows.length; i++) {
      const subUser = await Model.User.count({
        where: {
          startParam: list.rows[i].user_id
        }
      })
      list.rows[i].subUser = subUser
    }

    const total_use = await Model.User.sum('use_ton');
    return successResp(resp, { total_use, ...list }, 'success')
  } catch (error) {
    manager_logger().info('Failed to view member list', error)
    console.error(`${error}`)
    return errorResp(resp, 400, `${error}`)
  }
}

/**
 * 
 * View subordinate member list
 */
async function getUserInviteList(req, resp) {
  manager_logger().info('View homepage information')
  try {
    const data = req.query
    const where = {}
    if (data.id) {
      where.invite_id = data.id
    }
    const list = await Model.User.findAndCountAll({
      order: [['createdAt', 'desc']],
      where,
    })
    const total = await Model.User.count()
    return successResp(resp, { ...list, total }, 'Successful!')
  } catch (error) {
    manager_logger().info('Failed to view homepage information', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}

/**
 * 
 * View homepage information
 */
async function getHomeInfo(req, resp) {
  manager_logger().info('View homepage information')
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0); // Set today's start time
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1); // Set today's end time

    const totalUser = await Model.User.count()
    const totalScore = await Model.User.sum('score')
    const totalHuiYuan = await Model.User.count({
      where: {
        isPremium: true
      }
    })
    const todayRegister = await Model.User.count({
      where: {
        createdAt: {
          [dataBase.Op.gt]: todayStart,
          [dataBase.Op.lt]: todayEnd
        }
      }
    })
    const totalVisit = await Model.Visit.count()
    const totalTon = await Model.Event.sum('price', {
      where: {
        type: 'recharge'
      }
    })
    const totalUse = await Model.Event.sum('score', {
      where: {
        type: 'chat_video'
      }
    })

    const todayVisit = await Model.Visit.findAll({
      where: {
        createdAt: {
          [dataBase.Op.gt]: todayStart,
          [dataBase.Op.lt]: todayEnd
        }
      }
    })

    const todayTon = await Model.Event.findAll({
      attributes: [
        'createdAt',
        [dataBase.sequelize.literal('SUM(price)'), 'totalTon']
      ],
      where: {
        createdAt: {
          [dataBase.Op.gt]: todayStart,
          [dataBase.Op.lt]: todayEnd
        },
        type: 'recharge'
      }
    })

    const todayUse = await Model.Event.findAll({
      attributes: [
        'createdAt',
        [dataBase.sequelize.literal('SUM(score)'), 'totalUse']
      ],
      where: {
        createdAt: {
          [dataBase.Op.gt]: todayStart,
          [dataBase.Op.lt]: todayEnd
        },
        type: 'chat_video'
      }
    })
    const todayScore = await Model.Event.findAll({
      attributes: [
        'createdAt',
        [dataBase.sequelize.literal('SUM(score)'), 'totalScore']
      ],
      where: {
        createdAt: {
          [dataBase.Op.gt]: todayStart,
          [dataBase.Op.lt]: todayEnd
        },
        score: {
          [dataBase.Op.gt]: 0
        }
      }
    })

 

   
    // Get the date from **n** days ago
    const startDate = new Date()
    startDate.setHours(23, 59, 59, 0); // Set today's end time


    const getList = async (day, table, type) => {
      const list = [];
      for (let i = day - 1; i >= 0; i--) {
        const endDate = new Date(todayStart);
        endDate.setDate(endDate.getDate() - i);
        endDate.setHours(0, 0, 0, 0)
        list.push({
          date: moment(endDate).format('YYYY-MM-DD'),
          num: 0
        })
      }
      let sql = ''
      if (table == 'user' || table == 'visit') {
        sql = `
        SELECT DATE(createdAt) as date, COUNT(*) as num from ${table} WHERE createdAt >= :endDate AND createdAt <= :startDate GROUP BY date;`;
      } else {
        sql = `
         SELECT DATE(createdAt) as date, sum(${type == 'recharge' ? 'price' : 'score'}) as num from ${table} WHERE createdAt >= :endDate AND createdAt <= :startDate ${type ? `AND type='${type}'` : ''} GROUP BY date;`;
      }
      const startDate = new Date()
      const endDate = new Date(todayStart);
      endDate.setDate(endDate.getDate() - req.query.day);

      const listResult = await dataBase.sequelize.query(sql, {
        type: dataBase.QueryTypes.SELECT,
        replacements: { startDate, endDate },
      });

      list.map((item, index) => {
        listResult.forEach(rItem => {
          if (item.date == rItem.date) {
            list[index].num = rItem.num
          }
        })
      })
      return list
    }



    const userList = await getList(req.query.day, 'user', '');
    const visitList = await getList(req.query.day, 'visit', '');
    const scoreList = await getList(req.query.day, 'event', '');
    const rechargeList = await getList(req.query.day, 'event', 'recharge');


    let resData = {
      totalScore,
      totalUser,
      totalHuiYuan,
      todayRegister,
      totalVisit,
      todayVisit: todayVisit.length,
      totalUse,
      todayUse: Math.abs(todayUse[0].dataValues.totalUse),
      totalTon,
      todayTon: todayTon[0].dataValues.totalTon,
      todayScore: todayScore[0].dataValues.totalScore,
      rechargeList,
      userList,
      scoreList,
      visitList,
    }

    function handleNumber(obj) {
      const resData = obj
      Object.keys(resData).forEach(key => {
        if (!isNaN(resData[key])) {
          resData[key] = Math.round(resData[key])
        }
      })
      return resData
    }

    resData = handleNumber(resData)

    return successResp(resp, resData, 'success')

  } catch (error) {
    manager_logger().info('View homepage information', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}

/**
 * 
 * View administrator list
 */
async function getAdminList(req, resp) {
  manager_logger().info('View administrator list')
  try {
    const data = req.query
    const where = {}
    if (data.id) {
      where.invite_id = data.id
    }
    const list = await Model.Manager.findAndCountAll({
      order: [['createdAt', 'desc']],
      where,
    })
    const total = await Model.Manager.count()
    return successResp(resp, { ...list, total }, 'Successful!')
  } catch (error) {
    manager_logger().info('Failed to view administrator list', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}


/**
 * 
 * View item list
 */
async function getPropsList(req, resp) {
  manager_logger().info('View item list')
  try {
    const data = req.query
    const where = {}
    if (data.name) {
      where.name = {
        [dataBase.Op.like]: `%${data.name}%`
      }
    }
    if (data.visible == 1) {
      where.visible = 1
    }
    if (data.visible == 0) {
      where.visible = 0
    }
    const list = await Model.Props.findAndCountAll({
      order: [['createdAt', 'desc']],
      where,
      offset: (data.pageNum - 1) * data.pageSize,
      limit: data.pageSize * 1,
    })
    list.rows.map(async (item, index) => {
      item.price = await utils.usdt_ffp(item.usdt)
    })
    setTimeout(() => {
      return successResp(resp, { ...list }, 'Successful!')
    }, 100);
  } catch (error) {
    manager_logger().info('Failed to view item list', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}


/**
 * 
 * View events
 */
async function getEventList(req, resp) {
  manager_logger().info('View events')
  try {
    const data = req.query
    const where = {}
    if (data.from_user) {
      where.from_user = data.from_user
    }
    if (data.type) {
      where.type = data.type
    }
    if (data.from_username) {
      where.from_username = {
        [dataBase.Op.like]: `%${data.from_username}%`
      }
    }
    if (data.to_user) {
      where.to_user = data.to_user
    }
    if (data.to_username) {
      where.to_username = {
        [dataBase.Op.like]: `%${data.to_username}%`
      }
    }
    if (data.is_really) {
      where.is_really = data.is_really == 'true' ? true : false
    }

    const list = await Model.Event.findAndCountAll({
      order: [['createdAt', 'desc']],
      where,
      offset: (data.pageNum - 1) * data.pageSize,
      limit: data.pageSize * 1,
    })

    const total = await Model.Event.count()
    return successResp(resp, { ...list, total }, 'Successful!')
  } catch (error) {
    manager_logger().info('Failed to view events', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}


/**
 * 
 * View system configuration
 */
async function getConfigInfo(req, resp) {
  manager_logger().info('View system configuration')
  try {
    const info = await Model.Config.findOne()
    return successResp(resp, info.dataValues, 'Successful!')
  } catch (error) {
    manager_logger().info('Failed to view system configuration', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}

/**
 * 
 * View system configuration
 */
async function getAllConfig(req, resp) {
  manager_logger().info('View system configuration')
  try {
    const base = await Model.Config.findOne()
    const country = await Model.Country.findAll({
      order: [['sort', 'desc']]
    })
    const language = await Model.Language.findAll({
      order: [['sort', 'desc']]
    })
    const style = await Model.Style.findAll({
      order: [['sort', 'desc']]
    })
    const group = await Model.Group.findAll({
      order: [['sort', 'desc']]
    })
    const systemLanguage = await Model.SystemLanguage.findAll({
      order: [['sort', 'desc']]
    })
    return successResp(resp, { base, country, language, style, group, systemLanguage })
  } catch (error) {
    manager_logger().info('Failed to view system configuration', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}


/**
 * 
 * View task list
 */
async function getTaskList(req, resp) {
  manager_logger().info('View task list')
  try {
    const list = await Model.TaskList.findAndCountAll({})
    return successResp(resp, list, 'success')
  } catch (error) {
    manager_logger().info('Failed to view task list', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}



/**
 * 
 * View wallet list
 */
async function getWalletList(req, resp) {
  manager_logger().info('View wallet list')
  try {
    const data = req.query
    let sql = ''

    if (data.nick_name) {
      sql += `WHERE nick_name LIKE '%${data.nick_name}%'`
    }

    if (data.address) {
      if (sql) {
        sql += 'AND '
      } else {
        sql += 'WHERE '
      }
      sql += ` address='${data.address}'`
    }

    if (data.type) {
      if (sql) {
        sql += 'AND '
      } else {
        sql += 'WHERE '
      }
      sql += ` type='${data.type}'`
    }

    const limit = `LIMIT ${data.pageSize} OFFSET ${(data.pageNum - 1) * data.pageSize}`

    const sqlStr = `SELECT p.*, u.nick_name FROM wallet p JOIN user u ON p.uid = u.id ${sql} ORDER BY createdAt DESC ${limit};`
    const list = await dataBase.sequelize.query(sqlStr, { type: dataBase.QueryTypes.SELECT })

    const countStr = `SELECT COUNT(*) as count FROM wallet p JOIN user u ON p.uid = u.id ${sql};`
    const count = await dataBase.sequelize.query(countStr, { type: dataBase.QueryTypes.SELECT })

    const totalStr = `SELECT COUNT(*) as total FROM wallet p JOIN user u ON p.uid = u.id;`
    const total = await dataBase.sequelize.query(totalStr, { type: dataBase.QueryTypes.SELECT })

    return successResp(resp, { rows: list, total: total[0].total, count: count[0].count }, 'Successful!')
  } catch (error) {
    manager_logger().info('Failed to view wallet list', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}


/**
 * 
 * View level
 */
async function getExpList(req, resp) {
  manager_logger().info('View level')
  try {
    const data = req.query
    const where = {}
    if (data.lv) {
      where.lv = data.lv
    }

    const list = await Model.CheckInReward.findAndCountAll({
      order: [['day', 'asc']],
      where,
    })
    const total = await Model.CheckInReward.count()
    return successResp(resp, { ...list, total }, 'Successful!')
  } catch (error) {
    manager_logger().info('Failed to view level', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}
/**
 * 
 * Item list
 */
async function getPropsRecordList(req, resp) {
  manager_logger().info('Item list')
  try {
    const data = req.query
    let sql = 'WHERE props_amount > 0 '

    if (data.nick_name) {
      sql += `AND nick_name LIKE '%${data.nick_name}%'`
    }

    if (data.address) {
      if (sql) {
        sql += 'AND '
      } else {
        sql += 'WHERE '
      }
      sql += ` address='${data.address}'`
    }

    if (data.source) {
      if (sql) {
        sql += 'AND '
      } else {
        sql += 'WHERE '
      }
      sql += ` source='${data.source}'`
    }

    if (data.props_id) {
      if (sql) {
        sql += 'AND '
      } else {
        sql += 'WHERE '
      }
      sql += ` props_id=${data.props_id}`
    }

    const limit = `LIMIT ${data.pageSize} OFFSET ${(data.pageNum - 1) * data.pageSize}`

    const sqlStr = `SELECT p.*, u.nick_name FROM props_record p JOIN user u ON p.uid = u.id ${sql} ORDER BY createdAt DESC ${limit};`
    const list = await dataBase.sequelize.query(sqlStr, { type: dataBase.QueryTypes.SELECT })

    const countStr = `SELECT COUNT(*) as count FROM props_record p JOIN user u ON p.uid = u.id ${sql};`
    const count = await dataBase.sequelize.query(countStr, { type: dataBase.QueryTypes.SELECT })

    const totalStr = `SELECT COUNT(*) as total FROM props_record p JOIN user u ON p.uid = u.id WHERE props_amount > 0;`
    const total = await dataBase.sequelize.query(totalStr, { type: dataBase.QueryTypes.SELECT })

    return successResp(resp, { rows: list, total: total[0].total, count: count[0].count }, 'Successful!')

  } catch (error) {
    manager_logger().info('Failed to view item list', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}


/**
 * 
 * View prize list
 */
async function getPrizeList(req, resp) {
  manager_logger().info('View prize list')
  try {
    const data = req.query
    const where = {}
    if (data.lv) {
      where.lv = data.lv
    }

    const list = await Model.Prize.findAndCountAll({
      order: [['createdAt', 'desc']],
      where,
    })
    const total = await Model.Prize.count()
    return successResp(resp, { ...list, total }, 'Successful!')
  } catch (error) {
    manager_logger().info('Failed to view prize list', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}

/**
 * 
 * Update member information
 */
async function updateUserInfo(req, resp) {
  manager_logger().info('Update member information')
  try {
    const data = req.body
    const oldUser = await Model.User.findByPk(data.id)
    await Model.User.update(
      { ...data },
      {
        where: {
          id: data.id
        }
      }
    )
    if (data.score !== oldUser.score) {
      await Model.Event.create({
        type: 'system_change',
        from_user: req.id,
        to_user: data.user_id,
        from_username: 'system',
        to_username: data.username,
        score: data.score - oldUser.score,
        desc: `System operation coins:${data.score - oldUser.score}`
      })
    }
    if (data.use_ton !== oldUser.use_ton) {
      await Model.Event.create({
        type: 'system_change',
        from_user: 0,
        to_user: data.user_id,
        from_username: 'system',
        to_username: data.username,
        price: data.use_ton - oldUser.use_ton,
        desc: `System operation ton:${data.use_ton - oldUser.use_ton}`
      })
    }
    if (data.startParam !== oldUser.startParam) {
      await Model.Event.create({
        type: 'system_change',
        from_user: 0,
        to_user: data.user_id,
        from_username: 'system',
        to_username: data.username,
        score: 0,
        desc: `System operation:modify ${data.username} superior ID is ${data.startParam}`
      })
    }
    return successResp(resp, {}, 'Successful!')
  } catch (error) {
    manager_logger().info('Update member information', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}

/**
 * 
 * Update item information
 */
async function updatePropsInfo(req, resp) {
  manager_logger().info('Update item information')
  try {
    let data = req.body

    if (data.id) {
      const upObj = JSON.parse(JSON.stringify(data))
      delete upObj.id
      await Model.Props.update(
        upObj,
        {
          where: {
            id: data.id
          }
        }
      )
    } else {
      await Model.Props.create(data)
    }
    return successResp(resp, {}, 'Successful!')
  } catch (error) {
    manager_logger().info('Failed to update item information.', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}

/**
 * 
 * Update event
 */
async function updateEventInfo(req, resp) {
  manager_logger().info('Update event information.')
  try {
    let data = req.body

    if (data.id) {
      const upObj = JSON.parse(JSON.stringify(data))
      delete upObj.id
      await Model.Event.update(
        upObj,
        {
          where: {
            id: data.id
          }
        }
      )
    } else {
      await Model.Event.create(data)
    }
    return successResp(resp, {}, 'Successful!')
  } catch (error) {
    manager_logger().info('Failed to update event information', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}


/**
 * 
 * Update event
 */
async function updateConfigInfo(req, resp) {
  manager_logger().info('Update event information')
  try {
    let data = req.body

    if (data.id) {
      const upObj = JSON.parse(JSON.stringify(data))
      delete upObj.id
      await Model.Config.update(
        upObj,
        {
          where: {
            id: data.id
          }
        }
      )
    } else {
      await Model.Config.create(data)
    }
    return successResp(resp, {}, 'Successful!')
  } catch (error) {
    manager_logger().info('Failed to update event information', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}

/**
 * 
 * Update administrator information
 */
async function updateAdminInfo(req, resp) {
  manager_logger().info('Update administrator information')
  try {
    let data = req.body

    if (data.id) {
      const upObj = JSON.parse(JSON.stringify(data))
      delete upObj.id
      await Model.Manager.update(
        upObj,
        {
          where: {
            id: data.id
          }
        }
      )
    } else {
      await Model.Manager.create(data)
    }
    return successResp(resp, {}, 'Successful!')
  } catch (error) {
    manager_logger().info('Failed to update administrator information', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}

/**
 * 
 * Update prize
 */
async function updatePrizeInfo(req, resp) {
  manager_logger().info('Update prize information')
  try {
    let data = req.body

    if (data.id) {
      const upObj = JSON.parse(JSON.stringify(data))
      delete upObj.id
      await Model.Prize.update(
        upObj,
        {
          where: {
            id: data.id
          }
        }
      )
    } else {
      await Model.Prize.create(data)
    }
    return successResp(resp, {}, 'Successful!')
  } catch (error) {
    manager_logger().info('Failed to update prize information', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}

/**
 * 
 * Update level
 */
async function updateExpList(req, resp) {
  manager_logger().info('Update level information')
  try {
    let data = req.body

    if (data.id) {
      const upObj = JSON.parse(JSON.stringify(data))
      delete upObj.id
      await Model.CheckInReward.update(
        upObj,
        {
          where: {
            id: data.id
          }
        }
      )
    } else {
      await Model.CheckInReward.create(data)
    }
    return successResp(resp, {}, 'Successful!')
  } catch (error) {
    manager_logger().info('Failed to update level information', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}

/**
 * 
 * Update user item list
 */
async function updateUserPropsList(req, resp) {
  manager_logger().info('Update user item list information')
  try {
    let data = req.body

    if (data.id) {
      const upObj = JSON.parse(JSON.stringify(data))
      delete upObj.id
      await Model.PropsRecord.update(
        upObj,
        {
          where: {
            id: data.id
          }
        }
      )
    } else {
      await Model.PropsRecord.create(data)
    }
    return successResp(resp, {}, 'Successful!')
  } catch (error) {
    manager_logger().info('Failed to update user item list information', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}

/**
 * 
 * Update or create task
 */
async function updateTaskInfo(req, resp) {
  manager_logger().info('Update or create task')
  try {
    const data = req.body
    if (data.id) {
      await Model.TaskList.update(data, {
        where: {
          id: data.id
        }
      })
    } else {
      await Model.TaskList.create(data)
    }

    return successResp(resp, {}, 'Successful!')
  } catch (error) {
    manager_logger().info('Failed to update or create task', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}

/**
 * 
 * Delete member
 */
async function removeUser(req, resp) {
  manager_logger().info('Update member information')
  try {
    const data = req.body
    await Model.User.destroy(
      {
        where: {
          id: data.id
        }
      }
    )
    return successResp(resp, {}, 'Successful!')
  } catch (error) {
    manager_logger().info('Update member information', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}

/**
 * 
 * Delete wallet
 */
async function removeWallet(req, resp) {
  manager_logger().info('Update wallet information')
  try {
    const data = req.body
    await Model.Wallet.destroy(
      {
        where: {
          address: data.address
        }
      }
    )
    return successResp(resp, {}, 'Successful!')
  } catch (error) {
    manager_logger().info('Update wallet information', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}


/**
 * 
 * Delete item
 */
async function removeProps(req, resp) {
  manager_logger().info('Delete item information')
  try {
    const data = req.body
    await Model.Props.destroy(
      {
        where: {
          id: data.id
        }
      }
    )
    return successResp(resp, {}, 'Successful!')
  } catch (error) {
    manager_logger().info('Failed to delete item information', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}


/**
 * 
 * Delete operation record
 */
async function removeEvent(req, resp) {
  manager_logger().info('Delete operation record')
  try {
    const data = req.body
    await Model.Event.destroy(
      {
        where: {
          id: data.id
        }
      }
    )
    return successResp(resp, {}, 'Successful!')
  } catch (error) {
    manager_logger().info('Failed to delete operation record', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}


/**
 * 
 * Delete administrator
 */
async function removeAdminInfo(req, resp) {
  manager_logger().info('Delete administrator')
  try {
    const data = req.body
    await Model.Manager.destroy(
      {
        where: {
          id: data.id
        }
      }
    )
    return successResp(resp, {}, 'Successful!')
  } catch (error) {
    manager_logger().info('Failed to delete the administrator', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}


/**
 * 
 * Delete task
 */
async function removeTaskList(req, resp) {
  manager_logger().info('Delete task')
  try {
    const data = req.body
    await Model.TaskList.destroy(
      {
        where: {
          id: data.id
        }
      }
    )
    return successResp(resp, {}, 'Successful!')
  } catch (error) {
    manager_logger().info('Failed to delete the task', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}


/**
 * 
 * Delete prize
 */
async function removePrize(req, resp) {
  manager_logger().info('Delete prize')
  try {
    const data = req.body
    await Model.Prize.destroy(
      {
        where: {
          id: data.id
        }
      }
    )
    return successResp(resp, {}, 'Successful!')
  } catch (error) {
    manager_logger().info('Failed to delete the prize', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}

/**
 * 
 * Delete level
 */
async function removeLevel(req, resp) {
  manager_logger().info('Delete level')
  try {
    const data = req.body
    await Model.CheckInReward.destroy(
      {
        where: {
          id: data.id
        }
      }
    )
    return successResp(resp, {}, 'Success！')
  } catch (error) {
    manager_logger().info('Failed to delete the level', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}

/**
 * 
 * Delete user props
 */
async function removeUserProps(req, resp) {
  manager_logger().info('Delete user props')
  try {
    const data = req.body
    await Model.PropsRecord.destroy(
      {
        where: {
          id: data.id
        }
      }
    )
    return successResp(resp, {}, 'Success!')
  } catch (error) {
    manager_logger().info('Failed to delete user item', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}
//----------------------------- private method --------------
// Configure log output
function manager_logger() {
  log4js.configure({
    appenders: {
      out: { type: 'console' },
      app: {
        type: 'dateFile',
        filename: './logs/manage/manage',
        pattern: 'yyyy-MM-dd.log',
        alwaysIncludePattern: true
      }
    },
    categories: {
      default: { appenders: ['out', 'app'], level: 'debug' }
    }
  })
  var logger = log4js.getLogger('manage')
  return logger
}


module.exports = {
  login,
  userInfo,
  getUserList,
  getUserInviteList,
  updateUserInfo,
  removeUser,
  removeProps,
  updatePropsInfo,
  getPropsList,
  removeEvent,
  updateEventInfo,
  getEventList,
  getConfigInfo,
  updateConfigInfo,
  getHomeInfo,
  getAdminList,
  updateAdminInfo,
  removeAdminInfo,
  removeTaskList,
  updateTaskInfo,
  getTaskList,
  getPrizeList,
  getExpList,
  updatePrizeInfo,
  updateExpList,
  removeLevel,
  removePrize,
  removeWallet,
  getWalletList,
  getPropsRecordList,
  updateUserPropsList,
  removeUserProps,
  manager_logger,
  getAllConfig
}