function Hero(game, x, y) {
    // call Phaser.Sprite constructor
    Phaser.Sprite.call(this, game, x, y, 'pumpkin');
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
}

// inherit from Phaser.Sprite
Hero.prototype = Object.create(Phaser.Sprite.prototype);
Hero.prototype.constructor = Hero;
Hero.prototype.move = function (direction, speed=250) {
    this.body.velocity.x = direction * speed * Math.sin(this.rotation);
    this.body.velocity.y = direction * speed * -Math.cos(this.rotation);
};
Hero.prototype.strafe = function (direction, speed=250) {
    this.body.velocity.x = direction * speed * -Math.cos(this.rotation);
    this.body.velocity.y = direction * speed * -Math.sin(this.rotation);
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
    this.game.load.image('ogre', 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/72/emoji_u1f479.png');
    this.game.load.image('alien', 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/72/emoji_u1f47d.png');
    this.game.load.image('goblin', 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/72/emoji_u1f47a.png');
    this.game.load.image('clown', 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/72/emoji_u1f921.png');
    this.game.load.image('skull', 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/72/emoji_u2620.png');
    this.game.load.image('bullet', 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/32/emoji_u1fa78.png');
    this.game.load.image('big_bullet', 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/72/emoji_u1fa78.png');
}
PlayState.init = function () {
    this.keys = this.game.input.keyboard.addKeys({
        left: Phaser.KeyCode.LEFT,
        right: Phaser.KeyCode.RIGHT,
        up: Phaser.KeyCode.UP,
        down: Phaser.KeyCode.DOWN,
        w: Phaser.KeyCode.W,
        a: Phaser.KeyCode.A,
        s: Phaser.KeyCode.S,
        d: Phaser.KeyCode.D,
        q: Phaser.KeyCode.Q,
        e: Phaser.KeyCode.E,
        shoot: Phaser.KeyCode.SPACEBAR,
        boom: Phaser.KeyCode.ENTER
    });
    this.score = 0;
};
var spiders;
var scoreDisplay;
var ammoDisplay;
var levelPrefix;
var levelDisplay;
PlayState.create = function() {
    this.game.stage.backgroundColor = "#000";
    this.hero = new Hero(this.game, 960, 540);
    this.game.add.existing(this.hero);
    this.hero.rotate(Math.PI/2);
    this.hero.anchor.set(0.5, 0.5);
    this.hero.weapon = this.game.add.weapon(-1, "bullet");
    this.hero.weapon.trackSprite(this.hero,0,0,false);
    this.hero.weapon.bulletSpeed = 600;
    this.hero.weapon.bulletAngleOffset=90;
    this.hero.weapon.bulletInheritSpriteSpeed=true;
    this.hero.weapon.fireLimit = 15;
    this.hero.body.setSize(48,48);
    spiders = this.game.add.group();
    ammo = this.game.add.group();
    this.game.time.events.loop(3000, createSpider, this);
    this.game.time.events.loop(200, addAmmo, this);
    this._createHud();
}
function createSpider(){
    var icons = ["spider", "zombie", "ghost", "skull", "ogre", "goblin", "alien", "clown"];
    let rand = Math.random() * 4;
    let rem = rand % 1;
    let side = rand - rem;
    let x, y;

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
    this.game.physics.enable(spider);
}
PlayState.update = function() {
    this._handleCollisions();
    this._handleInput();
    spiders.forEach(this.game.physics.arcade.moveToObject, this.game.physics.arcade, true, this.hero, (80 + (20 * Math.random())));
}
function addAmmo(){
    let x, y;
    if (Math.random() < 0.01){
    x = (Math.random() * 1820) + 50
    y = (Math.random() * 980) + 50
    var ammo_drop = ammo.create(x, y, "big_bullet");
    this.game.physics.enable(ammo_drop);
    this.game.time.events.add(4000, function(){ammo_drop.kill()});
    }
}
PlayState._handleInput = function () {
    if (this.keys.left.isDown || this.keys.q.isDown) { // rotate anticlockwise
        this.hero.rotate(-0.075);
    }
    else if (this.keys.right.isDown || this.keys.e.isDown) { // rotate clockwise
        this.hero.rotate(0.075);
    }
    else if (this.keys.up.isDown || this.keys.w.isDown) { // move hero forwards
        this.hero.move(1);
    }
    else if (this.keys.down.isDown || this.keys.s.isDown) { // move hero backwards
        this.hero.move(-1);
    }
    else if (this.keys.a.isDown) { // strafe "left"
        this.hero.strafe(-1);
    }
    else if (this.keys.d.isDown) { // strafe "right"
        this.hero.strafe(1);
    }
    else { //Hammertime!
        this.hero.move(0,0);
    };

    if (this.keys.shoot.isDown){
        this.hero.weapon.fireAngle = this.hero.angle + 270;
        this.hero.weapon.fire();
        ammoDisplay.setText(this.hero.weapon.fireLimit - this.hero.weapon.shots);
    } else if (this.keys.boom.isDown){
        if (this.hero.weapon.fireLimit - this.hero.weapon.shots > 15){
            this.hero.weapon.shots += 15;
            spiders.forEach(killSprite, this, true);
            this.game.stage.backgroundColor = "#f00";
            this.game.time.events.add(500, function(){PlayState.game.stage.backgroundColor = "#000"});
            ammoDisplay.setText(this.hero.weapon.fireLimit - this.hero.weapon.shots);
        }
    }
};
function killSprite (sprite) {
    sprite.kill();
};
PlayState._handleCollisions = function () {
    this.game.physics.arcade.overlap(this.hero, spiders,
        this._onHeroVsEnemy, null, this);
        this.game.physics.arcade.overlap(this.hero, ammo,
            this._onHeroVsAmmo, null, this);
        this.game.physics.arcade.overlap(this.hero.weapon.bullets, spiders,
            this._onShootEnemy, null, this);
};
PlayState._onHeroVsEnemy = function (hero, enemy) {
    alert("Game over! You killed " + this.score + " monsters!");
    this.game.state.restart();
    this.game.time.slowMotion = 1;
};
PlayState._onHeroVsAmmo = function (hero, ammo) {
    ammo.kill();
    this.hero.weapon.fireLimit += 5;
    ammoDisplay.setText(this.hero.weapon.fireLimit - this.hero.weapon.shots);
};
PlayState._onShootEnemy = function (hero, enemy) {
    enemy.kill();
    this.score++;
    if (this.score % 10 == 0){
        levelDisplay.setText(Math.floor((this.score + 10) / 10));
        levelDisplay.setStyle({font:"80px Courier New", fill: "#0f0"})
        this.game.time.events.add(500, function(){levelDisplay.setStyle({font:"72px Courier New", fill: "#fff"})});
        this.game.time.slowMotion *= 0.8;
        this.hero.weapon.fireLimit += 15;
        ammoDisplay.setText(this.hero.weapon.fireLimit - this.hero.weapon.shots);
    }
    scoreDisplay.setText(this.score);
};
PlayState._createHud = function () {
    let ammo = this.game.make.image(0, 0, 'big_bullet');
    let spider = this.game.make.image(250, 0, 'spider');
    this.hud = this.game.add.group();
    this.hud.add(ammo);
    scoreDisplay = this.game.add.text(400, 10, "0", {fill:"#ffffff", font:"72px Courier New"});
    ammoDisplay = this.game.add.text(150, 10, "15", {fill:"#ffffff", font:"72px Courier New"});
    levelPrefix = this.game.add.text(600, 10, "Level", {fill:"#c0c0c0", font:"72px Courier New"});
    levelDisplay = this.game.add.text(900, 10, "1", {fill:"#ffffff", font:"72px Courier New"});
    this.hud.add(spider);
    this.hud.position.set(50, 10);
};
window.onload = function () {
    let game = new Phaser.Game(1920, 1080, Phaser.AUTO, 'game');
    game.state.add('play', PlayState);
    game.state.start('play');
};
