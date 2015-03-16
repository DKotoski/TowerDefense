buildTable();
function Player(name, score) {
    this.name = name;
    this.score = score;
    var player = this;
    this.toString = function () {
        return player.name + " " + player.score;
    };
    this.fromString = function (string) {
        var tmpArr = string.split(" ");
        player.score = tmpArr[tmpArr.length - 1];
        if(tmpArr.length>1) player.name = tmpArr[0];
    }
}

var highScoreArray = new Array();

function getFromLocalStorage() {
    highScoreArray = new Array();
    for (var i = 0; i < 10; i++) {
        if (localStorage.getItem(i) !== null) {
            var tmpPlayer = new Player();
            tmpPlayer.fromString(localStorage.getItem(i));
            highScoreArray.push(tmpPlayer);
        } else
            return;

    }
}

function putInLocalStorage() {
    sortHighScore();
    for (var i = 0; i < 10 && i < highScoreArray.length; i++) {
        localStorage.setItem(i, highScoreArray[i].toString());
    }
}

function sortHighScore() {
    highScoreArray.sort(function (a, b) {
        return b.score - a.score;
    });
}

function buildTable() {
    getFromLocalStorage();
    sortHighScore();
    $("tbody").html("");
    for (var i = 0 ; i < highScoreArray.length; i++) {
        $("tbody").append("<tr><td>" + (i + 1) + "</td><td>" + highScoreArray[i].name + "</td><td>" + highScoreArray[i].score + "</td></tr>");
    }
}

function addNewScore(name, score) {
    var tmp = new Player(name, score);
    highScoreArray.push(tmp);
    putInLocalStorage();
    buildTable();
}

