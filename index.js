require('dotenv').config()
const express = require('express')
const jsonParser = require('body-parser').json()
const path = require('path')
const shortid = require('shortid')
const WebSocket = require('ws');
const http = require('http')

// Redis setup
const rtg = require("url").parse(process.env.REDISTOGO_URL)
const redis = require("redis").createClient(rtg.port, rtg.hostname)
redis.auth(rtg.auth.split(":")[1])
const { promisify } = require("util")
const redisGet = promisify(redis.get).bind(redis)
const redisSet = promisify(redis.set).bind(redis)

const app = express()

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')))

// Put all API endpoints under '/api'
app.get('/api/game/create', (req, res) => {
  let gameCode = shortid.generate()
  if (process.env.NODE_ENV === 'development') {
    res.json('sr8kOcHM9')
  } else {
    redisSet(gameCode, '').then(status => {
      res.json(gameCode)
    })
  }
})

app.get('/api/game/get/:gameCode', jsonParser, (req, res) => {
  redisGet(req.params.gameCode).then(gameState => {
    if (!gameState) {
      res.sendStatus(404)
    } else {
      res.json(gameState)
    }
  })
})

app.post('/api/game/update', jsonParser, (req, res) => {
  redisSet(req.body.gameCode, JSON.stringify(req.body)).then(status => {
    res.sendStatus(200)
  })
})

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'))
})

const server = http.createServer(app);
server.listen(process.env.PORT || 5000)

const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {
  console.log('connection')
  ws.on('message', function incoming(data) {
    console.log('message')
    redisSet(JSON.parse(data).gameCode, data).catch(console.log)
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });
});