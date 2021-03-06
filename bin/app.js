var express = require("express")
var logger = require('morgan')

var app = express()

app.use(logger("dev"))
app.use(express.static("public"))

var port = 3500
var server = app.listen(port, () => console.log("Server listening on port " + port))

require("./socket.js")(server)

process.on('SIGINT', () => { 
    console.log("\033[0GExiting") 
    process.exit()
});

