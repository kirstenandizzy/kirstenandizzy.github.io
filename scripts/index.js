const sprites = [
    "./assets/soot_sprites/face/1.png",
    "./assets/soot_sprites/face/2.png",
    "./assets/soot_sprites/face/3.png",
    "./assets/soot_sprites/face/4.png",
    "./assets/soot_sprites/face/5.png",
    "./assets/soot_sprites/face/6.png",
    "./assets/soot_sprites/face/7.png",
    "./assets/soot_sprites/face/8.png",
    "./assets/soot_sprites/face/9.png",
    "./assets/soot_sprites/face/10.png"
]
const canvas = document.querySelector("#sprite-house");

// module aliases
let Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite,
  Mouse = Matter.Mouse,
  MouseConstraint = Matter.MouseConstraint;

// create an engine
let engine = Engine.create();

const SPRIZE_SIZE = 70;
const BOUNDARY_SIZE = 20;
const HEIGHT = 640 + BOUNDARY_SIZE;


// create a renderer
let render = Render.create({
  canvas: canvas,
  engine: engine,
  options: {
    background: "transparent",
    wireframes: false,
    width: window.innerWidth,
    height: HEIGHT,
    pixelRatio: 'auto'
  }
});

const createObject = () => {
  let box = Bodies.circle(Math.random() * (SPRIZE_SIZE - window.innerWidth) + window.innerWidth, -SPRIZE_SIZE, SPRIZE_SIZE, {
    render: {
      sprite: {
        texture: sprites[Math.floor(Math.random() * sprites.length)],
        xScale: 0.035,
        yScale: 0.035
      }
    }
  });
  Composite.add(engine.world, box);
};

const GENERATE_INTERVAL = 500;
const intervalId = setInterval(createObject, GENERATE_INTERVAL);

setTimeout(() => {
  clearInterval(intervalId);
}, GENERATE_INTERVAL*13);


// create ground
const ground = Bodies.rectangle(
  window.innerWidth / 2,
  HEIGHT,
  window.innerWidth,
  BOUNDARY_SIZE,
  {
    isStatic: true,
    label: "Ground"
   }
);

const wallLeft = Bodies.rectangle(-BOUNDARY_SIZE, HEIGHT / 2, BOUNDARY_SIZE, HEIGHT, {
  isStatic: true, label: "Wall Left"
});
const wallRight = Bodies.rectangle(window.innerWidth + BOUNDARY_SIZE, HEIGHT / 2, BOUNDARY_SIZE, HEIGHT, {
  isStatic: true, label: "Wall Right"
});

// add all of the bodies to the world
Composite.add(engine.world, [ground, wallLeft, wallRight]);

// run the renderer
Render.run(render);

// create runner
let runner = Runner.create();

// run the engine
Runner.run(runner, engine);

let mouse = Mouse.create(render.canvas);
let mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 1,
    render: {
      visible: false
    }
  }
});

Composite.add(engine.world, mouseConstraint);

window.addEventListener("resize", function () {
  Matter.Body.setPosition(ground, {x: window.innerWidth / 2, y: HEIGHT + BOUNDARY_SIZE})
  Matter.Body.setPosition(wallRight, {x: window.innerWidth + BOUNDARY_SIZE, y: HEIGHT / 2})
});

