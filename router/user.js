var log4js = require('log4js')
const { errorResp, successResp } = require('../middleware/request')
const Model = require('../model/index')
const dataBase = require('../model/database')
const moment = require('moment/moment')
const { isLastDay, resetUserTicket, createToken, getMessage, logger } = require('../utils/common')
const path = require('path')
/**
 * post /v1/user/login
 * @summary 登录
 * @tags user
 * @description 登录接口
 * @security - Authorization
 */
async function login(req, resp) {
  logger('user').info('WEB端登录', `${req.id}`)
  try {
    await dataBase.sequelize.transaction(async (t) => {
     
    })
  } catch (error) {
   
    console.error(`Login failed:${error}`)
    return errorResp(resp, 400, `${error}`)
  }
}

module.exports = {
  login,
}