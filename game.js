
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update });

function preload() {
    game.load.image('background', 'assets/starfield.jpg');
    game.load.spritesheet('me', 'assets/me.png', 32, 48);
    game.load.image('diamond', 'assets/diamond.png');
}

var me;
var cursors;
var emitter;
var spaceKey;

var score = 0;

function create() {

    game.add.tileSprite(0, 0, 1600, 1200, 'background');
    game.world.setBounds(0, 0, 1600, 1200);
    game.physics.startSystem(Phaser.Physics.P2JS);
    me = game.add.sprite(game.world.centerX, game.world.centerY, 'me');
    me.animations.add('me-down', [0,1,2,3]);
    me.animations.add('me-left', [4,5,6,7]);
    me.animations.add('me-right', [8,9,10,11]);
    me.animations.add('me-up', [12,13,14,15]);
    game.physics.p2.enable(me);
    cursors = game.input.keyboard.createCursorKeys();
    game.camera.follow(me);

    emitter = game.add.emitter(0, 0, 100);
    emitter.makeParticles('diamond');
    emitter.gravity = 0;

    spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
}

function update () {
    if (spaceKey.isDown) {
	particleBurst(me.x, me.y, 3);
    } 

    var moved = false;
    if (cursors.left.isDown) {
	console.log('left');
	me.animations.play('me-left', 10, false);
        me.body.x -= 5;
	if (spaceKey.isDown) me.body.x -= 15;
	moved = true;
    } else if (cursors.right.isDown) {
	console.log('right');
	me.animations.play('me-right', 10, false);
        me.body.x += 5;
	if (spaceKey.isDown) me.body.x += 15;
	moved = true;
    }
    if (cursors.up.isDown) {
	console.log('up');
	if (!moved) me.animations.play('me-up', 10, false);
	me.body.moveUp(100);
    } else if (cursors.down.isDown) {
	console.log('down');
	if (!moved) me.animations.play('me-down', 10, false);
	me.body.moveDown(100);
    }
}

function particleBurst(x, y, n) {
    emitter.x = x;
    emitter.y = y;
    emitter.start(true, 1000, null, n);
}
