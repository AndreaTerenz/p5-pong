class Ball {
    
    static INIT_BALL_VEL = new p5.Vector(5, 6)
    static MAX_VEL = 10
    static BALL_RADIUS = 7

    constructor() {
        this.pos = new p5.Vector(width/2, height/2)
        this.speed = Ball.INIT_BALL_VEL
        this.can_update = false
        this.gianfranco = false
    }
    
    set_movable(m) {
        this.can_update = m
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

    //FIXME: vertical collision doesn't really work that well
    collide_with_paddle(paddle) {
        if (paddle.contains(this.pos)){
            this.pos = paddle.translate_out(this.pos)

            var p = paddle.pos
            var test = this.pos.copy()
            var collided_l = false
            var collided_r = false
            var collided_t = false
            var collided_b = false

            // which edge is closest?
            if (this.pos.x <= p.x){         test.x = p.x; collided_l = true       // left edge
            }else if (this.pos.x >= p.x + Paddle.PADDLE_SIZE.x){ test.x = p.x+Paddle.PADDLE_SIZE.x; collided_r = true  }   // right edge
            
            if (this.pos.y <= p.y){         test.y = p.y; collided_t = true       // top edge
            }else if (this.pos.y >= p.y+Paddle.PADDLE_SIZE.y){ test.y = p.y+Paddle.PADDLE_SIZE.y; collided_b = true }   // bottom edge

            var distance = this.pos.dist(test)
            var did_collide = (distance <= Ball.BALL_RADIUS)

            if (did_collide) {
                fill(0, 255, 0)

                if (collided_l || collided_r) this.speed.x *= -1

                if (collided_t || collided_b) {
                    this.speed.y *= -1
                    this.speed.y += Paddle.VERTICAL_DELTA
                }
            }
        }

        /*var tl_corner = createVector(p.x - Ball.BALL_RADIUS, p.y - Ball.BALL_RADIUS)
        var br_corner = createVector(p.x + Paddle.PADDLE_SIZE.x + Ball.BALL_RADIUS, p.y + Paddle.PADDLE_SIZE.y + Ball.BALL_RADIUS)
        
        //p5.Vector.add(p, Paddle.PADDLE_SIZE).add(createVector(Ball.BALL_RADIUS))
        
        fill(255, 0, 0)
        if ((this.pos.y >= tl_corner.y && this.pos.y <= br_corner.y) && (this.pos.x >= tl_corner.x && this.pos.x <= br_corner.x)) {
            if (this.pos.x >= tl_corner.x && this.pos.x <= br_corner.x) {
                this.speed.x *= -1
                fill(0, 0, 255)
            }
            else if (this.pos.y >= tl_corner.y && this.pos.y <= br_corner.y) {
                this.speed.y *= -1*Paddle.VERTICAL_DELTA
                fill(0, 255, 0)
            }   
        }*/
    }

    draw() {
        
        circle(this.pos.x, this.pos.y, Ball.BALL_RADIUS * 2)
    }
}