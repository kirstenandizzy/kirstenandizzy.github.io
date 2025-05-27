import sprite1 from '../assets/face/1.png'; 
import sprite2 from '../assets/face/2.png'; 
import sprite3 from '../assets/face/3.png'; 
import sprite4 from '../assets/face/4.png'; 
import sprite5 from '../assets/face/5.png'; 
import sprite6 from '../assets/face/6.png'; 
import sprite7 from '../assets/face/7.png'; 
import sprite8 from '../assets/face/8.png'; 
import sprite9 from '../assets/face/9.png'; 
import sprite10 from '../assets/face/10.png'; 

const sprites = [
    sprite1,
    sprite2,
    sprite3,
    sprite4,
    sprite5,
    sprite6,
    sprite7,
    sprite8,
    sprite9,
    sprite10
]
const canvas = document.querySelector("#sprite-house");
const addButton = document.querySelector("#add-button");

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

// create a renderer
let render = Render.create({
  canvas: canvas,
  engine: engine,
  options: {
    background: "transparent",
    wireframes: false,
    width: window.innerWidth,
    height: window.innerHeight
  }
});

const createObject = () => {
  let box = Bodies.circle(window.innerWidth / 2, 0, 40, {
    render: {
      sprite: {
        texture: sprites[Math.floor(Math.random() * sprites.length)]
      }
    }
  });
  Composite.add(engine.world, box);
};

// create ground
let ground = Bodies.rectangle(
  window.innerWidth / 2,
  window.innerHeight,
  window.innerWidth,
  60,
  { isStatic: true }
);

// add all of the bodies to the world
Composite.add(engine.world, [ground]);

// run the renderer
Render.run(render);

// create runner
let runner = Runner.create();

// run the engine
Runner.run(runner, engine);

addButton.addEventListener("click", createObject);

let mouse = Mouse.create(render.canvas);
let mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 0.2,
    render: {
      visible: false
    }
  }
});

Composite.add(engine.world, mouseConstraint);

