// pendulum.js
document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('pendulumCanvas');
    const ctx = canvas.getContext('2d');

    let length, angle, gravity = 9.81;
    let angleRad, angularVelocity = 0, angularAcceleration = 0;
    let originX = canvas.width / 2, originY = 50;
    let pendulumX, pendulumY;
    let animationId;
    let timeStep = 0.02;
    let damping = 0.999;
    const displayAmplification = 5;

    document.getElementById('startButton').addEventListener('click', startSimulation);

    function startSimulation() {
        length = parseFloat(document.getElementById('length').value);
        angle = parseFloat(document.getElementById('angle').value);
        if (angle > 5) {
            alert("初始角度不能超过5°");
            return;
        }
        angleRad = angle * Math.PI / 180;
        angularVelocity = 0;

        if (animationId) {
            cancelAnimationFrame(animationId);
        }

        calculatePeriod();
        animate();
    }

    function calculatePeriod() {
        const period = 2 * Math.PI * Math.sqrt(length / gravity);
        document.getElementById('periodValue').innerText = period.toFixed(2) + ' s';
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        angularAcceleration = (-gravity / length) * Math.sin(angleRad);
        angularVelocity += angularAcceleration * timeStep;
        angularVelocity *= damping;
        angleRad += angularVelocity * timeStep;

        const displayAngleRad = angleRad * displayAmplification;

        pendulumX = originX + length * 100 * Math.sin(displayAngleRad);
        pendulumY = originY + length * 100 * Math.cos(displayAngleRad);

        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(pendulumX, pendulumY);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(pendulumX, pendulumY, 10, 0, Math.PI * 2);
        ctx.fill();

        animationId = requestAnimationFrame(animate);
    }
});
