/*--------------------------------*
 * Game Setup                     *
 *--------------------------------*/
// setup canvas
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;
canvas.style.backgroundColor = GAME_BACKGROUND_COLOR;

// insert controller
window.addEventListener('keydown', keyDownHandler);
window.addEventListener('keyup', keyUpHandler);

/*--------------------------------*
 * Game Variables                 *
 *--------------------------------*/
let controller = {};
controller.one = {};
controller.two = {};

let player1 = new Player();
player1.paddle.setup(PADDLE_MARGIN, canvas.height/2-PADDLE_HEIGHT/2, PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_FILL_COLOR, PADDLE_LINE_COLOR);
player1.paddle.controllerNumber = 1;
player1.paddle.ySpeed = 5;
player1.paddle.xSpeed = 5;
player1.paddle.ballReleased = false;
player1.score = 0;
player1.scoreSetup(canvas.width/2-30, 20, 'right');
player1.turn = true;

let player2 = new Player();
player2.paddle.setup(canvas.width-PADDLE_WIDTH-PADDLE_MARGIN, canvas.height/2-PADDLE_HEIGHT/2, PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_FILL_COLOR, PADDLE_LINE_COLOR);
player2.paddle.controllerNumber = 2;
player2.paddle.ySpeed = 5;
player2.paddle.xSpeed = 5;
player2.paddle.ballReleased = true;
player2.score = 0;
player2.scoreSetup(canvas.width/2+30, 20, 'left');
player2.turn = false;

let ball = new Ball(0, 0, BALL_RADIUS, BALL_FILL_COLOR, BALL_LINE_COLOR);

let controlScreen = true;

/*--------------------------------*
 * Preloading                     *
 *--------------------------------*/
let controlScreenImage = new Image();
controlScreenImage.ready = false;
controlScreenImage.onload = setAssetReady;
controlScreenImage.src = 'img/pong_controls.png';

function setAssetReady() {
    this.ready = true;
}

// preloading screen
drawText(canvas.width/2, canvas.height/2, 'Loading ...', 'white', 'center')

// start preloading
let preloader = setInterval(preloading, 1000/GAME_FPS);

function preloading() {
    if (controlScreenImage.ready) {  // if assets have been loaded
        // stop preloading
        clearInterval(preloader);

        // start game
        let startGame = setInterval(gameloop, 1000/GAME_FPS);
    }
}

/*--------------------------------*
 * Game Loop                      *
 *--------------------------------*/
function gameloop() {
    clearCanvas();

    if (controlScreen) {
        context.drawImage(controlScreenImage, 0, 0, canvas.width, canvas.height);
        if (controller.one.start) {
            controlScreen = false;
        }
    } else {
        ball.move();
        player1.move();
        player2.move();
        
        // player1 collision detection
        let player1HitEdge = rectHitEdge(player1.paddle);
        if (player1HitEdge.top) {
            player1.paddle.changePosition(player1.paddle.x, 1);
        }
        if (player1HitEdge.bottom) {
            player1.paddle.changePosition(player1.paddle.x, canvas.height-player1.paddle.height-1);
        }

        // player2 collision detection
        let player2HitEdge = rectHitEdge(player2.paddle);
        if (player2HitEdge.top) {
            player2.paddle.changePosition(player2.paddle.x, 1);
        }
        if (player2HitEdge.bottom) {
            player2.paddle.changePosition(player2.paddle.x, canvas.height-player2.paddle.height-1);
        }

        // check ball state
        if (!player1.paddle.ballReleased) { // player1 not release the ball

            // stick ball to paddle player1
            ball.changePosition(player1.paddle.xw+ball.radius+1, player1.paddle.yh-(player1.paddle.height/2));

        } else if (!player2.paddle.ballReleased) { // player2 not release the ball

            // stick ball to paddle player1
            ball.changePosition(player2.paddle.x-ball.radius-1, player2.paddle.yh-(player2.paddle.height/2));

        } else { // both release the ball
            
            // ball collision detection
            const ballHitEdge = circleHitEdge(ball);
            if (ballHitEdge.top) {
                ball.changePosition(ball.x, ball.radius+1);
                ball.inverseDirectionY();
            }
            if (ballHitEdge.bottom) {
                ball.changePosition(ball.x, canvas.height-ball.radius-1);
                ball.inverseDirectionY();
            }

            const ballHitPlayer1 = isBallHitPaddle(ball, player1.paddle);
            const ballHitPlayer2 = isBallHitPaddle(ball, player2.paddle);
            if (ballHitPlayer1) {
            
                // change ball position 
                ball.changePosition(player1.paddle.xw+ball.radius+1, ball.y);

                // change ball speed and inverse ball direction to right (+)
                ball.xSpeed = getRandomNumber(BALL_SPEED_MIN, BALL_SPEED_MAX);
                
            } else if (ballHitPlayer2) {
            
                // change ball position 
                ball.changePosition(player2.paddle.x-ball.radius-1, ball.y);

                // change ball speed and inverse ball direction to left (-)
                ball.xSpeed = getRandomNumber(BALL_SPEED_MIN, BALL_SPEED_MAX) * -1;
            }
            

            if (ball.x+ball.radius < 0) { // ball out of arena left
                player2.score++;

                const totalScoreEven = isEven(player1.score + player2.score);
                if (totalScoreEven) {
                    changePlayerTurn();  
                }

                resetBallPosition();
            } else if (ball.x-ball.radius > canvas.width) { // ball out of arena right
                player1.score++;

                const totalScoreEven = isEven(player1.score + player2.score);
                if (totalScoreEven) {
                    changePlayerTurn();           
                }

                resetBallPosition();
            }
        }

        if (player1.score === 11) {
            alert("Player 1 WIN!");
            restartGame();
        } else if (player2.score === 11) {
            alert("Player 2 WIN!");
            restartGame();
        }

        ball.show();
        player1.show();
        player2.show();
    }
}

