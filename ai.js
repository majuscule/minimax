$(document).ready(function(){
    
    var canvas = $('#board')[0];
    var ctx = canvas.getContext('2d');

    function cell(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.state = 0;
        this.play = function(player, color) {
            this.state = player;
            var centerX = this.x + this.size/2;
            var centerY = this.y + this.size/2;
            if (typeof color != 'undefined')
                ctx.strokeStyle = color;
            else
                ctx.strokeStyle = 'black';
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
        this.clear = function() {
            ctx.clearRect(this.x+5, this.y+5, this.size-20, this.size-20);
            this.state = 0;
        }
    }

    function board(size, startingActor) {
        var self = this;
        this.size = size;
        this.turn = startingActor;
        this.cellSize = canvas.width / size;
        this.gameOver = 0;
        this.cells = [];
        this.init = function() {
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'black';
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
        this.restart = function() {
            for (var i = 0; i < this.size; i++) {
                for (var ii = 0; ii < this.size; ii++) {
                    this.cells[i][ii].clear();
                }
            }
            this.gameOver = 0;
            this.turn = startingActor;
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
        this.checkBoardPosition = function(x,y) {
            for (var i = 0; i < tictactoe.cells.length; i++) {
                for (var ii = 0; ii < tictactoe.cells[i].length; ii++) {
                    var cell = tictactoe.cells[i][ii];
                    if (x > cell.x && x < cell.x + cell.size
                        && y > cell.y && y < cell.y + cell.size) {
                        return cell;
                    }
                }
            }
            return false;
        }
        this.play = function(player, cell) {
            this.turn = 'ai';
            cell.play(player);
            endCondition(tictactoe.serialize(), 'paint');
            if (!this.gameOver) {
                var bestMove = minimax(this.serialize(), 'o').move;
                tictactoe.cells[bestMove[1]][bestMove[0]].play('o');
                endCondition(tictactoe.serialize(), 'paint');
                tictactoe.turn = 'player';
            } else
                $('#board').css('cursor', 'auto');
        }
    }


    $('#board').mousemove(function(e){
        if (!tictactoe || tictactoe.gameOver || tictactoe.turn != 'player') return;
        event = e || window.event;
        x = event.pageX - canvas.offsetLeft,
        y = event.pageY - canvas.offsetTop;
        var cell = tictactoe.checkBoardPosition(x,y);
        if (cell && !cell.state)
            $('#board').css('cursor', 'pointer');
        else
            $('#board').css('cursor', 'auto');
    });

    $('#board').on('click', function(e){
        if (!tictactoe || tictactoe.gameOver || tictactoe.turn != 'player') return;
        event = e || window.event;
        x = event.pageX - canvas.offsetLeft,
        y = event.pageY - canvas.offsetTop;
        var cell = tictactoe.checkBoardPosition(x,y);
        if (cell && !cell.state)
            tictactoe.play('x', cell);
    });

    $('#restart').on('click', function(e){
            tictactoe.restart();
            $('#board').fadeTo('slow', 1);
            $('#restart').fadeOut('slow');
    });

    function generate(state, player) {
        var possibilities = [];
        for (var i = 0; i < state.length; i++) {
            for (var ii = 0; ii < state[i].length; ii++) {
                if (!state[i][ii]) {
                    var future = jQuery.extend(true, [], state);
                    future[i][ii] = player;
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

    function endCondition(state, paint) {
        var player, eog = fullCells = tally = 0;
        var size = state.length;
        for (var i = 0; i < size && !eog; i++) {
            player = state[i][0];
            tally = 0;
            for (var ii = 0; ii < size && !eog; ii++) {
                if (state[i][ii] == player)
                    tally++;
                if (tally == size) {
                    if (paint)
                        for (var iii = 0; iii < size; iii++)
                            tictactoe.cells[i][iii].play(player, 'green');
                    eog = player;
                }
            }
        }
        for (var i = 0, tally = 0; i < size && !eog; i++) {
            player = state[0][i];
            tally = 0;
            for (var ii = 0; ii < size && !eog; ii++) {
                if (state[ii][i] == player)
                    tally++;
                if (tally == size) {
                    if (paint)
                        for (var iii = 0; iii < size; iii++)
                            tictactoe.cells[iii][i].play(player, 'green');
                    eog = player;
                }
            }
        }
        for (var i = 0, tally = 0; i < size && !eog; i++) {
            if (i == 0)
                player = state[0][0];
            for (var ii = 0; ii < size && !eog; ii++) {
                if (i == ii && state[i][ii] == player)
                    tally++;
                if (tally == size) {
                    if (paint)
                        for (var iii = 0; iii < size; iii++)
                            tictactoe.cells[iii][iii].play(player, 'green');
                    eog = player;
                }
            }
        }
        for (var i = 0, tally = 0; i < size && !eog; i++) {
            for (var ii = 0; ii < size && !eog; ii++) {
                if (i == 0 && ii == size-1)
                    player = state[0][size-1];
                if (i == (size-1)-ii
                        && state[i][ii] == player)
                    tally++;
                if (tally == size) {
                    eog = player;
                    if (paint)
                        for (var iii = 0; iii < size; iii++)
                            tictactoe.cells[iii][(size-1)-iii].play(eog, 'green');
                    eog = player;
                }
                if (state[i][ii] !== 0)
                    if (!eog && ++fullCells == size*size)
                        eog = 'tie';
            }
        }
        if (eog && paint) {
            tictactoe.gameOver = 1;
            $('#board').fadeTo('slow', 0.2);
            $('#restart').fadeIn('slow');
        }
        return eog ? eog : false;
    }

    function score(state, player, activePlayer) {
        var eog = endCondition(state);
        if (eog === 'tie')
            return 0;
        if (eog)
            return eog == player ? 1 : -1;
        return false;
    }

    function minimax(state, player, activePlayer) {
        var activePlayer = typeof activePlayer == 'undefined' ?
                            (player == 'x' ? 'o' : 'x') : activePlayer;
        var nextPlayer = activePlayer == 'x' ? 'o' : 'x';
        var eog = score(state, player, activePlayer);
        if (eog !== false)
            return eog;
        var scores = [];
        var futures = generate(state, nextPlayer);
        for (var i in futures) {
            var future = futures[i];
            var result = minimax(future.state, player, nextPlayer);
            if (typeof result == 'object')
                result = result.score;
            scores.push({
                    'move'  : [future.x,future.y],
                    'score' : result
            });
        }
        if (activePlayer == player) {
            var worstScore = 1;
            var worstIndex = 0;
            for (var i in scores)
                if (scores[i].score <= worstScore)
                    worstScore = scores[worstIndex = i].score;
            return scores[worstIndex];
        } else {
            var bestScore = -1;
            var bestIndex = 0;
            for (var i in scores)
                if (scores[i].score >= bestScore)
                    bestScore = scores[bestIndex = i].score;
            return scores[bestIndex];
        }
    }

    var tictactoe = new board(3, 'player').init();

});
