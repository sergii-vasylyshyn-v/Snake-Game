const global = {};
function snakeGame(initialParams) {
  const horizontalDirections = ["left", "right"];
  const verticalDirections = ["up", "down"];
  const bodyColor = "rgb(180, 180, 200)";
  const headColor = "rgb(250, 250, 120)";
  const foodColor = "rgb(210, 120, 120)";

  // Create a dot representing part of the snake or food
  function dot(props) {
    let { x, y, color } = props;
    const e = document.createElement("i");
    initialParams.displayE.appendChild(e);

    function applyState() {
      const step = 100 / initialParams.field.size;
      e.style.left = `${step * x}%`;
      e.style.top = `${step * y}%`;
      e.style.width = `${step}%`;
      e.style.height = `${step}%`;
      e.style.backgroundColor = color;
    }
    applyState();

    return {
      set: (props) => {
        let modified = false;
        const checkField = (field) => {
          const is = props.hasOwnProperty(field);
          if (is) modified = true;
          return is;
        };
        if (checkField("x")) x = props.x;
        if (checkField("y")) y = props.y;
        if (checkField("color")) color = props.color;
        if (modified) applyState();
      },
      get: () => ({
        x,
        y,
        color,
      }),
      kill: () => {
        e.remove();
      },
    };
  }

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Initialize snake dots
  function createSnake() {
    const snakeLength = 3;
    const dots = [];
    const x = getRandomInt(0, initialParams.field.size - 1);
    const y = getRandomInt(5, initialParams.field.size - 6);
    for (let i = 0; i < snakeLength; i++) {
      const color = snakeLength - i > 1 ? bodyColor : headColor;
      dots.push(
        dot({
          x,
          y: y + i,
          color,
        })
      );
    }
    return dots;
  }

  let snake = createSnake();

  // Generate random position for food
  function randomPositionFood() {
    const random = () => {
      return getRandomInt(0, initialParams.field.size - 1);
    };

    let [x, y] = [random(), random()];

    while (snake.some((dot) => dot.get().x == x && dot.get().y == y)) {
      x = random();
      y = random();
    }

    return { x, y };
  }

  // Create Food Dot
  function createFood() {
    const color = foodColor;
    const { x, y } = randomPositionFood();

    return dot({
      x,
      y,
      color,
    });
  }

  const food = createFood();

  // Check if snake's head eats the food
  function foodEating() {
    const head = snake[snake.length - 1];
    if (food.get().x === head.get().x && food.get().y === head.get().y) {
      return true;
    }
    return false;
  }

  function updateScore() {
    const scores = snake.length - 3;
    initialParams.scoreE.innerHTML = scores;
  }

  // Move the snake in the current direction
  function moving() {
    let direction = "down";
    let changeDirectionAccept = true;
    let speed = initialParams.gameSpeed;
    const historyMovingTail = [];

    global.snakeInterval = setInterval(() => {
      const prevs = [];
      [...snake].reverse().forEach((dot, index) => {
        const isHead = index == 0;
        const props = dot.get();

        prevs.push({
          x: props.x,
          y: props.y,
        });

        if (index == snake.length - 1) {
          historyMovingTail.unshift({
            x: props.x,
            y: props.y,
          });
        }

        const cases = {
          left: () => {
            props.x--;
          },
          right: () => {
            props.x++;
          },
          up: () => {
            props.y--;
          },
          down: () => {
            props.y++;
          },
        };

        if (isHead) {
          cases[direction]();
          endGameAnalyze(props);
        } else {
          props.x = prevs[index - 1].x;
          props.y = prevs[index - 1].y;
        }

        dot.set(props);
      });

      if (foodEating()) {
        const tailPos = historyMovingTail[0];
        snake.unshift(
          dot({
            x: tailPos.x,
            y: tailPos.y,
            color: bodyColor,
          })
        );
        const { x, y } = randomPositionFood();
        food.set({ x, y });
      }
      changeDirectionAccept = true;
      updateScore();
    }, speed);

    return {
      setDirection: (nDirection) => {
        if (
          !(
            verticalDirections.includes(direction) &&
            verticalDirections.includes(nDirection)
          ) &&
          !(
            horizontalDirections.includes(direction) &&
            horizontalDirections.includes(nDirection)
          ) &&
          changeDirectionAccept
        ) {
          direction = nDirection;
          changeDirectionAccept = false;
        }
      },
    };
  }

  const move = moving();

  // Reset the game
  function resetGame() {
    const { x, y } = randomPositionFood();
    food.set({ x, y });
    snake.forEach((dot) => dot.kill());
    snake = createSnake();
    move.setDirection("down");
  }

  function endGameAnalyze(props) {
    const { x, y } = props;

    const ateTail = snake.some((dot, index) => {
      if (index != snake.length - 1) {
        const { x: x_, y: y_ } = dot.get();
        if (x == x_ && y == y_) return true;
      }
    });

    if (
      x < 0 ||
      x > initialParams.field.size - 1 ||
      y < 0 ||
      y > initialParams.field.size - 1 ||
      (snake.length > 3 && ateTail)
    ) {
      resetGame();
    }
  }

  // Methods for control of the game
  return {
    left: () => move.setDirection("left"),
    right: () => move.setDirection("right"),
    down: () => move.setDirection("down"),
    up: () => move.setDirection("up"),
  };
}

