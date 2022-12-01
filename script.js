var canvas = document.getElementById('game');
var scoreText = document.getElementById('score');
var levelText = document.getElementById('level');
var context = canvas.getContext('2d');

var grid = 20;
var count = 0;
var newBloc = createBloc();
var lastColor = '';

var deadCells = [];

var time = 0;
var rotateTime = 0;
var leftTime = 0;
var rightTime = 0;
var pauseTime = 0;

var score = 0; 

var paused = false;

var simulationSpeed = 10;

var isDashing = false;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

function loop() {
	requestAnimationFrame(loop);

	//count frames
	if (++count < simulationSpeed && !isDashing) {
		return;
	}
	count = 0;

	//count time
	time ++;

	//stop if pause
	if(paused) {
		scoreText.innerHTML = "Pause";
		return;
	}

	context.clearRect(0, 0, canvas.width,canvas.height);

	//move bloc
	if(isGrounded()) {
		stopBloc();
	} else {
		for(var i = 0; i < newBloc.length; i++) {
			newBloc[i][1] += 1;
		}
	}

	//move outside of the border
	for(var i = 0; i < newBloc.length; i++) {
		if(newBloc[i][0] < 0) {
			for(var k = 0; k < newBloc.length; k++) {
				newBloc[k][0] ++;
			}
		}
		if(newBloc[i][0] > (canvas.width / grid) - 1) {
			for(var k = 0; k < newBloc.length; k++) {
				newBloc[k][0] --;
			}
		}
	}

	//dash
	if(isDashing) {
		var move = 0
		while(!isGrounded() && move < 3) {
			for(var i = 0; i < newBloc.length; i++) {
				newBloc[i][1] += 1;
			}
			move  ++;
		}
		if(isGrounded()) {isDashing = false;}
	}


	//bg grid
	for(var x = 0; x < canvas.width / grid; x++) {
		for(var y = 0; y < canvas.height / grid; y++) {
			context.fillStyle = 'black';
			context.fillRect(x * grid + 1, y * grid + 1, grid - 2, grid - 2);
		}
	}

	//show bloc
	for(var i = 0; i < newBloc.length; i++) {
		context.fillStyle = newBloc[i][2];
		context.fillRect(newBloc[i][0] * grid + 1, newBloc[i][1] * grid + 1, grid - 2, grid - 2);
	}

	//show dead cells
	for(var i = 0; i < deadCells.length; i++) {
		context.fillStyle = deadCells[i][2];
		context.fillRect(deadCells[i][0] * grid + 1, deadCells[i][1] * grid + 1, grid - 2, grid - 2);
	}

	//calc level
	simulationSpeed = 11 - (clamp(Math.floor(score / 1000), 0, 9) + 1);

	//show stats
	scoreText.innerHTML = score.toString();
	levelText.innerHTML = "vitesse: " + (11 - simulationSpeed).toString();
}

function createBloc() {
	var blocs = [
		[
			[0, 0, ''],
			[-1, 0, ''],
			[1, 0, ''],
			[0, -1, '']
		],
		[
			[0, 0, ''],
			[0, -1, ''],
			[-1, -1, ''],
			[0, 1, '']
		],
		[
			[0, 0, ''],
			[0, -1, ''],
			[-1, -1, ''],
			[1, 0, '']
		],
		[
			[0, 0, ''],
			[-1, 0, ''],
			[-1, -1, ''],
			[0, -1, '']
		],
		[
			[0, 0, ''],
			[0, -1, ''],
			[0, -2, ''],
			[0, 1, '']
		]
	];
	/*blocs = [
		[
			[0, 0, '']
		]
	];*/
	var colors = ['#1FF901', '#010CF9', '#F92301', '#F9F501', '#F97D01', '#9301F9'];

	//create the bloc
	var blocId = getRandomInt(0, blocs.length);
	var randomColor = getRandomInt(0, colors.length);
	var result = blocs[blocId];
	var xPos = getRandomInt(0, canvas.width / grid);
	var color = colors[randomColor];
	//eviter de recrer la meme couleur que le bloc precedent
	if(color === lastColor) {
		color = colors[(randomColor + 1) % colors.length]
	}
	lastColor = color;
	var xFlip = getRandomInt(0, 2);
	var yFlip = getRandomInt(0, 2);
	for(var i = 0; i < result.length; i++) {
		result[i][0] *= (xFlip == 0 ? -1 : 1);
		result[i][1] *= (yFlip == 0 ? -1 : 1);
		result[i][0] += xPos;
		result[i][2] = color;
	}
	return result;
}

