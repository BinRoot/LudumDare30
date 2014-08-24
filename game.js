
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });



function preload() {
    game.load.image('background', 'assets/background.png');
    game.load.spritesheet('me', 'assets/me.png', 32, 48);
    game.load.image('diamond', 'assets/glow.png');
    game.load.image('enemy_planet', 'assets/enemy_planet.png');
    game.load.spritesheet('enemy_planet_sprite', 'assets/enemy_planet_sprite.png', 100, 800);
    game.load.image('my_planet', 'assets/my_planet.png');
    game.load.spritesheet('enemy1', 'assets/enemy1b.png', 96, 96);
    game.load.image('shield', 'assets/shield.png');
    game.load.audio('theme', ['assets/theme.mp3', 'assets/theme.ogg']);
    game.load.spritesheet('button', 'assets/button_sprite_sheet.png', 193, 71);
    game.load.image('glow', 'assets/glow.png');
    game.load.audio('coin1', ['assets/coin1.wav']);
    game.load.audio('coin2', ['assets/coin2.wav']);
    game.load.audio('hyperloop', ['assets/hyperloop.wav']);
    game.load.audio('die', ['assets/die.wav']);
}

var me;
var cursors;
var emitter;
var spaceKey;
var payload = 0;
var shield;
var score = 0;
var enemies;
var enemyCollisionGroup;
var playerCollisionGroup;
var shieldUsed = false;
var button;
var dead = false;
var shieldEmitter;
var coin1;
var coin2;
var hyperloop;
var die;

function create() {
    game.add.tileSprite(0, 0, 1600, 800, 'background');
    game.world.setBounds(0, 0, 1600, 800);
    music = game.add.audio('theme', 1, true);
    music.play();
    coin1 = game.add.audio('coin1', 0.1);
    coin2 = game.add.audio('coin2', 0.1);
    die = game.add.audio('die', 0.5);
    hyperloop = game.add.audio('hyperloop', 0.05);
    game.add.image(0, 0, 'my_planet');
    var enemy_planet_sprite = game.add.sprite(1500, 0, 'enemy_planet_sprite');
    enemy_planet_sprite.animations.add('enemy_planet_sprite');
    enemy_planet_sprite.play('enemy_planet_sprite', 6, true);
    
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);
    playerCollisionGroup = game.physics.p2.createCollisionGroup();
    enemyCollisionGroup = game.physics.p2.createCollisionGroup();
    game.physics.p2.updateBoundsCollisionGroup();

    game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;

    enemies = game.add.group();
    enemies.enableBody = true;
    enemies.physicsBodyType = Phaser.Physics.P2JS;

    shield = game.add.image(-100, -100, 'shield')
    button = game.add.button(-100, -100, 'button', button_click, this, 2, 1, 0);
    button.onInputOver.add(button_over, this);
    button.onInputOut.add(button_out, this);

    me = game.add.sprite(50, game.world.centerY, 'me');
    me.animations.add('me-down', [0,1,2,3]);
    me.animations.add('me-left', [4,5,6,7]);
    me.animations.add('me-right', [8,9,10,11]);
    me.animations.add('me-up', [12,13,14,15]);
    game.physics.p2.enable(me);
    me.body.rotateRight(1);
    me.body.moveRight(10);
    me.body.setCollisionGroup(playerCollisionGroup);
    me.body.collides(enemyCollisionGroup, hitEnemy, this);
    cursors = game.input.keyboard.createCursorKeys();
    game.camera.follow(me);

    emitter = game.add.emitter(0, 0, 100);
    emitter.makeParticles('diamond');
    emitter.setAlpha(0.01, 0.1);
    emitter.setScale(0.01, 0.01);
    emitter.gravity = 0;

    shieldEmitter = game.add.emitter(0,0, 100);
    shieldEmitter.makeParticles('diamond');
    shieldEmitter.gravity = 0;

    spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
}

function button_over() {
    
}

function button_out() {
    
}

function button_click() {
    location.reload();
}

function hitEnemy(body1, body2) {
    if (shieldUsed) {
	enemies.remove(body1);
	enemies.remove(body2);
    } else {
	console.log('lost game!');
	if (!dead) {
	    button.x = me.x - 100;
	    button.y = me.y;
	    me.tint = 0xff0000;
	    die.play();
	}
	dead = true;
	
    }

}

