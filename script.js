//const GRID = document.getElementById("grid");
const GRID = document.querySelector(".grid");
const GAP = 20;
const PIECE_SIZE = 40;
const GRID_WIDTH = getGridWidth();
const GRID_HEIGHT = getGridHeight();
const ROW = GRID_HEIGHT / PIECE_SIZE;
const COLUMN = GRID_WIDTH / PIECE_SIZE;
const PIECE = [];
const FOOD_COLOR = "orange";
const BACKGROUND_COLOR = "black";
const SNAKE_COLOR = "green";

const UP = "up";
const DOWN = "down";
const LEFT = "left";
const RIGHT = "right";
const NONE = "none";
const SPEED = 4;
const TIME_STEP = 1000/SPEED;


GRID.style.width = GRID_WIDTH + "px";
GRID.style.height = GRID_HEIGHT + "px";

for (let row = 0, i = 0; row < ROW; row++) {
    let temp = [];
    for (let column = 0; column < COLUMN; column++, i++) {
        let piece = document.createElement("div");
        piece.style.width = PIECE_SIZE + "px";
        piece.style.height = PIECE_SIZE + "px";
        piece.setAttribute("class", "piece");
        GRID.appendChild(piece);
        temp.push(piece);
    }
    PIECE.push(temp);
}

/*
for (let i = 0; i < TOATAL_PIECE; i++) {
    let piece = document.createElement("div");
    piece.style.width = PIECE_SIZE + "px";
    piece.style.height = PIECE_SIZE + "px";
    piece.setAttribute("class", "piece");
    //GRID.appendChild(piece);
    PIECE.push(piece);
}
*/

function getGridWidth() {
    for (let i = getClientWidth() - GAP * 2; i > 0; i--) {
        if (i % PIECE_SIZE === 0) {
            return i;
        }
    }
}

function getGridHeight() {
    for (let i = getClientHeight() - GAP * 2; i > 0; i--) {
        if (i % PIECE_SIZE === 0) {
            return i;
        }
    }
}

function getClientWidth(){
    var myWidth = 0;
    if( typeof window.innerWidth === "number" ) {
        myWidth = window.innerWidth;//Non-IE
    } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
        myWidth = document.documentElement.clientWidth;//IE 6+ in 'standards compliant mode'
    } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
        myWidth = document.body.clientWidth;//IE 4 compatible
    }
    return myWidth;
}

function getClientHeight(){
    var myHeight = 0;
    if( typeof window.innerHeight === "number" ) {
        myHeight = window.innerHeight;//Non-IE
    } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
        myHeight = document.documentElement.clientHeight;//IE 6+ in 'standards compliant mode'
    } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
        myHeight = document.body.clientHeight;//IE 4 compatible
    }
    return myHeight;
}

// Food
class Food {
    constructor() {
        this.row = 0;
        this.column = 0;
        this.color = FOOD_COLOR;
    }

    place(snake_coordinates) {
        this.row = this.newCoordinateX();
        this.column = this.newCoordinateY();

        for (let snake_coord of snake_coordinates) {
            if (this.row == snake_coord[0] && this.column == snake_coord[1]) {
                this.place();
            }
        }
        PIECE[this.column][this.row].style.backgroundColor = this.color;
    }

    clear() {
        PIECE[this.column][this.row].style.backgroundColor = BACKGROUND_COLOR;
    }

    reset(snake_coordinates) {
        this.clear();
        this.place(snake_coordinates);
    }

    newCoordinateX() {
        return Math.floor(Math.random() * COLUMN);
    }

    newCoordinateY() {
        return Math.floor(Math.random() * ROW);
    }
}

// Snake
class Snake {
    constructor() {
        this.direction = NONE;
        this.color = SNAKE_COLOR;
        this.length = 3;

        this.new();
    }

    new() {
        this.coordinates = [];

        let center_coord_x = Math.floor(COLUMN / 2);
        let center_coord_y = Math.floor(ROW / 2);        

        switch (Math.floor(Math.random() * 4)) {
            case 0:
                this.direction = UP;
                for (let i = 0; i < this.length; i++) {
                    this.coordinates.push([center_coord_x, center_coord_y + i]);
                }                
                break;

            case 1:
                this.direction = DOWN;
                for (let i = 0; i < this.length; i++) {
                    this.coordinates.push([center_coord_x, center_coord_y - i]);
                }                
                break; 

            case 2:
                this.direction = LEFT;
                for (let i = 0; i < this.length; i++) {
                    this.coordinates.push([center_coord_x + i, center_coord_y]);
                }                
                break;   

            case 3:
                this.direction = RIGHT;
                for (let i = 0; i < this.length; i++) {
                    this.coordinates.push([center_coord_x - i, center_coord_y]);
                }
                break;

            default:
                console.log("something went wrong!");
                break;
        }        
    }

    render(texture) {
        for (let coord of this.coordinates) {
            if (this.renderable([coord[0], coord[1]])) {
                PIECE[coord[1]][coord[0]].style.backgroundColor = texture;
            }
        }
    }

