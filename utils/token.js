/**
 * jsonwebtoken是用来生成token给客户端的
 * express-jwt是用来验证token的
 */

const jwt = require('jsonwebtoken');
const signkey = 'mes_qdhd_mobile_xhykjyxgs'; // 自定义秘钥

// 生成token
exports.setToken = function (username) {
  return new Promise((resolve, reject) => {
    // 用户名，signkey:自定义秘钥，expiresIn:失效时间
    const token = jwt.sign({ username }, signkey, { expiresIn: 60 * 60 * 24 * 7 });
    resolve(token);
  })
}

// 验证token
exports.checkToken = async function (token, username, res) {
  let tokenInvalidFlag = false;

  return jwt.verify(token, signkey, (error, decoded) => {
    if (!error && decoded.username === username)
      tokenInvalidFlag = true

    if (!tokenInvalidFlag) {
      res.send({
        flag: false,
        msg: "token invalid"
      });
      return false;
    }

    return true;
  });
}
