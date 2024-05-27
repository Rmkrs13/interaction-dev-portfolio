let player;
let playerImg;
let beerImg;
let chocoImg;
let beers = [];
let chocomelks = [];
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameInterval;
let orientationPermissionGranted = false;
let gameOver = false;
let timeElapsed = 0;
let chocoMilkFrequency = 60;

function preload() {
    playerImg = loadImage('./images/xavier.svg');
    beerImg = loadImage('./images/beer.svg');
    chocoImg = loadImage('./images/choco.svg');
}

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight * 0.8);
    canvas.parent('canvas-container');
    player = createVector(width / 2, height / 2);  // Center player at the start
    scoreElement = select('#score');
    noLoop();
}

function draw() {
    background(200);

    // Draw player
    image(playerImg, player.x - 40, player.y - 40, 80, 80);

    // Handle beers
    for (let i = beers.length - 1; i >= 0; i--) {
        beers[i].y += 5;
        image(beerImg, beers[i].x - 15, beers[i].y - 15, 30, 30);
        if (dist(player.x, player.y, beers[i].x, beers[i].y) < 40) {
            score++;
            scoreElement.html('Score: ' + score);
            beers.splice(i, 1);
        } else if (beers[i].y > height) {
            beers.splice(i, 1);
        }
    }

    // Handle chocomelks
    for (let i = chocomelks.length - 1; i >= 0; i--) {
        chocomelks[i].y += 5;
        image(chocoImg, chocomelks[i].x - 15, chocomelks[i].y - 15, 30, 30);
        if (dist(player.x, player.y, chocomelks[i].x, chocomelks[i].y) < 40) {
            endGame();
            return;
        } else if (chocomelks[i].y > height) {
            chocomelks.splice(i, 1);
        }
    }

    if (frameCount % 30 == 0) {
        beers.push(createVector(random(0, width), 0));
    }

    if (frameCount % chocoMilkFrequency == 0) {
        chocomelks.push(createVector(random(0, width), 0));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('start-btn').addEventListener('click', requestOrientationPermission);
    document.getElementById('restart-btn').addEventListener('click', resetGame);
});

function requestOrientationPermission() {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response === 'granted') {
                    orientationPermissionGranted = true;
                    startGame();
                } else {
                    alert('Gyroscope access denied');
                }
            })
            .catch(console.error);
    } else if (window.DeviceOrientationEvent) {
        startGame();
    } else {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('no-gyro-screen').classList.remove('hidden');
    }
}

function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    player.set(width / 2, height / 2);  // Center player at the start of the game
    score = 0;
    scoreElement.html('Score: ' + score);
    timeElapsed = 0;
    chocoMilkFrequency = 60; // Reset frequency
    gameInterval = setInterval(updateGame, 1000);
    loop();
    window.addEventListener('deviceorientation', handleOrientation);
}

function handleOrientation(event) {
    if (orientationPermissionGranted || window.DeviceOrientationEvent) {
        let dx = map(event.gamma, -45, 45, -5, 5);
        let dy = map(event.beta, -45, 45, -5, 5);
        player.x = constrain(player.x + dx, 0, width);
        player.y = constrain(player.y + dy, 0, height);
    }
}

function updateGame() {
    timeElapsed++;
    if (timeElapsed % 60 === 0) { // Every minute
        chocoMilkFrequency = max(10, chocoMilkFrequency - 5); // Increase frequency by reducing interval
    }
}

function endGame() {
    clearInterval(gameInterval);
    noLoop();
    gameOver = true;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    document.getElementById('final-score').textContent = score;
    document.getElementById('high-score').textContent = highScore;
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('end-screen').classList.remove('hidden');
}

function resetGame() {
    document.getElementById('end-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
    player.set(width / 2, height / 2);  // Center player at the reset of the game
    beers = [];
    chocomelks = [];
    score = 0;
    gameOver = false;
}