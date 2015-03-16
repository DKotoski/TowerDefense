var soundTrack = new Howl({
    urls: ['Assets/Nils_505_Feske_-_34_-_Tsrups.mp3'], autoplay: true,
    loop: true
});
var shoot = new Howl({ urls: ['Assets/Shoot.mp3'] });
var death = new Howl({ urls: ['Assets/Death.mp3'] });

$("#inputPanel").fadeOut();
function lost() {
    $("#points").text("You have won " + score + " points! Well played");
    $("#inputPanel").fadeIn();
}

function resetGame() {
    //enemy settings
    enemyHP = 40;
    enemySpeed = 11;
    enemiesN = 6;
    enemyID = 0;

    //ui elements
    health = 100;
    money = 500;
    score = 0;
}

$("#submit").on("click", function () {
    addNewScore($("#name").val(), score);
    resetGame();
    $("#inputPanel").fadeOut();
});

$("#newGame").on("click", function () {
    $("#inputPanel").fadeOut();
    resetGame();
});

$(".glyphicon").on("click", function () {
    if ($(this).hasClass("glyphicon-volume-off")) {
        $(this).removeClass("glyphicon-volume-off");
        $(this).addClass("glyphicon-volume-up");
        soundTrack.stop();
    } else {
        $(this).removeClass("glyphicon-volume-up");
        $(this).addClass("glyphicon-volume-off");
        console.log("vlez");
        soundTrack.play();
    }
});