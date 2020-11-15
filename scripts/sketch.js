var p1 = undefined, p2 = undefined
var b = undefined
var score1 = 0, score2 = 0
var game_started = false

function setup() {
    createCanvas(1000, 500);
    p1 = new Paddle(Paddle.PADDLE_H_OFFSET, (height - Paddle.PADDLE_SIZE.y)/2);
    p2 = new Paddle((width - Paddle.PADDLE_SIZE.x) - Paddle.PADDLE_H_OFFSET, (height - Paddle.PADDLE_SIZE.y)/2);
    b = new Ball()

    textFont("Roboto mono")
    textSize(30)
    
}

function draw() {
    background(0)

    fill(100)
    rect(0, 0, Paddle.PADDLE_H_OFFSET, height)
    rect(width-Paddle.PADDLE_H_OFFSET, 0, Paddle.PADDLE_H_OFFSET, height)

    p1.update()
    p2.update()

    if (game_started) {
        b.update(p1, p2)

        fill(255, 255, 255, 180)
        textAlign(RIGHT, CENTER)
        text(str(score1), (width/2 - Paddle.PADDLE_H_OFFSET)/2 + Paddle.PADDLE_H_OFFSET, height/2)
        textAlign(LEFT, CENTER)
        text(str(score2), width - ((width/2 - Paddle.PADDLE_H_OFFSET)/2 + Paddle.PADDLE_H_OFFSET), height/2)

        if (check_score()) {
            console.log("player 1 score: ", score1);
            console.log("player 2 score: ", score2);

            b.reset()
            p1.reset()
            p2.reset()

            //game_started = false
        }
    }
    else {
        fill(255)
        textAlign(CENTER, CENTER)
        text("Press arrow keys to start", width/2, height/2)
    }
}

function check_score() {
    if (b.pos.x <= p1.pos.x) score2+=1
    if (b.pos.x >= p2.pos.x + Paddle.PADDLE_SIZE.x) score1+=1

    return (b.pos.x <= p1.pos.x || b.pos.x >= p2.pos.x + Paddle.PADDLE_SIZE.x)
}

function keyPressed() {
    if (keyCode == UP_ARROW || keyCode == DOWN_ARROW) {
        game_started = true

        b.set_movable(true)

        if (keyCode == UP_ARROW) {
            p1.set_direction(-1)
            p2.set_direction(-1)
        }

        if (keyCode == DOWN_ARROW) {
            p1.set_direction(1)
            p2.set_direction(1)
        }
    }
}

function keyReleased() {
    if (keyCode == UP_ARROW || keyCode == DOWN_ARROW) {
        p1.set_direction(0)
        p2.set_direction(0)        
    }
}

function sign(val) {
    if (val == undefined || val == 0) return 0

    return abs(val) / val
}