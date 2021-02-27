const express = require('express')
const app = express()
const port = 3000

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
    db : process.env.REDIS_DB
});

client.on("error", function(error) {
  console.error(error);
});


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
      })
    );
    
    //respond to api
    res.status(200).json({
      value : value
    })
})

app.listen(port, () => {
  console.log(`calculator api listening at http://localhost:${port}`)
})