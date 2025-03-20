//initialize high score
let highScore = localStorage.getItem('highScore') || 0;

//home screen
let homeScreen = true;

//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdImg;

let birdWidth = 34; // Same for both
let birdHeight = 24; // Same for both

let bird1 = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight,
    velocityY: 0,
    score: 0,
    gameOver: false,
    hasPlayedDeathSound: false // Flag to prevent death sound from playing repeatedly
};

let bird2 = {
    x: birdX + 50,
    y: birdY,
    width: birdWidth,  // Ensure same width
    height: birdHeight, // Ensure same height
    velocityY: 0,
    score: 0,
    gameOver: false,
    hasPlayedDeathSound: false // Flag to prevent death sound from playing repeatedly
};


//pipes
let pipeArray = [];
let pipeWidth = 64; 
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg
let bottomPipeImg

//physics
let velocityX = -2; //pipes moving left speed
let velocityY = 0; //bird jump speed
let gravity = 0.2; //bird falling speed

let gameOver = false;
let score = 0;


window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    drawHomeScreen(); // Show the home screen initially
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    //Display high score
    context.fillStyle = "white";
    context.font = "20px sans-serif";
    context.fillText("High Score: " + highScore, 5, 70);

    // Load images for each player
    birdImg1 = new Image();
    birdImg1.src = "./flappybird.png";

    birdImg2 = new Image();
    birdImg2.src = "./flappybirdblue.png";

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500);
    document.addEventListener("keydown", moveBird);
};

function update() {

    console.log("Game Running...");

    if (homeScreen) {
        drawHomeScreen();
        return;
    }

    // Stop the game logic if both players are in the gameOver state
    if (bird1.gameOver && bird2.gameOver) {
        console.log("Game over. Waiting for restart...");

        // Ensure high score gets updated properly
        if (bird1.score > highScore) {
            highScore = bird1.score;
            localStorage.setItem('highScore', highScore); // Save to localStorage
        }
        if (bird2.score > highScore) {
            highScore = bird2.score;
            localStorage.setItem('highScore', highScore); // Save to localStorage
        }

        // Only proceed if gameOver flag is not already set
        if (!gameOver) {
            gameOver = true;  // Set the flag to prevent multiple refreshes
            // After 2 seconds, refresh the game
            setTimeout(() => {
                location.reload();  // This will reload the page
            }, 2000);
        }

        // Play game over sound (if not already played)
        const gameOverSound = document.getElementById('gameOverSound');
        if (gameOverSound && !gameOverSound.hasPlayed) {
            gameOverSound.hasPlayed = true;
            gameOverSound.play();
        }

        // Pause background music (if playing)
        const bgm = document.getElementById('bgm');
        if (bgm && !bgm.paused) {
            console.log("Pausing background music...");
            bgm.pause();
        }

        // Display "GAME OVER" text
        context.fillStyle = "white";
        context.font = "45px sans-serif";
        context.textAlign = "center";
        context.fillText("GAME OVER", board.width / 2, board.height / 2 - 40);

        // Display High Score
        context.fillStyle = "white";
        context.font = "20px sans-serif";
        context.fillText("High Score: " + highScore, board.width / 2, board.height / 2 + 10);

        return;  // Stop the update loop
    }

    requestAnimationFrame(update);  // Keep the game loop running
    context.clearRect(0, 0, board.width, board.height);

    // Update Player 1
    if (!bird1.gameOver) {
        bird1.velocityY += gravity;
        bird1.y = Math.max(bird1.y + bird1.velocityY, 0);
        context.drawImage(birdImg1, bird1.x, bird1.y, birdWidth, birdHeight);

        // Check if bird1 falls off the screen
        if (bird1.y > board.height && !bird1.gameOver) {
            bird1.gameOver = true;
            bird1.velocityY = 0; // Stop falling when dead
            playDeathSound(bird1); // Play death sound when falling
        }
    }

    // Update Player 2
    if (!bird2.gameOver) {
        bird2.velocityY += gravity;
        bird2.y = Math.max(bird2.y + bird2.velocityY, 0);
        context.drawImage(birdImg2, bird2.x, bird2.y, birdWidth, birdHeight);

        // Check if bird2 falls off the screen
        if (bird2.y > board.height && !bird2.gameOver) {
            bird2.gameOver = true;
            bird2.velocityY = 0; // Stop falling when dead
            playDeathSound(bird2); // Play death sound when falling
        }
    }


    // Check for collisions and update scores for both players
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        // Player 1 score update
        if (!pipe.passedByP1 && bird1.x > pipe.x + pipe.width && !bird1.gameOver) {
            bird1.score += 0.5; // Increase score only for Player 1
            pipe.passedByP1 = true; // Mark pipe as passed for Player 1
            //play score sound
            const scoreSound = document.getElementById('scoreSound');
            if (scoreSound) {
                scoreSound.currentTime = 0;
                scoreSound.play();
            }
        }

        // Player 2 score update
        if (!pipe.passedByP2 && bird2.x > pipe.x + pipe.width && !bird2.gameOver) {
            bird2.score += 0.5; // Increase score only for Player 2
            pipe.passedByP2 = true; // Mark pipe as passed for Player 2
            //play score sound
            const scoreSound = document.getElementById('scoreSound');
            if (scoreSound) {
                scoreSound.currentTime = 0;
                scoreSound.play();
            }
        }

        // Collision detection
        if (detectCollision(bird1, pipe)) {
            if (!bird1.gameOver) {
                bird1.gameOver = true;
                bird1.velocityY = 0; // Stop falling when dead
                playDeathSound(bird1); // Play death sound when falling
            }
        }
        
        if (detectCollision(bird2, pipe)) {
            if (!bird2.gameOver) {
                bird2.gameOver = true;
                bird2.velocityY = 0; // Stop falling when dead
                playDeathSound(bird2); // Play death sound when falling
            }
        }
    }

    // Display scores
    context.fillStyle = "white";
    context.font = "20px sans-serif";
    context.textAlign = "center"; // Center text horizontally

    // Player 1 Score
    context.fillText("Player 1 Score: " + bird1.score, board.width / 4, 20);

    // Player 2 Score
    context.fillText("Player 2 Score: " + bird2.score, (board.width / 4) * 3, 20);

    // Display High Score below current scores
    context.font = "20px sans-serif";
    context.fillText("High Score: " + highScore, board.width / 2, 50); // Position High Score below the scores

    gameOverSound.hasPlayed = false;
}

