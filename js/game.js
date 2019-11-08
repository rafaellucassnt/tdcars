//Configurações do canvas
var FPS = 24;
var CANVAS_WIDTH = 510, CANVAS_HEIGHT = 650;
var KEY_CODE_UP = 38, KEY_CODE_DOWN = 40, KEY_CODE_LEFT = 37, KEY_CODE_RIGHT = 39, KEY_CODE_SPACE = 32, KEY_CODE_ENTER = 13;
var MOVE_X = 50;
var SPEED_MOVE = 0.5, SPEED_OBSTACLES = 2.5, SPEED_OBSTACLES_MAX = 10;
var TYPE_COMPONENT_IMAGE = 'IMAGE', TYPE_COMPONENT_TEXT = 'TEXT', TYPE_COMPONENT_ELEMENT = 'ELEMENT';
var LOCAL_STORAGE_SCORE_MAX = 'SCORE_MAX';
var SPRITE_CAR_TIME = 15;
var SCORE_MAX = localStorage.getItem(LOCAL_STORAGE_SCORE_MAX);


//propriedades
var obstacle = {
    width: 40,
    height: 80,
    type: [
        {
            name: 'CAR',
            src: 'images/car_green.png',
        },
        {
            name: 'HOLE',
            src: 'images/car_red.png',
        }
    ],
    cars: [
        'images/vehicles/mini_truck.png',
        'images/vehicles/car.png',
        'images/vehicles/taxi.png',
        'images/vehicles/audi.png',
        'images/vehicles/viper.png',
        'images/vehicles/mini_van.png',
        'images/vehicles/ambulance.png'
    ],
    typeComponent: TYPE_COMPONENT_IMAGE
}

var roads = {
    one: 125,
    two: 175,
    three: 225,
    four: 275,
    five: 325,
    getRoads: function () {
        return [this.one, this.two, this.three, this.four, this.five];
    }
}

var car = {
    width: 40,
    height: 80,
    sprite: [
        'images/vehicles/car_police/1.png',
        'images/vehicles/car_police/2.png',
        'images/vehicles/car_police/3.png'
    ],
    //Coloca o carro no meio da terceira estrada
    x: roads.three + 15,
    y: CANVAS_HEIGHT - 130,
    type: TYPE_COMPONENT_IMAGE
}

var properties = {
    scene: 'images/road.jpg',
    points: 'images/points.png',
    score: 'images/score.png',
    icon: 'images/icon.png',
    bandStreet: 'images/band_street.png',
    font: {
        size: '18px',
        name: 'Consolas',
        color: 'Black'
    }
}

//elementos para o jogo
var sceneGame;
var carGame;
var obstaclesGame = [];
var scoreGame;
var pointsGame;
var sceneGame;
var scoreTextGame;
var pointsTextGame;
var levelTextGame;
var timeTextGame;
var scoreMaxTextGame;
var iconGame;
var bandStreetLeftGame, bandStreetRightGame;
var stage;

//DOM
var btnAction = document.getElementById('btnAction');

//configurações quadro de animação navegador
window.requestAnimationFrame = window.requestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.mozRequestAnimationFrame
    || function (callback) { window.setTimeout(callback, 1000 / 60); };


/**
 * Objeto para criar configurações de inicialização do jogo
 */
var game = {
    active: false,
    canvas: document.createElement('canvas'),
    context: function () {
        return this.canvas.getContext('2d');
    },
    start: function () {
        this.active = true;
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        this.context = this.canvas.getContext('2d');
        this.frameNo = 0;
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, FPS);//intervalo do loop

        SCORE_MAX = localStorage.getItem(LOCAL_STORAGE_SCORE_MAX) ? localStorage.getItem(LOCAL_STORAGE_SCORE_MAX) : 0;

        //key listeners
        window.addEventListener('keyup', keypressHandler, false);

        //background
        sceneGame = new Scene();
        sceneGame.context = this.context;

        //DOM
        btnAction.innerText = 'Pausar';
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop: function () {
        this.active = false;
        clearInterval(this.interval);
        btnAction.innerText = 'Jogar';
    },
    play: function () {
        if (!hasColision()) {
            this.active = true;
            this.interval = setInterval(updateGameArea, FPS);//intervalo do loop
            btnAction.innerText = 'Pausar';
        } else {
            location.reload();
        }
    },
    toogle: function () {
        if (this.active) {
            this.stop();
        } else {
            this.play();
        }
    }
}

/**
 * Função para verificar o valor se o quadro foi passado
 * 
 * @param value for verify {integer}
 * @return boolean
 */
