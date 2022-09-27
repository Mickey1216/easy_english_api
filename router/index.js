const express = require('express');
const router = express.Router();
// sequelize-orm框架
const sequelize = require('sequelize');
const Op = sequelize.Op;
// 模型
const User = require('../model/login.js');
const Config = require('../model/config.js');
const Words = require('../model/words.js');
// token 
const Ctoken = require('../utils/token.js');

const multiparty = require('multiparty');
const fs = require("fs");
const path = require("path");

// 头像上传基地址
const avatarUploadBasePath = 
  path.join(__dirname.substring(0, __dirname.lastIndexOf('\\')), "upload", "avatar");

// -------------------------------------
/**
 * 用户配置相关路由（config表）/api/config
 */
// 将用户名添加进入config表 /config/add
router.post('/config/add', (req, res) => {
  let { username } = req.body;
  Config.create({
    username
  }).then(data => {
    res.status(200).json({
      flag: true,
      msg: 'ok'
    });
  }).catch(err => {
    res.status(500).send({
      flag: false,
      msg: err
    });
  })
})

// 读取用户配置信息 /config/load
router.post('/config/load', async (req, res) => {
  let { username, token } = req.body;
  // 当需要token验证时，加入这行代码
  if (!await Ctoken.checkToken(token, username, res)) // token验证失败
    return;

  Config.findOne({
    where: {
      username
    }
  }).then(data => {
    let { page_size, pronunciation_type, is_marked_only } = data.dataValues
    res.status(200).json({
      flag: true,
      msg: 'ok',
      configs:{
        page_size,
        pronunciation_type,
        is_marked_only
      }
    })
  }).catch(err => {
    res.status(500).send({
      flag: false,
      msg: err
    })
  })
})

// 修改用户配置信息表的page_size字段  /config/update/page_size
router.patch('/config/update/page_size', async (req, res) => {
  let { username, token, limit } = req.body;
  if (!await Ctoken.checkToken(token, username, res)) // token验证失败
    return;

  Config.update({ page_size: limit }, {
    where: {
      username
    }
  }).then(data => {
    res.status(200).json({
      flag: true,
      msg: 'ok'
    })
  }).catch(err => {
    res.status(500).send({
      flag: false,
      msg: err
    })
  });
})

// 修改用户配置信息表的pronunciation_type字段  /config/update/pronunciation_type
router.patch('/config/update/pronunciation_type', async (req, res) => {
  let { username, token, pronunciationType } = req.body;
  if (!await Ctoken.checkToken(token, username, res)) // token验证失败
    return;
  
  Config.update({ pronunciation_type: pronunciationType }, {
    where: {
      username
    }
  }).then(data => {
    res.status(200).json({
      flag: true,
      msg: 'ok'
    })
  }).catch(err => {
    res.status(500).send({
      flag: false,
      msg: err
    })
  });
})

// 修改用户配置信息表的is_marked_only字段  /config/update/is_marked_only
router.patch('/config/update/is_marked_only', async (req, res) => {
  let { username, token, markedType } = req.body;
  if (!await Ctoken.checkToken(token, username, res)) // token验证失败
    return;

  Config.update({ is_marked_only: markedType }, {
    where: {
      username
    }
  }).then(data => {
    res.status(200).json({
      flag: true,
      msg: 'ok'
    })
  }).catch(err => {
    res.status(500).send({
      flag: false,
      msg: err
    })
  });
})


// -------------------------------------
/**
 * 用户信息相关路由（login表）/api/user
 */
// 用户登录接口 /user/login
router.post('/user/login', (req, res) => {
  let { username, password } = req.body;
  User.findOne({
    where: {
      username,
      password
    }
  }).then(async data => {
    let token = await Ctoken.setToken(username);
    res.status(200).json({
      username: data.username,
      flag: true,
      msg: "ok",
      token
    });
  }).catch(err => {
    res.status(500).send({
      flag: false,
      msg: err
    });
  })
})

