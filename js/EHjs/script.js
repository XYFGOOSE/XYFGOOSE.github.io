let engine, render, ball, wall1, wall2, Forceapplied;

function project() {
    // 清空之前的渲染
    if (render) {
        Matter.Render.stop(render);
        Matter.World.clear(engine.world);
        Matter.Engine.clear(engine);
        render.canvas.remove();
        render.canvas = null;
        render.context = null;
        render.textures = {};
    }

    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Body = Matter.Body,
        Composite = Matter.Composite,
        World = Matter.World,
        Bodies = Matter.Bodies,
        Vector = Matter.Vector;

    engine = Engine.create();

    render = Render.create({
        element: document.getElementById('renderport'),
        engine: engine,
        options: {
            width: 800,
            height: 600,
            wireframes: false,
            background: '#0f0f13'
        }
    });

    var mass = parseFloat(document.getElementById('mass').value);
    var efld = parseFloat(document.getElementById('efld').value);
    var chrg = parseFloat(document.getElementById('chrg').value);
    var direction = document.getElementById('direction').value;
    var vel = parseFloat(document.getElementById('vel').value);

    Forceapplied = chrg * efld * (direction === 'up' ? -1 : 1);

    ball = Bodies.circle(20, 300, 5, {
        friction: 0,
        frictionAir: 0.05,
        inverseInertia: 0,
        render: {
            fillStyle: 'red'
        }
    });
    wall1 = Bodies.rectangle(400, 0, 800, 20, {
        isStatic: true,
        render: { fillStyle: 'white', strokeStyle: 'white', lineWidth: 3 }
    });
    wall2 = Bodies.rectangle(400, 600, 800, 20, {
        isStatic: true,
        render: { fillStyle: 'white', strokeStyle: 'white', lineWidth: 3 }
    });

    engine.world.gravity.y = 0;
    Matter.Body.setMass(ball, mass);
    Matter.Body.setVelocity(ball, { x: vel, y: 0 });

    World.add(engine.world, [ball, wall1, wall2]);

    Matter.Events.on(engine, 'beforeUpdate', function (event) {
        Body.applyForce(ball, ball.position, { x: 0, y: Forceapplied / mass });
    });

    var trail = [];

    Matter.Events.on(render, 'afterRender', function () {
        trail.unshift({
            position: Vector.clone(ball.position),
            speed: ball.speed
        });

        Render.startViewTransform(render);
        render.context.globalAlpha = 0.7;

        for (var i = 0; i < trail.length; i += 1) {
            var point = trail[i].position,
                speed = trail[i].speed;

            var hue = 250 + Math.round((1 - Math.min(1, speed / 10)) * 170);
            render.context.fillStyle = 'hsl(' + hue + ', 100%, 55%)';
            render.context.fillRect(point.x, point.y, 2, 2);
        }

        render.context.globalAlpha = 1;
        Render.endViewTransform(render);

        if (trail.length > 2000) {
            trail.pop();
        }
    });

    Engine.run(engine);
    Render.run(render);
}
