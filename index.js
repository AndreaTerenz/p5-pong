var express = require("express")

var app = express()
app.use(express.static("public"))

var server = app.listen(3000, () => { console.log("Server started"); })

var io = require("socket.io")(server)
io.on("connect", (socket) => {
    console.log("New connection (ID: " + socket.id + ")")

    socket.emit("connection_data", {
        id: socket.id,
        room: socket.id
    })

    socket.on('disconnect', function(){
        console.log("Client " + socket.id + " disconnected");
    });
})

function get_room_size(socket_room) {
    var room_ref = io.sockets.adapter.rooms.get(socket_room)

    return (room_ref) ? room_ref.size : -1
}