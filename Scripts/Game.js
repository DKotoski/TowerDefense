/// <reference path="Scripts/pixi.js" />
/// <reference path="Scripts/Howler.js" />
// setting up renderer
var renderer = new PIXI.WebGLRenderer(920, 640);
$("#daGame").append(renderer.view);
//setting stage
var stage = new PIXI.Stage(0x6aabad, true);
var uiSide = new PIXI.Sprite(PIXI.Texture.fromImage("Assets/uiSide.png"));
uiSide.position.x = 640;
uiSide.position.y = 0;
stage.addChild(uiSide);
//setting music
//setting sprites
//towers
//tower constructor
function Tower(sprite, x, y, shootSpeed,range,damage) {
    this.shootSpeed = shootSpeed;
    this.range = range;
    this.sprite = sprite;
    this.x = x;
    this.y = y;
    this.sprite.position.x = x - 32;
    this.sprite.position.y = y - 32;
    this.sprite.pivot.x = 32;
    this.sprite.pivot.y = 32;
    this.target=null;
    this.targetIndex=-1;
    this.damage = damage;
    var tower = this;
    this.toSpriteCoordinates = function (x, y) {
        tower.sprite.position.x = x - 32;
        tower.sprite.position.y = y - 32;
    };
    this.fromSpriteCoordinates = function (x, y) {
        tower.x = x + 32;
        tower.y = y + 32;
    };
    this.rotate = function(angle){
        tower.sprite.rotation = angle;
    };
    this.getTarget= function(index){
        if(index==-1) return;
        var distance = Math.sqrt((tower.x - enemies[index].x) * (tower.x - enemies[index].x) + (tower.y - enemies[index].y) * (tower.y - enemies[index].y));
        if(distance>tower.range) 
        {
            tower.target=null;
            tower.targetIndex=-1;
            tower.getTarget(index-1);
        }
        if (distance < tower.range) {
            tower.targetIndex = index;
            tower.target=enemies[index];
            if(!stage.contains(tower.target.sprite)){
                tower.target=null;
                tower.targetIndex = -1;
                return;
            }            
                    
            var angle = Math.atan((tower.target.y-tower.y)/(tower.target.x - tower.x));
            if (tower.target.x < tower.x) angle += 3.14;
            tower.rotate(angle);                    
        }
    };
    this.shootTarget = function () {
        if(tower.target==null) return;
        tower.getTarget(enemies.length-1);
        if(tower.target==null) return;
        var toRemove = tower.target.sprite;
        shoot.play();
        var bullet = new Bullet(tower.sprite.position.x, tower.sprite.position.y, tower.target,tower);
        bullets.push(bullet);
        stage.addChild(bullet.sprite);
        return;                    
    }
            
}
//end tower constructor
// enemy constuctor
function Enemy(x, y, hp, speed,id) {
    this.id=id;
    this.traveled = y;
    this.sprite = new PIXI.Sprite(PIXI.Texture.fromImage("Assets/enemy.png"));
    this.x = x;
    this.y = y;
    this.sprite.position.x = x - 32;
    this.sprite.position.y = y - 32;
    this.sprite.pivot.x = 32;
    this.sprite.pivot.y = 32;
    this.hp = hp;
    this.speed = speed;
    var enemy = this;
    this.toSpriteCoordinates = function (x, y) {
        enemy.sprite.position.x = x - 32;
        enemy.sprite.position.y = y - 32;
    };
    this.fromSpriteCoordinates = function (x, y) {
        enemy.x = x + 32;
        enemy.y = y + 32;
    };
    this.position = function (x, y) {
        enemy.sprite.position.x = x;
        enemy.sprite.position.y = y;
        this.fromSpriteCoordinates(x, y);
    };
    this.move = function () {
        if(enemy.sprite.position.y>=640){
            health--;
            enemy.Die();            
            return;
        }
        if(enemy.sprite.position.y<64)
        {
            enemy.fromSpriteCoordinates(enemy.sprite.position.x, enemy.sprite.position.y);
            enemy.toSpriteCoordinates(enemy.x, enemy.y + 10/enemy.speed);   
        }else{
        enemy.fromSpriteCoordinates(enemy.sprite.position.x, enemy.sprite.position.y);
        var dx = pathMatrix[Math.floor(enemy.y / 64) - 1][Math.floor(enemy.x / 64) - 1][0] / enemy.speed;
        var dy = pathMatrix[Math.floor(enemy.y / 64) - 1][Math.floor(enemy.x / 64) - 1][1] / enemy.speed;               
        enemy.toSpriteCoordinates(enemy.x + dx, enemy.y + dy);
        }
        enemy.traveled += (10 / enemy.speed);
    };
    this.isDead = function (bullet) {
        enemy.hp -= bullet.tower.damage;
        if (enemy.hp <= 0) {
            enemy.Die();
            money += 10;
            score += 1;
            death.play();
        }
    };
    this.Die = function(){
        if (stage.contains(enemy.sprite)) {
            stage.removeChild(enemy.sprite);
        }
        for(var i=0;i<enemies.length;i++){
            if(enemies[i].id==enemy.id){
                enemies.splice(i,1);
            }
        }
    };
}
//end enemy constructor
// UI ELEMENT CONSTRUCTOR
function UIElement(sprite, x, y, price, shootSpeed,range,damage,tooltip) {
    this.text = new PIXI.Text(price, { font: "bold 20px Galindo", fill: "#d6c069" });
    this.sprite = new PIXI.Sprite(PIXI.Texture.fromImage(sprite));   
    this.range = range;         
    this.damage = damage;
    this.x = x;
    this.y = y;
    this.shootSpeed = shootSpeed;
    this.sprite.position.x = x - 32;
    this.sprite.position.y = y - 32;
    this.sprite.pivot.x = 32;
    this.sprite.pivot.y = 32;
    this.spriteLocation = sprite;
    this.price = price;
    this.tooltip = new PIXI.Text(tooltip, { font: "bold 15px Galindo", fill: "#d6c069" });
    var element = this;
    element.text.position.y=element.y;
    element.text.position.x = element.x - 50;
    element.tooltip.position.y = element.sprite.position.y;
    element.tooltip.position.x = element.sprite.position.x+50;
    this.dim = function () {
        element.sprite.alpha = 0.5;
        element.sprite.interactive = false;
    }
    this.dimOut = function () {
        element.sprite.alpha = 1;
        element.sprite.interactive = true;
    }
           
    element.sprite.mousedown = element.sprite.touchstart = function (data) {
        this.data = data;
        this.alpha = 0.5;
        this.dragging = true;
    };
    element.sprite.mouseup = element.sprite.mouseupoutside = element.sprite.touchend = element.sprite.touchendoutside = function (data) {
        this.alpha = 1
        this.dragging = false;            
        var newPosition = this.data.getLocalPosition(this.parent);
        if (money >= element.price) {
            if (stageMatrix[Math.floor(newPosition.y / 64)][Math.floor(newPosition.x / 64)] === 1) {
                var tmpX = (Math.floor(newPosition.x / 64) + 1) * 64;
                var tmpY = (Math.floor(newPosition.y / 64) + 1) * 64;
                var t = new Tower(new PIXI.Sprite(PIXI.Texture.fromImage(element.spriteLocation)), tmpX, tmpY, element.shootSpeed, element.range, element.damage);
                towers.push(t);
                stage.addChild(t.sprite);
                money -= element.price;
                this.position.x = x - 32;
                this.position.y = y - 32;
                stageMatrix[Math.floor(newPosition.y / 64)][Math.floor(newPosition.x / 64)]=0;
            } else {
                this.position.x = x - 32;
                this.position.y = y - 32;
            }
        } else {
            this.position.x = x - 32;
            this.position.y = y - 32;
        }
        this.data = null;
    };
    element.sprite.mousemove = element.sprite.touchmove = function (data) {
        if (this.dragging) {
            var newPosition = this.data.getLocalPosition(this.parent);
            this.position.x = newPosition.x;
            this.position.y = newPosition.y;
        }
    };
        
}
//END UI CONSTRUCTOR
//BULLET CONSTRUCTOR
function Bullet(x, y, target, tower) {
    this.traveling = true;
    this.tower = tower;
    this.x = x;
    this.y = y;
    this.target = tower.target;
    this.sprite = new PIXI.Sprite(PIXI.Texture.fromImage("Assets/bullet.png"));
    var bullet = this;
           
    this.setSpriteLocation = function () {
        bullet.sprite.position.x = bullet.x;
        bullet.sprite.position.y = bullet.y;
    }
    bullet.setSpriteLocation();
    this.checkTarget = function () {
        if (!bullet.target) {
            bullet.target = bullet.tower.target;
        }
    }
    this.destroy = function () {
        if (stage.contains(bullet.sprite)) {
            stage.removeChild(bullet.sprite);
        }
        if (bullets.indexOf(tower) > -1) {
            bullets.splice(bullets.indexOf(tower), 1);
        }
    }
    this.travel = function () {
        if (bullet.traveling) {
            
            var dFromT = Math.sqrt((bullet.sprite.position.x - bullet.tower.sprite.position.x) * (bullet.sprite.position.x - bullet.tower.sprite.position.x) + (bullet.sprite.position.y - bullet.tower.sprite.position.y) * (bullet.sprite.position.y - bullet.tower.sprite.position.y))
            if (dFromT > bullet.tower.range + 200) {
                bullet.destroy();
                return;
            }
            if (bullet.tower.target != null) {
                bullet.target = bullet.tower.target;
            }
            if(bullet.target===null) return;
            var tan = (bullet.target.sprite.position.y - bullet.y) / (bullet.target.sprite.position.x - bullet.x)
            var angle = Math.atan(tan);
            if (bullet.target.sprite.position.x < bullet.x) angle += Math.PI;
            if (bullet.target.sprite.position.x < (bullet.x + 2) && bullet.target.sprite.position.x > (bullet.x - 2) && bullet.target.sprite.position.y < (bullet.y + 2) && bullet.target.sprite.position.y > (bullet.y - 2)) {
                bullet.target.isDead(bullet);
                bullet.tower.target = null;
                bullet.tower.targetIndex = -1;
                bullet.traveling = false;
                bullet.destroy();
                return;
            }
            var distance = 4;
            var moveByY = distance * Math.sin(angle);
            var moveByX = distance * Math.cos(angle);
            bullet.y += moveByY;
            bullet.x += moveByX;
            bullet.setSpriteLocation();
        }
    }
}
//END BULLET CONSTRUCTOR
var towers = new Array();
var bullets = new Array();

