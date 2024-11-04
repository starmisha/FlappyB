//<script type="module" src="/config.js"></script>
// Файл конфигурации для хранения всех констант и настроек

// Настройки шрифтов
const FontConfig = {
	family: 'Digital-7',
	src: 'url(fonts/Digital-7/digital_7.ttf)'
};

// Настройки игры
const GameConfig = {
	pipeWidthMultiplier: 2,
	pipeGapPercentage: 0.25,
	pipeSpeed: 2,
	pipeFrequency: 1000, // в миллисекундах
	backgroundSpeed: 0.5
};

// Настройки физики
const PhysicsConfig = {
	gravity: 0.6,
	liftCoefficient: 2
};

// Размеры и позиции элементов UI
const UIConfig = {
	scoreboard: {
		scoreboard: {
			width: 0.2, // Процент от ширины холста
			height: 0.1, // Процент от высоты холста
			paddingX: 0.01, // Процент от ширины холста
			paddingY: 0.01 // Процент от высоты холста
		},
	},
	text: {
		fontSize: 0.024, // Процент от высоты холста
		glowColor: '#00ff00',
		textColor: '#ffffff'
	}
};

// Пути к ресурсам
const ResourcePaths = {
	birdImage: 'images/Flappy-Bird-PNG-HD.png',
	backgroundImage: 'images/flap.png'
};

// Загрузка шрифта
const font = new FontFace(FontConfig.family, FontConfig.src);
font.load().then(function (loadedFont) {
	document.fonts.add(loadedFont);
}).catch(function (error) {
	console.error('Failed to load font:', error);
});

class Renderer {
	constructor(canvas) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
	}

	drawBackground(backgroundImage, backgroundX) {
		this.ctx.drawImage(backgroundImage, backgroundX, 0, this.canvas.width, this.canvas.height);
		this.ctx.drawImage(backgroundImage, backgroundX + this.canvas.width, 0, this.canvas.width, this.canvas.height);
	}

	drawBird(bird) {
		bird.draw(this.ctx);
	}

	drawPipes(pipes, pipeWidth, canvasHeight, pipeGap) {
		this.ctx.fillStyle = 'green';
		pipes.forEach(pipe => {
			this.ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
			this.ctx.fillRect(pipe.x, pipe.topHeight + pipeGap, pipeWidth, canvasHeight - pipe.topHeight - pipeGap);
		});
	}

	drawScoreboard(score, bestScoreValue) {
		const scoreboardWidth = 200;
		const scoreboardHeight = 100;
		const scoreboardX = this.canvas.width - scoreboardWidth - 10;
		const scoreboardY = 10;

		// Рисуем фон табло
		this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		this.ctx.fillRect(scoreboardX, scoreboardY, scoreboardWidth, scoreboardHeight);

		// Рисуем текущий счёт
		this.drawGlowingText(`Score: ${score}`, scoreboardX + 10, scoreboardY + 40, 24, '#00ff00', '#ffffff');

		// Рисуем лучший счёт
		this.drawGlowingText(`Best: ${bestScoreValue}`, scoreboardX + 10, scoreboardY + 80, 24, '#00ff00', '#ffffff');
	}

	drawGlowingText(text, x, y, fontSize, glowColor, textColor) {
		this.ctx.font = `${fontSize}px 'Digital-7', monospace`;
		this.ctx.shadowColor = glowColor;
		this.ctx.shadowBlur = 10;
		this.ctx.fillStyle = glowColor;
		this.ctx.fillText(text, x, y);
		this.ctx.shadowBlur = 0;
		this.ctx.fillStyle = textColor;
		this.ctx.fillText(text, x, y);
	}

	clear() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}