function everyInterval(n) {
    if ((game.frameNo / n) % 1 == 0) { return true; }
    return false;
}

/**
 * Função para criar novo estágio genérico de componente
 * Este objeto controla o estágio, acelera e sobe de nível
 * 
 * @param init level {integer}
 * @return
 */
function Stage(levelInit) {
    this.levelActual = (levelInit && levelInit > 0) ? levelInit : 1;
    this.levelMax = 5;
    this.totalObstacles = this.levelActual;
    this.interval = 150;
    this.level = {
        one: { score: 1, obstacles: 1 },
        two: { score: 50, obstacles: 2 },
        three: { score: 150, obstacles: 3 },
        four: { score: 300, obstacles: 4 },
        five: { score: 500, obstacles: 4 }
    };
    this.up = function (score) {
        if (this.levelActual < this.levelMax) {
            switch (score) {
                case this.level.one.score:
                    this.totalObstacles = this.level.one.obstacles;
                    this.levelActual = 1;
                    this.interval = 80;
                    SPEED_OBSTACLES = 2;
                    return false;
                case this.level.two.score:
                    this.totalObstacles = this.level.two.obstacles;
                    this.levelActual = 2;
                    this.interval = 70;
                    SPEED_OBSTACLES = 4;
                    return;
                case this.level.three.score:
                    this.totalObstacles = this.level.three.obstacles;
                    this.levelActual = 3;
                    SPEED_OBSTACLES = 6;
                    this.interval = 60;
                    return false;
                case this.level.four.score:
                    this.totalObstacles = this.level.four.obstacles;
                    this.levelActual = 4;
                    SPEED_OBSTACLES = 8;
                    this.interval = 40;
                    return false;
                case this.level.five.score:
                    this.totalObstacles = this.level.five.obstacles;
                    this.levelActual = 5;
                    SPEED_OBSTACLES = 10;
                    this.interval = 30;
                    return false;
            }
        }
    }
}

/**
 * Função para criar novo Componente Genérico
 * contém o componente de herança
 * 
 * @param width {integer}
 * @param height {integer}
 * @param color/font/image {String}
 * @param x {integer}
 * @param y {integer}
 * @param type component {TYPE_COMPONENT_ELEMENT|TYPE_COMPONENT_IMAGE|TYPE_COMPONENT_TEXT}
 * @return 
 */
