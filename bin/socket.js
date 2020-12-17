var usernames = {}

module.exports = function (server) {
    var io = require("socket.io")(server)

    io.on("connect", (socket) => {
        var socket_room = undefined
        var username = undefined
        var room_confirmed = false

        console.log("New connection (ID: " + socket.id + ")")

        socket.on("user_data", (data) => {

            let refusal_reason = undefined

            if (!data.room) refusal_reason = "NO_ROOM"
            else {
                let size = get_room_size(data.room)
                if (data.mode == "create" && size > 0)
                    refusal_reason = "ROOM_EXISTS"
                else if (data.mode == "join") {
                    if (size < 1) refusal_reason = "ROOM_NOT_EXISTS"
                    else if (size > 1) refusal_reason = "ROOM_FULL"
                }
            }

            room_confirmed = (refusal_reason == undefined)

            if (!room_confirmed) {
                socket.emit("room_refused", refusal_reason)
                return
            }

            socket_room = data.room

            socket.emit("room_confirmed", socket_room)
            socket.join(socket_room)
            username = data.name

            if (!usernames[socket_room])
                usernames[socket_room] = []
            usernames[socket_room].push(username)

            console.log("Registered user " + username + " in room " + socket_room)

            if (get_room_size(socket_room) >= 2) {
                console.log("Two clients have joined room [" + socket_room + "]")

                let n = usernames[socket_room]
                let i = Array.from(io.sockets.adapter.rooms.get(socket_room))

                io.to(socket_room).emit("room_filled", {
                    names: n,
                    ids: i
                })
            }
        })

        socket.on("scored", (score) => {
            console.log("Client " + socket.id + " scored");
            socket.to(socket_room).emit("opp_scored", score)
        })

        socket.on("won", (id) => {
            console.log("Client " + id + " won");
            socket.to(socket_room).emit("opp_won", id)
        })

        socket.on('disconnect', () => {
            console.log("Client " + socket.id + " disconnected");

            if (room_confirmed) {
                removeClientFromRoom(socket, socket_room, username)
            }
        });

        socket.on('quit', () => {
            console.log("Client " + socket.id + " left its room");

            if (room_confirmed) {
                socket.leave(socket_room)

                removeClientFromRoom(socket, socket_room, username)
            }
        });

        socket.on('moved', (delta) => {
            //console.log("Client " + socket.id + " moved by :" + delta);
            socket.to(socket_room).emit("opp_moved", delta)
        })
    })
    
    function get_room_size(socket_room) {
        var room_ref = io.sockets.adapter.rooms.get(socket_room)

        return (room_ref) ? room_ref.size : -1
    }

    function removeClientFromRoom(socket, room, username) {
        usernames[room].splice(usernames[room].indexOf(username), 1)
    
        if (get_room_size(room) < 1) {
            console.log("Room " + room + " has emptied")
        } else {
            socket.to(room).emit("opp_left")
        }
    }
}