class Bird {
	constructor(x, y, width, height, rotationSpeed, birdImage, physics) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.velocity = 0;
		this.rotation = 0;
		this.rotationSpeed = rotationSpeed;
		this.birdImage = birdImage;
		this.physics = physics;
	}

	update(canvasHeight, pipes, pipeWidth, pipeGap) {
		this.physics.applyGravity(this);

		// Анимация взлета
		this.rotation = Math.min(Math.max(this.velocity * this.rotationSpeed, -Math.PI / 4), Math.PI / 4);

		if (this.y < 0) {
			this.y = 0;
			this.velocity = 0;
		}

		if (this.physics.checkCollisionWithPipes(this, pipes, pipeWidth, pipeGap)) {
			return true; // Столкновение с трубами (игра окончена)
		}

		// **Корректная проверка столкновения с землей**
		if (this.physics.checkCollisionWithGround(this, canvasHeight)) {
			return true; // Столкновение с землей (игра окончена)
		}

		return false; // Нет столкновений
	}

	draw(ctx) {
		ctx.save();
		ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
		ctx.rotate(this.rotation);
		ctx.drawImage(this.birdImage, -this.width / 2, -this.height / 2, this.width, this.height);
		ctx.restore();
	}

	flap() {
		this.physics.applyLift(this);
	}
}

class BirdPhysics {
	constructor(gravity, lift) {
		this.gravity = gravity;
		this.lift = lift;
	}

	applyGravity(bird) {
		bird.velocity += this.gravity;
		bird.y += bird.velocity;
	}

	applyLift(bird) {
		// Рассчитываем подъемную силу, основываясь на зазоре в трубе, обеспечивая разумное значение
		const lift = Math.min(this.lift * (GameConfig.pipeGapPercentage * canvas.height) / 2, 5); // Ограничение подъемной силы
		bird.velocity -= lift;
	}

	checkCollisionWithGround(bird, canvasHeight) {
		return bird.y + bird.height >= canvasHeight;
	}

	checkCollisionWithPipes(bird, pipes, pipeWidth, pipeGap) {
		for (let pipe of pipes) {
			if (bird.x + bird.width > pipe.x && bird.x < pipe.x + pipeWidth &&
				(bird.y < pipe.topHeight || bird.y + bird.height > pipe.topHeight + pipeGap)) {
				return true;
			}
		}
		return false;
	}
}

