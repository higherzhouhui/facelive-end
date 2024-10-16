const log4js = require('log4js')
const Model = require('../model/index')
const dataBase = require('../model/database')
const { isLastDay, getRandomInt } = require('../utils/common')
const moment = require('moment/moment')

//-- demo--//
async function demo(sendData) {
  const data = handleSendData(sendData)
  operation_log(data)
  await dataBase.sequelize.transaction(async (t) => {
    try {

    } catch (error) {
      console.error(error)
      bot_logger().error(`demo Error: ${error}`)
    }
  })
}

async function get_all_user(sendData) {
  const data = handleSendData(sendData)
  operation_log(data)
  const allUser = []
  await dataBase.sequelize.transaction(async (t) => {
    try {
      const all = await Model.User.findAll()
      all.forEach(item => {
        allUser.push(item.dataValues.user_id)
      })
    } catch (error) {
      console.error(error)
      bot_logger().error(`demo Error: ${error}`)
    }
  })
  return allUser
}

async function create_user(sendData) {
  const data = handleSendData(sendData)
  operation_log(data)

  await dataBase.sequelize.transaction(async (t) => {
    try {
      const userInfo = await Model.User.findOne({
        where: {
          user_id: data.user_id
        }
      })
      if (!userInfo) {
        const config = await Model.Config.findOne()
        const text = data.text
        if (text.split(' ').length == 2) {
          const parameter = text.split(' ')[1]; // 假设参数紧跟在/start之后
          if (parameter) {
            data.text = '/start'
            const startParam = parseInt(atob(parameter))
            if (!isNaN(startParam)) {
              data.startParam = startParam
              const parentUser = await Model.User.findOne({
                user_id: startParam
              })
              if (parentUser) {
                const score = config.invite_normal
                parentUser.increment({
                  invite_friends_score: score,
                  score: score,
                })
                const event_data = {
                  type: 'Inviting',
                  from_user: data.user_id,
                  to_user: startParam,
                  score: score,
                  from_username: data.username,
                  to_username: parentUser.username,
                  desc: `${parentUser.username} invite ${data.username} join us!`
                }
                await Model.Event.create(event_data)
              }
            }
          }
        }

        await Model.User.create(data)
        const event_data = {
          type: 'Register',
          from_user: data.user_id,
          to_user: data.user_id,
          score: config.invite_normal,
          from_username: data.username,
          to_username: data.username,
          desc: `${data.username} join us!`
        }
        await Model.Event.create(event_data)
      } else {
        return
        // 处理邀请游戏链接
        const text = data.text
        if (text && text.split(' ').length == 2) {
          const parameter = text.split(' ')[1]; // 假设参数紧跟在/start之后
          const startParam = parseInt(atob(parameter))
          if (!isNaN(startParam)) {
            if (startParam == data.user_id) {
              return
            }
            // 奖励上级
            const parentUser = await Model.User.findOne({
              where: {
                user_id: startParam
              }
            })
            if (parentUser) {
              if (userInfo.startParam == 0) {
                await userInfo.update({
                  startParam: startParam
                })
              }
              const todayStart = new Date();
              todayStart.setHours(0, 0, 0, 0); // 设置今天的开始时间
              const todayEnd = new Date(todayStart);
              todayEnd.setDate(todayEnd.getDate() + 1); // 设置今天的结束时间

              const dailyRewards = await Model.Event.findAndCountAll({
                where: {
                  type: 'share_reward',
                  to_user: startParam,
                  createdAt: {
                    [dataBase.Op.gt]: todayStart,
                    [dataBase.Op.lt]: todayEnd
                  }
                }
              })
              // 每天三次
              if (dailyRewards.count <= 3) {
                const currentReward = await Model.Event.findAndCountAll({
                  where: {
                    type: 'share_reward',
                    to_user: startParam,
                    from_user: data.user_id,
                    createdAt: {
                      [dataBase.Op.gt]: todayStart,
                      [dataBase.Op.lt]: todayEnd
                    }
                  }
                })
                if (currentReward.count == 0) {
                  await parentUser.increment({
                    ticket: 1
                  })
                  const event_data = {
                    type: 'share_reward',
                    to_user: startParam,
                    from_user: data.user_id,
                    from_username: data.username,
                    to_username: parentUser.username,
                    ticket: 1,
                    desc: `${data.username} play game by ${parentUser.username} share link`
                  }
                  await Model.Event.create(event_data)
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(error)
      bot_logger().error(`create_user Error: ${error}`)
    }
  })
}


async function get_userInfo(sendData) {
  const data = handleSendData(sendData)
  operation_log(data)
  let userInfo
  await dataBase.sequelize.transaction(async (t) => {
    try {
      userInfo = await Model.User.findOne({
        where: {
          user_id: data.user_id
        }
      })
      const count = await Model.User.count({
        where: {
          startParam: data.user_id
        }
      })
      userInfo.count = count
    } catch (error) {
      console.error(error)
      bot_logger().error(`get_userInfo Error: ${error}`)
    }
  })
  return userInfo
}


async function get_tasks(sendData) {
  const data = handleSendData(sendData)
  operation_log(data)
  let list
  await dataBase.sequelize.transaction(async (t) => {
    try {
      const id = data.user_id
      const sql = `SELECT t.*, ut.status FROM tasklist t LEFT JOIN usertask ut ON t.id = ut.task_id AND ut.user_id=${id} ORDER BY t.id`
      list = await dataBase.sequelize.query(sql, { type: dataBase.QueryTypes.SELECT })

    } catch (error) {
      console.error(error)
      bot_logger().error(`get_tasks Error: ${error}`)
    }
  })
  return list
}

async function check_tasks(sendData, task_id) {
  const data = handleSendData(sendData)
  operation_log(data)
  let name = ''
  await dataBase.sequelize.transaction(async (t) => {
    try {
      const task_data = {
        task_id: task_id,
        user_id: data.user_id,
        status: 'Claim'
      }
      const [taskItem, created] = await Model.UserTask.findOrCreate({
        where: {
          user_id: data.user_id,
          task_id: task_id
        },
        defaults: task_data
      })
      const taskInfo = await Model.TaskList.findByPk(task_id)
      name = taskInfo.name
    } catch (error) {
      console.error(error)
      bot_logger().error(`check_tasks Error: ${error}`)
    }
  })
  return name
}


async function user_feedBack(sendData) {
  const data = handleSendData(sendData)
  operation_log(data)
  let score = 0
  await dataBase.sequelize.transaction(async (t) => {
    try {
      const config = await Model.Config.findOne()
      const feedData = {
        user_id: data.user_id,
        text: data.text,
        score: config.feed_back
      }
      score = config.feed_back
      await Model.FeedBack.create(feedData)
      await dataBase.cache.set(`${data.user_id}feedBack`, 0)

    } catch (error) {
      console.error(error)
      bot_logger().error(`user_feedBack Error: ${error}`)
    }
  })
  return score
}

async function get_scripts(sendData) {
  const data = handleSendData(sendData)
  operation_log(data)
  let scripts = []
  await dataBase.sequelize.transaction(async (t) => {
    try {
      scripts = await Model.Script.findAll()

    } catch (error) {
      console.error(error)
      bot_logger().error(`demo Error: ${error}`)
    }
  })
  return scripts
}

async function get_script_detail(sendData, cId) {
  const data = handleSendData(sendData)
  operation_log(data)
  let id = cId
  let scripts;
  await dataBase.sequelize.transaction(async (t) => {
    try {
      if (!id) {
        const _script = await Model.Script.findOne({
          order: [['createdAt', 'desc']]
        })
        id = _script.dataValues.id
        scripts = _script.dataValues
      } else {
        scripts = await Model.Script.findByPk(id)
      }
      scripts.config = await Model.Config.findOne()
      const isDone = await Model.Event.findOne({
        where: {
          from_user: data.user_id,
          type: 'done_script',
          script_id: id
        }
      })
      if (isDone) {
        scripts.isDone = true
      } else {
        const isBegin = await Model.UserChoose.findOne({
          where: {
            script_id: id,
            user_id: data.user_id
          }
        })
        if (isBegin) {
          scripts.isBegin = true
        }
      }
    } catch (error) {
      console.error(error)
      bot_logger().error(`get_script_detail Error: ${error}`)
    }
  })
  return scripts
}

async function get_script_option(sendData, id) {
  const data = handleSendData(sendData)
  operation_log(data)
  let options;
  await dataBase.sequelize.transaction(async (t) => {
    try {
      const config = await Model.Config.findOne()

      const isDone = await Model.Event.findOne({
        where: {
          from_user: data.user_id,
          type: 'done_script',
          script_id: id
        }
      })

      if (isDone) {
        const userInfo = await Model.User.findOne({
          where: {
            user_id: data.user_id
          }
        })
        if (userInfo.dataValues.ticket < config.choose_jb) {
          options = false
          return
        }
        await Model.User.decrement({
          ticket: config.reset_jb
        }, {
          where: {
            user_id: data.user_id,
          }
        })
        const event_data = {
          from_user: data.user_id,
          to_user: data.user_id,
          from_username: data.username,
          to_username: data.username,
          ticket: 0 - config.reset_jb,
          type: 'reset_script',
          script_id: id,
          desc: `${data.username} reset a script`
        }
        await Model.Event.create(event_data)
        // 修改完成的记录
        await isDone.update({
          type: 'done_script_reset'
        })
      }

      // 扣次数
      const isBegin = await Model.UserChoose.findOne({
        where: {
          user_id: data.user_id,
          script_id: id
        }
      })

      if (!isBegin) {
        const userInfo = await Model.User.findOne({
          where: {
            user_id: data.user_id
          }
        })
        if (userInfo.dataValues.ticket < config.choose_jb) {
          options = false
          return
        }
        await userInfo.decrement({
          ticket: config.choose_jb
        })
        await Model.UserChoose.create({
          user_id: data.user_id,
          script_id: id
        })
        const event_data = {
          from_user: data.user_id,
          to_user: data.user_id,
          from_username: data.username,
          to_username: data.username,
          ticket: 0 - config.choose_jb,
          type: 'choose_script',
          script_id: id,
          desc: `${data.username} choose a script`
        }
        await Model.Event.create(event_data)
      }
      const scriptDetail = await Model.ScriptDetail.findOne({
        order: [['sort', 'asc']],
        where: {
          script_id: id
        }
      })
      options = scriptDetail.dataValues
      const list = await Model.ChooseOption.findAll({
        order: [['sort', 'asc']],
        where: {
          ScriptDetail_id: scriptDetail.dataValues.id
        }
      })
      options.list = []
      list.forEach(element => {
        options.list.push(element.dataValues)
      });
    } catch (error) {
      console.error(error)
      bot_logger().error(`demo Error: ${error}`)
    }
  })
  return options
}

async function choose_option(sendData, id) {
  const data = handleSendData(sendData, id)
  operation_log(data)
  let result = {
    code: 0
  }
  await dataBase.sequelize.transaction(async (t) => {
    try {
      const optionDetail = await Model.ChooseOption.findByPk(id)

      const [userChooseDetail, isCreate] = await Model.UserChoose.findOrCreate({
        where: {
          user_id: data.user_id,
          script_id: optionDetail.script_id,
          detail_id: optionDetail.scriptDetail_id,
        },
        defaults: {
          user_id: data.user_id,
          script_id: optionDetail.script_id,
          detail_id: optionDetail.scriptDetail_id,
          option_id: id
        }
      })

      if (!isCreate) {
        result.code = 400
        result.msg = ''
        await userChooseDetail.update({
          option_id: id
        })
      }
      const config = await Model.Config.findOne()
      const userInfo = await Model.User.findOne({
        where: {
          user_id: data.user_id
        }
      })
      if (result.code == 0) {
        await userInfo.increment({
          score: config.click_jb,
        })
        const event_data = {
          from_user: data.user_id,
          to_user: data.user_id,
          from_username: data.username,
          to_username: data.username,
          score: config.click_jb,
          script_id: optionDetail.script_id,
          type: 'choose_option',
          desc: `${data.username} choose a option`
        }
        await Model.Event.create(event_data)
      }


      const _chooseDetail = await Model.ChooseOption.findByPk(id)
      // current scriptDetail
      let scriptDetail = await Model.ScriptDetail.findByPk(_chooseDetail.scriptDetail_id)
      // next scriptDetail
      scriptDetail = await Model.ScriptDetail.findOne({
        where: {
          script_id: _chooseDetail.script_id,
          key: _chooseDetail.value
        }
      })

      result.data = scriptDetail.dataValues
      const list = await Model.ChooseOption.findAll({
        order: [['sort', 'asc']],
        where: {
          ScriptDetail_id: scriptDetail.dataValues.id
        }
      })
      result.data.list = []
      list.forEach(element => {
        result.data.list.push(element.dataValues)
      });
      if (scriptDetail.shortOver || scriptDetail.longOver) {
        game_over(sendData, list[0].id)
      }
      // if (scriptDetail.shortOver || scriptDetail.longOver) {
      //   let add_score = config.done_jb
      //   if (scriptDetail.longOver) {
      //     add_score = config.done_really_jb
      //   }
      //   if (result.code == 0) {
      //     await userInfo.increment({
      //       score: add_score,
      //       complete: 1,
      //     })
      //     const event_data = {
      //       from_user: data.user_id,
      //       to_user: data.user_id,
      //       from_username: data.username,
      //       to_username: data.username,
      //       score: config.done_jb,
      //       type: 'done_script',
      //       script_id: optionDetail.script_id,
      //       desc: `${data.username} done a script`
      //     }
      //     await Model.Event.create(event_data)
      //   }
      //   result.code = 401
      //   result.msg = '该剧本已经完成'
      // } else {
      //   result.data = scriptDetail.dataValues
      //   const list = await Model.ChooseOption.findAll({
      //     order: [['sort', 'asc']],
      //     where: {
      //       ScriptDetail_id: scriptDetail.dataValues.id
      //     }
      //   })
      //   result.data.list = []
      //   list.forEach(element => {
      //     result.data.list.push(element.dataValues)
      //   });
      // }
    } catch (error) {
      console.error(error)
      bot_logger().error(`demo Error: ${error}`)
    }
  })
  return result
}

async function done_tasks(sendData, task_id) {
  const data = handleSendData(sendData)
  operation_log(data)
  let status = ''
  await dataBase.sequelize.transaction(async (t) => {
    try {
      const taskItem = await Model.UserTask.findOne({
        where: {
          user_id: data.user_id,
          task_id: task_id
        },
      })
      if (!taskItem) {
        status = 'Please complete the task first!'
        return
      }
      if (taskItem.dataValues.status == 'Done') {
        status = 'The task has been completed!'
        return
      }
      taskItem.update({
        status: 'Done'
      })
      const taskInfo = await Model.TaskList.findByPk(task_id)

      status = `Congratulations on receiving the task reward: ${taskInfo.ticket} limit`
      await Model.User.increment({
        ticket: taskInfo.ticket,
      },
        {
          where: {
            user_id: data.user_id
          }
        })
    } catch (error) {
      console.error(error)
      bot_logger().error(`done_tasks Error: ${error}`)
    }
  })
  return status
}

async function get_config() {
  let config
  await dataBase.sequelize.transaction(async (t) => {
    try {
      config = await Model.Config.findOne()
    } catch (error) {
      console.error(error)
      bot_logger().error(`get_config Error: ${error}`)
    }
  })
  return config
}

async function set_language(id, lang) {
  await dataBase.sequelize.transaction(async (t) => {
    try {
      const userInfo = await Model.User.findOne({
        where: {
          user_id: id
        }
      })
      if (!userInfo) {

      } else {
        await userInfo.update({
          lang: lang
        })
      }
    } catch (error) {
      console.error(error)
      bot_logger().error(`set_language Error: ${error}`)
    }
  })
}

async function get_language(id) {
  let lang = 'en'
  await dataBase.sequelize.transaction(async (t) => {
    try {
      const userInfo = await Model.User.findOne({
        where: {
          user_id: id
        }
      })
      if (userInfo) {
        lang = userInfo.dataValues.lang || userInfo.dataValues.languageCode
      } else {

      }
    } catch (error) {
      console.error(error)
      bot_logger().error(`get_language Error: ${error}`)
      return lang
    }
  })
  lang = lang == 'zh-hans' ? 'zh' : 'en'
  return lang
}

async function operation_log(data) {
  bot_logger().info('operation_log:', `${JSON.stringify(data)}`)

  await dataBase.sequelize.transaction(async (t) => {
    try {
      const event_data = {
        ...data,
        desc: `${data.username} input ${data.text}`
      }
      await Model.BotEvent.create(event_data)
    } catch (error) {
      bot_logger().error(`operation_log Error: ${error}`)
    }
  })
}

async function game_over(sendData, id) {
  const data = handleSendData(sendData)
  operation_log(data)
  let result = {
    code: 0,
    msg: ''
  }
  await dataBase.sequelize.transaction(async (t) => {
    try {

      let user = await Model.User.findOne({
        where: {
          user_id: data.user_id,
        }
      })
      const config = await Model.Config.findOne()
      const optionDetail = await Model.ChooseOption.findByPk(id)
      const scriptDetail = await Model.ScriptDetail.findByPk(optionDetail.scriptDetail_id)
      const isDone = await Model.Event.findOne({
        where: {
          from_user: data.user_id,
          type: 'done_script',
          script_id: optionDetail.script_id
        }
      })
      if (isDone) {
        result = {
          code: 400,
          msg: 'Congratulations on completing the script!'
        }
        return
      }

      let add_score = config.done_jb
      if (scriptDetail.longOver) {
        add_score = config.done_really_jb
      }

      await user.increment({
        score: add_score,
        complete: 1,
      })
      let event_data = {
        from_user: data.user_id,
        to_user: data.user_id,
        from_username: data.username,
        to_username: data.username,
        score: add_score,
        type: 'done_script',
        script_id: optionDetail.script_id,
        key: scriptDetail.key,
        desc: `${data.username} done a script`
      }
      await Model.Event.create(event_data)

      if (user.startParam) {
        const parentUser = await Model.User.findOne({
          where: {
            user_id: user.startParam
          }
        })
        if (parentUser) {
          const score_ratio = Math.floor(add_score * config.invite_friends_ratio / 100)
          await parentUser.increment({
            score: score_ratio,
            invite_friends_score: score_ratio
          })
          event_data = {
            type: 'done_script_parent',
            from_user: data.user_id,
            from_username: user.username,
            to_user: parentUser.user_id,
            to_username: parentUser.username,
            score: score_ratio,
            ticket: 0,
            script_id: optionDetail.script_id,
            key: scriptDetail.key,
            desc: `${parentUser.username} get done script reward ${score_ratio} Pts from ${user.username}`
          }
          await Model.Event.create(event_data)
        }
      }

      // 检查是否完成了所有结局
      const script_result = await Model.ScriptDetail.findAll({
        attributes: ['key'],
        where: {
          script_id: optionDetail.script_id,
          [dataBase.Op.or]: [
            {
              shortOver: true
            },
            {
              longOver: true
            }
          ]
        }
      })
      const user_done_result = await Model.Event.findAll({
        attributes: ['key'],
        where: {
          script_id: optionDetail.script_id,
          from_user: data.user_id,
          [dataBase.Op.or]: [
            {
              type: 'done_script'
            },
            {
              type: 'done_script_reset'
            }
          ]
        }
      })
      const is_done_all = await Model.Event.findOne({
        where: {
          type: 'done_script_all',
          from_user: data.user_id,
          script_id: optionDetail.script_id,
        }
      })
      if (is_done_all) {
        return
      }
      const _user_done_result = []
      const _script_result = []
      script_result.forEach(item => {
        _script_result.push(item.dataValues.key)
      })
      user_done_result.forEach(item => {
        _user_done_result.push(item.dataValues.key)
      })

      if (_script_result.every(value => _user_done_result.includes(value))) {
        const event_data = {
          from_user: data.user_id,
          to_user: data.user_id,
          from_username: data.username,
          to_username: data.username,
          score: config.done_jb_all,
          type: 'done_script_all',
          script_id: optionDetail.script_id,
          desc: `${data.username} done a script`
        }
        await user.increment({
          score: config.done_jb_all,
        })
        await Model.Event.create(event_data)
      }
    } catch (error) {
      console.error(error)
      bot_logger().error(`demo Error: ${error}`)
    }
  })
  return result
}

async function accord_option_scriptId(sendData, id) {
  const data = handleSendData(sendData)
  operation_log(data)
  let script_id;
  await dataBase.sequelize.transaction(async (t) => {
    try {
      const operation = await Model.ChooseOption.findByPk(id)
      script_id = operation.script_id
    } catch (error) {
      console.error(error)
      bot_logger().error(`demo Error: ${error}`)
    }
  })
  return script_id
}

async function user_checkIn(sendData) {
  const data = handleSendData(sendData)
  operation_log(data)
  let signObj = {}
  await dataBase.sequelize.transaction(async (t) => {
    try {
      const user = await Model.User.findOne({
        where: {
          user_id: data.user_id
        }
      })
      let day = 0
      let today = moment().utc().format('MM-DD')
      const checkInList = await Model.Event.findAll({
        where: {
          type: 'checkIn',
          from_user: data.user_id,
        },
        order: [['createdAt', 'desc']],
        attributes: ['createdAt']
      })
      const newCheckInList = checkInList.filter(item => {
        return moment(item.dataValues.createdAt).utc().format('MM-DD') != today
      })

      newCheckInList.map((item, index) => {
        if (isLastDay(new Date(item.dataValues.createdAt).getTime(), index + 1)) {
          day = (index + 1) % 7
        }
      })

      const allRewardList = await Model.CheckInReward.findAll({
        order: [['day', 'asc']],
        attributes: ['day', 'score', 'ticket']
      })
      let reward = allRewardList[0]
      try {
        reward = allRewardList[day]
      } catch (error) {
        bot_logger().error('check day Error:', 'dayIndex:', day, `${error}`)
      }

      let check_score = user.check_score
      let score = user.score
      let ticket = user.ticket
      if (user.check_date != today) {
        check_score += reward.score
        score += reward.score
        ticket += reward.ticket
        await Model.User.update({
          check_date: today,
          check_score: check_score,
          score: score,
          ticket: ticket
        }, {
          where: {
            user_id: data.user_id
          },
        })

        let event_data = {
          type: 'checkIn',
          from_user: data.user_id,
          from_username: user.username,
          to_user: data.user_id,
          to_username: user.username,
          desc: `${user.username} is checked day: ${reward.day}`,
          score: reward.score,
          ticket: reward.ticket,
        }
        await Model.Event.create(event_data)
        if (user.startParam) {
          const parentUser = await Model.User.findOne({
            where: {
              user_id: user.startParam
            }
          })
          if (parentUser) {
            const config = await Model.Config.findOne()
            const score_ratio = Math.floor(reward.score * config.invite_friends_ratio / 100)
            await parentUser.increment({
              score: score_ratio,
              invite_friends_score: score_ratio
            })
            event_data = {
              type: 'checkIn_parent',
              from_user: data.user_id,
              from_username: user.username,
              to_user: parentUser.user_id,
              to_username: parentUser.username,
              score: score_ratio,
              ticket: 0,
              desc: `${parentUser.username} get checkIn reward ${score_ratio} Pts from ${user.username}`
            }
            await Model.Event.create(event_data)
          }
        }
      }
      signObj = {
        check_date: today,
        score: reward.score,
        day: reward.day,
        ticket: reward.ticket,
        username: user.username,
      }
    } catch (error) {
      console.error(error)
      bot_logger().error(`user_checkIn Error: ${error}`)
    }
  })
  return signObj
}

async function getMessageToChannel() {
  bot_logger().error(`定时发送消息到群组`)
  let info = {}
  await dataBase.sequelize.transaction(async (t) => {
    try {
      const count = await Model.Anchor.count()
      const anchorId = getRandomInt(0, count)
      const anchorInfo = await Model.Anchor.findByPk(anchorId)
      if (anchorId) {
        info = anchorInfo
        const country = await Model.Country.findAll()
        const language = await Model.Language.findAll()
        const style = await Model.Style.findAll()
        const countryLabel = country.filter(item => {
          return (item.code == info.country)
        })
        const languageLabel = language.filter(item => {
          return (item.code == info.language)
        })
        const styleLabel = style.filter(item => {
          return (item.code == info.style)
        })
        console.log(info.language, language)
        if (countryLabel.length && languageLabel.length && styleLabel.length) {
          info.countryLabel = countryLabel[0].en
          info.languageLabel = languageLabel[0].en
          info.styleLabel = styleLabel[0].en
        }
      } else {
        getMessageToChannel()
      }
    } catch (error) {
      console.error(error)
      bot_logger().error(`getMessageToChannel Error: ${error}`)
    }
  })
  return info
}


module.exports = {
  create_user,
  set_language,
  get_language,
  get_userInfo,
  get_config,
  get_tasks,
  check_tasks,
  done_tasks,
  user_feedBack,
  user_checkIn,
  get_scripts,
  get_script_detail,
  get_script_option,
  choose_option,
  game_over,
  accord_option_scriptId,
  get_all_user,
  getMessageToChannel,
}


function handleSendData(sendData) {
  const data = {
    ...sendData,
    ...sendData.chat,
    ...sendData.from,
  }
  data.firstName = data.first_name
  data.lastName = data.last_name
  data.languageCode = data.language_code
  data.isBot = data.is_bot
  delete data.from
  delete data.chat
  delete data.entities
  data.user_id = data.id
  delete data.id

  return data
}




function bot_logger() {
  log4js.configure({
    appenders: {
      out: { type: 'console' },
      app: {
        type: 'dateFile',
        filename: './logs/bot/bot',
        pattern: 'yyyy-MM-dd.log',
        alwaysIncludePattern: true
      }
    },
    categories: {
      default: { appenders: ['out', 'app'], level: 'debug' }
    }
  })
  const logger = log4js.getLogger('bot')
  return logger
}
