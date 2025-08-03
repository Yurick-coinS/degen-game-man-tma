/**
 * @class MainScene
 * @description Это главная игровая сцена. Вся логика игры будет здесь.
 * @extends Phaser.Scene
 */
class MainScene extends Phaser.Scene {
	constructor() {
		super({ key: 'MainScene' });
	}

	/**
	 * @function preload
	 * @description Метод для предварительной загрузки всех игровых ассетов.
	 * Выполняется один раз перед созданием сцены.
	 */
	preload() {
		// Загрузка спрайт-листа персонажа.
		// Ключ 'player' будет использоваться для ссылки на этот ассет в игре.
		// Путь 'assets/sprites/player_sprites.png' соответствует структуре проекта.
		// frameWidth и frameHeight - размеры одного кадра в спрайт-листе.
		this.load.spritesheet('player', 'assets/sprites/player_sprites.png', {
			frameWidth: 32, // Уточните ширину одного кадра
			frameHeight: 32 // Уточните высоту одного кадра
		});

		// Здесь будут загружаться другие ассеты: тайлмапы, звуки, другие спрайты.
		// this.load.image('wall', 'assets/sprites/wall.png');
		// this.load.tilemapTiledJSON('level1', 'assets/tilemaps/level1.json');
	}

	/**
	 * @function create
	 * @description Метод для инициализации игровых объектов и настройки сцены.
	 * Выполняется один раз после `preload`.
	 */
	create() {
		// Этот метод будет содержать логику создания игрового мира:
		// 1. Создание тайловой карты уровня.
		// 2. Добавление персонажа (this.physics.add.sprite(...)).
		// 3. Создание анимаций персонажа (this.anims.create(...)).
		// 4. Настройка камеры (this.cameras.main.startFollow(player)).
		// 5. Инициализация управления (джойстик, клавиатура).
		// 6. Подключение к HTML UI элементам для их обновления.

		// Временный текст для проверки, что Phaser работает.
		const centerX = this.cameras.main.width / 2;
		const centerY = this.cameras.main.height / 2;
		this.add.text(centerX, centerY, 'Прометей: Ядро Phaser 3 запущено.', {
			fontFamily: '"Share Tech Mono"',
			fontSize: '20px',
			color: '#14F195'
		}).setOrigin(0.5);

		// Пример получения доступа к HTML элементу
		this.goldBalanceElement = document.getElementById('gold-balance');
	}

	/**
	 * @function update
	 * @description Главный игровой цикл. Вызывается на каждом кадре.
	 * @param {number} time - Общее время с начала игры.
	 * @param {number} delta - Время с последнего кадра (в мс).
	 */
	update(time, delta) {
		// Здесь будет основная игровая логика, которая выполняется постоянно:
		// 1. Обработка ввода от игрока (проверка состояния джойстика/клавиш).
		// 2. Обновление позиции персонажа и его анимации.
		// 3. Проверка столкновений (physics overlaps/colliders).
		// 4. Обновление состояния врагов (AI).
		// 5. Обновление HTML UI (например, this.goldBalanceElement.innerText = newScore).
	}
}

/**
 * @const config
 * @description Основной объект конфигурации для игры Phaser.
 */
const config = {
	// Автоматический выбор рендера: WebGL, если доступен, иначе Canvas.
	type: Phaser.AUTO,
	// Родительский HTML-элемент, в который будет встроен canvas.
	parent: 'phaser-container',
	// Базовое разрешение игры. Будет масштабироваться под размер контейнера.
	width: 420,
	height: 420,
	// Настройки масштабирования для адаптивности.
	scale: {
		mode: Phaser.Scale.FIT, // Вписать в контейнер, сохраняя пропорции.
		autoCenter: Phaser.Scale.CENTER_BOTH // Центрировать по горизонтали и вертикали.
	},
	// Физический движок. Arcade Physics - легкий и быстрый, идеален для 2D-игр.
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 0 }, // Гравитация не нужна для игры с видом сверху.
			debug: false // Установите true для отображения отладочных границ.
		}
	},
	// Отключение рендеринга пиксельной графики с размытием.
	render: {
		pixelArt: true
	},
	// Список всех сцен игры.
	scene: [MainScene]
};

// Запуск игры с предоставленной конфигурацией.
const game = new Phaser.Game(config);