window.onload = function () {
	const canvas = document.getElementById('gameCanvas');
	const renderer = new Renderer(canvas);
	const scoreBoard = document.getElementById('scoreBoard');
	const currentScore = document.getElementById('currentScore');
	let bestScore = document.getElementById('bestScore');
	const birdImage = new Image();
	birdImage.src = ResourcePaths.birdImage;

	const backgroundImage = new Image();
	let backgroundX = 0;
	backgroundImage.src = ResourcePaths.backgroundImage;
	const restartButton = document.getElementById('restartButton');

	const physics = new BirdPhysics(PhysicsConfig.gravity, PhysicsConfig.liftCoefficient);
	const bird = new Bird(50, 300, 20, 20, 0.05, birdImage, physics);

	const pipeWidth = bird.width * GameConfig.pipeWidthMultiplier;
	const pipeGap = canvas.height * GameConfig.pipeGapPercentage;
	const pipeSpeed = GameConfig.pipeSpeed;
	const pipeFrequency = GameConfig.pipeFrequency;


	let pipes = [];
	let score = 0;
	let bestScoreValue = localStorage.getItem('bestScore') || 0;
	bestScore.textContent = bestScoreValue;
	let gameOver = false;
	let lastPipeTime = 0;
	let imagesLoaded = 0;
	const totalImages = 2;

	function drawBackground() {
		renderer.drawBackground(backgroundImage, backgroundX);
		if (!gameOver) {
			backgroundX -= 0.5; // Настройте скорость движения фона
			if (backgroundX <= -canvas.width) {
				backgroundX = 0;
			}
		}
	}

	function updatePipes() {
		if (!gameOver) {
			const currentTime = new Date().getTime();
			if (currentTime - lastPipeTime > pipeFrequency) {
				const topHeight = Math.random() * (canvas.height - pipeGap - 100) + 50;
				pipes.push({
					x: canvas.width,
					topHeight: topHeight
				});
				lastPipeTime = currentTime;
			}
			// Увеличиваем сложность
			if (score >= GameConfig.scoreThresholds[0] && pipeSpeed < GameConfig.initialPipeSpeed + GameConfig.pipeSpeedIncrement * GameConfig.scoreThresholds.length) {
				pipeSpeed += GameConfig.pipeSpeedIncrement;
				GameConfig.scoreThresholds.shift(); // Удаляем достигнутый порог
			}

			pipes.forEach(pipe => {
				pipe.x -= pipeSpeed;

				if (!pipe.passed && bird.x > pipe.x + pipeWidth / 2) {
					score++;
					currentScore.textContent = score;
					pipe.passed = true;
				}

				if (pipe.x + pipeWidth < 0) {
					pipes.shift();
				}
			});
		}
	}

	function gameLoop() {
		renderer.clear();
		drawBackground();

		if (bird.update(canvas.height, pipes, pipeWidth, pipeGap)) {
			endGame()
			return;
		}

		renderer.drawBird(bird);
		renderer.drawPipes(pipes, pipeWidth, canvas.height, pipeGap);
		renderer.drawScoreboard(score, bestScoreValue);

		if (!gameOver) {
			requestAnimationFrame(gameLoop);
		} else {
			renderer.ctx.fillStyle = 'red';
			renderer.ctx.font = '40px Arial';
			renderer.ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);

			if (gameOver && score > bestScoreValue) {
				bestScoreValue = score;
				localStorage.setItem('bestScore', bestScoreValue);
			}
			restartButton.style.display = 'block';
		}
	}

	function startGame() {
		if (imagesLoaded === totalImages) {
			bestScoreValue = localStorage.getItem('bestScore') || 0;
			bestScore.textContent = bestScoreValue; // bestScore уже определена
			bestScore.textContent = bestScoreValue;
			gameLoop();
		}
	}
	birdImage.onload = function () {
		imagesLoaded++;
		startGame();
	};

	backgroundImage.onload = function () {
		imagesLoaded++;
		startGame();
	};
	function endGame() {
		gameOver = true;
		renderer.ctx.fillStyle = 'red';
		renderer.ctx.font = '40px Arial';
		renderer.ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);

		if (score > bestScoreValue) {
			bestScoreValue = score;
			localStorage.setItem('bestScore', bestScoreValue);
			bestScore.textContent = bestScoreValue;
		}

		// Показываем кнопку Restart
		restartButton.style.display = 'block';
	}


	function restartGame() {
		bird.x = 50;
		bird.y = 300;
		bird.velocity = 0;
		bird.rotation = 0;
		pipes = [];
		score = 0;
		gameOver = false;

		// Проверяем существование элемента перед обновлением
		const currentScoreElement = document.getElementById('currentScore');
		if (currentScoreElement) {
			currentScoreElement.textContent = score;
		}

		restartButton.style.display = 'none';
		gameLoop();
		backgroundX = 0;
	}
	/*function resizeCanvas() {

		const screenWidth = window.innerWidth;
		const canvasWidth = Math.min(screenWidth, 1024);
		canvas.width = canvasWidth;
		canvas.height = canvasWidth * 1.5;

		const scoreboardWidth = canvas.width * UIConfig.scoreboard.scoreboard.width;
		const scoreboardHeight = canvas.height * UIConfig.scoreboard.scoreboard.height;
		const scoreboardX = canvas.width - scoreboardWidth - (canvas.width * UIConfig.scoreboard.scoreboard.paddingX);
		const scoreboardY = canvas.height * UIConfig.scoreboard.scoreboard.paddingY;

		scoreBoard.style.width = `${scoreboardWidth}px`;
		scoreBoard.style.height = `${scoreboardHeight}px`;
		scoreBoard.style.left = `${scoreboardX}px`;
		scoreBoard.style.top = `${scoreboardY}px`;
		;

		// Масштабирование кнопки Restart
		restartButton.style.width = '40%';
		restartButton.style.height = '40%';
		restartButton.style.left = '0%';
		restartButton.style.top = '20%';
	}

	resizeCanvas();
	window.addEventListener('resize', resizeCanvas);*/


	document.addEventListener('keydown', (event) => {
		if (!gameOver && event.code === 'Space') {
			bird.flap();
		}
	});


	restartButton.addEventListener('click', restartGame)
};
