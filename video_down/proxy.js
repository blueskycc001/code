const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 3001;

// 启用CORS
app.use(cors());

// 视频代理
app.get('/proxy/video', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).send('URL参数缺失');
    }

    console.log('代理视频请求:', url);
    
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream',
      headers: {
        'Referer': 'https://www.douyin.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // 设置响应头
    Object.keys(response.headers).forEach(key => {
      res.setHeader(key, response.headers[key]);
    });

    // 设置内容类型
    res.setHeader('Content-Type', 'video/mp4');
    
    // 流式传输响应
    response.data.pipe(res);
  } catch (error) {
    console.error('视频代理错误:', error.message);
    res.status(500).send(`代理请求失败: ${error.message}`);
  }
});

// 图片代理
app.get('/proxy/image', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).send('URL参数缺失');
    }

    console.log('代理图片请求:', url);
    
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream',
      headers: {
        'Referer': 'https://www.douyin.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // 设置响应头
    Object.keys(response.headers).forEach(key => {
      res.setHeader(key, response.headers[key]);
    });

    // 设置内容类型
    res.setHeader('Content-Type', 'image/jpeg');
    
    // 流式传输响应
    response.data.pipe(res);
  } catch (error) {
    console.error('图片代理错误:', error.message);
    res.status(500).send(`代理请求失败: ${error.message}`);
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`代理服务器运行在 http://localhost:${port}`);
});