/*--------------------------------*
 * Controller                     *
 *--------------------------------*/
function keyDownHandler(event) {
    let keyboard = String.fromCharCode(event.keyCode);

    // controller-1 settings
    if (keyboard === 'W') {
        controller.one.up = true;
    }
    if (keyboard === 'S') {
        controller.one.down = true;
    }
    if (keyboard === 'D') {
        controller.one.releaseBall = true;
    }
    if (keyboard === ' ') {
        controller.one.start = true;
    }

    // controller-2 settings
    if (keyboard === 'I') {
        controller.two.up = true;
    }
    if (keyboard === 'K') {
        controller.two.down = true;
    }
    if (keyboard === 'J') {
        controller.two.releaseBall = true;
    }
}
function keyUpHandler(event) {
    let keyboard = String.fromCharCode(event.keyCode);

    // controller-1 settings
    if (keyboard === 'W') {
        controller.one.up = false;
    }
    if (keyboard === 'S') {
        controller.one.down = false;
    }
    if (keyboard === 'D') {
        controller.one.releaseBall = false;
    }
    if (keyboard === ' ') {
        controller.one.start = false;
    }

    // controller-2 settings
    if (keyboard === 'I') {
        controller.two.up = false;
    }
    if (keyboard === 'K') {
        controller.two.down = false;
    }
    if (keyboard === 'J') {
        controller.two.releaseBall = false;
    }
}

function Player() {
    this.paddle = new Paddle();
    this.score = 0;
    this.turn = false;

    this.scoreSetup = (x, y, align) => {
        this.scoreX = x;
        this.scoreY = y;
        this.scoreAlign = align;
    };
    this.move = () => {
        this.paddle.move();
    };
    this.show = (x, y, align) => {
        this.paddle.show();
        drawText(this.scoreX, this.scoreY, this.score, 'white', this.scoreAlign);
    };
}

function Paddle() {
    this.setup = (x, y, width, height, fillColor, lineColor) => {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.fillColor = fillColor;
        this.lineColor = lineColor;
        this.xw = this.x + this.width;
        this.yh = this.y + this.height;
        this.xSpeed = 1;
        this.ySpeed = 1;
        this.controllerNumber = 1;
        this.ballReleased = false;
    };
    this.show = () => {
        drawRect(this.x, this.y, this.width, this.height, this.fillColor, this.lineColor);
    };
    this.move = () => {
        if (this.controllerNumber === 1) {
            if (controller.one.up) {
                this.y -= this.ySpeed;
            }
            if (controller.one.down) {
                this.y += this.ySpeed;
            }
            if (controller.one.releaseBall) {
                this.ballReleased = true;
            }
        } else if (this.controllerNumber === 2) {
            if (controller.two.up) {
                this.y -= this.ySpeed;
            }
            if (controller.two.down) {
                this.y += this.ySpeed;
            }
            if (controller.two.releaseBall) {
                this.ballReleased = true;
            }
        }
        this.xw = this.x + this.width;
        this.yh = this.y + this.height;
    };
    this.changePosition = (x, y) => {
        this.x = x;
        this.y = y;
        this.xw = this.x + this.width;
        this.yh = this.y + this.height;
    };
}

