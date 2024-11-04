// Файл конфигурации для хранения всех констант и настроек

// Настройки шрифтов
export const FontConfig = {
	family: 'Digital-7',
	src: 'url(fonts/Digital-7/digital_7.ttf)'
};

// Настройки игры
export const GameConfig = {
	pipeWidthMultiplier: 2,
	pipeGapPercentage: 0.25,
	pipeSpeed: 2,
	pipeFrequency: 1000, // в миллисекундах
	backgroundSpeed: 0.5
};

// Настройки физики
export const PhysicsConfig = {
	gravity: 0.6,
	liftCoefficient: 2
};

// Размеры и позиции элементов UI
export const UIConfig = {
	scoreboard: {
		width: 200,
		height: 100,
		paddingX: 10,
		paddingY: 10
	},
	text: {
		fontSize: 24,
		glowColor: '#00ff00',
		textColor: '#ffffff'
	}
};

// Пути к ресурсам
export const ResourcePaths = {
	birdImage: 'images/Flappy-Bird-PNG-HD.png',
	backgroundImage: 'images/flap.png'
};
