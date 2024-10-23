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
        zh: '全部',
        sort: 1000,
        selected: true,
      },
      {
        label: 'free',
        code: 'free',
        zh: '免费',
        en: 'Free',
        sort: 10,
      },
      {
        label: 'paid',
        code: 'paid',
        en: 'Paid',
        zh: '付费',
        sort: 5,
      },
    ]
    data.forEach(async item => {
      await Model.Group.create(item)
    })  } catch (error) {
    admin_logger().error('init group error:', error)
  }
}


async function init_systemLanguageList() {
  try {
    const data = [
    
      {
        label: 'English',
        code: 'en',
        zh: '英语',
        sort: 10,
      },
      {
        label: '中文',
        code: 'zh',
        zh: '中文',
        sort: 5,
      },
    ]
    data.forEach(async item => {
      await Model.SystemLanguage.create(item)
    })  } catch (error) {
    admin_logger().error('init SystemLanguage error:', error)
  }
}


async function init_productList() {
  try {
    const data = [
      {
        score: 10000,
        price: 0.0001
      },
      {
        score: 30000,
        price: 1.99
      },
      {
        score: 80000,
        price: 3.99
      },
      {
        score: 200000,
        price: 7.99
      },
    ]
    data.forEach(async item => {
      await Model.Product.create(item)
    })  } catch (error) {
    admin_logger().error('init Product error:', error)
  }
}

async function init_styleList() {
  try {
    const data = [
      {
        label: 'all',
        code: 'all',
        zh: '全部',
        sort: 100,
        selected: true,
      },
      {
        label: 'hot',
        code: 'hot',
        zh: '热门聊天🔞',
        en: 'Hot Chat 🔞',
        sort: 50,
      },
      {
        label: 'cc',
        code: 'cc',
        zh: '休闲聊天',
        en: 'Leisure Chat',
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
        zh: '全部',
        sort: 100,
        selected: true,
      },
      {
        label: 'en',
        code: 'en',
        zh: '英语',
        en: 'English',
        sort: 100,
      },
      {
        label: 'yny',
        code: 've',
        zh: '越南语',
        en: 'Vietnamese',
        sort: 90,
      },
      {
        label: 'ta',
        code: 'ta',
        zh: '他加禄语',
        en: 'Tagalog',
        sort: 80,
      },
      {
        label: 'fp',
        code: 'fp',
        en: 'Filipino',
        zh: '菲律宾语',
        sort: 70,
      },
      {
        label: 'pg',
        code: 'pg',
        zh: '葡萄牙语',
        en: 'Portuguese',
        sort: 60,
      },
      {
        label: 'zh',
        code: 'zh',
        zh: '中文',
        en: 'Chinese',
        sort: 50,
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
        zh: '全部',
        sort: 200,
        selected: true,
      },
      {
        flag: '🇵🇭',
        label: 'ph',
        code: 'ph',
        zh: '菲律宾',
        en: 'Philippines',
        sort: 190,
      },
      {
        flag: '🇳🇬',
        label: 'ng',
        zh: '尼日利亚',
        en: 'Nigeria',
        code: 'ng',
        sort: 180,
      },
      {
        flag: '🇻🇳',
        label: 'vn',
        zh: '越南',
        en: 'Vietnam',
        code: 'vn',
        sort: 170,
      },
      {
        flag: '🇧🇷',
        label: 'br',
        zh: '巴西',
        en: 'Brazil',
        code: 'br',
        sort: 160,
      },
      {
        flag: '🇨🇴',
        label: 'co',
        zh: '哥伦比亚',
        en: 'Colombia',
        code: 'co',
        sort: 150,
      },
      {
        flag: '🇺🇸',
        label: 'us',
        zh: '美国',
        code: 'us',
        en: 'United States',
        sort: 140,
      },
      {
        flag: '🇨🇦',
        label: 'ca',
        zh: '加拿大',
        en: 'Canada',
        code: 'ca',
        sort: 130,
      },
      {
        flag: '🇬🇭',
        label: 'gh',
        zh: '加纳',
        code: 'gh',
        en: 'Ghana',
        sort: 120,
      },
      {
        flag: '🇨🇳',
        label: 'cn',
        zh: '中国',
        en: 'China',
        code: 'cn',
        sort: 110,
      },
      {
        flag: '🇻🇪',
        label: 've',
        zh: '委内瑞拉',
        en: 'Venezuela',
        code: 've',
        sort: 100,
      },
      {
        flag: '🇮🇳',
        label: 'in',
        zh: '印度',
        en: 'India',
        code: 'in',
        sort: 90,
      },
      {
        flag: '🇬🇧',
        label: 'gb',
        zh: '英国',
        en: 'britain',
        code: 'gb',
        sort: 80,
      },
      {
        flag: '🇸🇾',
        label: 'dy',
        en: 'Syria',
        code: 'dy',
        zh: '叙利亚',
        sort: 70,
      },
      {
        flag: '🇧🇩',
        label: 'bd',
        zh: '孟加拉国',
        en: 'Bangladesh',
        code: 'bd',
        sort: 60,
      },
      {
        flag: '🇯🇲',
        label: 'jm',
        en: 'Jamaica',
        zh: '牙买加',
        code: 'jm',
        sort: 50,
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
      const random3 = Math.ceil(Math.random() * 18)
      const random4 = Math.ceil(Math.random() * 7)
      const data = {
        name: `${nameList[random1]}${i + 1}`,
        age: random1 + 18,
        home_cover: `/image/${random3}.png`,
        avatar: `/image/${random3}.png`,
        video: `/video/${random3}.mp4`,
        cover: `/video/${random3}.mp4`,
        style: Math.random() > 0.5 ? 'hot' : 'cc',
        group: Math.random() > 0.5 ? 'free' : 'paid',
        isCommend: Math.random() > 0.8 ? true : false,
        heart: 302 * random1,
        comment: 211 * random1,
        time: 6584 * random1,
        fens: 6542 * random3,
        return: 33 * random3,
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
  await init_systemLanguageList()
  await init_productList()


  const config = await Model.Config.findAll()
  if (config) {
    console.log(config)
    return 'successful!'
  } else {
    return 'fail'
  }
}


module.exports = {
  init_baseData,
}