function Component(width, height, color, x, y, type) {
    this.type = type;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.speedX = 0;
    this.speedY = 0;
    this.angle = 0;
    this.image = null;
    this.tag = 0;
    this.update = function () {
        var ctx = game.context;
        if (this.type == TYPE_COMPONENT_TEXT) {
            ctx.font = this.width + ' ' + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
        } else if (this.type == TYPE_COMPONENT_IMAGE) {
            if (!this.image) {
                this.image = new Image();
                this.image.src = color;
            }

            ctx.drawImage(this.image,
                this.x,
                this.y,
                this.width, this.height);
        } else if (this.type == TYPE_COMPONENT_ELEMENT) {
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    this.newPosition = function () {
        this.x = this.speedX;
        this.y += this.speedY;
    }
    this.crashWith = function (element) {
        var crash = false;
        var axisX = this.x;
        var width = ((this.width / 2) + 6) + this.x;
        var axisY = this.y;
        var height = this.y + this.height;

        var elementAxisX = element.x;
        var elementWidth = ((element.width / 2) + 6) + element.x;
        var elementAxisY = element.y;
        var elementHeight = element.y + element.height;

        if (axisX => elementAxisX && axisX <= elementWidth) {//verifica colisão esquerda - direita no eixos X -->
            if (axisX < elementWidth && width > elementAxisX) {//verifica colisão direita - esquerda no eixo X <--
                if (elementHeight >= axisY && elementAxisY <= height) {
                    crash = true;
                }
            }
        }

        return crash;
    }
    this.moveUp = function () {
        this.speedY -= SPEED_MOVE;
    }
    this.moveDown = function () {
        this.speedY += SPEED_MOVE;
    }
    this.moveLeft = function () {
        if (this.x >roads.one)
            this.speedX -= 50;
    }
    this.moveRight = function () {
        if (this.x < roads.five)
            this.speedX += 50;
    }
    this.changeImage = function (src) {
        var ctx = game.context;
        if (this.type == TYPE_COMPONENT_IMAGE) {
            this.image = new Image();
            this.image.src = src;
            ctx.drawImage(this.image,
                this.x,
                this.y,
                this.width, this.height);
        }
    }
}


/**
 * Função para criar nova tela de cena genérica de componente
 * contém o componente de herança
 * 
 * @param width {integer}
 * @param height {integer}
 * @param x {integer}
 * @param y {integer}
 * @param background source {String}
 * @return 
 */
function Scene() {
    Component.call(this);//componente de herança

    this.lastRepaintTime = window.performance.now();
    this.init = false;
    this.context;
}

/**
 * Função para manipular keyPress na tela
 * Controla as setas (cima, baixo, esquerda, direita)
 * Função de chamada movida pelo objeto desejado
 * 
 * @return
 */
function keypressHandler(event) {
    switch (event.keyCode) {
        case KEY_CODE_UP:
            break;
        case KEY_CODE_DOWN:
            break;
        case KEY_CODE_LEFT:
            carGame.moveLeft();
            break;
        case KEY_CODE_RIGHT:
            carGame.moveRight();
            break;
        case KEY_CODE_ENTER:
            break;
        case KEY_CODE_SPACE:
            btnAction.onclick();
            break;
    }
}

/**
 * Função para iniciar o jogo criando objetos no jogo
 * para depois criar na tela
 * 
 * @return
 */
function startGame() {
    stage = new Stage(2);

    //scene
    sceneGame = new Scene(CANVAS_WIDTH, CANVAS_HEIGHT, 0, 0, properties.scene);

    //components
    bandStreetLeftGame = new Component(10, 700, properties.bandStreet, roads.one, 0, TYPE_COMPONENT_IMAGE);
    bandStreetRightGame = new Component(10, 700, properties.bandStreet, 383, 0, TYPE_COMPONENT_IMAGE);

    carGame = new Component(car.width, car.height, car.sprite[1], car.x, car.y, car.type);
    carGame.speedX = car.x;

    //skins
    scoreGame = new Component(150, 100, properties.score, CANVAS_WIDTH - 150, 0, TYPE_COMPONENT_IMAGE);
    iconGame = new Component(40, 40, properties.icon, 8, 18, TYPE_COMPONENT_IMAGE);
    pointsGame = new Component(150, 100, properties.points, 0, 0, TYPE_COMPONENT_IMAGE);

    //text
    scoreTextGame = new Component(properties.font.size, properties.font.name, properties.font.color, CANVAS_WIDTH - 80, 78, TYPE_COMPONENT_TEXT);
    scoreMaxTextGame = new Component(properties.font.size, properties.font.name, properties.font.color, CANVAS_WIDTH - 85, 45, TYPE_COMPONENT_TEXT);
    pointsTextGame = new Component(properties.font.size, properties.font.name, properties.font.color, 60, 45, TYPE_COMPONENT_TEXT);
    levelTextGame = new Component(properties.font.size, properties.font.name, properties.font.color, 30, 78, TYPE_COMPONENT_TEXT);
    timeTextGame = new Component('12px', properties.font.name, 'white', CANVAS_WIDTH - 105, CANVAS_HEIGHT - 15, TYPE_COMPONENT_TEXT);

    //object configuration
    levelTextGame.text = stage.levelActual;
    timeTextGame.text = '';

    game.start();
}

/**
 * Função para atualizar elementos da tela
 * de acordo com os eixos x e y
 * Chame também hasColision para verificar o jogo interrompido
 * 
 * @return
 */
function updateGameArea() {
    if (hasColision()) {
        game.stop();
        btnAction.innerText = 'Reiniciar';
    } else {
        game.clear();
        game.frameNo += 1;

        createObstacles();
        bandStreetLeftGame.update();
        bandStreetRightGame.update();

        score();
        scoreGame.update();
        scoreTextGame.update();
        scoreMaxTextGame.update();

        pointsGame.update();
        pointsTextGame.update();

        levelTextGame.text = stage.levelActual;
        levelTextGame.update();

        timeTextGame.update();

        iconGame.update();
        animateCarGame();
    }
}

/**
 * Funciton para criar sprite animar do carro
 * Esta função altera a imagem por quadro de contagem
 * 
 * @return
 */
function animateCarGame() {
    carGame.newPosition();

    if (!carGame.tag.update) {
        carGame.tag = {
            update: true,
            actualSprite: 0,
            sprite: {
                start: game.frameNo,
                end: game.frameNo + SPRITE_CAR_TIME
            }
        }
    }

    if (game.frameNo > carGame.tag.sprite.start && game.frameNo <= carGame.tag.sprite.end) {
        carGame.changeImage((carGame.tag.actualSprite == 1) ? car.sprite[0] : car.sprite[2]);
        if (game.frameNo == carGame.tag.sprite.end) {
            carGame.tag.actualSprite = (carGame.tag.actualSprite == 1) ? 0 : 1;
            carGame.tag.sprite.start = game.frameNo + 1;
            carGame.tag.sprite.end = game.frameNo + SPRITE_CAR_TIME;
        }
    }


    carGame.update();
}

/**
 * Função para imprimir pontuação total na tela
 * Salve também a pontuação máxima no navegador localStorage
 * 
 * @return
 */
function score() {
    var text = '';
    var calc = Math.floor(game.frameNo / 5);
    var points = ((game.frameNo / 5) / 100).toFixed(1);

    if (calc > 0) {
        scoreTextGame.text = text + calc;
    } else {
        scoreTextGame.text = text + 0;
    }

    pointsTextGame.text = points;
    scoreMaxTextGame.text = SCORE_MAX;
    if (calc > SCORE_MAX) {
        scoreMaxTextGame.text = calc;
        localStorage.setItem(LOCAL_STORAGE_SCORE_MAX, calc);//salva pontuação recorde


    }

    stage.up(calc);//verificar pontuação para subir de nível
}

/**
 * Função para criar objeto de obstáculos
 * Crie itens nas 4 estradas de forma randomica
 * O total de objetos varia de acordo com o nível (ramdom)
 * Os objetos que estavam na tela são removidos da matriz de elementos para não existe mais
 * 
 * @return 
 */
function createObstacles() {
    var x, y;
    var srcObstacle;

    if (game.frameNo == 1 || everyInterval(stage.interval)) {
        var roadsUsed = [];
        var obstacleUsed = [];
        //criar N obstáculos por nível
        var totalObstaclesRandom = Math.round(Math.random() * stage.totalObstacles);

        //para criar
        for (var indexObstacle = 0; indexObstacle < totalObstaclesRandom; indexObstacle++) {
            var roadBefore = (indexObstacle > 0) ? obstaclesGame[indexObstacle - 1].tag : 1;
            var newRoad = randomIndex(roads.getRoads().length, roadsUsed);
            var newObstacle = randomIndex(obstacle.cars.length, obstacleUsed);

            roadsUsed.push(newRoad);

            // Coloca o obstáculo no meio da estrada escolhida
            x = roads.getRoads()[newRoad] + 15;
            y = Math.round(Math.random() * 50) * -1;

            var typeObstacle = Math.floor(Math.round(Math.random() * 1));

            srcObstacle = obstacle.cars[newObstacle];
            var newObstacle = new Component(obstacle.width, obstacle.height, srcObstacle, x, y, obstacle.typeComponent);
            newObstacle.tag = newRoad;

            obstaclesGame.push(newObstacle);
        }
    }
    for (i = 0; i < obstaclesGame.length; i++) {
        if (obstaclesGame[i].y >= CANVAS_HEIGHT) {
            obstaclesGame.splice(i, 1);//remove obstáculo
        } else {
            obstaclesGame[i].y += SPEED_OBSTACLES;
            obstaclesGame[i].update();
        }
    }
}

/**
 * Função para verificar objetos de colisão entre carros e movimentos de carros
 * 
 * @return boolean
 */
function hasColision() {
    for (i = 0; i < obstaclesGame.length; i++) {
        if (carGame.crashWith(obstaclesGame[i])) {
            return true;
        }
    }
    return false;
}

/**
 * Função para número aleatório com exceção de argumentos passados ​​na matriz
 * 
 * @param size array {integer}
 * @param array with excepet items {array}
 * @return number
 */
function randomIndex(lengthOfArray, itemsExclude) {
    var rand = null;  //inteiro

    do {
        rand = Math.round(Math.random() * (lengthOfArray - 1));
    } while (itemsExclude.indexOf(rand) != -1);

    return rand;
}

var seconds = 0, minutes = 0, hours = 0;
setInterval(function () {
    if (!hasColision() && game.active) {
        var secondsFormat, minutesFormat, hoursFormat;

        if (seconds >= 60) {
            minutes++;
            seconds = 0;
        }
        if (minutes >= 60) {
            hours++;
            minutes = 0;
        }

        if (seconds < 10) secondsFormat = '0' + seconds;
        else secondsFormat = '' + seconds;

        if (minutes < 10) minutesFormat = '0' + minutes;
        else minutesFormat = '' + minutes;

        if (hours < 10) hoursFormat = '0' + hours;
        else hoursFormat = '' + hours;

        timeTextGame.text = 'Tempo ' + hoursFormat + ':' + minutesFormat + ':' + secondsFormat;

        seconds++;
    }
}, 1000);