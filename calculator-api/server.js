const express = require('express')
const app = express()
const PORT = 3000;
const HOST = 'localhost';

//bodyparser
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())

//math
const math= require('mathjs')

//redis
const redis = require("redis");
const client = redis.createClient({
    host : process.env.REDIS_HOST,
    port : process.env.REDIS_PORT,
    password : process.env.REDIS_PASSWORD,
    db : process.env.REDIS_DB,
    connect_timeout: 2000
});

client.on("error", function(error) {
  console.error(error);
  //throw new Error(error)
});

app.get('/ping',(req,res,next) => {
    res.json({
       message: "pong"
    })
})

app.post('/calculator', (req, res, next) => {
    const { args } = req.body
    // prepare message
    const key = Date.now()
    const value = math.evaluate(args)

    //put message on redis queue
    client.publish("math", 
      JSON.stringify({
        key: key,
        args: args,
        value: value
      }),(err, reply) => { 
          res.status(200).json(
            {
              result: value,
              queueStatus : err ? 500 : 200,
              message: err ? err.message : reply
            }
          )
      }
    );

    
})

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).json(
    { 
      message: err.message
    }
  )
})

app.listen(PORT, HOST);
console.log(`Calculator-api running on http://${HOST}:${PORT}`);
