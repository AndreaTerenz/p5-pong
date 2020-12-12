module.exports = function (server) {
    var io = require("socket.io")(server)

    var usernames = {}

    io.on("connect", (socket) => {
        var socket_room = undefined
        var username = undefined

        console.log("New connection (ID: " + socket.id + ")")

        socket.on("user_data", (data) => {

            let refusal_reason = undefined

            if (!data.room) {
                refusal_reason = "NO_ROOM"
            } else if (data.mode == "create" && get_room_size(data.room) > 0) {
                refusal_reason = "ROOM_EXISTS"
            } else if (data.mode == "join" && get_room_size(data.room) != 1) {
                refusal_reason = "ROOM_FULL"
            }

            if (refusal_reason) {
                socket.emit("room_refused", refusal_reason)
                return
            }

            console.log(get_room_size(data.room))

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
            if (socket_room) {
                console.log("Client " + socket.id + " disconnected");

                usernames[socket_room].splice(usernames[socket_room].indexOf(username), 1)

                if (get_room_size(socket_room) < 1) {
                    console.log("Room " + socket_room + " has emptied");
                } else {
                    socket.to(socket_room).emit("opp_left")
                }
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
}