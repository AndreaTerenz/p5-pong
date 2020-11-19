var express = require("express")

var app = express()
app.use(express.static("public"))

var server = app.listen(3000, () => { console.log("Server started"); })

var io = require("socket.io")(server)

var room_count = 1
var rooms_set = (new Set()).add("room_" + room_count)
var rooms_iter = rooms_set.values()
var next_room = rooms_iter.next().value
rooms_set.delete(next_room)

io.on("connect", (socket) => {
    var socket_room = next_room
    socket.join(socket_room)

    console.log("New connection (ID: " + socket.id + " - room: " + socket_room + ")")

    socket.emit("connection_data", {
        id: socket.id,
        opponent: undefined,
        room: socket_room
    })

    if (get_room_size(socket_room) >= 2) {
        console.log("Two clients have joined room [" + socket_room + "]")
        io.to(socket_room).emit("room_filled", Array.from(io.sockets.adapter.rooms.get(socket_room)))

        if (rooms_set.size == 0) {
            room_count += 1
            rooms_set.add("room_" + room_count)
        }
        
        next_room = rooms_iter.next().value
        rooms_set.delete(next_room)
    }

    socket.on('disconnect', function(){
        console.log("Client " + socket.id + " disconnected");

        rooms_set.add(socket_room)
    });
})

function get_room_size(socket_room) {
    var room_ref = io.sockets.adapter.rooms.get(socket_room)

    return (room_ref) ? room_ref.size : -1
}

