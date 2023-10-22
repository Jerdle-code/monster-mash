function Hero(game, x, y) {
    // call Phaser.Sprite constructor
    Phaser.Sprite.call(this, game, x, y, 'pumpkin');
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
}

// inherit from Phaser.Sprite
Hero.prototype = Object.create(Phaser.Sprite.prototype);
Hero.prototype.constructor = Hero;
Hero.prototype.move = function (direction, speed=200) {
    this.body.velocity.x = direction * speed * Math.sin(this.rotation);
    this.body.velocity.y = direction * speed * -Math.cos(this.rotation);
};
Hero.prototype.rotate = function (angle){
    this.rotation += angle;
}

PlayState = {};

PlayState.preload = function() {
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.pageAlignVertically = true;
    this.game.load.crossOrigin = "Anonymous";
    this.game.load.image('pumpkin', 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/72/emoji_u1f383.png');
    this.game.load.image('spider', 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/72/emoji_u1f577.png');
    this.game.load.image('zombie', 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/72/emoji_u1f9df.png');
    this.game.load.image('ghost', 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/72/emoji_u1f47b.png');
    this.game.load.image('skull', 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/72/emoji_u2620.png');
    this.game.load.image('bullet', 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/32/emoji_u1fa78.png');
}
PlayState.init = function () {
    this.keys = this.game.input.keyboard.addKeys({
        left: Phaser.KeyCode.LEFT,
        right: Phaser.KeyCode.RIGHT,
        up: Phaser.KeyCode.UP,
        down: Phaser.KeyCode.DOWN,
        shoot: Phaser.KeyCode.SPACEBAR
    });
    this.score = 0;
};
var spiders;
PlayState.create = function() {
    this.game.stage.backgroundColor = "#000";
    this.hero = new Hero(this.game, 960, 540);
    this.game.add.existing(this.hero);
    this.hero.rotate(Math.PI/2);
    this.hero.anchor.set(0.5, 0.5);
    this.hero.weapon = this.game.add.weapon(5, "bullet");
    this.hero.weapon.trackSprite(this.hero,0,0,false);
    this.hero.weapon.bulletSpeed = 600;
    this.hero.weapon.bulletAngleOffset=90;
    this.hero.weapon.bulletInheritSpriteSpeed=true;
    this.hero.body.setSize(48,48);
    spiders = this.game.add.group();
    this.game.time.events.loop(3000, createSpider, this);
    this._createHud();
}
function createSpider(){
    var icons = ["spider", "zombie", "ghost", "skull"];
    var rand = Math.random() * 4;
    var rem = rand % 1;
    var side = rand - rem;
    var x, y;

    switch(side){
        case 0:
            x = 50;
            y = (rem * 980) + 50;
            break;
        case 1:
            x = (rem * 1820) + 50;
            y = 50;
            break;
        case 2:
            x = 1870;
            y = (rem * 980) + 50;
            break;
        case 3:
            x = (rem * 1820) + 50;
            y = 1030;
            break;
    }
    var random_icon = icons[Math.floor(Math.random()*icons.length)];
    var spider = spiders.create(x, y, random_icon);
    console.log(x);
    console.log(y);
    this.game.physics.enable(spider);

}
PlayState.update = function() {
    this._handleCollisions();
    this._handleInput();
    spiders.forEach(this.game.physics.arcade.moveToObject, this.game.physics.arcade, true, this.hero, 100);
}
PlayState._handleInput = function () {
    if (this.keys.left.isDown) { // rotate anticlockwise
        this.hero.rotate(-0.075);
    }
    else if (this.keys.right.isDown) { // rotate clockwise
        this.hero.rotate(0.075);
    }
    else if (this.keys.up.isDown) { // move hero forwards
        this.hero.move(1);
    }
    else if (this.keys.down.isDown) { // move hero backwards
        this.hero.move(-1);
    }
    else { //Hammertime!
        this.hero.move(0,0);
    };

    if (this.keys.shoot.isDown){
        this.hero.weapon.fireAngle = this.hero.angle + 270;
        this.hero.weapon.fire();
    }
};
PlayState._handleCollisions = function () {
    this.game.physics.arcade.overlap(this.hero, spiders,
        this._onHeroVsEnemy, null, this);
        this.game.physics.arcade.overlap(this.hero.weapon.bullets, spiders,
            this._onShootEnemy, null, this);
};
PlayState._onHeroVsEnemy = function (hero, enemy) {
    alert("Game over! You killed " + this.score + " monsters!");
    this.game.state.restart();
    this.game.time.slowMotion = 1;
};
PlayState._onShootEnemy = function (hero, enemy) {
    enemy.kill();
    this.score++;
    if (this.score % 10 == 0){
        alert("Level " + (Math.floor(this.score/10)+1))
        this.game.time.slowMotion *= 0.8;
    }
};
PlayState._createHud = function () {
    let ammo = this.game.make.image(0, 0, 'bullet');
    let spider = this.game.make.image(50, 0, 'spider');
    this.hud = this.game.add.group();
    this.hud.add(ammo);
    this.hud.add(spider);
    this.hud.position.set(10, 10);
};
window.onload = function () {
    let game = new Phaser.Game(1920, 1080, Phaser.AUTO, 'game');
    game.state.add('play', PlayState);
    game.state.start('play');
};