// 用户注册接口 /user/register
router.post('/user/register', (req, res) => {
  let { username, email, password } = req.body;
  User.create({
    username,
    email,
    password,
    // is_active: 1,
    create_time: new Date()
  }).then(result => {
    res.status(200).json({
      flag: true,
      msg: "ok",
    });
  }).catch(err => {
    res.status(500).send({
      flag: false,
      msg: err,
    })
  });
})

// 头像上传接口 /user/upload/avatar
router.post("/user/upload/avatar", (req, res) => {
  let form = new multiparty.Form()
  form.parse(req, async (err, fields, files) => {
    // 解析formData
    let username = fields.username[0]
    let token = fields.token[0]

    if (!await Ctoken.checkToken(token, username, res)) // token验证失败
      return; 

    let file = files.file[0]
    if (!file)
      res.send({
        flag: false,
        msg: "无上传的头像文件"
      })
    
    // 获取图片后缀名  
    const suffix = file.originalFilename.substring(file.originalFilename.lastIndexOf('.'));
    // 头像存储地址
    const avatarNewPath = path.join(avatarUploadBasePath, username + suffix);

    // 将头像地址从缓存拷贝到存储地址
    let rs = fs.createReadStream(file.path);
    let ws = fs.createWriteStream(avatarNewPath);
    rs.pipe(ws);
    // 删除缓存中的头像
    rs.on("end", () => {
      fs.unlinkSync(file.path);
    })

    res.json({
      flag: true,
      msg: "ok"
    })
  })
})

// 加载头像的接口 /user/load/avatar
router.post("/user/load/avatar", (req, res) => {
  let { username } = req.body;

  // 读取头像文件的上传地址
  fs.readdir(avatarUploadBasePath, (err, files) => {
    if (err){
      res.send({
        flag: false,
        msg: err
      })
      return
    }
    
    // 遍历头像文件
    for(let file of files) {
      if (file.substring(0, file.lastIndexOf('.')) === username){ // 判断是否为本人头像
        // 头像地址
        const avatarPath = path.join(avatarUploadBasePath, file);
        fs.readFile(avatarPath, (err, data) => {
          if (err)
            res.send({
              flag: false,
              msg: err
            })
          else
            res.send({
              flag: true,
              msg: "ok",
              avatarRaw: new Buffer.from(data).toString("base64") // 将头像传给前端，base64编码
            })
        })
        return
      }
    }

    // 没有头像的情况
    res.send({
      flag: false,
      msg: "无头像"
    })
  })
})


// -------------------------------------
/**
 * 单词相关路由（words表）/api/words
 */
// 添加新单词 /words/add
router.post("/words/add", async (req, res) => {
  let { username, token, word, pronunciation, explanation, sentence, note, mark } = req.body;
  if (!await Ctoken.checkToken(token, username, res)) // token验证失败
    return;
  
  // 检查某个用户下某单词是否已经存在  
  Words.findOne({
    where: {
      word,
      belonging: username,
    }
  }).then(data => {
    if (data){ // 单词已经存在
      res.status(200).send({
        flag: false,
        msg: "the word exists" 
      })
    }else{
      // 创建单词
      Words.create({
        word,
        pronunciation,
        explanation,
        sentence,
        note,
        create_time: new Date(),
        belonging: username,
        mark
      }).then(data => {
        res.status(200).json({
          flag: true,
          msg: 'ok' 
        })
      }).catch(err => {
        res.status(500).send({
          flag: false,
          msg: err 
        })
      });
    }
  }).catch(err => {
    res.status(500).send({
      flag: false,
      msg: err 
    })
  })
})

// 修改单词信息（多个字段，所以用put方法） /words/update
router.put('/words/update', async (req, res) => {
  let { username, token, word, pronunciation, explanation, sentence, note } = req.body;
  if (!await Ctoken.checkToken(token, username, res)) // token验证失败
    return;
  
  Words.update({ pronunciation, explanation, sentence, note }, {
    where: {
      belonging: username,
      word
    }
  }).then(data => {
    res.status(200).json({
      flag: true,
      msg: 'ok'
    })
  }).catch(err => {
    res.status(500).send({
      flag: false,
      msg: err
    })
  });
})

