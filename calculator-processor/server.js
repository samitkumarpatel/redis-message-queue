const express = require('express')
const app = express()
const PORT = 3001;
const HOST = '0.0.0.0';

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
    db : process.env.REDIS_DB,
    connect_timeout: 2000
});

client.on("error", function(error) {
  console.error(error);
});

//mongo
const MongoClient = require('mongodb').MongoClient;
const mongo_host = process.env.MONGODB_HOST || "localhost"
const mongo_port = process.env.MONGODB_PORT || "27017"
const url = 'mongodb://'+mongo_host+':'+process.env.MONGODB_PORT+'/math';

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

app.listen(PORT, HOST);
console.log(`Calculator-processor running on http://${HOST}:${PORT}`);