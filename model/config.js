/**
 * 用户配置表
 */

// 1、导入sequelize模块
const Sequelize = require('sequelize');
// 2、导入配置文件
const sqllize = require('../config/db.js');

// 3、创建数据模型
const configModel = sqllize.define('config', {
  username: {
    type: Sequelize.STRING(255), // 数据类型
    primaryKey: true // 主键
  },
  page_size: {
    type: Sequelize.INTEGER,
    defaultValue: 10
  },
  pronunciation_type: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  is_marked_only :{
    type: Sequelize.INTEGER,
    defaultValue: 0
  }
},{
  // 使用自定义表名
  freezeTableName: true,
  // 去掉默认的添加时间和更新时间
  timestamps: false,
})

module.exports = configModel;