function drawHomeScreen() {
    context.fillStyle = "black";
    context.fillRect(0, 0, board.width, board.height);

    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.textAlign = "center";
    context.fillText("Flappy Bird", board.width / 2, board.height / 2 - 20);

    context.fillStyle = "white";
    context.font = "20px sans-serif";
    context.textAlign = "center";
    context.fillText("Press Space to Start", board.width / 2, board.height / 2 + 20);
}

function placePipes() {
    if (gameOver) return;

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4; // Space between pipes

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passedByP1: false,
        passedByP2: false
    };
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace, 
        width: pipeWidth,
        height: pipeHeight,
        passedByP1: false,
        passedByP2: false
    };
    pipeArray.push(bottomPipe);
}


function moveBird(e) {
    if ((e.code === "Space") && !bird1.gameOver) {
        // Player 1 jump
        bird1.velocityY = -6;

        //play jump sound
        const playjumpSound = Math.random() < 0.5;
        if (playjumpSound) {
            const jumpSound = document.getElementById('jumpSound');
            if (jumpSound) {
                jumpSound.currentTime = 0;
                jumpSound.play();
            }
        }
        else {
            const swooshSound = document.getElementById('flapSound');
            if (jumpSound) {
                jumpSound.currentTime = 0;
                jumpSound.play();
            }
        }
    }

    if (e.code === "ArrowUp" && !bird2.gameOver) {
        // Player 2 jump
        bird2.velocityY = -6;

        //play jump sound
        const playjumpSound = Math.random() < 0.5;
        if (playjumpSound) {
            const jumpSound = document.getElementById('jumpSound');
            if (jumpSound) {
                jumpSound.currentTime = 0;
                jumpSound.play();
            }
        }
        else {
            const swooshSound = document.getElementById('flapSound');
            if (jumpSound) {
                jumpSound.currentTime = 0;
                jumpSound.play();
            }
        }
    }

    if (e.code == "KeyR") {
        // Reset high score
        highScore = 0;
        localStorage.setItem("highScore", highScore); // Clear high score in localStorage
        console.log("High score reset to 0");
    }
}

