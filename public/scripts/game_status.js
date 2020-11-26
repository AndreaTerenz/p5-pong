class GameStatus {
    constructor () {
        this.winner = 0;
        this.score_1 = 0
        this.score_2 = 0
        this.playing = false
        this.room_filled = false
    }

    start() {
        if (this.room_filled && !this.playing) {
            this.reset_scores();
            this.winner = 0;
            this.playing = true;
        }
    }

    reset(room_still_filled = true) {
        this.reset_scores();
        this.winner = 0
        this.room_filled = room_still_filled;
        this.playing = false;
    }

    reset_scores() {
        this.score_1 = 0;
        this.score_2 = 0;
    }

    check_winner() {
        if (this.score_1 >= score_limit)
            this.winner = 1;
        else if (this.score_2 >= score_limit)
            this.winner = 2;

        return (this.winner != 0);
    }

    check_score(b_x, p1_x, p2_x) {
        if (b_x <= p1_x) {
            this.score_2 += 1;
            return 2;
        }
        if (b_x >= p2_x + Paddle.PADDLE_SIZE.x) {
            this.score_1 += 1;
            return 1;
        }

        return 0;
    }
};
