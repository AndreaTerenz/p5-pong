var p1, p2 = undefined

function setup() {
    createCanvas(900, 400);
    p1 = new Paddle(40, (height - Paddle.PADDLE_SIZE.y)/2);
    p2 = new Paddle((width - Paddle.PADDLE_SIZE.x) - 40, (height - Paddle.PADDLE_SIZE.y)/2);
}

function draw() {
    background(0);
    p1.draw();
    p2.draw();
}
