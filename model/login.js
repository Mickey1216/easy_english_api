/**
 * 用户信息表
 */

// 1、导入sequelize模块
const Sequelize = require('sequelize');
// 2、导入配置文件
const sqllize = require('../config/db.js');

// 3、创建数据模型
const userModel = sqllize.define("login", {
  username: {
    type: Sequelize.STRING(255),
    primaryKey: true 
  },
  email: {
    type: Sequelize.STRING(255),
    validate: {
      // 格式必须为 邮箱格式
      isEmail: true,
    }
  },
  password: {
    type: Sequelize.STRING(255)
  },
  is_active:{
    type: Sequelize.INTEGER(1),
    defaultValue: 1 // 默认值为1
  },
  create_time: {
    type: Sequelize.DATE
  }
},{
  // 使用自定义表名
  freezeTableName: true,
  // 去掉默认的添加时间和更新时间
  timestamps: false,
})

module.exports = userModel;