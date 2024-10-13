const { DataTypes } = require('sequelize')
const db = require('./database')
/** 用户表 */
const User = db.sequelize.define(
  'user',
  {
    authDate: { type: DataTypes.STRING, defaultValue: '' },
    chatInstance: { type: DataTypes.STRING, defaultValue: '' },
    hash: { type: DataTypes.STRING },
    query_id: { type: DataTypes.STRING },
    addedToAttachmentMenu: { type: DataTypes.STRING },
    allowsWriteToPm: { type: DataTypes.BOOLEAN },
    firstName: { type: DataTypes.STRING },
    user_id: { type: DataTypes.BIGINT },
    languageCode: { type: DataTypes.STRING },
    lastName: { type: DataTypes.STRING },
    username: { type: DataTypes.STRING },
    score: { type: DataTypes.DOUBLE, defaultValue: 0 },
    isPremium: { type: DataTypes.BOOLEAN, defaultValue: false },
    startParam: { type: DataTypes.STRING, defaultValue: '0' },
    photoUrl: { type: DataTypes.STRING },
    invite_friends_score: { type: DataTypes.BIGINT, defaultValue: 0 },
    invite_friends_game_score: { type: DataTypes.BIGINT, defaultValue: 0 },
    check_score: { type: DataTypes.BIGINT, defaultValue: 0 },
    task_score: { type: DataTypes.BIGINT, defaultValue: 0 },
    bind_wallet_score: { type: DataTypes.BIGINT, defaultValue: 0 },
    check_date: { type: DataTypes.STRING, defaultValue: '' },
    ticket: { type: DataTypes.BIGINT, defaultValue: 10 },
    wallet: { type: DataTypes.STRING },
    is_Tg: { type: DataTypes.BOOLEAN, defaultValue: true },
    is_New: { type: DataTypes.BOOLEAN, defaultValue: true },
    last_play_time: { type: DataTypes.DATE },
    level: { type: DataTypes.INTEGER, defaultValue: 1},
    follow_anchor: { type: DataTypes.STRING },
    chat_anchor: { type: DataTypes.STRING },
  },
  {
    tableName: 'user',
    indexes: [
      {
        unique: true,
        fields: ['user_id']
      }
    ]
  }
)
// User.sync({ alter: true })


/** 签到奖励列表  */
const CheckInReward = db.sequelize.define(
  'CheckInReward',
  {
    day: { type: DataTypes.INTEGER },
    ticket: { type: DataTypes.INTEGER },
    score: { type: DataTypes.INTEGER }
  },
  {
    tableName: 'CheckInReward'
  }
)

// CheckInReward.sync({ alter: true })


/** 任务列表  */
const TaskList = db.sequelize.define(
  'tasklist',
  {
    name: { type: DataTypes.STRING },
    link: { type: DataTypes.STRING },
    linkType: { type: DataTypes.STRING },
    score: { type: DataTypes.INTEGER },
    ticket: { type: DataTypes.INTEGER },
    type: { type: DataTypes.STRING },
  },
  {
    tableName: 'tasklist'
  }
)

// TaskList.sync({ alter: true })

/** 全局配置  */
const Config = db.sequelize.define(
  'config',
  {
    right_score: { type: DataTypes.INTEGER, defaultValue: 10 },
    free_gas: { type: DataTypes.INTEGER, defaultValue: 3 },
    ticket: { type: DataTypes.INTEGER, defaultValue: 10 },
    auto_driver: { type: DataTypes.INTEGER, defaultValue: 750 },
    invite_friends_ratio: { type: DataTypes.INTEGER, defaultValue: 10 },
    invite_friends_score: { type: DataTypes.INTEGER, defaultValue: 5000 },
    recovery_time: { type: DataTypes.INTEGER, defaultValue: 90 },
    bind_wallet_score: { type: DataTypes.INTEGER, defaultValue: 3000 },
    tg_link: { type: DataTypes.STRING, defaultValue: 'https://t.me/face_live_bot' },
  },
  {
    tableName: 'config'
  }
)
// Config.sync({ force: true })
// Config.create({})
/** 操作日志  */
const Event = db.sequelize.define(
  'event',
  {
    type: { type: DataTypes.STRING },
    score: { type: DataTypes.INTEGER, defaultValue: 0 },
    from_user: { type: DataTypes.BIGINT },
    from_username: { type: DataTypes.STRING, defaultValue: 'system' },
    to_user: { type: DataTypes.BIGINT, defaultValue: 0 },
    to_username: { type: DataTypes.STRING, defaultValue: 'system' },
    desc: { type: DataTypes.STRING },
    ticket: { type: DataTypes.INTEGER, defaultValue: 0 },
    guessType: { type: DataTypes.STRING },
    result: { type: DataTypes.STRING },
    symbol: { type: DataTypes.STRING, defaultValue: 'BTC' },
    count: { type: DataTypes.INTEGER, defaultValue: 0 },
    gas_add: { type: DataTypes.DATE },
    count_begin: { type: DataTypes.DATE },
    is_really: { type: DataTypes.BOOLEAN, defaultValue: true }
  },
  {
    tableName: 'event'
  }
)

