/// <reference path="Scripts/pixi.js" />
/// <reference path="Scripts/Howler.js" />
// setting up renderer
var renderer = new PIXI.WebGLRenderer(920, 640);
$("#daGame").append(renderer.view);
//setting stage
var stage = new PIXI.Stage(0x97c56e, true);
//setting music
//setting sprites
//towers
//tower constructor
function Tower(sprite, x, y, shootSpeed) {
    this.shootSpeed = shootSpeed;
    this.range = 150;
    this.sprite = sprite;
    this.x = x;
    this.y = y;
    this.sprite.position.x = x - 32;
    this.sprite.position.y = y - 32;
    this.sprite.pivot.x = 32;
    this.sprite.pivot.y = 32;
    this.target=null;
    this.targetIndex=-1;
    this.damage = 50;
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
                //console.log("vleze");
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
        //console.log(tower.shootSpeed);
        /* enemies.splice(tower.targetIndex,1);
            if(stage.contains(toRemove)){
                stage.removeChild(toRemove);
            }
            //console.log(tower.targetIndex);
            tower.target=null;
            tower.targetIndex = -1;
            money += 10;*/
            return;                    
    }
            
}
//end tower constructor
// enemy constuctor
function Enemy(x, y, hp, speed) {
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
            if (stage.contains(enemy.sprite)) {
                stage.removeChild(enemy.sprite);
            }
            enemies.pop();            
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
            if (stage.contains(bullet.tower.target.sprite)) {
                stage.removeChild(bullet.tower.target.sprite);
            }
            enemies.splice(bullet.tower.targetIndex, 1);
            money += 10;
            death.play();
        }
    };
    this.Die = function(){
        if (stage.contains(enemy.sprite)) {
            stage.removeChild(enemy.sprite);
        }
    };
}
//end enemy constructor
// UI ELEMENT CONSTRUCTOR
function UIElement(sprite, x, y, price, shootSpeed) {
    this.sprite = new PIXI.Sprite(PIXI.Texture.fromImage(sprite));            
    this.x = x;
    this.y = y;
    this.shootSpeed = shootSpeed;
    this.sprite.position.x = x - 32;
    this.sprite.position.y = y - 32;
    this.sprite.pivot.x = 32;
    this.sprite.pivot.y = 32;
    this.spriteLocation = sprite;
    this.price = price;
    var element = this;
    this.dim = function () {
        element.sprite.alpha = 0.5;
        element.sprite.interactive = false;
    }
    this.dimOut = function () {
        element.sprite.alpha = 1;
        element.sprite.interactive = true;
    }
           
    element.sprite.mousedown = element.sprite.touchstart = function (data) {
        console.log("mousedown");
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
                var t = new Tower(new PIXI.Sprite(PIXI.Texture.fromImage(element.spriteLocation)), tmpX, tmpY, element.shootSpeed);
                towers.push(t);
                stage.addChild(t.sprite);
                money -= element.price;
                this.position.x = x - 32;
                this.position.y = y - 32;
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
    this.target = target;
    this.sprite = new PIXI.Sprite(PIXI.Texture.fromImage("Assets/bullet.png"));
    var bullet = this;
    this.rotate = function (angle) {
        bullet.sprite.rotation = angle;
    };
           
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
            if (bullet.tower.targetIndex === -1) {
                bullet.destroy();
                return;
            }
            var dFromT = Math.sqrt((bullet.sprite.position.x - bullet.tower.sprite.position.x) * (bullet.sprite.position.x - bullet.tower.sprite.position.x) + (bullet.sprite.position.y - bullet.tower.sprite.position.y) * (bullet.sprite.position.y - bullet.tower.sprite.position.y))
            if (dFromT > bullet.tower.range + 50) {
                bullet.destroy();
                return;
            }
            if (bullets.indexOf(bullet) == -1) {
                bullet.destroy();
                return;
            }
            if (bullet.tower.target == null) {
                bullet.destroy();
                return;
            }
            var tan = (bullet.target.sprite.position.y - bullet.y) / (bullet.target.sprite.position.x - bullet.x)
            var angle = Math.atan(tan);
            if (bullet.target.sprite.position.x < bullet.x) angle += Math.PI;
            bullet.rotate(angle);
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
//var towers = [new Tower(new PIXI.Sprite(PIXI.Texture.fromImage("Assets/t1.png")), 64 * 4, 64 * 3, 85), new Tower(new PIXI.Sprite(PIXI.Texture.fromImage("Assets/t2.png")), 64 * 7, 64 * 5, 245), new Tower(new PIXI.Sprite(PIXI.Texture.fromImage("Assets/t3.png")), 64 * 6, 64 * 3, 300), new Tower(new PIXI.Sprite(PIXI.Texture.fromImage("Assets/t3.png")), 64 * 6, 64 * 7, 300)];
var towers = new Array();
var uiElements = [new UIElement("Assets/t1.png",64*12,64*2,100,100), new UIElement("Assets/t2.png",64*12,64*4,200,150), new UIElement("Assets/t3.png",64*12,64*6,300,130)];
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
for(var i =0;i<uiElements.length;i++){
    stage.addChild(uiElements[i].sprite);
}
        
        
        
var enemies = new Array();

var enemyHP = 40;
var enemySpeed = 11;
var enemiesN = 6;
       
        
//ui elements
var health = 100;
var money = 10000;
        
    
var text = new PIXI.Text(health, { font: "50px Arial", fill: "red" });
text.position.x = 64 * 10;
stage.addChild(text);
var textMoney = new PIXI.Text(money, { font: "50px Arial", fill: "red" });
textMoney.position.x = 64 * 10;
textMoney.position.y = 64 * 8;
stage.addChild(textMoney);
//ui elements end
var timer = 0;

$("#newWave").on("click", function () {
    enemyHP += 10;
    enemySpeed *= 0.95;
    enemiesN += 2;
    for (var i = 0; i < enemiesN; i++) {
        var enemy = new Enemy(64 * 9, (64 - (20 * enemiesN)) + (i * 20), enemyHP, enemySpeed);
        enemies.push(enemy);
        stage.addChild(enemy.sprite);
    }
});


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
        enemies = new Array();
    }
    renderer.render(stage);
    requestAnimationFrame(animate);
}
//end animation