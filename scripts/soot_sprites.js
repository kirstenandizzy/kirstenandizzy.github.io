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
    "./assets/soot_sprites/face/10.png",
    "./assets/soot_sprites/face/11.png",
    "./assets/soot_sprites/face/12.png",
    "./assets/soot_sprites/face/13.png",
    "./assets/soot_sprites/face/14.png",
    "./assets/soot_sprites/face/15.png",
    "./assets/soot_sprites/face/16.png",
    "./assets/soot_sprites/face/17.png",
    "./assets/soot_sprites/face/18.png",
    "./assets/soot_sprites/face/19.png"]
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
const HEIGHT = window.outerWidth < 700 ? window.outerWidth < 500 ? 640 + BOUNDARY_SIZE : 660 + BOUNDARY_SIZE : 695 + BOUNDARY_SIZE;

// create a renderer
let render = Render.create({
  canvas: canvas,
  engine: engine,
  options: {
    background: "transparent",
    wireframes: false,
    width: window.outerWidth,
    height: HEIGHT,
    pixelRatio: 2
  }
});

const SPAWN_POS_MAX = window.outerWidth - SPRIZE_SIZE;
const SPAWN_POS_MIN = SPRIZE_SIZE;

const createObject = () => {
  let sprite = Bodies.circle(Math.random() * (SPAWN_POS_MIN - SPAWN_POS_MAX) + SPAWN_POS_MAX, -SPRIZE_SIZE, SPRIZE_SIZE, {
    render: {
      sprite: {
        texture: sprites[Math.floor(Math.random() * sprites.length)],
        xScale: 0.035,
        yScale: 0.035
      }
    },
    frictionAir : 0.025,
    friction : 2,
    restitution: 1,
    inertia: 50000,
    mass: 1.25
  });
  Composite.add(engine.world, sprite);
  setInterval(function() {
    const shouldMakeTrouble = Math.random() < 0.05;
    if (shouldMakeTrouble) {
      var force = 0.1;
      var deltaVector = Matter.Vector.sub(mouse.position, sprite.position);
      var normalizedDelta = Matter.Vector.normalise(deltaVector);
      var forceVector = Matter.Vector.mult(normalizedDelta, force);
      Matter.Body.applyForce(sprite, sprite.position, forceVector);
    }
    
  }, 250);
  return sprite;
};

const GENERATE_INTERVAL = 100;
const intervalId = setInterval(createObject, GENERATE_INTERVAL);
const SRITE_COUNT = window.outerWidth*.009;

setTimeout(() => {
  clearInterval(intervalId);
}, GENERATE_INTERVAL*SRITE_COUNT);


// create ground
const ground = Bodies.rectangle(
  window.outerWidth / 2,
  HEIGHT,
  window.outerWidth,
  BOUNDARY_SIZE,
  {
    isStatic: true,
    label: "Ground"
   }
);

const ceiling = Bodies.rectangle(
  window.outerWidth / 2,
  -SPRIZE_SIZE,
  window.outerWidth,
  BOUNDARY_SIZE,
  {
    isStatic: true,
    label: "Ceiling"
   }
);

const wallLeft = Bodies.rectangle(-BOUNDARY_SIZE, HEIGHT / 2, BOUNDARY_SIZE, HEIGHT, {
  isStatic: true, label: "Wall Left"
});

const wallRight = Bodies.rectangle(window.outerWidth + BOUNDARY_SIZE, HEIGHT / 2, BOUNDARY_SIZE, HEIGHT, {
  isStatic: true, label: "Wall Right"
});

window.addEventListener("resize", function () {
  Matter.Body.setPosition(ground, {x: window.outerWidth / 2, y: HEIGHT})
  Matter.Body.setPosition(wallRight, {x: window.outerWidth + BOUNDARY_SIZE, y: HEIGHT / 2})
  Matter.Body.setPosition(wallLeft, {x: -BOUNDARY_SIZE, y: HEIGHT / 2})
});

// add all of the bodies to the world
Composite.add(engine.world, [ground, ceiling, wallLeft, wallRight]);

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

// Needed for Matter.js bug where window stops scrolling around canvas
mouse.element.removeEventListener('wheel', mouse.mousewheel);
mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel);

mouseConstraint.mouse.element.removeEventListener('touchstart', mouseConstraint.mouse.mousedown);
mouseConstraint.mouse.element.removeEventListener('touchmove', mouseConstraint.mouse.mousemove);
mouseConstraint.mouse.element.removeEventListener('touchend', mouseConstraint.mouse.mouseup);

mouseConstraint.mouse.element.addEventListener('touchstart', mouseConstraint.mouse.mousedown, { passive: true });
mouseConstraint.mouse.element.addEventListener('touchmove', (e) => {
  if (mouseConstraint.body) {
    mouseConstraint.mouse.mousemove(e);
  }
});
mouseConstraint.mouse.element.addEventListener('touchend', (e) => {
  if (mouseConstraint.body) {
    mouseConstraint.mouse.mouseup(e);
  }
});

mouse.mousedown = function(event) {
  var position = Mouse._getRelativeMousePosition(event, mouse.element, mouse.pixelRatio),
      touches = event.changedTouches;

  if (touches) {
      mouse.button = 0;
      // event.preventDefault(); # comment this
  } else {
      mouse.button = event.button;
  }

  mouse.absolute.x = position.x;
  mouse.absolute.y = position.y;
  mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;
  mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;
  mouse.mousedownPosition.x = mouse.position.x;
  mouse.mousedownPosition.y = mouse.position.y;
  mouse.sourceEvents.mousedown = event;
};