class Rectangle {
    constructor (x, y, s) {
        this.pos = new p5.Vector(x, y)
        this.size = s
    }

    draw() {
        fill(255)
        rect(this.pos.x, this.pos.y, this.size.x, this.size.y)
    }
}

class Paddle extends Rectangle {

    static PADDLE_SIZE = new p5.Vector(20, 120)
    static PADDLE_H_OFFSET = 120
    static VERTICAL_DELTA = 10

    constructor (x, y) {
        super(x, y, Paddle.PADDLE_SIZE)
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