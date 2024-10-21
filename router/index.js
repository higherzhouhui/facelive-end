const express = require('express')
const router = express.Router()
const user = require('./user.js')
const game = require('./game.js')
const checkInReward = require('./reward.js')
const task = require('./task.js')
const level = require('./level.js')
const anchor = require('./anchor.js')
const product = require('./product.js')
const file = require('./file.js')
// 上传文件
router.post('/dogAdmin/upload', file.upload.single('file'), file.uploadFile)

// 用户路由
router.post('/user/login', user.login)
router.post('/user/h5PcLogin', user.h5PcLogin)
router.post('/user/update', user.updateInfo)
router.post('/user/check', user.userCheck)
router.post('/user/bindWallet', user.bindWallet)
router.post('/user/changeLang', user.changeLang)
router.get('/user/list', user.getUserList)
router.get('/user/subList', user.getSubUserList)
router.get('/user/subTotal', user.getSubUserTotal)
router.get('/user/userInfo', user.getUserInfo)
router.get('/user/createUser', user.createUserInfo)
router.get('/user/cancelCreateUser', user.cancelCreateUserInfo)
router.get('/user/startFarming', user.startFarming)
router.get('/user/getRewardFarming', user.getRewardFarming)
router.get('/user/getMagicPrize', user.getMagicPrize)
router.get('/user/getMyScoreHistory', user.getMyScoreHistory)
router.get('/user/subtotallist', user.getSubUserTotalAndList)
router.get('/system/resetTicket', user.resetTicketInfo)

// 主播
router.get('/anchor/list', anchor.list)
router.get('/anchor/three', anchor.three)
router.get('/anchor/more', anchor.more)
router.get('/anchor/info', anchor.info)
router.get('/anchor/next', anchor.next)
router.get('/anchor/begin', anchor.begin)
router.post('/anchor/follow', anchor.follow)
router.get('/anchor/followList', anchor.followList)
router.get('/anchor/chatList', anchor.chatList)

// 产品
router.get('/product/list', product.list)
router.post('/product/buy', product.buy)


router.get('/game/begin', game.begin)
router.get('/game/record', game.record)
router.get('/game/addgas', game.addgas)
router.post('/game/end', game.end)

router.get('/levellist/list', level.list)

// 签到奖励列表
router.get('/checkInReward/list', checkInReward.list)
// 获取任务列表
router.get('/task/list', task.list)
router.post('/task/handle', task.handle)


// 管理后台接口
const manage = require('./manage/index.js')
const manageAccount = require('./manage/account.js')
const manageAnchor = require('./manage/anchor.js')
const manageCountry = require('./manage/country.js')
const manageLanguage = require('./manage/language.js')
const manageStyle = require('./manage/style.js')
const manageGroup = require('./manage/group.js')
const manageOrder = require('./manage/order.js')
const manageConsumption = require('./manage/consumption.js')
const manageFollow = require('./manage/follow.js')
const manageChat = require('./manage/chat.js')
const manageProduct = require('./manage/product.js')

router.post('/dogAdmin/login', manage.login)
router.get('/dogAdmin/userInfo', manage.userInfo)
router.get('/system/getConfig', manage.getConfigInfo)
router.get('/system/getAllConfig', manage.getAllConfig)

router.get('/dogAdmin/getUserList', manageAccount.getUserList)
router.get('/dogAdmin/getUserInviteList', manageAccount.getUserInviteList)
router.post('/dogAdmin/user/update', manageAccount.updateUserInfo)
router.post('/dogAdmin/user/remove', manageAccount.removeUser)

router.get('/dogAdmin/anchor/list', manageAnchor.getList)
router.post('/dogAdmin/anchor/update', manageAnchor.updateInfo)
router.post('/dogAdmin/anchor/remove', manageAnchor.removeRecord)

router.get('/dogAdmin/country/list', manageCountry.getList)
router.post('/dogAdmin/country/update', manageCountry.updateInfo)
router.post('/dogAdmin/country/remove', manageCountry.removeRecord)

router.get('/dogAdmin/language/list', manageLanguage.getList)
router.post('/dogAdmin/language/update', manageLanguage.updateInfo)
router.post('/dogAdmin/language/remove', manageLanguage.removeRecord)

router.get('/dogAdmin/style/list', manageStyle.getList)
router.post('/dogAdmin/style/update', manageStyle.updateInfo)
router.post('/dogAdmin/style/remove', manageStyle.removeRecord)

router.get('/dogAdmin/group/list', manageGroup.getList)
router.post('/dogAdmin/group/update', manageGroup.updateInfo)
router.post('/dogAdmin/group/remove', manageGroup.removeRecord)

router.get('/dogAdmin/order/list', manageOrder.getList)
router.post('/dogAdmin/order/update', manageOrder.updateInfo)
router.post('/dogAdmin/order/remove', manageOrder.removeRecord)

router.get('/dogAdmin/consumption/list', manageConsumption.getList)
router.post('/dogAdmin/consumption/update', manageConsumption.updateInfo)
router.post('/dogAdmin/consumption/remove', manageConsumption.removeRecord)

router.get('/dogAdmin/product/list', manageProduct.getList)
router.post('/dogAdmin/product/update', manageProduct.updateInfo)
router.post('/dogAdmin/product/remove', manageProduct.removeRecord)

router.get('/dogAdmin/follow/list', manageFollow.getList)
router.get('/dogAdmin/chat/list', manageChat.getList)


router.get('/dogAdmin/getPropsList', manage.getPropsList)
router.post('/dogAdmin/props/update', manage.updatePropsInfo)
router.post('/dogAdmin/props/remove', manage.removeProps)
router.get('/dogAdmin/getEventList', manage.getEventList)
router.post('/dogAdmin/event/update', manage.updateEventInfo)
router.post('/dogAdmin/event/remove', manage.removeEvent)
router.get('/dogAdmin/config/info', manage.getConfigInfo)
router.post('/dogAdmin/config/update', manage.updateConfigInfo)
router.get('/dogAdmin/home/info', manage.getHomeInfo)
router.get('/dogAdmin/admin/list', manage.getAdminList)
router.post('/dogAdmin/admin/update', manage.updateAdminInfo)
router.post('/dogAdmin/admin/remove', manage.removeAdminInfo)

router.get('/dogAdmin/task/list', manage.getTaskList)
router.post('/dogAdmin/task/update', manage.updateTaskInfo)
router.post('/dogAdmin/task/remove', manage.removeTaskList)

router.get('/dogAdmin/prize/list', manage.getPrizeList)
router.post('/dogAdmin/prize/update', manage.updatePrizeInfo)
router.post('/dogAdmin/prize/remove', manage.removePrize)

router.get('/dogAdmin/exp/list', manage.getExpList)
router.post('/dogAdmin/exp/update', manage.updateExpList)
router.post('/dogAdmin/exp/remove', manage.removeLevel)
router.get('/dogAdmin/propsRecord/list', manage.getPropsRecordList)
router.post('/dogAdmin/propsRecord/update', manage.updateUserPropsList)
router.post('/dogAdmin/propsRecord/remove', manage.removeUserProps)
router.get('/dogAdmin/wallet/list', manage.getWalletList)
router.post('/dogAdmin/wallet/remove', manage.removeWallet)

module.exports = router
