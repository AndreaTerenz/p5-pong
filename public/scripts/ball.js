class Ball {
    
    static MAX_VEL = 8
    static BALL_RADIUS = 7
    static MAX_VEL_ANGLE = Math.PI/3

    constructor(seed) {
        this.reset(seed)
    }
    
    set_movable(m) {
        this.can_update = m
    }
    
    reset(seed) {
        if (seed) this.reset_rand(seed)
        this.pos = new p5.Vector(width/2, height/2)
        this.speed = this.get_random_speed()
        this.can_update = false
    }

    reset_rand(seed) {
        this.last_seed = seed
        this.rand = new Math.seedrandom(seed)
    }

    update(p1, p2) {
        if (this.can_update) {
            this.collide_with_paddle(p1)
            this.collide_with_paddle(p2)

            this.intersects_walls()

            this.speed.setMag(Ball.MAX_VEL)
            this.pos.add(this.speed)
            
            this.pos.x = constrain(this.pos.x, 0, width - Ball.BALL_RADIUS)
            this.pos.y = constrain(this.pos.y, 0, height - Ball.BALL_RADIUS)
        }

        this.draw()
    }

    intersects_walls() {
        if ((this.pos.y <= Ball.BALL_RADIUS || this.pos.y >= height-Ball.BALL_RADIUS) || (this.pos.x <= Ball.BALL_RADIUS || this.pos.x >= width-Ball.BALL_RADIUS)) {
            if (this.pos.x <= Ball.BALL_RADIUS || this.pos.x >= width-Ball.BALL_RADIUS) {
                this.speed.x *= -1
            }

            else if (this.pos.y <= Ball.BALL_RADIUS || this.pos.y >= height-Ball.BALL_RADIUS) {
                this.speed.y *= -1
            }   
        }
    }
    
    collide_with_paddle(paddle) {
        if (paddle.contains(this.pos)){
            this.pos = paddle.translate_out(this.pos, Ball.BALL_RADIUS)

            var p = paddle.pos
            var test = this.pos.copy()
            var collided_x = false
            var collided_y = false

            // which edge is closest?
            if (this.pos.x <= p.x){         test.x = p.x; collided_x = true       // left edge
            }else if (this.pos.x >= p.x + Paddle.PADDLE_SIZE.x){ test.x = p.x+Paddle.PADDLE_SIZE.x; collided_x = true  }   // right edge
            
            if (this.pos.y <= p.y){         test.y = p.y; collided_y = true       // top edge
            }else if (this.pos.y >= p.y+Paddle.PADDLE_SIZE.y){ test.y = p.y+Paddle.PADDLE_SIZE.y; collided_y = true }   // bottom edge

            if (this.pos.dist(test) <= Ball.BALL_RADIUS) {
                if (collided_x) this.speed.x *= -1
                else if (collided_y) this.speed.y = Paddle.VERTICAL_DELTA - this.speed.y
            }
        }
    }

    draw() {
        circle(this.pos.x, this.pos.y, Ball.BALL_RADIUS * 2)
    }

    get_random_speed() {
        var angle_tan = map(this.rand.quick(), 0, 1, Math.tan(-Ball.MAX_VEL_ANGLE), Math.tan(Ball.MAX_VEL_ANGLE))
        var angle_choice = Math.round(this.rand.quick())
        var angle = Math.atan(angle_tan)

        return p5.Vector.fromAngle(angle + Math.PI*angle_choice)
    }
}