function detectCollision(a, b) {
    let birdHitboxShrink = 1; // Shrinks hitbox slightly for fine-tuned accuracy

    const hasCollided = (a.x + birdHitboxShrink < b.x + b.width) &&   
                        (a.x + a.width - birdHitboxShrink > b.x) &&   
                        (a.y + birdHitboxShrink < b.y + b.height) &&  
                        (a.y + a.height - birdHitboxShrink > b.y);    

    if (hasCollided) {
        if (a === bird1 && !bird1.gameOver && !bird1.hasPlayedDeathSound) {
            bird1.gameOver = true;
            bird1.hasPlayedDeathSound = true; // Mark Player 1 as having played death sound
            bird1.velocityY = 0; // Stop falling when dead
            const collisionSound = document.getElementById('collisionSound');
            if (collisionSound) {
                collisionSound.currentTime = 0;
                collisionSound.play();
            }
        }

        if (a === bird2 && !bird2.gameOver && !bird2.hasPlayedDeathSound) {
            bird2.gameOver = true;
            bird2.hasPlayedDeathSound = true; // Mark Player 2 as having played death sound
            bird2.velocityY = 0; // Stop falling when dead
            const collisionSound = document.getElementById('collisionSound');
            if (collisionSound) {
                collisionSound.currentTime = 0;
                collisionSound.play();
            }
        }
    }

    return hasCollided;
}

function restartGame() {
    console.log("Restarting game in 2 seconds...");
    setTimeout(() => {
        // Reset both players' game over flags and scores
        bird1.gameOver = false;
        bird2.gameOver = false;
        bird1.hasPlayedDeathSound = false; // Reset death sound flag
        bird2.hasPlayedDeathSound = false; // Reset death sound flag
        bird1.score = 0;
        bird2.score = 0;

        // Reset pipes and other game variables
        pipeArray = [];
        velocityY = 0; // Reset bird jump velocity
        score = 0; // Reset global score if used
        gameOver = false; // Reset global gameOver state if used

        console.log("Game state reset. Restarting game loop...");

        // Restart the game loop
        requestAnimationFrame(update);
    }, 2000); // 2-second delay
}

function startGame() {
    homeScreen = false;
    requestAnimationFrame(update);
}

function playDeathSound(bird) {
    if (!bird.hasPlayedDeathSound) {
        const collisionSound = document.getElementById('collisionSound');
        if (collisionSound) {
            collisionSound.currentTime = 0;
            collisionSound.play();
            bird.hasPlayedDeathSound = true; // Set the flag after the sound plays
        }
    }
}

document.addEventListener("click", function (event) {
    if (bird1.gameOver && bird2.gameOver) {
        // Check if the click is within the restart button bounds
        const buttonX = board.width / 2 - 50;
        const buttonY = board.height / 2 + 30;
        const buttonWidth = 100;
        const buttonHeight = 40;

        if (
            event.offsetX >= buttonX &&
            event.offsetX <= buttonX + buttonWidth &&
            event.offsetY >= buttonY &&
            event.offsetY <= buttonY + buttonHeight
        ) {
            console.log("Restart button clicked.");
            restartGame();
        } else {
            console.log("Click detected outside restart button.");
        }

        if (score > highScore) {
            highScore = Math.floor(score);
            localStorage.setItem('highScore', highScore); // Saving the high score to localStorage
        }
    }
});

document.addEventListener("keydown", function (event) {
    if ((bird1.gameOver && bird2.gameOver) && event.code === "Enter") {
        restartGame();
    }
});

document.addEventListener("keydown", function (event) {
    if (homeScreen && (event.code === "Space" || event.code === "Enter")) {
        startGame();

        // Ensure audio plays ONLY after user interaction
        const bgm = document.getElementById('bgm');
        if (bgm) {
            bgm.volume = 0.5; // Optional: Set volume
            bgm.currentTime = 0;
            bgm.play().catch(error => console.warn("BGM play failed:", error)); 
        }
    }
});

document.addEventListener("click", function () {
    if (homeScreen) {
        startGame();

        // Ensure audio plays ONLY after user interaction
        const bgm = document.getElementById('bgm');
        if (bgm) {
            bgm.volume = 0.5;
            bgm.currentTime = 0;
            bgm.play().catch(error => console.warn("BGM play failed:", error)); 
        }
    }
});
