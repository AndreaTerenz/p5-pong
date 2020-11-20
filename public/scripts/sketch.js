var p1 = undefined, p2 = undefined
var own_p = undefined, opp_p = undefined
var b = undefined
var score_limit = 20 // prompt("Enter score limit: ", 20);

var socket_data
var socket

var game_status = {
    winner  : 0,
    score_1 : 0,
    score_2 : 0,
    playing : false,
    room_filled : false,

    start() {
        if (this.room_filled) {
            this.winner = 0,
            this.playing = true
        }
    },

    reset() {
        this.reset_scores(),
        this.room_filled = false,
        this.playing = false
    },

    reset_scores() {
        this.score_1 = 0
        this.score_2 = 0
        this.winner = 0
    },

    check_winner() {
        if (this.score_1 >= score_limit) this.winner = 1
        else if (this.score_2 >= score_limit) this.winner = 2
    
        if (this.winner != 0) this.reset_scores()    
    },

    check_score(b_pos, p1_pos, p2_pos) {
        if (b_pos.x <= p1_pos.x) this.score_2+=1
        if (b_pos.x >= p2_pos.x + Paddle.PADDLE_SIZE.x) this.score_1+=1
    
        if (b_pos.x <= p1_pos.x || b_pos.x >= p2_pos.x + Paddle.PADDLE_SIZE.x) {
            check_winner()
            return true
        }

        return false
    }
}

function setup() {
    Ball.MAX_VEL_ANGLE = radians(Ball.MAX_VEL_ANGLE)

    let cnv = createCanvas(1000, 500)
    cnv.parent("sketch_container")

    setup_socket()

    p1 = new Paddle(Paddle.PADDLE_H_OFFSET, (height - Paddle.PADDLE_SIZE.y)/2);
    p2 = new Paddle((width - Paddle.PADDLE_SIZE.x) - Paddle.PADDLE_H_OFFSET, (height - Paddle.PADDLE_SIZE.y)/2);
    
    textFont("Roboto mono")
    textSize(30)

    drawingContext.shadowOffsetX = 0;
    drawingContext.shadowOffsetY = 0;
    drawingContext.shadowBlur = 10;
    drawingContext.shadowColor = "black";
}

function setup_socket() {
    let address = "http://localhost:3500" //(true) ? "http://95.248.171.171:3000" : 

    socket = io.connect(address)

    socket.on("connection_data", (data) => { 
        socket_data = data
        set_label("#socket_id", "Player ID: " + socket_data.id)
        set_label("#opponent_id", "Waiting for other player...")
        set_label("#room_id", "Room: " + socket_data.room)

        b = new Ball(socket_data.room)
     })

    socket.on("room_filled", (players) => {
        let opp = (players[0] == socket.id) ? players[1] : players[0]
        own_p = (players[0] == socket.id) ? p1 : p2
        opp_p = (players[0] == socket.id) ? p2 : p1

        set_label("#opponent_id", "Opponent ID: " + opp)
        game_status.room_filled = true
    })

    socket.on("opp_moved", (delta) => {
        game_status.start()
        opp_p.set_direction(delta)
        b.set_movable(true)
    })

    socket.on("opp_left", () => {
        reset_objects()
        game_status.reset()

        set_label("#socket_id", "Player ID: " + socket_data.id)
        set_label("#opponent_id", "Waiting for other player...")
        set_label("#room_id", "Room: " + socket_data.room)
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

    fill(100)
    rect(0, 0, Paddle.PADDLE_H_OFFSET, height)
    rect(width-Paddle.PADDLE_H_OFFSET, 0, Paddle.PADDLE_H_OFFSET, height)

    if (game_status.room_filled)
    {
        p1.update()
        p2.update()

        if (game_status.playing) {
            b.update(p1, p2)

            draw_ingame_txt()

            if (game_status.check_score(b.pos, p1.pos, p2.pos)) reset_objects()
        }
        else {
            draw_start_msg()
        }
    }
    else {
        draw_waiting_msg()
    }
}

function draw_ingame_txt() {
    fill(255, 255, 255, 180)
    textAlign(RIGHT, CENTER)
    text(str(game_status.score_1), (width / 2 - Paddle.PADDLE_H_OFFSET) / 2 + Paddle.PADDLE_H_OFFSET, height / 2)
    textAlign(LEFT, CENTER)
    text(str(game_status.score_2), width - ((width / 2 - Paddle.PADDLE_H_OFFSET) / 2 + Paddle.PADDLE_H_OFFSET), height / 2)

    fill(255, 255, 255, 130)
    textAlign(CENTER, CENTER)
    textSize(18)
    text("First player to " + str(score_limit) + " points wins", width / 2, height - 40)
    textSize(30)
}

function draw_start_msg() {
    fill(255)
    textAlign(CENTER, CENTER)

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

    var msg = "Waiting for second player..."

    text(msg, width / 2, height / 2)
}

function check_score() {
    if (b.pos.x <= p1.pos.x) game_status.score_2+=1
    if (b.pos.x >= p2.pos.x + Paddle.PADDLE_SIZE.x) game_status.score_1+=1

    return (b.pos.x <= p1.pos.x || b.pos.x >= p2.pos.x + Paddle.PADDLE_SIZE.x)
}

function check_winner() {
    if (game_status.score_1 >= score_limit) game_status.winner = 1
    else if (game_status.score_2 >= score_limit) game_status.winner = 2

    return game_status.winner != 0    
}

function up_key_pressed() {
    return (keyCode == UP_ARROW || key == 'w')
}

function down_key_pressed() {
    return (keyCode == DOWN_ARROW || key == 's')
}

function accept_keypress() {
    return ((up_key_pressed() || down_key_pressed()) && game_status.room_filled)
}

function keyPressed() {
    if (accept_keypress()) {
        game_status.playing = true
        game_status.winner = 0  

        b.set_movable(true)

        if (up_key_pressed()) {
            own_p.set_direction(-1)
            socket.emit("moved", -1)
        }

        if (down_key_pressed()) {
            own_p.set_direction(1)
            socket.emit("moved", 1)
        }
    }
}

function keyReleased() {
    if (accept_keypress()) {
        own_p.set_direction(0)
        socket.emit("moved", 0) 
    }
}

function sign(val) {
    if (val == undefined || val == 0) return 0

    return abs(val) / val
}