function update () {
    
    if (spaceKey.isDown && score > 0) {
	shield.x = me.x - 50;
	shield.y = me.y - 50;
	if (!shieldUsed) {
	    shieldUsed = true;
	    score = score - 1;
	}
    } else {
	if (!spaceKey.isDown) {
	    shieldUsed = false;
	}
	shield.x = -100;
	shield.y = -100;
    }

    if (me.x >= 1550 && payload == 0) {
	payload = parseInt(Math.random() * 5, 10);
	coin1.play();
	console.log(payload);
	if (shieldUsed) {
	    spaceKey.isDown = false;
	    shieldUsed = false;
	}
    }
    if (me.x <= 50 && payload > 0) {
	score = score+payload;
	coin2.play();
	payload = 0;
	for (i = 0; i < score; i++) {
	    spawnEnemy();
	}
	addGlow(me.x, me.y);
	if (shieldUsed) {
	    spaceKey.isDown = false;
	    shieldUsed = false;
	}
    }

    if (dead) return;

    var moved = false;
    if (cursors.left.isDown) {
	me.body.moveRight(0);
	if (payload > 0) {
	    particleBurst(me.x, me.y, payload);
	}
	me.animations.play('me-left', 10, false);
        me.body.x -= 5;
	if (shieldUsed) {
	    me.body.x -= 15;
	    shieldBurst(me.x, me.y);
	}
	moved = true;
    } else if (cursors.right.isDown) {
	me.body.moveRight(0);
	me.animations.play('me-right', 10, false);
        me.body.x += 5;
	if (shieldUsed) {
	    me.body.x += 15;
	    shieldBurst(me.x, me.y);
	}
	moved = true;
    }
    if (cursors.up.isDown) {
	me.body.moveRight(0);
	if (!moved) me.animations.play('me-up', 10, false);
	me.body.moveUp(100);
    } else if (cursors.down.isDown) {
	me.body.moveRight(0);
	if (!moved) me.animations.play('me-down', 10, false);
	me.body.moveDown(100);
    }
}

function addGlow(x, y) {
    var emitter = game.add.emitter(x, y, 200);

    emitter.makeParticles('glow');

    emitter.setRotation(5, 0);
    emitter.setAlpha(0.01, 0.5);
    emitter.setScale(Math.random(), Math.random());
    emitter.gravity = Math.random() * 20 - 10;
    emitter.start(false, 2000, 100);
}

function spawnEnemy() {
    var enemy = enemies.create(900 + game.world.randomX/2, game.world.randomY, 'enemy1');
    enemy.animations.add('enemy-all');
    enemy.animations.play('enemy-all', Math.random()*10, true);
    enemy.tint = Math.random() * 0xffffff;
    game.physics.p2.enable(enemy);
    enemy.body.setRectangle(40, 40);
    enemy.body.setCollisionGroup(enemyCollisionGroup);
    enemy.body.collides([enemyCollisionGroup, playerCollisionGroup]);
}

function distanceToPointer(displayObject, pointer) {
    this._dx = displayObject.x - pointer.x;
    this._dy = displayObject.y - pointer.y;
    return Math.sqrt(this._dx * this._dx + this._dy * this._dy);
}

function moveToXY(xx, yy, x, y, speed) {
    var _angle = Math.atan2(y - yy, x - xx);
    var x = Math.cos(_angle) * speed;
    var y = Math.sin(_angle) * speed;
    return { x: x, y: y };
}

function shieldBurst(x, y) {
    shieldEmitter.x = x;
    shieldEmitter.y = y;
    shieldEmitter.start(true, 400, null, 5);
    hyperloop.play();
}

function particleBurst(x, y, n) {
    emitter.x = x;
    emitter.y = y;
    emitter.start(true, 400, null, n);
}

function render() {
    game.debug.text('Minerals: ' + score, 350, 50);
}

function gofull() {
    if (game.scale.isFullScreen) {
        game.scale.stopFullScreen();
    } else {
        game.scale.startFullScreen();
    }
}
