const express = require('express')
const app = express()
const port = 3001

//bodyparser
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())
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

//mongo
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/math';

client.on("message", function(channel, message) {
    console.log("Subscriber received message in channel '" + channel + "': " + message);
    /*
        store that mongodb
        {
            "id": "",
            "date" : "",
            "expression" : "",
            "result" : ""
        }
    */ 
    const m = JSON.parse(message)
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
        if(err)
            console.error(err)

        db.db("math").collection('user').insertMany([
            {
                date: m.key,
                expression: m.args,
                result: m.value
            }
        ],(e,r) => {
            console.table(r.ops)
            db.close()
        })  
    })

}); 
client.subscribe("math");

app.listen(port, () => {
    console.log(`calculator processor listening at http://localhost:${port}`)
})