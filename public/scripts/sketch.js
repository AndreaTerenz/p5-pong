p5.disableFriendlyErrors = true; // disables FES

var p1, p2
var own_p, opp_p
var b
var score_limit = 20 // prompt("Enter score limit: ", 20);
var game_stat
var socket
var connection_data = {
    id : "",
    room : "",
    opp_id : ""
}

var labels
var show_canvas = true

function setup() {
    createCanvas(1000, 500).parent("#sketch_container")
    toggleCanvas();

    setup_socket()

    p1 = new Paddle(Paddle.PADDLE_H_OFFSET, (height - Paddle.PADDLE_SIZE.y)/2, "L");
    p2 = new Paddle((width - Paddle.PADDLE_SIZE.x) - Paddle.PADDLE_H_OFFSET, (height - Paddle.PADDLE_SIZE.y)/2, "R");
    
    game_stat = new GameStatus()
    labels = {
        player_id : select("#socket_id"),
        opp_id : select("#opponent_id"),
        room : select("#room_id")
    }

    textFont("Roboto mono")
    textSize(30)
}

function toggleCanvas() {
    show_canvas = !show_canvas
    if (show_canvas)
        select("#sketch_container").show()
    else
        select("#sketch_container").hide()
}

function setup_socket() {
    let address = "http://localhost:3500"

    socket = io.connect(address)

    socket.on("connection_data", (data) => { 
        connection_data.id = data.id
        connection_data.room = data.room
        labels.player_id.html("Player ID: " + connection_data.id)
        labels.opp_id.html("Waiting for other player...")
        labels.room.html("Room: " + connection_data.room)
     })

    socket.on("room_filled", (players) => {
        toggleCanvas();
        game_stat.room_filled = true
        connection_data.opp_id = (players[0] == socket.id) ? players[1] : players[0]
        own_p = (players[0] == socket.id) ? p1 : p2
        opp_p = (players[0] == socket.id) ? p2 : p1

        let seed = connection_data.room + players[0] + players[1]
        if (b) b.reset(seed)
        else b = new Ball(seed)

        own_p.label = "You"
        opp_p.label = "Opp"

        labels.opp_id.html("Opponent ID: " + connection_data.opp_id)
    })

    socket.on("opp_scored", (score) => {
        game_stat.score_1 = score.l_score
        game_stat.score_2 = score.r_score

        handle_score()
    })

    socket.on("opp_won", (id) => {
        if (connection_data.id != id && game_stat.playing)
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
        toggleCanvas();
        labels.opp_id.html("Waiting for other player...")
    })
}

function reset_objects() {
    b.reset()
    p1.reset()
    p2.reset()
}

function draw() {
    background(0)

    if (game_stat.room_filled)
    {
        let colors = [color(56, 142, 60), color(211, 47, 47)]
        let l_col = (own_p == p1) ? colors[0] : colors[1]
        let r_col = (own_p == p1) ? colors[1] : colors[0]

        fill(l_col)
        rect(0, 0, Paddle.PADDLE_H_OFFSET, height)
        fill(r_col)
        rect(width-Paddle.PADDLE_H_OFFSET, 0, Paddle.PADDLE_H_OFFSET, height)

        p1.update()
        p2.update()

        if (game_stat.playing) {
            b.update(p1, p2)

            draw_ingame_txt()

            let scored = game_stat.check_score(b.pos.x, p1.pos.x, p2.pos.x)
            if (scored) {
                handle_score()

                socket.emit("scored", {
                    l_score : game_stat.score_1,
                    r_score : game_stat.score_2
                })

                if (game_stat.check_winner()) {
                    game_stat.reset()
            
                    socket.emit("won", connection_data.id)
                }
            }
        }
        else draw_start_msg()
    }
    else draw_waiting_msg()

    function draw_ingame_txt() {
        //Score
        let pos = createVector((width / 2 - Paddle.PADDLE_H_OFFSET) / 2 + Paddle.PADDLE_H_OFFSET, height / 2)
    
        fill(255, 255, 255, 180)
        textAlign(RIGHT, CENTER)
        textSize(30)
        text(str(game_stat.score_1), pos.x, pos.y)
        textAlign(LEFT, CENTER)
        text(str(game_stat.score_2), width - pos.x, pos.y)
    
        //Score limit msg
        fill(255, 255, 255, 130)
        textAlign(CENTER, CENTER)
        textSize(18)
        text("First player to " + str(score_limit) + " points wins", width / 2, height - 40)
    }
    
    function draw_start_msg() {
        fill(255)
        textAlign(CENTER, CENTER)
        textSize(30)
    
        var msg = "Press UP/DOWN or W/S to start"
    
        switch (game_stat.winner) {
            case 1: msg = "Player 1 won!\n" + msg; break;
            case 2: msg = "Player 2 won!\n" + msg; break;
        }
    
        text(msg, width / 2, height / 2)
    }
    
    function draw_waiting_msg() {
        fill(255)
        textAlign(CENTER, CENTER)
        textSize(30)
    
        var msg = "Waiting for second player..."
    
        text(msg, width / 2, height / 2)
    }
}

function handle_score() {
    console.log("Score: " + game_stat.score_1 + " | " + game_stat.score_2);
    reset_objects()
}

function up_key() { return (keyCode == UP_ARROW || key == 'w') }

function down_key() { return (keyCode == DOWN_ARROW || key == 's') }

function accept_keypress() { return ((up_key() || down_key()) && game_stat.room_filled) }

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
