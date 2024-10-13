var log4js = require('log4js')

const Model = require('../model/index')

async function init_manager() {
  try {
    const list = [
      { account: 'admin', password: 'a12345678' },
      { account: '18516010812', password: 'a123456' },
    ]
    list.map(async item => {
      await Model.Manager.create(item)
    })
  } catch (error) {
    admin_logger().error('init manage error:', error)
  }
}

async function init_rewardList() {
  try {
    const reward = require('../data/reward')
    reward.list.map(async item => {
      await Model.CheckInReward.create(item)
    })
  } catch (error) {
    admin_logger().error('init CheckInReward error:', error)
  }
}

async function init_taskList() {
  try {
    const list = require('../data/task')
    list.list.map(async item => {
      await Model.TaskList.create(item)
    })
  } catch (error) {
    admin_logger().error('init tasklist error:', error)
  }
}

async function init_levelList() {
  try {
    const list = require('../data/level')
    list.list.map(async item => {
      await Model.LevelList.create(item)
    })
  } catch (error) {
    admin_logger().error('init LevelList error:', error)
  }
}

async function init_systemConfig() {
  try {
    await Model.Config.create({})
  } catch (error) {
    admin_logger().error('init Config error:', error)
  }
}

async function init_groupList() {
  try {
    const data = [
      {
        label: 'all',
        code: 'all',
        sort: 0,
        selected: true,
      },
      {
        label: 'free',
        code: 'free',
        sort: 5,
      },
      {
        label: 'paid',
        code: 'paid',
        sort: 10,
      },
    ]
    data.forEach(async item => {
      await Model.Group.create(item)
    })  } catch (error) {
    admin_logger().error('init group error:', error)
  }
}

async function init_styleList() {
  try {
    const data = [
      {
        label: 'all',
        code: 'all',
        sort: 0,
        selected: true,
      },
      {
        label: 'hot',
        code: 'hot',
        sort: 5,
      },
      {
        label: 'cc',
        code: 'cc',
        sort: 10,
      },
    ]
    data.forEach(async item => {
      await Model.Style.create(item)
    })
  } catch (error) {
    admin_logger().error('init Config error:', error)
  }
}

async function init_languageList() {
  try {
    const data = [
      {
        label: 'all',
        code: 'all',
        sort: 0,
        selected: true,
      },
      {
        label: 'en',
        code: 'en',
        sort: 5,
      },
      {
        label: 'yny',
        code: 've',
        sort: 10,
      },
      {
        label: 'ta',
        code: 'ta',
        sort: 15,
      },
      {
        label: 'fp',
        code: 'fp',
        sort: 20,
      },
      {
        label: 'pg',
        code: 'pg',
        sort: 25,
      },
    ]
    data.forEach(async item => {
      await Model.Language.create(item)
    })
  } catch (error) {
    admin_logger().error('init language error:', error)
  }
}

async function init_countryList() {
  try {
    const data = [
      {
        flag: '',
        label: 'all',
        code: 'all',
        sort: 0,
        selected: true,
      },
      {
        flag: '🇵🇭',
        label: 'ph',
        code: 'ph',
        sort: 5,
      },
      {
        flag: '🇳🇬',
        label: 'ng',
        code: 'ng',
        sort: 10,
      },
      {
        flag: '🇻🇳',
        label: 'vn',
        code: 'vn',
        sort: 15,
      },
      {
        flag: '🇨🇦',
        label: 'ca',
        code: 'ca',
        sort: 20,
      },
      {
        flag: '🇧🇷',
        label: 'br',
        code: 'br',
        sort: 25,
      },
      {
        flag: '🇨🇴',
        label: 'co',
        code: 'co',
        sort: 30,
      },
      {
        flag: '🇺🇸',
        label: 'us',
        code: 'us',
        sort: 35,
      },
      {
        flag: '🇬🇭',
        label: 'gh',
        code: 'gh',
        sort: 40,
      },
      {
        flag: '🇨🇳',
        label: 'cn',
        code: 'cn',
        sort: 45,
      },
      {
        flag: '🇻🇪',
        label: 've',
        code: 've',
        sort: 50,
      },
      {
        flag: '🇮🇳',
        label: 'in',
        code: 'in',
        sort: 55,
      },
      {
        flag: '🇬🇧',
        label: 'gb',
        code: 'gb',
        sort: 60,
      },
      {
        flag: '🇸🇾',
        label: 'dy',
        code: 'dy',
        sort: 65,
      },
      {
        flag: '🇧🇩',
        label: 'bd',
        code: 'bd',
        sort: 70,
      },
      {
        flag: '🇯🇲',
        label: 'jm',
        code: 'jm',
        sort: 75,
      }
    ]
    data.forEach(async item => {
      await Model.Country.create(item)
    })
  } catch (error) {
    admin_logger().error('init country error:', error)
  }
}



async function init_anchorList() {
  try {
    const nameList = ['', 'Baby', 'Lady', 'Gaga', 'TL', 'Milk', 'Lucky', 'Cookie']
    const country = ['', 'us', 'cn', 'ng', 've', 'in', 'bd', 'jm']
    const language = ['', 'en', 've', 'ta', 'fp', 'pg', 'ta']
    for (let i = 0; i < 500; i ++) {
      const random1 = Math.ceil(Math.random() * 7)
      const random2 = Math.ceil(Math.random() * 7)
      const random3 = Math.ceil(Math.random() * 7)
      const random4 = Math.ceil(Math.random() * 7)
      const data = {
        name: `${nameList[random1]}${i + 1}`,
        age: random1 + 18,
        video: `/video/${random2}.mp4`,
        cover: `/image/${random3}.png`,
        style: Math.random() > 0.5 ? 'hot' : 'cc',
        group: Math.random() > 0.5 ? 'free' : 'paid',
        isCommend: Math.random() > 0.8 ? true : false,
        sort: i,
        country: country[random4],
        language: language[random4],
      }
      await Model.Anchor.create(data)
    }
  } catch (error) {
    admin_logger().error('init anchor error:', error)
  }
}

//----------------------------- private method --------------
// 配置日志输出
function admin_logger() {
  log4js.configure({
    appenders: {
      out: { type: 'console' },
      app: {
        type: 'dateFile',
        filename: './logs/admin/admin',
        pattern: 'yyyy-MM-dd.log',
        alwaysIncludePattern: true
      }
    },
    categories: {
      default: { appenders: ['out', 'app'], level: 'debug' }
    }
  })
  var logger = log4js.getLogger('admin')
  return logger
}

async function init_baseData() {
  await init_taskList();
  await init_levelList();
  await init_manager();
  await init_rewardList();
  await init_systemConfig();
  await init_anchorList()
  await init_groupList()
  await init_styleList()
  await init_languageList()
  await init_countryList()

  const config = await Model.Config.findAll()
  if (config) {
    console.log(config)
    return 'successful!'
  } else {
    return 'fail'
  }
}


module.exports = {
  init_manager,
  init_rewardList,
  init_systemConfig,
  init_taskList,
  init_levelList,
  init_baseData
}