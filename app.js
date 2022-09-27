const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const router = require('./router');
const app = express();

// 为客户端提供跨域资源请求
app.use(cors());
// 日志输出
app.use(morgan('dev'));
// 解析请求体
app.use(express.json());
app.use(express.urlencoded());

// 挂载路由
app.use('/api', router);

//设置端口号
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务已经开启,${PORT}端口监听中...`);
}) 