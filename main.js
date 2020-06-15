// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 960;
canvas.height = 960;
document.body.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background01.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
};
heroImage.src = "images/hero.png";

// Monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
	monsterReady = true;
};
var chooseMonster = function () {
	var min = 1;
	var max = 5;
	var monsterChosen = Math.floor(Math.random() * (max - min + 1) + min);
	monsterImage.src = "images/monster0" + monsterChosen + ".png";
}
chooseMonster();

// Power Up image
var powerUpReady = false;
var powerUpImage = new Image();
powerUpImage.onload = function () {
	powerUpReady = true;
};
var choosePowerUp = function () {
	var min = 1;
	var max = 2;
	var powerChosen = Math.floor(Math.random() * (max - min + 1) + min);
	powerUpImage.src = "images/powerUp0" + powerChosen + ".png"
	if (powerChosen == 1){
		powerUpType = 1;
	}
	if (powerChosen == 2){
		powerUpType = 2;
	}
}

// Sound object
function sound(src){
	this.sound = document.createElement("audio");
	this.sound.src = src;
	this.sound.volume = .10;
	this.sound.setAttribute("preload", "auto");
  	this.sound.setAttribute("controls", "none");
	  this.sound.style.display = "none";
	  document.body.appendChild(this.sound);
	  this.play = function() {
		  this.sound.play();
	  }
	  this.stop	= function() {
		  this.sound.stop();
	  }
}

// Game objects
var hero = {
	speed: 256, // movement in pixels per second
	x: 0,
	y: 0
};
var monster = {
	x: 0,
	y: 0
};
var powerUp = {
	x: 0,
	y: 0
}
var monstersCaught = 0;
var highScore = 0;

var gameTime = 5;
var roundTimer = 5; // 10 seconds
var timer = setInterval(function(){counter(canvas,roundTimer--);}, 1000);

var powerUpActive = false;
var powerUpType = 0;
var bonusMoveSpeed = 0;

var themeMusic = new sound("audio/seranade.mp3");
var caughtMonster = new sound("audio/fast_swipe.mp3");
var potionSound = new sound("audio/potion_gulp.mp3");
var clockSound = new sound("audio/clock_tick.mp3");

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

// Ends the applied power up <IN PROGRESS>
var applyPowerUp = function () {
	
}

// Initial set up of the game
var set = function () {
	themeMusic.play();

	roundTimer = gameTime;
	bonusMoveSpeed = 0;

	hero.x = canvas.width / 2;
	hero.y = canvas.height / 2;

	spawnPowerUp();

	// Throw the monster somewhere on the screen randomly
	monster.x = 32 + (Math.random() * (canvas.width - 96));
	monster.y = 32 + (Math.random() * (canvas.height - 96));

	// Add a chance to spawn a power up (power up code determines which power up to use, just spawn it)
};

// Reset the game when the player catches a monster
var reset = function () {
	if (roundTimer < 5){
		roundTimer = gameTime;
	}
	bonusMoveSpeed = 0;

	chooseMonster();
	spawnPowerUp();

	// Throw the monster somewhere on the screen randomly
	monster.x = 32 + (Math.random() * (canvas.width - 96));
	monster.y = 32 + (Math.random() * (canvas.height - 96));

	// Add a chance to spawn a power up (power up code determines which power up to use, just spawn it)
};

// Create a function that spawns a power up on chance (40% chance maybe?)
var spawnPowerUp = function () {
	var min = 1;
	var max = 100;
	var spawnChance = Math.floor(Math.random() * (max - min + 1) + min);
	// Rolls of 61 and higher will spawn a power up
	if (spawnChance >= 61){
		powerUpActive = true;
		choosePowerUp();
		powerUp.x = 32 + (Math.random() * (canvas.width - 96));
		powerUp.y = 32 + (Math.random() * (canvas.height - 96));
	}
}

// Set the high score and restart the game
var gameOver = function () {
	if (monstersCaught > highScore){
		highScore = monstersCaught;
	}
	monstersCaught = 0;

	powerUp.x = -50;
	powerUp.y = -50;

	hero.x = canvas.width / 2;
	hero.y = canvas.height / 2;
}

// Timer
function counter (ctx, roundTimer) {
	ctx.font = "24px Helvetica";
	ctx.fillStyle = "red";
	ctx.textAlign = "center";
	if (roundTimer == 0){
		gameOver();
		set();
	}
}

// Update game objects
var update = function (modifier) {
	// Screen size is fixed: 32 and 896 are the edges of the map
	if (38 in keysDown && hero.y >= 32) { // Player holding up
		hero.y -= (hero.speed + bonusMoveSpeed) * modifier;
	}
	if (40 in keysDown && hero.y <= 896) { // Player holding down
		hero.y += (hero.speed + bonusMoveSpeed) * modifier;
	}
	if (37 in keysDown && hero.x >= 32) { // Player holding left
		hero.x -= (hero.speed + bonusMoveSpeed) * modifier;
	}
	if (39 in keysDown && hero.x <= 896) { // Player holding right
		hero.x += (hero.speed + bonusMoveSpeed) * modifier;
	}

	// Are they touching?
	if (
		hero.x <= (monster.x + 32) && monster.x <= (hero.x + 32)
		&& hero.y <= (monster.y + 32) && monster.y <= (hero.y + 32)
	) {
		caughtMonster.play();
		++monstersCaught;
		reset();
	}

	// Did player collide with power up?
	if (
		hero.x <= (powerUp.x + 32) && powerUp.x <= (hero.x + 32)
		&& hero.y <= (powerUp.y + 32) && powerUp.y <= (hero.y + 32)
	) {
		if (powerUpType == 1){
			clockSound.play();
			roundTimer = roundTimer + 5;
			powerUp.x = -50;
			powerUp.y = -50;
		}
		if (powerUpType == 2){
			potionSound.play();
			bonusMoveSpeed = 256;
			powerUp.x = -50;
			powerUp.y = -50;
		}
	}

	// Add a similar if-logic to check if player picked up the power up, if so, apply effect and
	// undraw the power up from the screen
};

// Draw everything
var render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}

	if (heroReady) {
		ctx.drawImage(heroImage, hero.x, hero.y);
	}

	if (monsterReady) {
		ctx.drawImage(monsterImage, monster.x, monster.y);
	}
	if (powerUpActive){
		ctx.drawImage(powerUpImage, powerUp.x, powerUp.y);
	}

	// Score text
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Monsters caught: " + monstersCaught, 32, 32);

	// Timer text
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Time remaining: " + roundTimer, 390, 32);

	// Highscore
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("High score: " + highScore, 770, 32);

	// Gameover
	if (roundTimer == 0){
		ctx.fillStyle = "rgb(250, 250, 250)";
		ctx.font = "24px Helvetica";
		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.fillText("Game over! Restarting in a moment.", 280, 330);
	}
};


// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	//if (powerUpActive == true){

	//}else{
		update(delta / 1000);
		render();

		then = now;

		// Request to do this again ASAP
		requestAnimationFrame(main);
	//}
	// update(delta / 1000);
	// render();

	// then = now;

	// // Request to do this again ASAP
	// requestAnimationFrame(main);
};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
set();
main();