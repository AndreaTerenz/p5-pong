class Paddle {

    static PADDLE_SIZE = new p5.Vector(20, 120)

    constructor (x, y) {
        this.pos = new p5.Vector(x, y)
    }

    draw() {
        rect(this.pos.x, this.pos.y, Paddle.PADDLE_SIZE.x, Paddle.PADDLE_SIZE.y)
    }
}