class Ball {
    
    static INIT_BALL_VEL = new p5.Vector(6, 2)
    static MAX_VEL = 6
    static BALL_RADIUS = 7

    constructor() {
        this.pos = new p5.Vector(width/2, height/2)
        this.speed = Ball.INIT_BALL_VEL
        this.can_update = false
    }
    
    set_movable(m) {
        this.can_update = m
    }

    update(p1_pos, p2_pos) {
        if (this.can_update) {
            this.collide_with_paddle(p1)
            this.collide_with_paddle(p2)

            this.intersects_walls()

            this.speed.limit(Ball.MAX_VEL)
            this.pos.add(this.speed)
            
            this.pos.x = constrain(this.pos.x, 0, width - Ball.BALL_RADIUS)
            this.pos.y = constrain(this.pos.y, 0, height - Ball.BALL_RADIUS)
        }
    }

    intersects_walls() {
        if ((this.pos.y <= Ball.BALL_RADIUS || this.pos.y >= height-Ball.BALL_RADIUS) || (this.pos.x <= Ball.BALL_RADIUS || this.pos.x >= width-Ball.BALL_RADIUS)) {
            fill(0, 255, 0)

            if (this.pos.x <= Ball.BALL_RADIUS || this.pos.x >= width-Ball.BALL_RADIUS) {
                this.speed.x *= -1
            }

            else if (this.pos.y <= Ball.BALL_RADIUS || this.pos.y >= height-Ball.BALL_RADIUS) {
                this.speed.y *= -1
            }   
        }
    }

    collide_with_paddle(p) {
        var tl_corner = p5.Vector.sub(p.pos, createVector(Ball.BALL_RADIUS))
        var br_corner = p5.Vector.add(p.pos, Paddle.PADDLE_SIZE).add(createVector(Ball.BALL_RADIUS))
        
        fill(255)
        if ((this.pos.y >= tl_corner.y && this.pos.y <= br_corner.y) && (this.pos.x >= tl_corner.x && this.pos.x <= br_corner.x)) {
            fill(0, 255, 0)

            if (this.pos.x >= tl_corner.x && this.pos.x <= br_corner.x) {
                this.speed.x *= -1
            }

            else if (this.pos.y >= tl_corner.y && this.pos.y <= br_corner.y) {
                this.speed.y *= -1
            }   
        }
    }

    draw() {
        circle(this.pos.x, this.pos.y, Ball.BALL_RADIUS * 2)
    }
}