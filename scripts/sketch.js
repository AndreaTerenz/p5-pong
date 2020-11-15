var p1, p2 = undefined
var b = undefined

function setup() {
    createCanvas(1000, 500);
    
    p1 = new Paddle(Paddle.PADDLE_H_OFFSET, (height - Paddle.PADDLE_SIZE.y)/2);
    p2 = new Paddle((width - Paddle.PADDLE_SIZE.x) - Paddle.PADDLE_H_OFFSET, (height - Paddle.PADDLE_SIZE.y)/2);
    b = new Ball()
}

function draw() {
    background(0);
    p1.update()
    p2.update()
    

    p1.draw();
    p2.draw();

    b.update(p1, p2)
    b.draw()
}

function keyPressed() {
    if (keyCode == UP_ARROW || keyCode == DOWN_ARROW) {
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