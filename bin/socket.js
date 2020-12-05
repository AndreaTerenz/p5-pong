module.exports = function (server) {
    var io = require("socket.io")(server)

    var room_count = 1
    var rooms_set = (new Set()).add("room_" + room_count)
    var rooms_iter = rooms_set.values()
    var next_room = rooms_iter.next().value
    rooms_set.delete(next_room)

    var usernames = { }

    io.on("connect", (socket) => {
        var socket_room = undefined
        var username = undefined

        console.log("New connection (ID: " + socket.id + ")")
        
        socket.on("name_room", (data) => {
            username = data.name
            console.log("Socket " + socket.id + " registered for user " + username)

            socket_room = (data.room && get_room_size(data.room) != 2) ? data.room : next_room
            socket.join(socket_room)

            if (!usernames[socket_room])
                usernames[socket_room] = []
            usernames[socket_room].push(username)

            socket.emit("room_id", socket_room)
    
            if (get_room_size(socket_room) >= 2) {
                console.log("Two clients have joined room [" + socket_room + "]")
                
                let n = usernames[socket_room]
                let i = Array.from(io.sockets.adapter.rooms.get(socket_room))
    
                io.to(socket_room).emit("room_filled", {
                    names: n,
                    ids : i
                })
    
                if (socket_room == next_room) {
                    if (rooms_set.size == 0) {
                        room_count += 1
                        rooms_set.add("room_" + room_count)
                    }
                    
                    next_room = rooms_iter.next().value
                    rooms_set.delete(next_room)
                }
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

            usernames[socket_room].splice(usernames[socket_room].indexOf(username), 1)

            if (get_room_size(socket_room) < 1) {
                console.log("Room " + socket_room + " has emptied");
                delete usernames[socket_room]
            } else {
                socket.to(socket_room).emit("opp_left")
            }
            
            rooms_set.add(socket_room)
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