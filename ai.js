$(document).ready(function(){
    
    var canvas = $('#board')[0];
    var ctx = canvas.getContext('2d');

    function cell(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.state = 0;
        this.play = function(player) {
            this.state = player;
            var centerX = this.x + this.size/2;
            var centerY = this.y + this.size/2;
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

    function board(size) {
        var self = this;
        self.cellSize = canvas.width / size;
        self.cells = [];
        ctx.lineWidth = 2;
        for (var i = 0; i < size; i++) {
            self.cells.push([]);
            if (i > 0) {
                ctx.beginPath();
                ctx.moveTo(0, self.cellSize*i);
                ctx.lineTo(canvas.width, self.cellSize*i);
                ctx.stroke();
            }
            for (var ii = 0; ii < size; ii++) {
                if (ii > 0) {
                    ctx.beginPath();
                    ctx.moveTo(self.cellSize*ii, 0);
                    ctx.lineTo(self.cellSize*ii, canvas.height);
                    ctx.stroke();
                }
                self.cells[i][ii] =
                    new cell(self.cellSize*ii, self.cellSize*i,
                             self.cellSize, self.cellSize);
            }
        }
    }

    $('#board').on('click', function(e){
        if (!tictactoe) return;
        event = e || window.event;
        x = event.pageX - canvas.offsetLeft,
        y = event.pageY - canvas.offsetTop;
        for (var i = 0; i < tictactoe.cells.length; i++) {
            for (var ii = 0; ii < tictactoe.cells[i].length; ii++) {
                var cell = tictactoe.cells[i][ii];
                if (x > cell.x && x < cell.x + cell.size
                    && y > cell.y && y < cell.y + cell.size) {
                    cell.play(Math.random() > 0.5 ? 'x' : 'o');
                }
            }
        }
    });

    var tictactoe = new board(3);

});
