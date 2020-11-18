class Rectangle {
    constructor (x, y, s) {
        this.pos = new p5.Vector(x, y)
        this.size = s
    }

    draw() {
        fill(255)
        rect(this.pos.x, this.pos.y, this.size.x, this.size.y)
    }
    
    contains(p) {
        return (p.x >= this.pos.x && p.y >= this.pos.y && p.x <= this.pos.x+this.size.x && p.y <= this.pos.y+this.size.y)
    }

    translate_out(p, offset) {
        var output = undefined

        if (this.contains(p)) {
            var output = p.copy()

            var dx = p.x - this.pos.x;
            var dy = p.y - this.pos.y;
            
            var dw = this.pos.x + this.size.x - p.x;
            var dh = this.pos.y + this.size.y - p.y;

            if (p.x-dx-1 < 0) { dx = Infinity; }
            if (p.y-dy-1 < 0) { dy = Infinity; }
            if (p.y+dh+1 > height) { dh = Infinity; }
            if (p.x+dw+1 > width)  { dw = Infinity; }

            if (dx<=dy && dx<dw && dx<dh)
            {
                output.x = p.x-dx-offset;
            }
            else if (dy<dx && dy<dw && dy<dh)
            {
                output.y = p.y-dy-offset;
            }
            else if (dh<=dx && dh<=dw && dh<dy)
            {
                output.y = p.y+dh+offset;   
            }
            else if (dw<=dx && dw<dh && dw<dy)
            {
                output.x = p.x+dw+offset;
            }
        }

        return output
    }
}

class Paddle extends Rectangle {

    static PADDLE_SIZE = new p5.Vector(20, 120)
    static PADDLE_H_OFFSET = 105
    static VERTICAL_DELTA = 7

    constructor (x, y) {
        super(x, y, Paddle.PADDLE_SIZE)

        this.init_pos = createVector(x, y)
        this.v_speed = 0
        this.can_move = false
    }

    set_direction(dir) {
        this.can_move = (dir != undefined && dir != 0)
        this.v_speed = Paddle.VERTICAL_DELTA * sign(dir)
    }

    update() {
        if (this.can_move) this.move(this.v_speed)

        this.draw()
    }

    reset() {
        this.pos = this.init_pos.copy()
        this.v_speed = 0
        this.can_move = false
    }

    move(delta) {
        this.pos.y = constrain(this.pos.y + delta, 0, height - Paddle.PADDLE_SIZE.y)
    }
}