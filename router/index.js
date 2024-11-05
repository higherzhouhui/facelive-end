const express = require('express')
const router = express.Router()
const user = require('./user.js')
const file = require('./file.js')
const manage = require('./manage/index.js')
const questionList = require('./manage/questionList.js')
const question = require('./manage/question.js')

// 上传文件
router.post('/admin/upload', file.upload.single('file'), file.uploadFile)

// 用户路由
router.post('/user/login', user.login)

router.post('/admin/login', manage.login)
router.get('/admin/userInfo', manage.userInfo)
router.get('/admin/user/list', manage.userList)
router.post('/admin/user/updateInfo', manage.updateInfo)
router.post('/admin/user/remove', manage.remove)

router.get('/admin/questionList/list', questionList.getList)
router.post('/admin/questionList/update', questionList.update)
router.post('/admin/questionList/remove', questionList.remove)


router.get('/admin/question/list', question.getList)
router.post('/admin/question/update', question.update)
router.post('/admin/question/remove', question.remove)

module.exports = router
