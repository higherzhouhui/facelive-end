const { DataTypes } = require('sequelize')
const db = require('./database')

/** 问卷问题表 */
const QuestionList = db.sequelize.define(
  'questionlist',
  {
    title: { type: DataTypes.STRING },
    open: { type: DataTypes.BOOLEAN },
    creator: { type: DataTypes.STRING },
  },
  {
    tableName: 'questionlist',
  }
)

const Question = db.sequelize.define(
  'question',
  {
    title: { type: DataTypes.STRING },
    type: { type: DataTypes.STRING },
    sort: { type: DataTypes.INTEGER },
    relate: { type: DataTypes.INTEGER },
    question_list_id: { type: DataTypes.INTEGER },
  },
  {
    tableName: 'question',
  }
)


const Option = db.sequelize.define(
  'option',
  {
    title: { type: DataTypes.STRING },
    proportion: { type: DataTypes.INTEGER },
    sort: { type: DataTypes.INTEGER },
    question_id: { type: DataTypes.INTEGER },
    question_list_id: { type: DataTypes.INTEGER },
  },
  {
    tableName: 'option',
  }
)

const Channel = db.sequelize.define(
  'channel',
  {
    title: { type: DataTypes.STRING },
    is_h5: { type: DataTypes.STRING },
  },
  {
    tableName: 'channel',
  }
)

const Manager = db.sequelize.define(
  'manger',
  {
    account: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING },
    last_login: { type: DataTypes.DATE },
    name: { type: DataTypes.STRING },
    avatar: { type: DataTypes.STRING },
  },
  {
    tableName: 'manger',
  }
)

const Captcha = db.sequelize.define(
  'captcha',
  {
    phone: { type: DataTypes.STRING },
    code: { type: DataTypes.STRING },
  },
  {
    tableName: 'captcha',
  }
)

const Result = db.sequelize.define(
  'result',
  {
    phone: { type: DataTypes.STRING },
    begin_time: { type: DataTypes.BIGINT },
    end_time: { type: DataTypes.BIGINT },
    is_complete: { type: DataTypes.BOOLEAN },
    channel: { type: DataTypes.INTEGER },
    question_list_id: { type: DataTypes.INTEGER },
    question_id: { type: DataTypes.STRING },
    option_id: { type: DataTypes.STRING },
  },
  {
    tableName: 'result',
  }
)

module.exports = {
  Manager,
  Channel,
  QuestionList,
  Question,
  Option,
  Captcha,
  Result,
}