//help matrixes
var stageMatrix = [
    [1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 0, 1]];

var pathMatrix = [
    [[+64, 0], [+64, 0], [+64, 0], [+64, 0], [+64, 0], [+64, 0], [+64, 0], [+65, 0], [0, +10], [-64, 0]],
    [[+64, 0], [+64, 0], [+64, 0], [0, +10], [-10, 0], [-10, 0], [-10, 0], [-10, 0], [-10, 0], [-64, 0]],
    [[+64, 0], [+64, 0], [+64, 0], [0, +10], [0, +10], [-64, 0], [-64, 0], [-64, 0], [-64, 0], [-64, 0]],
    [[+64, 0], [+64, 0], [+64, 0], [+10, 0], [+10, 0], [+10, 0], [+10, 0], [0, +10], [-64, 0], [-64, 0]],
    [[+64, 0], [+64, 0], [+64, 0], [+64, 0], [+64, 0], [+64, 0], [+64, 0], [0, +10], [-64, 0], [-64, 0]],
    [[0, +10], [-10, 0], [-10, 0], [-10, 0], [-10, 0], [-10, 0], [-10, 0], [-10, 0], [-64, 0], [-64, 0]],
    [[0, +10], [0, +10], [-64, 0], [-64, 0], [-64, 0], [-64, 0], [-64, 0], [-64, 0], [-64, 0], [-64, 0]],
    [[+10, 0], [+10, 0], [+10, 0], [+10, 0], [+10, 0], [+10, 0], [+10, 0], [+10, 0], [0, +10], [-64, 0]],
    [[+64, 0], [+64, 0], [+64, 0], [+64, 0], [+64, 0], [+64, 0], [+64, 0], [+64, 0], [0, +10], [-64, 0]],
    [[+64, 0], [+64, 0], [+64, 0], [+64, 0], [+64, 0], [+64, 0], [+64, 0], [+64, 0], [0, +10], [-64, 0]]];
