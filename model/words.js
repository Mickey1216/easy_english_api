/**
 * 单词表
 */

// 1、导入sequelize模块
const Sequelize = require('sequelize');
// 2、导入配置文件
const sqllize = require('../config/db.js');

// 3、创建数据模型
const wordsModel = sqllize.define('words', {
  word_id: { 
    type: Sequelize.INTEGER,
    autoIncrement: true, // 自增加
    primaryKey: true // 主键
  },
  word: {
    type: Sequelize.STRING(63),
    unique: true
  },
  pronunciation: {
    type: Sequelize.STRING(127)
  },
  explanation: {
    type: Sequelize.STRING(255)
  },
  sentence: {
    type: Sequelize.STRING(1023)
  },
  note: {
    type: Sequelize.STRING(511)
  },
  create_time: {
    type: Sequelize.DATE
  },
  belonging: {
    type: Sequelize.STRING(255)
  },
  mark: { 
    type: Sequelize.STRING(1),
    defaultValue: "0" // 默认值为"0"
  }
},{
  // 使用自定义表名
  freezeTableName: true,
  // 去掉默认的添加时间和更新时间
  timestamps: false,
})

module.exports = wordsModel;