function isGrounded() {
	var result = false;
	for(var i = 0; i < newBloc.length; i++) {
		var touchDeadCell = 0
		for(var k = 0; k < deadCells.length; k++) {
			if(newBloc[i][1] + 1 == deadCells[k][1] && newBloc[i][0] == deadCells[k][0]) {
				touchDeadCell = 1;
			}
		}
		if(newBloc[i][1] + 1 >= canvas.height / grid || touchDeadCell == 1) {
			result = true;
		}
	}
	return result;
}

function isWall(dir) {
	var result = false;
	for(var i = 0; i < newBloc.length; i++) {
		var touchDeadCell = 0
		for(var k = 0; k < deadCells.length; k++) {
			if(newBloc[i][0] + dir == deadCells[k][0] && newBloc[i][1] == deadCells[k][1]) {
				result = true;
			}
		}
	}
	return result;
}

function stopBloc() {
	gameOver = 0;
	for(var i = 0; i < newBloc.length; i++) {
		deadCells.push(newBloc[i]);
		//game over
		if(newBloc[i][1] === 0) {
			gameOver = 1;
		}
	}
	if(gameOver == 1) {
		deadCells = [];
		score = 0;
	}
	newBloc = createBloc();

	//complete line
	var totalLines = 0;
	for(var i = 0; i < canvas.height / grid; i++) {
		var counted = [];
		var numberOfCell = 0;
		for(l = 0; l < deadCells.length; l++) {
			if(deadCells[l][1] == i) {
				if(!counted.includes(deadCells[l][0]) && deadCells[l][0] >= 0 && deadCells[l][0] <= canvas.width / grid) {
					numberOfCell ++;
					counted.push(deadCells[l][0]);
				}
			}
		}
		if(numberOfCell >= canvas.width / grid) {
			//remove line
			var lineToRemove = i;
			var cellsToRemove = [];
			for(l = 0; l < deadCells.length; l++) {
				if(deadCells[l][1] === lineToRemove) {
					cellsToRemove.push(l);
				}
			}
			var newDeadCells = [];
			for(l = 0; l < deadCells.length; l++) {
				var keep = 0;
				for(m = 0; m < cellsToRemove.length; m++) {
					if(l === cellsToRemove[m]) {
						keep = 1;
					}
				}
				if(keep == 0) {
					newDeadCells.push(deadCells[l]);
				}
			}
			deadCells = newDeadCells;
			//down other lines
			for(l = 0; l < deadCells.length; l++) {
				if(deadCells[l][1] < lineToRemove) {
					deadCells[l][1] += 1;
				}
			}
			totalLines ++;
		}
	}
	if(totalLines === 1){score += 100;}
	if(totalLines === 2){score += 250;}
	if(totalLines === 3){score += 750;}
	if(totalLines === 4){score += 2000;}
}

document.addEventListener('keydown', function(e) {
	//left
	if (e.which === 37 && newBloc[0][0] > 0 && leftTime < time && !isWall(-1)) {
		for(var i = 0; i < newBloc.length; i++) {
			newBloc[i][0] -= 1;
		}
		leftTime = time;
	}
	//up
	if (e.which === 38 && rotateTime < time) {
		for(var i = 0; i < 3; i++) {
			var xOffset = newBloc[0][0];
			var yOffset = newBloc[0][1];
			for(var i = 0; i < newBloc.length; i++) {
				newBloc[i][0] -= xOffset;
				newBloc[i][1] -= yOffset;
				x = newBloc[i][0];
				newBloc[i][0] = newBloc[i][1];
				newBloc[i][1] = -x;
				newBloc[i][0] += xOffset;
				newBloc[i][1] += yOffset;
				rotateTime = time;
			}
		}
	}
	//right
	if (e.which === 39 && newBloc[0][0] < (canvas.width - grid) / grid && rightTime < time && !isWall(1)) {
		for(var i = 0; i < newBloc.length; i++) {
			newBloc[i][0] += 1;
		}
		rightTime = time;
	}
	//down
	if (e.which === 40) {
		isDashing = true;
	}
	//space
	if(e.which === 32 && pauseTime < time) {
		paused = !paused;
		pauseTime = time;
	}
});

// start the game
requestAnimationFrame(loop);