    render_body() {
        this.render(this.color);
    }

    clear_body() {
        this.render(BACKGROUND_COLOR);
    }

    render_head() {
        let head = this.head();
        if (this.renderable(head)) {
            PIECE[head[1]][head[0]].style.backgroundColor = this.color;
        }
    }

    clear_tail() {
        let tail = this.coordinates.pop();
        PIECE[tail[1]][tail[0]].style.backgroundColor = BACKGROUND_COLOR;
    }

    renderable(part) {
        return part[0] >= 0 && part[0] < COLUMN && part[1] >= 0 && part[1] < ROW;
    }

    eat(food) {
        return this.coordinates[0][0] == food.row && this.coordinates[0][1] == food.column;
    }

    collide() {
        let head = this.head();

        if (head[0] < 0 || head[0] >= COLUMN || head[1] < 0 || head[1] >= ROW) {
            return true;
        }

        for (let i = 1; i < this.coordinates.length; i++) {
            let body = this.coordinates[i];

            if (head[0] === body[0] && head[1] === body[1]) {
                return true;
            }
        }

        return false;
    }

    head() {
        return this.coordinates[0];
    }

    reset() {
        this.clear_body();
        this.new();
        this.render_body();
    }

    handleEventKeyboard() {
        document.addEventListener("keydown", (event) => {
            let keyName = event.key;

            if (keyName === "ArrowUp" && this.direction !== DOWN) {
                this.direction = UP;
            }
            else if (keyName === "ArrowDown" && this.direction !== UP) {
                this.direction = DOWN;
            }
            else if (keyName === "ArrowLeft" && this.direction !== RIGHT) {
                this.direction = LEFT;
            }
            else if (keyName === "ArrowRight" && this.direction !== LEFT) {
                this.direction = RIGHT;
            }
        }, false);
    }

    handleEventTouchScreen() {
        let start_coord_x = 0;
        let start_coord_y = 0;
        let end_coord_x = 0;
        let end_coord_y = 0;

        let opposite = 0;
        let adjacent = 0;
        let hypotenuse = 0;
        let angle = 0;

        document.addEventListener("touchstart", event => {
            [...event.changedTouches].forEach(touch => {
                start_coord_x = touch.pageX;
                start_coord_y = touch.pageY;
            });
        });

        document.addEventListener("touchend", event => {
            [...event.changedTouches].forEach(touch => {

                end_coord_x = touch.pageX;
                end_coord_y = touch.pageY;

                opposite = (end_coord_x > start_coord_x) ? end_coord_x - start_coord_x : start_coord_x - end_coord_x;

                adjacent = (end_coord_y > start_coord_y) ? end_coord_y - start_coord_y : start_coord_y - end_coord_y;

                hypotenuse = Math.sqrt(Math.pow(opposite, 2) + Math.pow(adjacent, 2));

                if (hypotenuse > adjacent && hypotenuse > opposite) {
                    angle = Math.asin(opposite / hypotenuse) * 180 / Math.PI;

                    if (end_coord_x > start_coord_x && end_coord_y > start_coord_y) {
                        angle += 270;
                    }
                    else if (end_coord_x < start_coord_x && end_coord_y < start_coord_y) {
                        angle += 90;
                    }
                    else if (end_coord_x > start_coord_x && end_coord_y < start_coord_y) {
                        angle -= 90;
                    }
                    else if (end_coord_x < start_coord_x && end_coord_y > start_coord_y) {
                        angle -= 270;
                    }

                    angle = Math.abs(angle);

                    if (angle < 45 || angle > 315) {
                        this.direction = RIGHT;
                    }
                    else if (angle > 45 && angle < 135) {
                        this.direction = UP;
                    }
                    else if (angle > 135 && angle < 225) {
                        this.direction = LEFT;
                    }
                    else if (angle > 225 && angle < 315) {
                        this.direction = DOWN;
                    }
                }
            });
        });
    }

    move() {
        let head = this.head();
        let head_coord_x = head[0];
        let head_coord_y = head[1];

        this.handleEventKeyboard();
        this.handleEventTouchScreen();
        
        if (this.direction === UP) {
            head_coord_y -= 1;
        }
        else if (this.direction === DOWN) {
            head_coord_y += 1;
        }
        else if (this.direction === LEFT) {
            head_coord_x -= 1;
        }
        else if (this.direction === RIGHT) {
            head_coord_x += 1;
        }

        let new_head = [head_coord_x, head_coord_y];
        this.coordinates.unshift(new_head);
        this.render_head();
    }    
}

var food = new Food();
var snake = new Snake();

food.place(snake.coordinates);
snake.render_body();

function play() {
    snake.move();
    if (snake.collide(food)) {
        reset();
    }
    else {
        if (snake.eat(food)) {
            food.place(snake.coordinates);
        }
        else {
            snake.clear_tail();
        }
    }
}

function reset() {
    snake.reset();
    food.reset(snake.coordinates);
}

setInterval(play, TIME_STEP);