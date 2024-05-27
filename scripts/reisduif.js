let video;
let poseNet;
let noseX = 0;
let noseY = 0;
let birdY = 0;
let obstacles = [];
let score = 0;
let highscore = localStorage.getItem('highscore') || 0;
const obstacleWidth = 50;
let obstacleSpeed = 5;
let birdImg;
let noseDetected = false;
let noseMissingFrames = 0;
const maxNoseMissingFrames = 60; // End game if no nose detected for 1 second (60 frames)
let minGap;
let obstacleSpacing;

function preload() {
    birdImg = loadImage('../images/duif.svg'); // Zorg ervoor dat je een afbeelding van een duif hebt in je project
}

function setup() {
    const canvas = createCanvas(400, 400);
    canvas.parent('game-canvas');
    video = createCapture(VIDEO);
    video.size(400, 400);
    video.hide();

    poseNet = ml5.poseNet(video, modelLoaded);
    poseNet.on('pose', gotPoses);

    minGap = height * 0.1;
    obstacleSpacing = 200;

    resetGame();
    noLoop();
}

function draw() {
    background(255);
    push();
    translate(video.width, 0);
    scale(-1, 1);
    image(video, 0, 0);
    pop();

    if (!noseDetected) {
        noseMissingFrames++;
        if (noseMissingFrames > maxNoseMissingFrames) {
            endGame();
            return;
        }
    } else {
        noseMissingFrames = 0;
    }

    birdY = lerp(birdY, noseY, 0.5);
    image(birdImg, width - noseX - 25, birdY - 25, 50, 50); // Spiegel de positie van de neus

    handleObstacles();
    // displayScore(); // Verwijderd omdat we de score niet op het canvas willen weergeven
}

function gotPoses(poses) {
    if (poses.length > 0) {
        noseDetected = true;
        let newNoseX = poses[0].pose.nose.x;
        let newNoseY = poses[0].pose.nose.y;
        noseX = newNoseX;
        noseY = newNoseY;
    } else {
        noseDetected = false;
    }
}

function modelLoaded() {
    console.log('PoseNet model loaded');
}

function handleObstacles() {
    if (frameCount % obstacleSpacing === 0) {
        const gapY = random(minGap, height - minGap);
        const gapHeight = height * 0.1;
        obstacles.push({ x: width, top: gapY - gapHeight, bottom: gapY + gapHeight });
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obstacle = obstacles[i];
        obstacle.x -= obstacleSpeed;

        if (obstacle.x < -obstacleWidth) {
            obstacles.splice(i, 1);
            score++;
            document.getElementById('current-score').textContent = score; // Update score in de span
            if (score > highscore) {
                highscore = score;
                localStorage.setItem('highscore', highscore);
            }
        }

        fill(0);
        rect(obstacle.x, 0, obstacleWidth, obstacle.top);
        rect(obstacle.x, obstacle.bottom, obstacleWidth, height - obstacle.bottom);

        if (
            (width - noseX > obstacle.x && width - noseX < obstacle.x + obstacleWidth &&
            (birdY < obstacle.top || birdY > obstacle.bottom))
        ) {
            endGame();
        }
    }

    if (frameCount % 600 === 0) { // Every 10 seconds (assuming 60 fps), increase speed
        obstacleSpeed += 1;
    }
}

// Verwijderd omdat we de score niet op het canvas willen weergeven
// function displayScore() {
//     fill(0);
//     textSize(32);
//     textAlign(CENTER, CENTER);
//     text('Score: ' + score, width / 2, height - 30);
// }

function resetGame() {
    score = 0;
    obstacles = [];
    obstacleSpeed = 5;
    noseDetected = true;
    noseMissingFrames = 0;
    document.getElementById('current-score').textContent = score;
}

function endGame() {
    noLoop();
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('end-screen').classList.remove('hidden');
    document.getElementById('score').textContent = score;
    document.getElementById('highscore').textContent = highscore;
}

document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    resetGame();
    loop();
});

document.getElementById('restart-btn').addEventListener('click', () => {
    document.getElementById('end-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    resetGame();
    loop();
});