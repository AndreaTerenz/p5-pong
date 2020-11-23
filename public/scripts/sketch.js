var p1 = undefined, p2 = undefined
var own_p = undefined, opp_p = undefined
var b = undefined
var score_limit = 20 // prompt("Enter score limit: ", 20);

var socket
var connection_data = {
    id : "",
    room : "",
    opp_id : ""
}

var game_status = {
    winner  : 0,
    score_1 : 0, //LEFT score
    score_2 : 0, //RIGHT score
    playing : false,
    room_filled : false,

    start() {
        if (this.room_filled && !this.playing) {
            this.reset_scores()
            this.winner = 0
            this.playing = true
        }
    },

    reset(room_still_filled = true) {
        this.reset_scores()
        this.room_filled = room_still_filled
        this.playing = false
    },

    reset_scores() {
        this.score_1 = 0
        this.score_2 = 0
    },

    check_winner() {
        if (this.score_1 >= score_limit) this.winner = 1
        else if (this.score_2 >= score_limit) this.winner = 2
    
        return (this.winner != 0)
    },

    check_score(b_pos, p1_pos, p2_pos) {
        if (b_pos.x <= p1_pos.x) {
            this.score_2+=1
            return 2
        }
        if (b_pos.x >= p2_pos.x + Paddle.PADDLE_SIZE.x) {
            this.score_1+=1
            return 1
        }
    
        return 0
    }
}

function setup() {
    Ball.MAX_VEL_ANGLE = radians(Ball.MAX_VEL_ANGLE)

    let cnv = createCanvas(1000, 500)
    cnv.parent("sketch_container")

    setup_socket()

    p1 = new Paddle(Paddle.PADDLE_H_OFFSET, (height - Paddle.PADDLE_SIZE.y)/2, "L");
    p2 = new Paddle((width - Paddle.PADDLE_SIZE.x) - Paddle.PADDLE_H_OFFSET, (height - Paddle.PADDLE_SIZE.y)/2, "R");
    
    textFont("Roboto mono")
    textSize(30)
/*
    drawingContext.shadowOffsetX = 0;
    drawingContext.shadowOffsetY = 0;
    drawingContext.shadowBlur = 8;
    drawingContext.shadowColor = "black";*/
}

function setup_socket() {
    let address = "http://localhost:3500"

    socket = io.connect(address)

    socket.on("connection_data", (data) => { 
        connection_data.id = data.id
        connection_data.room = data.room
        set_label("#socket_id", "Player ID: " + connection_data.id)
        set_label("#opponent_id", "Waiting for other player...")
        set_label("#room_id", "Room: " + connection_data.room)
     })

    socket.on("room_filled", (players) => {
        game_status.room_filled = true
        connection_data.opp_id = (players[0] == socket.id) ? players[1] : players[0]
        own_p = (players[0] == socket.id) ? p1 : p2
        opp_p = (players[0] == socket.id) ? p2 : p1

        let seed = connection_data.room + players[0] + players[1]
        if (b) b.reset(seed)
        else b = new Ball(seed)

        own_p.label = "You"
        opp_p.label = "Opp"

        set_label("#opponent_id", "Opponent ID: " + connection_data.opp_id)
    })

    socket.on("opp_scored", (score) => {
        game_status.score_1 = score.l_score
        game_status.score_2 = score.r_score

        handle_score()
    })

    socket.on("opp_won", (id) => {
        if (connection_data.id != id && game_status.playing)
            game_status.reset()
    })

    socket.on("opp_moved", (delta) => {
        if (delta) {
            game_status.start()
            b.set_movable(true)
        }
        
        opp_p.set_direction(delta)
    })

    socket.on("opp_left", () => {
        connection_data.opp_id = ""
        reset_objects()
        game_status.reset(false)

        set_label("#socket_id", "Player ID: " + connection_data.id)
        set_label("#opponent_id", "Waiting for other player...")
        set_label("#room_id", "Room: " + connection_data.room)
    })
}

function reset_objects() {
    b.reset()
    p1.reset()
    p2.reset()
}

function set_label(id, txt) {
    let label = select(id)
    label.html(txt)
}

function draw() {
    background(0)

    let colors = [color(56, 142, 60), color(211, 47, 47)]
    let l_col = (own_p == p1) ? colors[0] : colors[1]
    let r_col = (own_p == p1) ? colors[1] : colors[0]

    fill(l_col)
    rect(0, 0, Paddle.PADDLE_H_OFFSET, height)
    fill(r_col)
    rect(width-Paddle.PADDLE_H_OFFSET, 0, Paddle.PADDLE_H_OFFSET, height)

    if (game_status.room_filled)
    {
        p1.update()
        p2.update()

        if (game_status.playing) {
            b.update(p1, p2)

            draw_ingame_txt()

            let scored = game_status.check_score(b.pos, p1.pos, p2.pos)
            if (scored) {
                handle_score()

                socket.emit("scored", {
                    l_score : game_status.score_1,
                    r_score : game_status.score_2
                })

                if (game_status.check_winner()) {
                    game_status.reset()
            
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
        text(str(game_status.score_1), pos.x, pos.y)
        textAlign(LEFT, CENTER)
        text(str(game_status.score_2), width - pos.x, pos.y)
    
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
    
        switch (game_status.winner) {
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
    console.log("Score: " + game_status.score_1 + " | " + game_status.score_2);
    reset_objects()
}

function up_key() { return (keyCode == UP_ARROW || key == 'w') }

function down_key() { return (keyCode == DOWN_ARROW || key == 's') }

function accept_keypress() { return ((up_key() || down_key()) && game_status.room_filled) }

function move_paddle(delta) {
    own_p.set_direction(delta)
    socket.emit("moved", delta)
}

function keyPressed() {
    if (accept_keypress()) {
        game_status.start()
        b.set_movable(true)

        if (up_key()) move_paddle(-1)
        else if (down_key()) move_paddle(1)
    }
}

function keyReleased() {
    if (accept_keypress()) move_paddle(0)
}
