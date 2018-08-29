/*--------------------------------*
 * Game System                    *
 *--------------------------------*/
// setup canvas and context
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');

// canvas settings
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;
canvas.style.backgroundColor = GAME_BACKGROUND_COLOR;

// text settings
context.textBaseline = 'top';

// start game loop
let gameloop = setInterval(update, 1000/GAME_FPS);

// enable controller
canvas.addEventListener('click', canvasClick);

/*--------------------------------*
 * Game Variables                 *
 *--------------------------------*/
let isClicked = false;
let clickX = 0;
let clickY = 0;
let playerHand = '';
let opponentHand = '';
let isOpponentTurn = false;
let isOpponentTextAppear = false;

const buttonTexts = ['ROCK', 'PAPER', 'SCISSOR'];
const lines = [];
lines[0] = { x: TEXTBOX_MARGIN_LEFT + TEXTBOX_FONT_MARGIN_LEFT, y: TEXTBOX_MARGIN_TOP + TEXTBOX_FONT_MARGIN_TOP};
lines[1] = { x: TEXTBOX_MARGIN_LEFT + TEXTBOX_FONT_MARGIN_LEFT, y: lines[0].y + TEXTBOX_FONT_DEFAULT_SIZE + TEXTBOX_FONT_DEFAULT_SPACING };
lines[2] = { x: TEXTBOX_MARGIN_LEFT + TEXTBOX_FONT_MARGIN_LEFT, y: lines[1].y + TEXTBOX_FONT_DEFAULT_SIZE + TEXTBOX_FONT_DEFAULT_SPACING };
lines[3] = { x: TEXTBOX_MARGIN_LEFT + TEXTBOX_FONT_MARGIN_LEFT, y: lines[2].y + TEXTBOX_FONT_DEFAULT_SIZE + TEXTBOX_FONT_DEFAULT_SPACING };
lines[4] = { x: TEXTBOX_MARGIN_LEFT + (TEXTBOX_WIDTH/2), y: lines[3].y + TEXTBOX_FONT_DEFAULT_SIZE + TEXTBOX_FONT_BIG_SPACING };

/*--------------------------------*
 * Game Loop                      *
 *--------------------------------*/
function update() {
    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // draw textbox (x, y, width, length, fillColor, lineColor)
    drawRect(TEXTBOX_MARGIN_LEFT, TEXTBOX_MARGIN_TOP, TEXTBOX_WIDTH, TEXTBOX_HEIGHT, TEXTBOX_FILL_COLOR, TEXTBOX_LINE_COLOR);

    // draw textbox text (text, line)
    drawTextboxText('Pick your hand ...', 0);
    if (playerHand) {
        drawTextboxText('> You picked ' + playerHand, 1);
        drawTextboxText('Waiting opponent ...', 2);
        if (!opponentHand) {
            let index = getRandomNumber(0, 2);
            opponentHand = buttonTexts[index];
            isOpponentTurn = true;
        }
    }
    if (isOpponentTurn && opponentHand) {
        setTimeout(() => {
            drawTextboxText('> Opponent picked ' + opponentHand, 3);
            isOpponentTextAppear = true;
        }, 1000*OPPONENT_DELAY);
        isOpponentTurn = false;
    }
    if (isOpponentTextAppear) {
        drawTextboxText('> Opponent picked ' + opponentHand, 3);
        if ( result() === 'WIN' ) {
            drawTextboxText('YOU WIN!', 4);
        } else if ( result() === 'DRAW' ) {
            drawTextboxText('YOU DRAW!', 4);
        } else if ( result() === 'LOSE' ) {
            drawTextboxText('YOU LOSE!', 4);
        }
    }

    // draw buttons
    const buttonX = BUTTON_MARGIN_LEFT;
    let buttonY = TEXTBOX_MARGIN_TOP + TEXTBOX_HEIGHT + TEXTBOX_MARGIN_BOTTOM + BUTTON_MARGIN_TOP;
    for (let i = 0; i < 3; ++i) {
        // draw button
        drawRect(buttonX, buttonY, BUTTON_WIDTH, BUTTON_HEIGHT, BUTTON_FILL_COLOR, BUTTON_LINE_COLOR);

        // draw button text
        const buttonTextX = BUTTON_MARGIN_LEFT + (BUTTON_WIDTH/2);
        let buttonTextY = buttonY + (BUTTON_HEIGHT-BUTTON_FONT_SIZE)/2;
        drawButtonText(buttonTexts[i], buttonTextX, buttonTextY);

        // check button click
        if (isClicked) {
            if ( !playerHand && isButtonClicked(buttonX, buttonY, BUTTON_WIDTH, BUTTON_HEIGHT, clickX, clickY) ) {
                playerHand = buttonTexts[i];
            }
        }

        // go to next button
        buttonY += BUTTON_MARGIN_TOP+BUTTON_HEIGHT;
    }

    // reset click status
    isClicked = false;
}

/*--------------------------------*
 * Controller                     *
 *--------------------------------*/
function canvasClick(event) {
    clickX = event.clientX - canvas.offsetLeft + window.pageXOffset;
    clickY = event.clientY - canvas.offsetTop + window.pageYOffset;

    isClicked = true;
}

/*--------------------------------*
 * Functions                      *
 *--------------------------------*/
function drawRect(x, y, width, height, fillColor, lineColor)
{
	context.fillStyle = fillColor;
	context.fillRect(x, y, width, height);
	context.strokeStyle = lineColor;
	context.strokeRect(x, y, width, height);
}

// need game variable: lines
function drawTextboxText(text, line) {
    if (line < 4) {
        context.font = 'bold ' + TEXTBOX_FONT_DEFAULT_SIZE + 'px sans-serif';
        context.textAlign = 'left';
        context.fillStyle = TEXTBOX_FONT_DEFAULT_COLOR;
        context.fillText(text, lines[line].x, lines[line].y);
    }
    if (line === 4) {
        context.font = 'bold ' + TEXTBOX_FONT_BIG_SIZE + 'px sans-serif';
        context.textAlign = 'center';
        context.fillStyle = TEXTBOX_FONT_BIG_COLOR;
        context.fillText(text, lines[line].x, lines[line].y);
    }
}

function drawButtonText(text, x, y) {
    context.font = 'bold ' + BUTTON_FONT_SIZE + 'px sans-serif';
    context.textAlign = 'center';
    context.fillStyle = BUTTON_FONT_COLOR;
    context.fillText(text, x, y);
}

function isButtonClicked(buttonX, buttonY, buttonWidth, buttonHeight, clickX, clickY)
{
	if (
        (buttonX <= clickX && buttonX+buttonWidth >= clickX) &&
        (buttonY <= clickY && buttonY+buttonHeight >= clickY) 
    ) {
        return true;
	} else {
		return false;
    }
}

// need game variables: playerHand, opponentHand
function result() {
    if (
        (playerHand === 'ROCK' && opponentHand === 'SCISSOR') || 
        (playerHand === 'PAPER' && opponentHand === 'ROCK') || 
        (playerHand === 'SCISSOR' && opponentHand === 'PAPER') 
    ) {
        return 'WIN';
    } else if (
        (playerHand === 'ROCK' && opponentHand === 'ROCK') || 
        (playerHand === 'PAPER' && opponentHand === 'PAPER') || 
        (playerHand === 'SCISSOR' && opponentHand === 'SCISSOR') 
    ) {
        return 'DRAW';
    } else {
        return 'LOSE';
    }
}

function getRandomNumber(minimum, maximum) {
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}
