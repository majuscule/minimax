$(document).ready(function(){
    
    var canvas = $('#board')[0];
    var ctx = canvas.getContext('2d');

    function cell(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.state = 0;
        this.play = function(player, draw) {
            this.state = player;
            var centerX = this.x + this.size/2;
            var centerY = this.y + this.size/2;
            if (typeof draw == 'undefined' ? true : draw) {
                if (player == 'o') {
                    ctx.beginPath();
                    ctx.arc(centerX, centerY,
                            size/2-20, 0, 2 * Math.PI);
                    ctx.lineWidth = 10;
                    ctx.stroke();
                } else if (player == 'x') {
                    ctx.beginPath();
                    ctx.moveTo(centerX, centerY);
                    ctx.lineTo(self.cellSize, canvas.height);
                    ctx.moveTo(centerX - 50, centerY - 50);
                    ctx.lineTo(centerX + 50, centerY + 50);
                    ctx.moveTo(centerX + 50, centerY - 50);
                    ctx.lineTo(centerX - 50, centerY + 50);
                    ctx.lineWidth = 10;
                    ctx.stroke()
                }
            }
        }
    }

    function board(size, startingActor) {
        var self = this;
        this.size = size;
        this.cellSize = canvas.width / size;
        this.cells = [];
        this.turn = startingActor;
        this.init = function() {
            ctx.lineWidth = 2;
            for (var i = 0; i < this.size; i++) {
                this.cells.push([]);
                if (i > 0) {
                    ctx.beginPath();
                    ctx.moveTo(0, this.cellSize*i);
                    ctx.lineTo(canvas.width, this.cellSize*i);
                    ctx.stroke();
                }
                for (var ii = 0; ii < this.size; ii++) {
                    if (ii > 0) {
                        ctx.beginPath();
                        ctx.moveTo(this.cellSize*ii, 0);
                        ctx.lineTo(this.cellSize*ii, canvas.height);
                        ctx.stroke();
                    }
                    this.cells[i][ii] =
                        new cell(this.cellSize*ii, this.cellSize*i,
                                 this.cellSize, this.cellSize);
                }
            }
            return this;
        }
        this.serialize = function() {
            var serial = []
            for (var i = 0; i < this.cells.length; i++) {
                serial.push([]);
                for (var ii = 0; ii < this.cells[i].length; ii++) {
                    serial[i][ii] = this.cells[i][ii].state;
                }
            }
            return serial;
        }
    }

    $('#board').on('click', function(e){
        if (!tictactoe && tictactoe.turn != 'player') return;
        event = e || window.event;
        x = event.pageX - canvas.offsetLeft,
        y = event.pageY - canvas.offsetTop;
        for (var i = 0; i < tictactoe.cells.length; i++) {
            for (var ii = 0; ii < tictactoe.cells[i].length; ii++) {
                var cell = tictactoe.cells[i][ii];
                if (x > cell.x && x < cell.x + cell.size
                    && y > cell.y && y < cell.y + cell.size) {
                    //cell.play(Math.random() > 0.5 ? 'x' : 'o');
                    if (!cell.state) {
                        var player = 'o';
                        cell.play(player);
                        if (!endCondition(tictactoe.serialize())) {
                            var aiMove = minimax(tictactoe.serialize(),
                                player == 'o' ? 'x' : 'o', ii, i).move;
                            console.log(aiMove);
                            tictactoe.cells[aiMove[1]][aiMove[0]].play(player == 'o' ? 'x' : 'o');
                        }
                        return;
                    }
                }
            }
        }
    });

    function generate(state, player) {
        console.log('generating futures for ' + player);
        var possibilities = [];
        for (var i = 0; i < state.length; i++) {
            for (var ii = 0; ii < state[i].length; ii++) {
                if (!state[i][ii]) {
                    //console.log(state[i][ii]);
                    //console.log('i: ' + i + ', ii: ' + ii);
                    var future = jQuery.extend(true, [], state);
                    future[i][ii] = player;
                    //possibilities.push(future);
                    possibilities.push({
                        'state'  : future,
                        'x'      : ii,
                        'y'      : i,
                    });
                }
            }
        }
        return possibilities;
    }

    function endCondition(state) {
        var horizontalPlayer, horizontalTally = 0;
        var verticalPlayer, verticalTally = 0;
        var diagonalPlayer, diagonalTally = 0;
        var antiDiagonalPlayer, antiDiagonalTally = 0;
        var fullCells = 0;
        var size = state.length;
        for (var i = 0; i < size; i++) {
            for (var ii = 0; ii < size; ii++) {
                if (i == 0)
                    verticalPlayer = state[ii][i];
                if (ii == 0)
                    horizontalPlayer = state[ii][i];
                if (i == 0 && ii == 0)
                    antiDiagonalPlayer = state[ii][i];
                if (i == 0 && ii == size)
                    diagonalPlayer = state[ii][i];
                if (state[ii][i] == horizontalPlayer)
                    horizontalTally++;
                if (state[i][ii] == verticalPlayer)
                    verticalTally++;
                if (state[i][ii])
                    fullCells++;
            }
            if (state[i][i] == diagonalPlayer)
                diagonalTally++;
            if (state[i][(size-1)-i] == antiDiagonalPlayer)
                antiDiagonalTally++;
            if (horizontalTally != size)
                horizontalTally = 0;
            if (verticalTally != size)
                verticalTally = 0;
        }
        if (horizontalTally >= size)
            return horizontalPlayer;
        if (verticalTally >= size)
            return verticalPlayer;
        if (diagonalTally == size)
            return diagonalPlayer;
        if (antiDiagonalTally == size)
            return antiDiagonalPlayer;
        if (fullCells == size*size)
            return 'tie';
        return false;
    }

    function score(state, player) {
        var result = endCondition(state);
        if (result !== false)
            return result == player ? 1 : -1;
        return false;
    }

    function minimax(state, player) {
        console.log('minimax: ' + state + ' for ' + player);
        var win = score(state, player);
        console.log('got score: ' + win);
        if (win !== false) {
            return win;
        }
        var scores = [];
        //var moves = [];
        //var nextPlayer = player == 'x' ? 'o' : 'x';
        //var futures = generate(state, nextPlayer);
        var futures = generate(state, player);
        for (var i in futures) {
            var future = futures[i];
            var result = minimax(future.state, player == 'x' ? 'o' : 'x');
            if (typeof result == 'object')
                result = result.score;
            scores.push({
                    'move'  : [future.x,future.y],
                    'score' : result
            });
        }
        if (player == 'x') {
            console.log('evaluating final choices for x');
            console.log(scores);
            var bestScore = 1;
            var bestMove;
            for (var i in scores) {
                if (scores[i].score <= bestScore) {
                    bestScore = scores[i].score;
                    bestMove = scores[i].move;
                }
            }
            return {
                'move'  : bestMove,
                'score' : bestScore
            };
        } else if (player == 'o') {
            console.log('evaluating final choices for o');
            console.log(scores);
            var bestScore = -1;
            var bestMove;
            for (var i in scores) {
                if (scores[i].score >= bestScore) {
                    console.log('assigning: ' + scores[i].move
                            + ' to bestMove with score ' + scores[i].score);
                    console.log(scores[i]);
                    bestScore = scores[i].score;
                    bestMove = scores[i].move;
                }
            }
            return {
                'move'  : bestMove,
                'score' : bestScore
            };
        }
    }

    var tictactoe = new board(3, 'player').init();

    tictactoe.cells[0][0].play('o');
    tictactoe.cells[0][2].play('x');
    tictactoe.cells[1][0].play('x');
    tictactoe.cells[2][0].play('x');
    tictactoe.cells[2][1].play('o');


    //tictactoe.cells[1][0].play('x');
    //tictactoe.cells[0][2].play('o');
    //tictactoe.cells[1][1].play('x');
    //tictactoe.cells[2][1].play('o');

    //tictactoe.cells[2][2].play('x');
    //tictactoe.cells[1][2].play('o');

});