function Ball(x, y, radius, fillColor, lineColor) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.fillColor = fillColor;
    this.lineColor = lineColor;
    this.xSpeed = 5;
    this.ySpeed = 5;
    
    this.show = () => {
        drawCircle(this.x, this.y, this.radius, this.fillColor, this.lineColor)
    };
    this.move = () => {
        this.x += this.xSpeed;
        this.y += this.ySpeed;
    };
    this.changePosition = (x, y) => {
        this.x = x;
        this.y = y;
    };
    this.inverseDirectionX = () => {
        this.xSpeed *= -1;
    };
    this.inverseDirectionY = () => {
        this.ySpeed *= -1;
    }
}

function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function drawRect(x, y, width, height, fillColor, lineColor) {
    context.fillStyle = fillColor;
    context.fillRect(x, y, width, height);
    context.strokeStyle = lineColor;
    context.strokeRect(x, y, width, height);
}

function drawCircle(x, y, radius, fillColor, lineColor) {
    context.beginPath();
    context.arc(x, y, radius, 0, 2*Math.PI, false);
    context.fillStyle = fillColor;
    context.fill();
    context.strokeStyle = lineColor;
    context.stroke();
}

function drawText(x, y, text, fillColor, align) {
    context.textBaseline = 'top';
    context.textAlign = align;
    context.font = "bold 40px sans-serif";
    context.fillStyle = fillColor;
	context.fillText(text, x, y);
}

function rectHitEdge(object) {
    let collision = {};
    if (object.x <= 0) {
        collision.left = true;
    } 
    if (object.xw >= canvas.width) {
        collision.right = true;
    }
    if (object.y <= 0) {
        collision.top = true;
    } 
    if (object.yh >= canvas.height) {
        collision.bottom = true;
    }
    return collision;
}

function circleHitEdge(object) {
    let collision = {};
    if (object.x-object.radius <= 0) {
        collision.left = true;
    } 
    if (object.x+object.radius >= canvas.width) {
        collision.right = true;
    }
    if (object.y-object.radius <= 0) {
        collision.top = true;
    } 
    if (object.y+object.radius >= canvas.height) {
        collision.bottom = true;
    }
    return collision;
}

function isBallHitPaddle(ball, paddle) {
    if (
        (ball.x+ball.radius >= paddle.x && ball.x-ball.radius <= paddle.xw) && 
        (ball.y+ball.radius >= paddle.y && ball.y-ball.radius <= paddle.yh) 
    ) {
        return true;
    } else {
        return false;
    }
}

function getRandomNumber(minimum, maximum) {
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

function isEven(number) {
    if (number % 2 === 0) {
        return true;
    } else {
        return false;
    }
}

function changePlayerTurn() {
    player1.turn = !player1.turn;
    player2.turn = !player2.turn;
}

function resetBallPosition() {
    if (player1.turn) {
        player1.paddle.ballReleased = false;
        player2.paddle.ballReleased = true;
        ball.changePosition(player1.paddle.xw+ball.radius+1, player1.paddle.yh-(player1.paddle.height/2));
    } else if (player2.turn) {
        player1.paddle.ballReleased = true;
        player2.paddle.ballReleased = false;
        ball.changePosition(player2.paddle.x-ball.radius-1, player2.paddle.yh-(player2.paddle.height/2));
    }
}

function restartGame() {
    // reset player1 stats
    player1.paddle.changePosition(PADDLE_MARGIN, canvas.height/2-PADDLE_HEIGHT/2);
    player1.paddle.ySpeed = 5;
    player1.paddle.xSpeed = 5;
    player1.paddle.ballReleased = false;
    player1.score = 0;
    player1.turn = true;

    // reset player2 stats
    player2.paddle.changePosition(canvas.width-PADDLE_WIDTH-PADDLE_MARGIN, canvas.height/2-PADDLE_HEIGHT/2);
    player2.paddle.ySpeed = 5;
    player2.paddle.xSpeed = 5;
    player2.paddle.ballReleased = true;
    player2.score = 0;
    player2.turn = false;

    // go back to control screen
    controlScreen = true;
}
