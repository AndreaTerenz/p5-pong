p5.disableFriendlyErrors = true; // disables FES

let p1, p2
let own_p, opp_p
let b
let score_limit = 20 // prompt("Enter score limit: ", 20);
let game_stat
let socket
let connection_data = {
    id: "",
    room: "",
    opp_id: "",
    own_name: "",
    opp_name: "",
    conn_mode: ""
}

let elements

function setup() {
    createCanvas(1000, 500).parent("#sketch_container")

    p1 = new Paddle(Paddle.H_OFFSET, (height - Paddle.PADDLE_SIZE.y) / 2, "L");
    p2 = new Paddle((width - Paddle.PADDLE_SIZE.x) - Paddle.H_OFFSET, (height - Paddle.PADDLE_SIZE.y) / 2, "R");

    game_stat = new GameStatus()
    elements = {
        player_id: select("#socket_id"),
        opp_id: select("#opponent_id"),
        room: select("#room_id"),
        container: select("#sketch_container"),
        game_area: select("#game"),
        inputs: select("#input")
    }

    setup_socket()  

    textFont("Roboto mono")

    showCanvas(false)
    showGame(false)
}

function connect(n, r, m) {
    connection_data.own_name = n
    connection_data.conn_mode = m

    if (r) connection_data.room = r

    socket.emit("user_data", {
        name: connection_data.own_name,
        room: connection_data.room,
        mode: connection_data.conn_mode
    })
}

function setup_socket() {
    socket = io.connect("http://localhost:3500")

    socket.on("room_refused", (reason) => {
        console.log("room refused : " + reason);
        resetInputs()

        if (reason == "NO_ROOM") alert("No room was provided")
        else {
            let msg = "Room \"" + connection_data.room + "\" "

            switch (reason) {
                case "ROOM_EXISTS" : msg += "already exists"; break
                case "ROOM_FULL" : msg += "is already full"; break
                case "ROOM_NOT_EXISTS" : msg += "doesn't exist"; break
                default: console.log("Room assignment failed for unknown reason: " + reason)
            }

            alert(msg)
        }
    })

    socket.on("room_confirmed", (room) => {
        console.log("room confirmed : " + room);
        connection_data.room = room
        
        showGame(true)

        elements.player_id.html("Player: " + connection_data.own_name)
        elements.opp_id.html("Waiting for other player...")
        elements.room.html("Room: " + connection_data.room)
    })

    socket.on("room_filled", (players) => {
        showCanvas(true)
        game_stat.room_filled = true

        let names = players.names
        let ids = players.ids

        connection_data.opp_id = (ids[0] == socket.id) ? ids[1] : ids[0]
        connection_data.opp_name = (names[0] == connection_data.own_name) ? names[1] : names[0]

        own_p = (ids[0] == socket.id) ? p1 : p2
        opp_p = (ids[0] == socket.id) ? p2 : p1

        let seed = connection_data.room + names[0] + names[1] + ids[1] + ids[0]
        if (b) b.reset(seed)
        else b = new Ball(seed)

        own_p.label = "You"
        opp_p.label = "Opp"

        elements.opp_id.html("Opponent: " + connection_data.opp_name)
    })

    socket.on("opp_scored", (score) => {
        game_stat.score_1 = score.l_score
        game_stat.score_2 = score.r_score

        handle_score()
    })

    socket.on("opp_won", (id) => {
        if (connection_data.opp_id == id && game_stat.playing)
            game_stat.reset()
    })

    socket.on("opp_moved", (delta) => {
        if (delta) {
            game_stat.start()
            b.set_movable(true)
        }

        opp_p.set_direction(delta)
    })

    socket.on("opp_left", () => {
        connection_data.opp_id = ""
        reset_objects()
        game_stat.reset(false)
        showCanvas(false)
        elements.opp_id.html("Waiting for other player...")
    })

    return true
}

function showCanvas(show = true) {
    if (show)
        elements.container.show()
    else
        elements.container.hide()  
}

function showGame(show = true) {
    if (show) {
        elements.game_area.show()
        elements.inputs.hide()
    }
    else {
        elements.game_area.hide()
        elements.inputs.show()
    }  
}

function quitGame() {
    for (const [key, _] of Object.entries(connection_data)) {
        connection_data[key] = ""
    }

    game_stat.reset(false)
    reset_objects()

    showCanvas(false)
    showGame(false)

    socket.emit("quit")
}

function reset_objects() {
    b.reset()
    p1.reset()
    p2.reset()
}

function draw() {
    background(0)

    if (game_stat.room_filled) {
        let colors = [color(56, 142, 60), color(211, 47, 47)]
        let l_col = (own_p == p1) ? colors[0] : colors[1]
        let r_col = (own_p == p1) ? colors[1] : colors[0]

        fill(l_col)
        rect(0, 0, Paddle.H_OFFSET, height)
        fill(r_col)
        rect(width - Paddle.H_OFFSET, 0, Paddle.H_OFFSET, height)

        p1.update()
        p2.update()

        if (game_stat.playing) {
            b.update(p1, p2)

            let pos = createVector((width / 2 - Paddle.H_OFFSET) / 2 + Paddle.H_OFFSET, height / 2)

            let c = color(255, 255, 255, 180)
            write_text(str(game_stat.score_1), c, RIGHT, 30, pos.x, pos.y)
            write_text(str(game_stat.score_2), c, LEFT, 30, width - pos.x, pos.y)

            //Score limit msg
            c = color(255, 255, 255, 130)
            let s = "First player to " + str(score_limit) + " points wins"
            write_text(s, c, CENTER, 18, width / 2, height - 40)

            let scored = game_stat.check_score(b.pos.x, p1.pos.x, p2.pos.x)
            if (scored) {
                handle_score()

                socket.emit("scored", {
                    l_score: game_stat.score_1,
                    r_score: game_stat.score_2
                })

                if (game_stat.check_winner()) {
                    game_stat.reset()

                    socket.emit("won", socket.id)
                }
            }
        } else {
            let msg = "Press UP/DOWN or W/S to start"

            switch (game_stat.winner) {
                case 1:
                    msg = "Player 1 won!\n" + msg;
                    break;
                case 2:
                    msg = "Player 2 won!\n" + msg;
                    break;
            }

            write_text(msg, color(255), CENTER, 30, width / 2, height / 2)
        }
    }
}

function write_text(str, color, h_align, size, x, y) {
    fill(color)
    textAlign(h_align, CENTER)
    textSize(size)
    text(str, x, y)
}

function handle_score() {
    console.log("Score: " + game_stat.score_1 + " | " + game_stat.score_2);
    reset_objects()
}

function up_key() {
    return (keyCode == UP_ARROW || key == 'w')
}

function down_key() {
    return (keyCode == DOWN_ARROW || key == 's')
}

function accept_keypress() {
    return ((up_key() || down_key()) && game_stat.room_filled)
}

function move_paddle(delta) {
    own_p.set_direction(delta)
    socket.emit("moved", delta)
}

function keyPressed() {
    if (accept_keypress()) {
        game_stat.start()
        b.set_movable(true)

        if (up_key()) move_paddle(-1)
        else if (down_key()) move_paddle(1)
    }
}

function keyReleased() {
    if (accept_keypress()) move_paddle(0)
}