//help matrixes end

var map = new PIXI.Sprite(PIXI.Texture.fromImage("Assets/map.png"));
stage.addChild(map);

for (var i = 0; i < towers.length; i++) {
    stage.addChild(towers[i].sprite);
}

        
        
        
var enemies = new Array();

//enemy settings
var enemyHP = 40;
var enemySpeed = 11;
var enemiesN = 6;
var enemyID=0;
        
//ui elements
var health = 100;
var money = 500;
var score = 0;

var uiElements = [new UIElement("Assets/t1.png", 720, 175, 100, 100, 150, 100, "A somewhat slower\nbut powerfull tower!"), new UIElement("Assets/t2.png", 720, 278, 150, 75, 150, 60, "A fast mashinegun\nbut lacks the power!"), new UIElement("Assets/t3.png", 720, 392, 500, 300, 1000, 1000, "The sniper\nKills instant from far!")];
for (var i = 0; i < uiElements.length; i++) {
    stage.addChild(uiElements[i].sprite);
    stage.addChild(uiElements[i].text);
    stage.addChild(uiElements[i].tooltip);
}



function UIWave() {
    this.sprite = new PIXI.Sprite(PIXI.Texture.fromImage("Assets/newWave.png"));
    this.sprite.position.x = 64 * 10 + 10;
    this.sprite.position.y = 540;
    this.sprite.scale.y = 0.8;
    this.sprite.interactive = true;
    var wave = this;
    this.sprite.mousedown = this.sprite.touchstart = function (data) {
        if (wave.sprite.interactive) {
            this.data = data;
            if (health > 0) {
                enemyHP += 10;
                enemySpeed *= 0.95;
                enemiesN += 2;
                for (var i = 0; i < enemiesN; i++) {
                    var enemy = new Enemy(64 * 9, (64 - (20 * enemiesN)) + (i * 20), enemyHP, enemySpeed, enemyID);
                    enemies.push(enemy);
                    stage.addChild(enemy.sprite);
                    enemyID++;
                }
            }
            wave.sprite.interactive = false;
            wave.sprite.alpha = 0.5;
        }
    };
};

