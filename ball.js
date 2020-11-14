class Ball {
    
    static BALL_RADIUS = 10

    constructor() {
        this.pos = new p5.Vector(width/2, height/2)
        this.can_update = false
    }

    update() {
        if (this.can_update) {
            this.pos.x += 2
        }
    }

    draw() {
        circle(this.pos.x, this.pos.y, Ball.BALL_RADIUS)
    }
}