// 删除单词（可能单个，可能多个） /words/del
router.delete("/words/del", async (req, res) => {
  let { username, token, words } = req.body;
  if (!await Ctoken.checkToken(token, username, res)) // token验证失败
    return;
  
  words = JSON.parse(words); // 此时words是数组类型
  let word = []; // 存储要删除的单词
  words.forEach(item => {
    word.push(item["word"]);
  })

  Words.destroy({
    where: { 
      word,
      belonging: username
    }
  }).then(data => {
    res.status(200).json({
      flag: true,
      msg: 'ok'
    })
  }).catch(err => {
    console.log(err);
    res.status(500).send({
      flag: false,
      msg: err
    })
  });
})

// 获取单词集 /words
router.post("/words", async (req, res) => {
  let { offset, limit, markOnly } =  req.query;
  let { username, token } = req.body;
  if (!await Ctoken.checkToken(token, username, res)) // token验证失败
    return;

  offset = parseInt(offset);
  limit = parseInt(limit);

  Words.findAndCountAll({
    offset: offset * limit,
    limit,
    where: {
      belonging: username,
      mark: { // 当markOnly为0时，表示加载所有单词；当markOnly为1时，表示加载标记单词
        [Op.or]: (markOnly === '0' ? ['1', '0'] : ['1'])
      } 
    }
  }).then(data => {
    res.status(200).json({
      flag: true,
      msg: "ok",
      words: data.rows
    })
  }).catch(err => {
    res.status(500).send({
      flag: false,
      msg: err
    })
  })  
})

// 修改单词标记信息（单个字段，所以用patch方法） /words/mark
router.patch('/words/mark', async (req, res) => {
  let { username, token, word, mark } = req.body;
  if (!await Ctoken.checkToken(token, username, res)) // token验证失败
    return; 

  Words.update({ mark }, {
    where: {
      word,
      belonging: username
    }
  }).then(data => {
    res.status(200).json({
      flag: true,
      msg: 'ok'
    })
  }).catch(err => {
    res.status(500).send({
      flag: false,
      msg: err
    })
  });
})

// 获取待复习的单词 /words/review
router.post('/words/review', async (req, res) => {
  // type：string类型 [0,1]：所有，[0]：未标记，[1]：标记    random：string类型 1：随机 0：顺序
  let { username, token, number, type, random } = req.body;
  type = JSON.parse(type); // 将type转为数组类型
  if (!await Ctoken.checkToken(token, username, res)) // token验证失败
    return;

   Words.findAll({
    limit: parseInt(number),
    order: random === '1' ? [sequelize.fn("RAND")] : [["word_id", "ASC"]], // 随机排序/顺序排序
    where: {
      belonging: username,
      mark: {
        [Op.or]: type.length === 2 ? ['0', '1'] : [type[0].toString()] // 所有/标记/未标记
      }
    }
   }).then(data => {
     let rets = new Array();
     data.forEach(word => {
      rets.push(word.dataValues)
     })

     res.json({
       flag: true,
       msg: "ok",
       words: rets
     })
   }).catch(err => {
     res.send({
       flag: false,
       msg: err
     })
   })
})

// 获取单词总个数 /words/number
router.post('/words/number', async (req, res) => {
  let { username, token } = req.body;
  if (!await Ctoken.checkToken(token, username, res)) // token验证失败
    return;

  Words.findAndCountAll({
    where:{
      belonging: username
    }
  }).then(data => {
    res.json({
      flag: true,
      msg: "ok",
      words_number: data.count // 总数
    })
  }).catch(err => {
    res.send({
      flag: false,
      msg: err
    })
  })
})

module.exports = router;