var newWave = new UIWave();

stage.addChild(newWave.sprite);
    
var text = new PIXI.Text(health, { font: "30px Galindo", fill: "#d6c069" });
text.position.x = 64 * 10 + 30;
text.position.y = 10;
stage.addChild(text);
var textMoney = new PIXI.Text(money, { font: "30px Galindo", fill: "#d6c069" });
textMoney.position.x = 64 * 10 +30;
textMoney.position.y = 50;
stage.addChild(textMoney);
var scoreText = new PIXI.Text(score, { font: "35px Galindo", fill: "#d6c069" });
scoreText.position.x = 64 * 10 + 20;
scoreText.position.y = 465;
stage.addChild(scoreText);
//ui elements end
var timer = 0;



//the animation function
requestAnimationFrame(animate);
function animate() {
    enemies.sort(function (a, b) {
        return a.traveled - b.traveled;
    });
    for (var i = 0 ; i < uiElements.length; i++) {
        if (uiElements[i].price <= money) {
            uiElements[i].dimOut();
        } else {
            uiElements[i].dim();
        }
    }
    timer++;
    timer=timer%1000;
    text.setText("Health: " + health);
    textMoney.setText("Money: " + money);
    scoreText.setText("Score: " + score);
    for (var i = 0; i < towers.length; i++) {
        towers[i].getTarget(enemies.length - 1);
        if (timer % towers[i].shootSpeed == 0 && towers[i].target != null) towers[i].shootTarget();
    }

    for(var i=0;i<enemies.length;i++){
        enemies[i].move();
    }

    for (var i = 0; i < bullets.length; i++) {
        bullets[i].travel();
    }

    if (enemies.length === 0) {
        for (var i = 0; i < bullets.length; i++) {
            bullets[i].destroy();
        }
    }
    if (health <= 0) {
        for (var i = 0; i < enemies.length; i++) {
            enemies[i].Die();
        }
        health = 0;
    }

    if (enemies.length != 0) {
        if(enemies[enemies.length-1].traveled>750)
        {
            newWave.sprite.interactive = true;
            newWave.sprite.alpha = 1;
        }
        else {

            newWave.sprite.interactive = false;
            newWave.sprite.alpha = 0.5;
        }
    } else if(health!=0){
        newWave.sprite.interactive = true;
        newWave.sprite.alpha = 1;
    }
    
    renderer.render(stage);
    requestAnimationFrame(animate);
}
//end animation