const displayE = document.querySelector("#display");
const btnLeftE = document.querySelector("#buttonControllLeft");
const btnRightE = document.querySelector("#buttonControllRight");
const btnUpE = document.querySelector("#buttonControllUp");
const btnDownE = document.querySelector("#buttonControllDown");
const scoreE = document.querySelector("#snakeScore");

function updateSizeOfDisplay() {
  const parentWidth = displayE.parentElement.offsetWidth;
  const parentHeight = displayE.parentElement.offsetHeight;
  const mainSize = parentWidth > parentHeight ? parentHeight : parentWidth;
  displayE.style.width = `${mainSize}px`;
  displayE.style.height = `${mainSize}px`;
}

updateSizeOfDisplay();

document.addEventListener(
  "resize",
  function (event) {
    updateSizeOfDisplay();
  },
  true
);

function startGame() {
  displayE.innerHTML = "";
  if (global.hasOwnProperty("snakeInterval")) {
    clearInterval(global.snakeInterval);
  }
  const gameSpeed = Number(document.querySelector("#gameSpeedField").value);

  const size = Number(document.querySelector("#gridSizeField").value);
  const game = snakeGame({
    displayE: displayE,
    scoreE: scoreE,
    field: {
      size,
    },
    gameSpeed,
  });

  const controllCases = {
    ArrowLeft: {
      el: btnLeftE,
      action: () => game.left(),
    },
    ArrowRight: {
      el: btnRightE,
      action: () => game.right(),
    },
    ArrowUp: {
      el: btnUpE,
      action: () => game.up(),
    },
    ArrowDown: {
      el: btnDownE,
      action: () => game.down(),
    },
  };

  function keydownHandler(event) {
    if (controllCases[event.code]) {
      controllCases[event.code].action();
    }
  }

  // unsubscribe
  document.removeEventListener("keydown", keydownHandler);

  Object.keys(controllCases).forEach((key) => {
    if (controllCases[key].clickHandler) {
      controllCases[key].el.removeEventListener(
        "click",
        controllCases[key].clickHandler
      );
    }
  });

  // subscribe
  document.addEventListener("keydown", keydownHandler);

  Object.keys(controllCases).forEach((key) => {
    controllCases[key].clickHandler = function () {
      if (controllCases[key]) {
        controllCases[key].action();
      }
    };
    controllCases[key].el.addEventListener(
      "click",
      controllCases[key].clickHandler
    );
  });
}