// Event.sync({ alter: true })


/** 国家  */
const Country = db.sequelize.define(
  'country',
  {
    label: { type: DataTypes.STRING },
    flag: { type: DataTypes.STRING },
    code: { type: DataTypes.STRING },
    sort: { type: DataTypes.INTEGER },
    selected: { type: DataTypes.BOOLEAN, defaultValue: false }
  },
  {
    tableName: 'country'
  }
)

/** 语言  */
const Language = db.sequelize.define(
  'language',
  {
    label: { type: DataTypes.STRING },
    code: { type: DataTypes.STRING },
    sort: { type: DataTypes.INTEGER },
    selected: { type: DataTypes.BOOLEAN, defaultValue: false }
  },
  {
    tableName: 'language'
  }
)

/** 风格  */
const Style = db.sequelize.define(
  'style',
  {
    label: { type: DataTypes.STRING },
    code: { type: DataTypes.STRING },
    sort: { type: DataTypes.INTEGER },
    selected: { type: DataTypes.BOOLEAN, defaultValue: false }
  },
  {
    tableName: 'style'
  }
)

/** 群组  */
const Group = db.sequelize.define(
  'group',
  {
    label: { type: DataTypes.STRING },
    code: { type: DataTypes.STRING },
    sort: { type: DataTypes.INTEGER },
    selected: { type: DataTypes.BOOLEAN, defaultValue: false }
  },
  {
    tableName: 'group'
  }
)

/** 主播  */
const Anchor = db.sequelize.define(
  'anchor',
  {
    name: { type: DataTypes.STRING },
   
    coin: { type: DataTypes.INTEGER, defaultValue: 500 },
    video: { type: DataTypes.STRING },
    heart: { type: DataTypes.INTEGER, defaultValue: 5000 },
    sort: { type: DataTypes.INTEGER, defaultValue: 0 },
    star: { type: DataTypes.INTEGER, defaultValue: 5 },
    time: { type: DataTypes.INTEGER, defaultValue: 50000 },
    fens: { type: DataTypes.INTEGER, defaultValue: 50000 },
    return: { type: DataTypes.INTEGER, defaultValue: 500 },
    comments: { type: DataTypes.INTEGER, defaultValue: 300 },
    age: { type: DataTypes.INTEGER },
    country: { type: DataTypes.STRING, defaultValue: 'us' },
    language: { type: DataTypes.STRING, defaultValue: 'en' },
    style: { type: DataTypes.STRING },
    group: { type: DataTypes.STRING },
    cover: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING,  defaultValue: 'onLine'},
    isCommend:  { type: DataTypes.BOOLEAN, defaultValue: false },
    channel:  { type: DataTypes.STRING, defaultValue: '' },
  },
  {
    tableName: 'anchor'
  }
)

/** Manager */
const Manager = db.sequelize.define(
  'manager',
  {
    account: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING },
    token: { type: DataTypes.STRING },
  },
  {
    tableName: 'manager'
  }
)
// Manager.sync({ alter: true })

/** UserTask */
const UserTask = db.sequelize.define(
  'usertask',
  {
    task_id: { type: DataTypes.INTEGER },
    status: { type: DataTypes.STRING, default: 'start' },
    user_id: { type: DataTypes.BIGINT },
  },
  {
    tableName: 'usertask'
  }
)

// UserTask.sync({ alter: true })

/** UserTask */
const LevelList = db.sequelize.define(
  'levellist',
  {
    level: { type: DataTypes.INTEGER },
    score: { type: DataTypes.BIGINT },
    name: { type: DataTypes.STRING },
  },
  {
    tableName: 'levellist'
  }
)
// LevelList.sync({ alter: true })

module.exports = {
  User,
  Config,
  Event,
  Manager,
  CheckInReward,
  TaskList,
  UserTask,
  LevelList,
  Anchor,
  Country,
  Language,
  Style,
  Group
}
