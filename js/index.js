function snakeGame(initialParams) {
  const horizontalDirections = ["left", "right"];
  const verticalDirections = ["up", "down"];
  const bodyColor = "rgb(180, 180, 200)";
  const headColor = "rgb(250, 250, 120)";
  const foodColor = "rgb(210, 120, 120)";
  function dot(props) {
    let { x, y, color } = props;
    const e = document.createElement("i");
    initialParams.displayElement.appendChild(e);

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

  function createSnakeDots() {
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

  let snake = createSnakeDots();

  function randomPositionForFood() {
    let x = getRandomInt(0, initialParams.field.size - 1);
    let y = getRandomInt(0, initialParams.field.size - 1);

    while (snake.some((dot) => dot.get().x == x && dot.get().y == y)) {
      x = getRandomInt(0, initialParams.field.size - 1);
      y = getRandomInt(0, initialParams.field.size - 1);
    }

    return { x, y };
  }

  function createFoodDot() {
    const color = foodColor;
    const { x, y } = randomPositionForFood();

    return dot({
      x,
      y,
      color,
    });
  }

  const food = createFoodDot();

  function foodEating() {
    const head = snake[snake.length - 1];
    if (food.get().x === head.get().x && food.get().y === head.get().y) {
      return true;
    }
    return false;
  }

  function mooving() {
    let direction = "down";
    let changeDirectionAccept = true;
    let speed = initialParams.gameSpeed;
    const historyMovingTail = [];

    window.snakeInterval = setInterval(() => {
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
        const { x, y } = randomPositionForFood();
        food.set({ x, y });
      }
      changeDirectionAccept = true;
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

  const moove = mooving();

  function resetGame() {
    const { x, y } = randomPositionForFood();
    food.set({ x, y });
    snake.forEach((dot) => dot.kill());
    snake = createSnakeDots();
    moove.setDirection("down");
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

  function listenButtons() {
    document.addEventListener("keydown", (event) => {
      switch (event.code) {
        case "ArrowUp":
          moove.setDirection("up");
          break;
        case "ArrowDown":
          moove.setDirection("down");
          break;
        case "ArrowLeft":
          moove.setDirection("left");
          break;
        case "ArrowRight":
          moove.setDirection("right");
          break;
      }
    });
  }

  listenButtons();
}

function startGame() {
  const displayElement = document.querySelector("#display");
  displayElement.innerHTML = "";
  if (window.hasOwnProperty("snakeInterval")) {
    clearInterval(window.snakeInterval);
  }
  const gameSpeed = Number(document.querySelector("#gameSpeedField").value);

  const size = Number(document.querySelector("#gridSizeField").value);
  snakeGame({
    displayElement,
    field: {
      size,
    },
    gameSpeed,
  });
}
