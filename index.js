var express = require("express")

var app = express()
app.use(express.static("public"))

var server = app.listen(3000, () => { console.log("Server started"); })

var io = require("socket.io")(server)
var next_room = 0

io.on("connect", (socket) => {
    var socket_room = "room"+(next_room)
    socket.join(socket_room)

    console.log("New connection (ID: " + socket.id + " - room: " + socket_room + ")")

    socket.emit("connection_data", {
        id: socket.id,
        opponent: undefined,
        room: socket_room
    })

    if (get_room_size(socket_room) >= 2) {
        console.log("Two clients have joined room " + socket_room)
        io.to(socket_room).emit("room_filled", Array.from(io.sockets.adapter.rooms.get(socket_room)))
        next_room += 1
    }

    socket.on('disconnect', function(){
        console.log("Client " + socket.id + " disconnected");
    });
})

function get_room_size(socket_room) {
    var room_ref = io.sockets.adapter.rooms.get(socket_room)

    return (room_ref) ? room_ref.size : -1
}