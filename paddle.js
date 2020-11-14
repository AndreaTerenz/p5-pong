class Paddle {

    static PADDLE_SIZE = new p5.Vector(20, 120)
    static PADDLE_H_OFFSET = 50
    static VERTICAL_DELTA = 10

    constructor (x, y) {
        this.pos = new p5.Vector(x, y)
    }

    draw() {
        rect(this.pos.x, this.pos.y, Paddle.PADDLE_SIZE.x, Paddle.PADDLE_SIZE.y)
    }

    update() {
        if (keyIsDown(UP_ARROW)) {
            this.move(-Paddle.VERTICAL_DELTA)
        }
        else if (keyIsDown(DOWN_ARROW)) {
            this.move(Paddle.VERTICAL_DELTA)
        }
    }

    move(delta) {
        this.pos.y = constrain(this.pos.y + delta, 0, height - Paddle.PADDLE_SIZE.y)
    }
}