const socket = io(); // Connect to the server

// Get the canvas and its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Define the scorpion object
const scorpion1 = {
    x: canvas.width*3 / 4, // Start at the center of the canvas
    y: canvas.height / 2,
    width: 30,
    height: 30,
    color: '#FF073A',
    speed: 0.1, // Acceleration speed
    vx: 0, // Velocity in the x direction
    vy: 0, // Velocity in the y direction
    friction: 0.9, // Friction coefficient (0 < friction < 1)
    hasBall: false, // Flag to indicate if scorpion1 has the ball
    direction: Math.PI, // Direction the scorpion is facing (0 radians = right, PI/2 = down, PI = left, 3PI/2 = up)
    canPickUpBall: true, // Flag to indicate if scorpion1 can pick up the ball
    score: 0, // Score for scorpion1
    visible: true, // Flag to determine if scorpion1 is visible
};

// Define the second scorpion object
const scorpion2 = {
    x: canvas.width / 4 - 30, // Start at 1/4 of the canvas width
    y: canvas.height / 2,
    width: 30,
    height: 30,
    color: '#00FFFF',
    speed: 0.1, // Acceleration speed
    vx: 0, // Velocity in the x direction
    vy: 0, // Velocity in the y direction
    friction: 0.9, // Friction coefficient (0 < friction < 1)
    hasBall: false, // Flag to indicate if scorpion2 has the ball
    direction: 0, // Direction the scorpion is facing ('up', 'down', 'left', 'right')
    canPickUpBall: true, // Flag to indicate if scorpion2 can pick up the ball
    score: 0, // Score for scorpion2
    visible: true, // Flag to determine if scorpion2 is visible
};

// Define the ball object
const ball = {
    x: canvas.width / 2, // Start at the center of the canvas
    y: canvas.height / 2 +10, // Position it near the top
    radius: 10, // Radius of the ball
    color: 'orange',
    visible: true, // Flag to determine if the ball is visible
    vx: 0, // Velocity in the x direction
    vy: 0, // Velocity in the y direction
};

const wave1 = {
    x: 0,
    y: 0,
    originX: 0, // Store the origin X position
    originY: 0, // Store the origin Y position
    width: 20,
    height: 20,
    color: 'lightblue',
    vx: 0,
    vy: 0,
    visible: false, // Initially, the wave is not visible
    ballHit: false, // Track if the wave has already hit the ball
};

const wave2 = {
    x: 0,
    y: 0,
    originX: 0, // Store the origin X position
    originY: 0, // Store the origin Y position
    width: 20,
    height: 20,
    color: 'lightgreen',
    vx: 0,
    vy: 0,
    visible: false, // Initially, the wave is not visible
    ballHit: false, // Track if the wave has already hit the ball
};

const bullet1 = {
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    color: 'red',
    vx: 0,
    vy: 0,
    visible: false, // Initially, the bullet is not visible
};

const bullet2 = {
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    color: 'blue',
    vx: 0,
    vy: 0,
    visible: false, // Initially, the bullet is not visible
};

// Define the corner objects
const cornerObjects = [
    { x: 0, y: 0, width: scorpion1.width, height: canvas.height / 3, color: '#4B0082' }, // Top-left
    { x: canvas.width - scorpion1.width, y: 0, width: scorpion1.width, height: canvas.height / 3, color: '#4B0082' }, // Top-right
    { x: 0, y: canvas.height - canvas.height / 3, width: scorpion1.width, height: canvas.height / 3, color: '#4B0082' }, // Bottom-left
    { x: canvas.width - scorpion1.width, y: canvas.height - canvas.height / 3, width: scorpion1.width, height: canvas.height / 3, color: '#4B0082' }, // Bottom-right
];

// Define the green object on the left wall
const greenObject = {
    x: 0, // Positioned on the left wall
    y: canvas.height / 3, // Positioned 1/3 down from the top of the canvas
    width: scorpion1.width, // Same width as scorpion1
    height: canvas.height / 3, // 1/3 the height of the canvas
    color: 'yellow', // Color of the object
};

// Define the yellow object on the right wall
const yellowObject = {
    x: canvas.width - scorpion2.width, // Positioned on the right wall
    y: canvas.height / 3, // Positioned 1/3 down from the top of the canvas
    width: scorpion2.width, // Same width as scorpion2
    height: canvas.height / 3, // 1/3 the height of the canvas
    color: 'yellow', // Color of the object
};

// Define the score tracker
let score = 0;

// Object to track pressed keys
const keysPressed = {};

let canDashScorpion1 = true; // Cooldown flag for scorpion1
let canDashScorpion2 = true; // Cooldown flag for scorpion2


// Function to draw scorpion1 as a circle with a white center
function drawScorpion() {
    // Draw the opposite triangle based on the direction
    drawOppositeTriangle(scorpion1, canShootBullet1);
    // Draw the spike if showSpike is true
    if (scorpion1.showSpike) {
        const spikeTip = drawSpike(scorpion1);

        // Check if the spike hits scorpion2
        if (isSpikeCollidingWithScorpion(spikeTip, scorpion2)) {
            resetScorpion(scorpion2); // Reset scorpion2 after a delay
        }
    }

    // Draw the outer circle (scorpion body)
    ctx.fillStyle = scorpion1.color;
    ctx.beginPath();
    ctx.arc(
        scorpion1.x + scorpion1.width / 2, // Center X
        scorpion1.y + scorpion1.height / 2, // Center Y
        scorpion1.width / 2, // Radius
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.closePath();

    // Draw the inner circle
    ctx.fillStyle = scorpion1.hasBall ? scorpion1.color : 'black'; // Fill with scorpion's color if it has the ball
    ctx.beginPath();
    ctx.arc(
        scorpion1.x + scorpion1.width / 2, // Center X
        scorpion1.y + scorpion1.height / 2, // Center Y
        scorpion1.width / 4, // Radius (smaller than the outer circle)
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.lineWidth = 2; // Set the outline width
    ctx.strokeStyle = 'orange'; // Set the outline color
    ctx.stroke(); // Draw the outline
    ctx.closePath();

    // Draw the green semi-circle line if scorpion1 can shoot the wave
    if (canSendWaveScorpion1) {
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 2;
        ctx.beginPath();

        // Adjust the semi-circle to face the scorpion's direction
        const startAngle = scorpion1.direction - Math.PI / 4; // Start angle (45 degrees before direction)
        const endAngle = scorpion1.direction + Math.PI / 4;   // End angle (45 degrees after direction)

        ctx.arc(
            scorpion1.x + scorpion1.width / 2, // Center X
            scorpion1.y + scorpion1.height / 2, // Center Y
            scorpion1.width / 2 - 3, // Slightly smaller radius than the outer circle
            startAngle, // Start angle
            endAngle // End angle
        );
        ctx.stroke();
        ctx.closePath();
    }
}

// Function to draw scorpion2 as a circle with a white center
function drawScorpion2() {
    // Draw the opposite triangle based on the direction
    drawOppositeTriangle(scorpion2, canShootBullet2);
    // Draw the spike if showSpike is true
    if (scorpion2.showSpike) {
        const spikeTip = drawSpike(scorpion2);

        // Check if the spike hits scorpion1
        if (isSpikeCollidingWithScorpion(spikeTip, scorpion1)) {
            resetScorpion(scorpion1); // Reset scorpion1 on hit
        }
    }

    // Draw the outer circle (scorpion body)
    ctx.fillStyle = scorpion2.color;
    ctx.beginPath();
    ctx.arc(
        scorpion2.x + scorpion2.width / 2, // Center X
        scorpion2.y + scorpion2.height / 2, // Center Y
        scorpion2.width / 2, // Radius
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.closePath();

    // Draw the inner circle
    ctx.fillStyle = scorpion2.hasBall ? scorpion2.color : 'black'; // Fill with scorpion's color if it has the ball
    ctx.beginPath();
    ctx.arc(
        scorpion2.x + scorpion2.width / 2, // Center X
        scorpion2.y + scorpion2.height / 2, // Center Y
        scorpion2.width / 4, // Radius (smaller than the outer circle)
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.lineWidth = 2; // Set the outline width
    ctx.strokeStyle = 'orange'; // Set the outline color
    ctx.stroke(); // Draw the outline
    ctx.closePath();

    // Draw the green semi-circle line if scorpion2 can shoot the wave
    if (canSendWaveScorpion2) {
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 2;
        ctx.beginPath();

        // Adjust the semi-circle to face the scorpion's direction
        const startAngle = scorpion2.direction - Math.PI / 4; // Start angle (45 degrees before direction)
        const endAngle = scorpion2.direction + Math.PI / 4;   // End angle (45 degrees after direction)

        ctx.arc(
            scorpion2.x + scorpion2.width / 2, // Center X
            scorpion2.y + scorpion2.height / 2, // Center Y
            scorpion2.width / 2 - 3, // Slightly smaller radius than the outer circle
            startAngle, // Start angle
            endAngle // End angle
        );
        ctx.stroke();
        ctx.closePath();
    }

}

function drawOppositeTriangle(scorpion, canShootFlag) {
    const triangleLength = 20; // Length of the triangle
    const triangleBase = 25; // Width of the triangle base
    const offset = 5; // Offset to move the triangle off-center

    const centerX = scorpion.x + scorpion.width / 2;
    const centerY = scorpion.y + scorpion.height / 2;

    // Offset the triangle's position further back along the direction opposite to the scorpion's facing direction
    const offsetX = -offset * Math.cos(scorpion.direction);
    const offsetY = -offset * Math.sin(scorpion.direction);

    // Calculate the triangle's tip position based on the direction opposite to the scorpion's facing direction
    const tipX = centerX - triangleLength * Math.cos(scorpion.direction) + offsetX;
    const tipY = centerY - triangleLength * Math.sin(scorpion.direction) + offsetY;

    // Calculate the base of the triangle
    const baseX1 = centerX + (triangleBase /2) * Math.sin(scorpion.direction) + offsetX;
    const baseY1 = centerY - (triangleBase /2) * Math.cos(scorpion.direction) + offsetY;
    const baseX2 = centerX - (triangleBase / 2) * Math.sin(scorpion.direction) + offsetX;
    const baseY2 = centerY + (triangleBase / 2) * Math.cos(scorpion.direction) + offsetY;

    // Draw the triangle as a visual element
    ctx.fillStyle = scorpion.color; // Match the triangle color to the scorpion's color
    ctx.beginPath();
    ctx.moveTo(tipX, tipY); // Tip of the triangle
    ctx.lineTo(baseX1, baseY1); // One side of the base
    ctx.lineTo(baseX2, baseY2); // Other side of the base
    ctx.closePath();
    // Fill the triangle only if the bullet is ready to fire
    if (canShootFlag) {
        ctx.fillStyle = scorpion.color; // Match the triangle color to the scorpion's color
        ctx.fill();
    } else {
        ctx.strokeStyle = scorpion.color; // Outline the triangle with the scorpion's color
        ctx.lineWidth = 2; // Set the outline width
        ctx.stroke();
    }
}

// Function to check collision between scorpion1 and the ball
function isCollidingWithBall(scorpion, ball) {
    const distX = scorpion.x + scorpion.width / 2 - ball.x;
    const distY = scorpion.y + scorpion.height / 2 - ball.y;
    const distance = Math.sqrt(distX * distX + distY * distY);

    return distance < ball.radius + scorpion.width / 2;
}

// Function to check collision between the ball and the green object
function isCollidingWithGreenObject(ball, greenObject) {
    return (
        ball.x + ball.radius > greenObject.x &&
        ball.x - ball.radius < greenObject.x + greenObject.width &&
        ball.y + ball.radius > greenObject.y &&
        ball.y - ball.radius < greenObject.y + greenObject.height
    );
}

// Function to draw the ball
function drawBall() {
    if (ball.visible) {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2); // Draw a circle
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.closePath();
    }
}

// Function to draw the corner objects
function drawCornerObjects() {
    cornerObjects.forEach((obj) => {
        ctx.fillStyle = obj.color;
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    });
}

// Function to check collision between two scorpions
function isCollidingScorpions(scorpion1, scorpion2) {
    if (!scorpion1.visible || !scorpion2.visible) {
        return false; // Skip collision check if either scorpion is not visible
    }

    const distX = (scorpion1.x + scorpion1.width / 2) - (scorpion2.x + scorpion2.width / 2);
    const distY = (scorpion1.y + scorpion1.height / 2) - (scorpion2.y + scorpion2.height / 2);
    const distance = Math.sqrt(distX ** 2 + distY ** 2);

    // Check if the distance between the centers is less than the sum of their radii
    return distance < (scorpion1.width / 2 + scorpion2.width / 2);
}

// Function to draw the green object
function drawGreenObject() {
    ctx.fillStyle = greenObject.color;
    ctx.fillRect(greenObject.x, greenObject.y, greenObject.width, greenObject.height);

    // Draw the green line on the left side
    ctx.strokeStyle = 'green'; // Set the line color to green
    ctx.lineWidth = 8; // Set the line width
    ctx.beginPath();
    ctx.moveTo(greenObject.x + greenObject.width-4, greenObject.y); // Start at the top-left corner
    ctx.lineTo(greenObject.x + greenObject.width-4, greenObject.y + greenObject.height); // Draw to the bottom-left corner
    ctx.stroke();
    ctx.closePath();
}

function drawYellowObject() {
    ctx.fillStyle = yellowObject.color;
    ctx.fillRect(yellowObject.x, yellowObject.y, yellowObject.width, yellowObject.height);

    // Draw the green line on the left side
    ctx.strokeStyle = 'green'; // Set the line color to green
    ctx.lineWidth = 8; // Set the line width
    ctx.beginPath();
    ctx.moveTo(yellowObject.x+4, yellowObject.y); // Start at the top-left corner
    ctx.lineTo(yellowObject.x+4, yellowObject.y + yellowObject.height); // Draw to the bottom-left corner
    ctx.stroke();
    ctx.closePath();
}

function drawSpike(scorpion) {
    const spikeLength = 30; // Length of the spike
    const spikeBase = 10; // Width of the spike base
    const centerX = scorpion.x + scorpion.width / 2;
    const centerY = scorpion.y + scorpion.height / 2;

    // Calculate the spike's tip position based on the scorpion's direction
    const tipX = centerX + spikeLength * Math.cos(scorpion.direction);
    const tipY = centerY + spikeLength * Math.sin(scorpion.direction);

    // Calculate the base of the spike
    const baseX1 = centerX + (spikeBase / 2) * Math.sin(scorpion.direction);
    const baseY1 = centerY - (spikeBase / 2) * Math.cos(scorpion.direction);
    const baseX2 = centerX - (spikeBase / 2) * Math.sin(scorpion.direction);
    const baseY2 = centerY + (spikeBase / 2) * Math.cos(scorpion.direction);

    // Draw the spike as a triangle
    ctx.fillStyle = 'pink'; // Spike color
    ctx.beginPath();
    ctx.moveTo(tipX, tipY); // Tip of the spike
    ctx.lineTo(baseX1, baseY1); // One side of the base
    ctx.lineTo(baseX2, baseY2); // Other side of the base
    ctx.closePath();
    ctx.fill();

    // Return the tip position for collision detection
    return { tipX, tipY };
}

function isSpikeCollidingWithScorpion(spikeTip, scorpion) {
    return (
        spikeTip.tipX > scorpion.x &&
        spikeTip.tipX < scorpion.x + scorpion.width &&
        spikeTip.tipY > scorpion.y &&
        spikeTip.tipY < scorpion.y + scorpion.height
    );
}

// Function to clear the canvas
function clearCanvas() {
    ctx.fillStyle = 'black'; // Set the background color to black
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the entire canvas with black
}

//function to reset scorpions on death
function resetScorpion(scorpion) {

    playAudio('audio/death.wav'); // Play the death sound

    if (scorpion.hasBall) {
        scorpion.hasBall = false;
        ball.visible = true;
        ball.x = scorpion.x + scorpion.width / 2; // Drop the ball at scorpion2's position
        ball.y = scorpion.y + scorpion.height / 2;
        ball.vx = 0; // Reset ball velocity
        ball.vy = 0; // Reset ball velocity
        ballSpeed = 0; // Stop the ball
    }

    scorpion.visible = false;
    if (scorpion === scorpion1) {
        canDashScorpion1 = false;
        canSendWaveScorpion1 = false;
        canShootBullet1 = false;
    } else if (scorpion === scorpion2) {
        canDashScorpion2 = false;
        canSendWaveScorpion2 = false;
        canShootBullet2 = false;
    }

    let positionUpdated = false;

    setTimeout(() => {
        scorpion.visible = true; // Reappear after 2 seconds

        if (!positionUpdated) {
            const newYPosition = Math.round(Math.random()) === 0
                ? canvas.height / 4
                : canvas.height * 3 / 4;

            scorpion.y = newYPosition; // Assign the new Y position
            positionUpdated = true; // Mark the position as updated
        }

        if (scorpion === scorpion2) {
            scorpion.x = canvas.width / 4 - 30; // Reset to starting X position
            scorpion.vx = 0; // Reset velocity
            scorpion.vy = 0; // Reset velocity
            direction = 0; // Reset direction
            canDashScorpion2 = true; // Reset dash cooldown
            canSendWaveScorpion2 = true; // Reset wave cooldown
            canShootBullet2 = true; // Reset bullet cooldown
        }
        else if (scorpion === scorpion1) {
            scorpion.x = canvas.width * 3 / 4; // Reset to starting X position
            scorpion.vx = 0; // Reset velocity
            scorpion.vy = 0; // Reset velocity
            direction = Math.PI; // Reset direction
            canDashScorpion1 = true; // Reset dash cooldown
            canSendWaveScorpion1 = true; // Reset wave cooldown
            canShootBullet1 = true; // Reset bullet cooldown
        }
    }, 2000); // 2000 milliseconds = 2 seconds
}
    

// Function to check collision with an object
function isColliding(obj1, obj2) {
    return (
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj2.height > obj2.y
    );
}

// Event listeners for keyboard controls
document.addEventListener('keydown', (event) => {
    keysPressed[event.key] = true; // Mark the key as pressed
});

document.addEventListener('keyup', (event) => {
    keysPressed[event.key] = false; // Mark the key as released
});

// Function to release the ball
function releaseBall() {
    if (scorpion1.hasBall) {
        scorpion1.hasBall = false; // Set hasBall to false
        scorpion1.color = '#FF073A'; // Change scorpion1's color back to red
        ball.visible = true; // Make the ball visible again

        // Place the ball at the edge of scorpion1 based on its direction
        const ballOffset = 50; // Offset to ensure the ball is slightly outside the scorpion
        ball.x = scorpion1.x + scorpion1.width / 2 + ballOffset * Math.cos(scorpion1.direction);
        ball.y = scorpion1.y + scorpion1.height / 2 + ballOffset * Math.sin(scorpion1.direction);

        const nextX = ball.x + ball.vx;
        const nextY = ball.y + ball.vy;

        // Check if the ball would be out of bounds
        if (
            ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width ||
            ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height ||
            cornerObjects.some((obj) => (
                nextX + ball.radius > obj.x &&
                nextX - ball.radius < obj.x + obj.width &&
                nextY + ball.radius > obj.y &&
                nextY - ball.radius < obj.y + obj.height
            ))
        ) {
            // Reset the ball to the center of the scorpion
            ball.x = scorpion1.x + scorpion1.width / 2;
            ball.y = scorpion1.y + scorpion1.height / 2;
            ballSpeed = 0; // Stop the ball
        }

        // Set the ball's velocity based on the direction the scorpion is facing
        const ballSpeed = 6; // Speed of the ball
        ball.vx = ballSpeed * Math.cos(scorpion1.direction);
        ball.vy = ballSpeed * Math.sin(scorpion1.direction);

        // Start cooldown for picking up the ball
        scorpion1.canPickUpBall = false;
        playAudio('audio/shootball.wav'); // Play the ball release sound
        setTimeout(() => {
            scorpion1.canPickUpBall = true;
        }, 170); // 170 milliseconds cooldown
    }
    else {
        // Temporarily show the spike
        scorpion1.showSpike = true;
        setTimeout(() => {
            scorpion1.showSpike = false; // Hide the spike after a short duration
        }, 500); // Spike visible for 500 milliseconds
    }
}

// Function to release the ball for scorpion2
function releaseBallScorpion2() {
    if (scorpion2.hasBall) {
        scorpion2.hasBall = false; // Set hasBall to false
        scorpion2.color = '#00FFFF'; // Change scorpion2's color back to blue
        ball.visible = true; // Make the ball visible again

        // Place the ball at the edge of scorpion2 based on its direction
        const ballOffset = 50; // Offset to ensure the ball is slightly outside the scorpion
        ball.x = scorpion2.x + scorpion2.width / 2 + ballOffset * Math.cos(scorpion2.direction);
        ball.y = scorpion2.y + scorpion2.height / 2 + ballOffset * Math.sin(scorpion2.direction);

        const nextX = ball.x + ball.vx;
        const nextY = ball.y + ball.vy;

        // Check if the ball would be out of bounds
        if (
            ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width ||
            ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height ||
            cornerObjects.some((obj) => (
                nextX + ball.radius > obj.x &&
                nextX - ball.radius < obj.x + obj.width &&
                nextY + ball.radius > obj.y &&
                nextY - ball.radius < obj.y + obj.height
            ))
        ) {
            // Reset the ball to the center of the scorpion
            ball.x = scorpion2.x + scorpion2.width / 2;
            ball.y = scorpion2.y + scorpion2.height / 2;
            ballSpeed = 0; // Stop the ball
        }

        // Set the ball's velocity based on the direction the scorpion is facing
        const ballSpeed = 6; // Speed of the ball
        ball.vx = ballSpeed * Math.cos(scorpion2.direction);
        ball.vy = ballSpeed * Math.sin(scorpion2.direction);

        // Start cooldown for picking up the ball
        playAudio('audio/shootball.wav'); // Play the ball release sound
        scorpion2.canPickUpBall = false;
        setTimeout(() => {
            scorpion2.canPickUpBall = true;
        }, 170); // 170 milliseconds cooldown
    }
    else {
        // Temporarily show the spike
        scorpion2.showSpike = true;
        setTimeout(() => {
            scorpion2.showSpike = false; // Hide the spike after a short duration
        }, 500); // Spike visible for 500 milliseconds
    }
}

// Function to update the ball's position
function updateBall() {
    if (ball.visible) {
        // Predict the ball's next position
        const nextX = ball.x + ball.vx;
        const nextY = ball.y + ball.vy;

        // Bounce off the walls and add glowing effect
        if (nextX - ball.radius < 0) {
            playAudio('audio/ballwall.wav'); // Play collision sound
            ball.vx *= -1; // Reverse horizontal velocity
            ball.x = ball.radius; // Reposition the ball
            // Draw glowing line on the left border
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)'; // Neon green color
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(0, nextY - ball.radius);
            ctx.lineTo(0, nextY + ball.radius);
            ctx.stroke();
            ctx.closePath();
        }
        if (nextX + ball.radius > canvas.width) {
            playAudio('audio/ballwall.wav'); // Play collision sound
            ball.vx *= -1; // Reverse horizontal velocity
            ball.x = canvas.width - ball.radius; // Reposition the ball
            // Draw glowing line on the right border
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(canvas.width, nextY - ball.radius);
            ctx.lineTo(canvas.width, nextY + ball.radius);
            ctx.stroke();
            ctx.closePath();
        }
        if (nextY - ball.radius < 0) {
            playAudio('audio/ballwall.wav'); // Play collision sound
            ball.vy *= -1; // Reverse vertical velocity
            ball.y = ball.radius; // Reposition the ball
            // Draw glowing line on the top border
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(nextX - ball.radius, 0);
            ctx.lineTo(nextX + ball.radius, 0);
            ctx.stroke();
            ctx.closePath();
        }
        if (nextY + ball.radius > canvas.height) {
            playAudio('audio/ballwall.wav'); // Play collision sound
            ball.vy *= -1; // Reverse vertical velocity
            ball.y = canvas.height - ball.radius; // Reposition the ball
            // Draw glowing line on the bottom border
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(nextX - ball.radius, canvas.height);
            ctx.lineTo(nextX + ball.radius, canvas.height);
            ctx.stroke();
            ctx.closePath();
        }

        // Bounce off corner objects
        cornerObjects.forEach((obj) => {
            if (
                nextX + ball.radius > obj.x &&
                nextX - ball.radius < obj.x + obj.width &&
                nextY + ball.radius > obj.y &&
                nextY - ball.radius < obj.y + obj.height
            ) {
                playAudio('audio/ballwall.wav'); // Play collision sound
                // Determine the side of collision
                const overlapX = Math.min(
                    nextX + ball.radius - obj.x,
                    obj.x + obj.width - nextX + ball.radius
                );
                const overlapY = Math.min(
                    nextY + ball.radius - obj.y,
                    obj.y + obj.height - nextY + ball.radius
                );

                // Draw a glowing line on the edge of the corner object
                ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)'; // Neon green color with some transparency
                ctx.lineWidth = 5; // Line width
                ctx.beginPath();
                if (overlapX < overlapY) {
                    ball.vx *= -1; // Reverse horizontal velocity
                    // Horizontal collision
                    ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)'; // Neon green color with some transparency
                    ctx.lineWidth = 5; // Line width
                    ctx.beginPath();
                    if (nextX < obj.x) {
                        // Left edge
                        ctx.moveTo(obj.x, nextY - ball.radius);
                        ctx.lineTo(obj.x, nextY + ball.radius);
                    } else {
                        // Right edge
                        ctx.moveTo(obj.x + obj.width, nextY - ball.radius);
                        ctx.lineTo(obj.x + obj.width, nextY + ball.radius);
                    }
                    ctx.stroke();
                    ctx.closePath();
                } else {
                    ball.vy *= -1; // Reverse vertical velocity
                    // Vertical collision
                    ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)'; // Neon green color with some transparency
                    ctx.lineWidth = 5; // Line width
                    ctx.beginPath();
                    if (nextY < obj.y) {
                        // Top edge
                        ctx.moveTo(nextX - ball.radius, obj.y);
                        ctx.lineTo(nextX + ball.radius, obj.y);
                    } else {
                        // Bottom edge
                        ctx.moveTo(nextX - ball.radius, obj.y + obj.height);
                        ctx.lineTo(nextX + ball.radius, obj.y + obj.height);
                    }
                    ctx.stroke();
                    ctx.closePath();
                }
            }
        });

        // Update the ball's position
        ball.x += ball.vx;
        ball.y += ball.vy;
    }
}

// Event listener for the space key
document.addEventListener('keydown', (event) => {
    if (event.key === ' ') { // Check if the space key is pressed
        releaseBall();
    }
});

// Event listener for the 0 key (scorpion2 shooting)
document.addEventListener('keydown', (event) => {
    if (event.key === '0') { // Check if the 0 key is pressed
        releaseBallScorpion2();
    }
});

// Event listener for the Q key (scorpion1 dashing)
document.addEventListener('keydown', (event) => {
    if (event.key === 'q' && scorpion1.visible) { // Check if scorpion1 is visible
        dashScorpion1();
    }
});

// Event listener for the 1 key (scorpion2 dashing)
document.addEventListener('keydown', (event) => {
    if (event.key === '1' && scorpion2.visible) { // Check if scorpion2 is visible
        dashScorpion2();
    }
});

// Event listener for the E key (scorpion1 sends a wave)
document.addEventListener('keydown', (event) => {
    if (event.key === 'e' && scorpion1.visible) { // Check if scorpion1 is visible
        sendWave(scorpion1);
    }
});

// Event listener for the 2 key (scorpion2 sends a wave)
document.addEventListener('keydown', (event) => {
    if (event.key === '2' && scorpion2.visible) { // Check if scorpion2 is visible
        sendWave(scorpion2);
    }
});

// Event listener for shooting bullets
document.addEventListener('keydown', (event) => {
    if (event.key === 'r') { // Scorpion1 shoots a bullet
        sendBullet(scorpion1, bullet1, canShootBullet1, startBulletCooldown1);
    }
    if (event.key === '3') { // Scorpion2 shoots a bullet
        sendBullet(scorpion2, bullet2, canShootBullet2, startBulletCooldown2);
    }
});

// Function to update the scorpion's direction
function updateScorpionDirection() {
    let dx = 0;
    let dy = 0;

    if (keysPressed['w']) dy -= 1; // Move up
    if (keysPressed['a']) dx -= 1; // Move left
    if (keysPressed['s']) dy += 1; // Move down
    if (keysPressed['d']) dx += 1; // Move right

    if (dx !== 0 || dy !== 0) {
        scorpion1.direction = Math.atan2(dy, dx); // Calculate angle in radians
    }
}

// Function to update scorpion2's direction
function updateScorpion2Direction() {
    let dx = 0;
    let dy = 0;

    if (keysPressed['ArrowUp']) dy -= 1; // Move up
    if (keysPressed['ArrowLeft']) dx -= 1; // Move left
    if (keysPressed['ArrowDown']) dy += 1; // Move down
    if (keysPressed['ArrowRight']) dx += 1; // Move right

    if (dx !== 0 || dy !== 0) {
        scorpion2.direction = Math.atan2(dy, dx); // Calculate angle in radians
    }
}

function resetGame() {
    playAudio('audio/score.wav'); // Play reset sound
    scorpion1.visible = false; // Hide scorpion1
    scorpion2.visible = false; // Hide scorpion2
    ball.visible = false; // Hide the ball

    canDashScorpion1 = false; // Disable dash for scorpion1
    canDashScorpion2 = false; // Disable dash for scorpion2
    canSendWaveScorpion1 = false; // Disable wave for scorpion1
    canSendWaveScorpion2 = false; // Disable wave for scorpion2
    canShootBullet1 = false; // Disable bullet for scorpion1
    canShootBullet2 = false; // Disable bullet for scorpion2
    
    setTimeout(() => {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2 + 10;
    ball.vx = 0;
    ball.vy = 0;
    ball.visible = true; // Make the ball visible again

    // Reset scorpions
    scorpion1.visible = true; // Make scorpion1 visible again
    scorpion2.visible = true; // Make scorpion2 visible again

    scorpion1.x = canvas.width * 3 / 4;
    scorpion1.y = canvas.height / 2;
    scorpion1.hasBall = false;
    scorpion1.color = '#FF073A';
    scorpion1.direction = Math.PI; // Reset direction

    scorpion2.x = canvas.width / 4 - 30;
    scorpion2.y = canvas.height / 2;
    scorpion2.hasBall = false;
    scorpion2.color = '#00FFFF';
    scorpion2.direction = 0; // Reset direction

    bullet1.visible = false; // Hide bullet1
    bullet2.visible = false; // Hide bullet2
    wave1.visible = false; // Hide wave1
    wave2.visible = false; // Hide wave2
    scorpion1.canPickUpBall = true; // Allow scorpion1 to pick up the ball again
    scorpion2.canPickUpBall = true; // Allow scorpion2 to pick up the ball again

    canDashScorpion1 = true; // Reset dash cooldown
    canDashScorpion2 = true; // Reset dash cooldown
    canSendWaveScorpion1 = true; // Reset wave cooldown
    canSendWaveScorpion2 = true; // Reset wave cooldown
    canShootBullet1 = true; // Reset bullet cooldown
    canShootBullet2 = true; // Reset bullet cooldown
    }, 4000); // 4000 milliseconds = 4 seconds
}

// Function to update the score display
function updateScoreDisplay() {
    const scorpion1ScoreElement = document.getElementById('player1score');
    const scorpion2ScoreElement = document.getElementById('player2score');
    scorpion1ScoreElement.textContent = scorpion1.score;
    scorpion2ScoreElement.textContent = scorpion2.score;
}

// Function to make scorpion1 dash
function dashScorpion1() {
    if (!canDashScorpion1) return; // Exit if scorpion1 is on cooldown
    playAudio('audio/dash.wav'); // Play dash sound

    const dashSpeed = 30; // Speed boost for the dash
    const dashDuration = 2000; // Dash duration in milliseconds

    // Temporarily increase the velocity
    scorpion1.vx += dashSpeed * Math.cos(scorpion1.direction);
    scorpion1.vy += dashSpeed * Math.sin(scorpion1.direction);

    // Set cooldown for scorpion1
    canDashScorpion1 = false;

    // Gradually reduce the speed boost over the dash duration
    const dashInterval = setInterval(() => {
        scorpion1.vx *= 0.9; // Reduce velocity gradually
        scorpion1.vy *= 0.9;
    }, 200); // Reduce every 100ms

    setTimeout(() => {
        clearInterval(dashInterval); // Stop reducing velocity after the dash duration
        canDashScorpion1 = true; // Reset cooldown
    }, dashDuration);
}

// Function to make scorpion2 dash
function dashScorpion2() {
    if (!canDashScorpion2) return; // Exit if scorpion2 is on cooldown
    playAudio('audio/dash.wav'); // Play dash sound

    const dashSpeed = 10; // Speed boost for the dash
    const dashDuration = 2000; // Dash duration in milliseconds

    // Temporarily increase the velocity
    scorpion2.vx += dashSpeed * Math.cos(scorpion2.direction);
    scorpion2.vy += dashSpeed * Math.sin(scorpion2.direction);

    // Set cooldown for scorpion2
    canDashScorpion2 = false;

    // Gradually reduce the speed boost over the dash duration
    const dashInterval = setInterval(() => {
        scorpion2.vx *= 0.9; // Reduce velocity gradually
        scorpion2.vy *= 0.9;
    }, 200); // Reduce every 100ms

    setTimeout(() => {
        clearInterval(dashInterval); // Stop reducing velocity after the dash duration
        canDashScorpion2 = true; // Reset cooldown
    }, dashDuration);
}

let canSendWaveScorpion1 = true; // Cooldown flag for scorpion1's wave
let canSendWaveScorpion2 = true; // Cooldown flag for scorpion2's wave

let hitscorpion1 = false; // Flag to track if scorpion1 has been hit by a wave
let hitscorpion2 = false;

function sendWave(scorpion) {
    let wave, canSendWaveFlag;

    if (scorpion === scorpion1) {
        wave = wave1;
        canSendWaveFlag = canSendWaveScorpion1;
    } else if (scorpion === scorpion2) {
        wave = wave2;
        canSendWaveFlag = canSendWaveScorpion2;
    }

    if (!canSendWaveFlag || wave.visible) return; // Prevent sending another wave if on cooldown or wave is already active
    playAudio('audio/wave.wav', 0.5); // Play wave sound

    // Set the wave's initial position to the center of the scorpion
    wave.visible = true;
    wave.x = scorpion.x + scorpion.width / 2; // Center of the scorpion horizontally
    wave.y = scorpion.y + scorpion.height / 2; // Center of the scorpion vertically
    wave.originX = wave.x; // Store the origin X position
    wave.originY = wave.y; // Store the origin Y position

    const waveSpeed = 4; // Speed of the wave
    // Set the wave's velocity based on the scorpion's direction
    wave.vx = waveSpeed * Math.cos(scorpion.direction);
    wave.vy = waveSpeed * Math.sin(scorpion.direction);

    // Start cooldown for the specific scorpion
    if (scorpion === scorpion1) {
        canSendWaveScorpion1 = false;
        hitscorpion2 = false; // Flag to track if scorpion2 has been hit by a wave
        setTimeout(() => {
            canSendWaveScorpion1 = true; // Reset cooldown after 500 milliseconds
        }, 3000); // 500 milliseconds cooldown
    } else if (scorpion === scorpion2) {
        hitscorpion1 = false; // Flag to track if scorpion1 has been hit by a wave
        canSendWaveScorpion2 = false;
        setTimeout(() => {
            canSendWaveScorpion2 = true; // Reset cooldown after 500 milliseconds
        }, 3000); // 500 milliseconds cooldown
    }
}

function updateWave(wave) {
    if (wave.visible) {
        // Update the wave's position
        wave.x += wave.vx;
        wave.y += wave.vy;

        // Calculate the distance from the wave's origin (scorpion's center)
        const scorpionCenterX = wave.originX;
        const scorpionCenterY = wave.originY;
        const distance = Math.sqrt(
            (wave.x - scorpionCenterX) ** 2 + (wave.y - scorpionCenterY) ** 2
        );

        // Increase the wave's size based on the distance
        wave.width = 20 + distance * 0.4; // Base size + growth factor
        wave.height = wave.width; // Keep it proportional

        // Hide the wave if it exceeds the maximum distance
        const maxDistance = 300; // Maximum distance the wave can travel
        if (distance > maxDistance) {
            wave.visible = false;
            wave.width = 20; // Reset size
            wave.height = 20; // Reset size
            wave.ballHit = false; // Reset the ball hit flag
        }

        // Hide the wave if it goes out of bounds
        if (
            wave.x < 0 ||
            wave.x > canvas.width ||
            wave.y < 0 ||
            wave.y > canvas.height
        ) {
            wave.visible = false;
            wave.width = 20; // Reset size
            wave.height = 20; // Reset size
            wave.ballHit = false; // Reset the ball hit flag
        }

        // Check for collision between the wave and the ball
        if (ball.visible && !wave.ballHit) { // Only check if the ball hasn't been hit yet
            const distX = wave.x - ball.x;
            const distY = wave.y - ball.y;
            const distanceToBall = Math.sqrt(distX ** 2 + distY ** 2);

            if (distanceToBall < wave.width / 2 + ball.radius) {
                // Collision detected: Change the ball's velocity
                const distanceFromOrigin = Math.sqrt(
                    (wave.x - wave.originX) ** 2 + (wave.y - wave.originY) ** 2
                );
        
                // Calculate the scaling factor (closer = stronger effect, farther = weaker effect)
                const maxDistance = 300; // Maximum distance the wave can travel
                const effectScale = Math.max(0, 1.5 - distanceFromOrigin / maxDistance);
        
                // Collision detected: Adjust the ball's velocity based on the wave's velocity and the scaling factor
                ball.vx += wave.vx * 0.5 * effectScale; // Scale the velocity adjustment
                ball.vy += wave.vy * 0.5 * effectScale;
        
                // Mark the ball as hit
                wave.ballHit = true;
            }
        }

        if (wave === wave1) {
            const distX = wave.x - (scorpion2.x + scorpion2.width / 2);
            const distY = wave.y - (scorpion2.y + scorpion2.height / 2);
            const distanceToScorpion2 = Math.sqrt(distX ** 2 + distY ** 2);

            if (distanceToScorpion2 < wave.width / 2 + scorpion2.width / 2 && !hitscorpion2) {
                hitscorpion2 = true; // Mark scorpion2 as hit

                if(scorpion2.hasBall) {
                    wave.ballHit = true;
                }
                resetScorpion(scorpion2); // Reset scorpion2 on collision
            }
        }

        if (wave === wave2) {
            const distX = wave.x - (scorpion1.x + scorpion1.width / 2);
            const distY = wave.y - (scorpion1.y + scorpion1.height / 2);
            const distanceToScorpion1 = Math.sqrt(distX ** 2 + distY ** 2);

            if (distanceToScorpion1 < wave.width / 2 + scorpion1.width / 2 && !hitscorpion1) {
                hitscorpion1 = true; // Mark scorpion1 as hit

                if (scorpion1.hasBall) {
                    wave.ballHit = true;
                }

                resetScorpion(scorpion1); // Reset scorpion1 on collision

            }
        }
    }
}

function drawWave(wave) {
    if (wave.visible) {
        ctx.fillStyle = wave.color;
        ctx.beginPath();

        // Calculate the start and end angles based on the wave's velocity
        const angle = Math.atan2(wave.vy, wave.vx); // Angle in radians
        const arcWidth = Math.PI / 2; // Width of the arc (90 degrees)

        const startAngle = angle - arcWidth; // Start angle of the arc
        const endAngle = angle + arcWidth;   // End angle of the arc

        // Draw the wave as an arc
        ctx.arc(wave.x, wave.y, wave.width / 2, startAngle, endAngle);
        ctx.fill();
        ctx.closePath();
    }
}

let canShootBullet1 = true; // Scorpion1's bullet cooldown
let canShootBullet2 = true; // Scorpion2's bullet cooldown

// Function to send a bullet
function sendBullet(scorpion, bullet, canShootFlag, setCooldownCallback) {
    if (!canShootFlag || bullet.visible) return; // Prevent sending another bullet if on cooldown or already active

    // Play the bullet shooting sound
    playAudio('audio/bullet.wav'); // Adjust volume as needed

    // Set the bullet's initial position to the center of the scorpion
    bullet.visible = true;
    bullet.x = scorpion.x + scorpion.width / 2; // Center of the scorpion horizontally
    bullet.y = scorpion.y + scorpion.height / 2; // Center of the scorpion vertically

    const bulletSpeed = 6; // Speed of the bullet
    // Set the bullet's velocity based on the scorpion's direction
    bullet.vx = bulletSpeed * Math.cos(scorpion.direction);
    bullet.vy = bulletSpeed * Math.sin(scorpion.direction);

    // Start cooldown for the specific scorpion
    setCooldownCallback();
}

// Cooldown functions
function startBulletCooldown1() {
    canShootBullet1 = false;
    setTimeout(() => {
        canShootBullet1 = true; // Reset cooldown after 3 seconds
    }, 3000); // 3000 milliseconds = 3 seconds
}

function startBulletCooldown2() {
    canShootBullet2 = false;
    setTimeout(() => {
        canShootBullet2 = true; // Reset cooldown after 3 seconds
    }, 3000); // 3000 milliseconds = 3 seconds
}

// Function to update the bullet's position
function updateBullet(bullet) {
    if (bullet.visible) {
        // Update the bullet's position
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        // Hide the bullet if it goes out of bounds
        if (
            bullet.x < 0 ||
            bullet.x > canvas.width ||
            bullet.y < 0 ||
            bullet.y > canvas.height
        ) {
            bullet.visible = false;
        }

        // Check for collision between the bullet and the ball
        if (ball.visible) {
            const distX = bullet.x - ball.x;
            const distY = bullet.y - ball.y;
            const distanceToBall = Math.sqrt(distX ** 2 + distY ** 2);

            if (distanceToBall < ball.radius + bullet.width / 2) {
                // Collision detected: Change the ball's velocity
                const bulletImpactScale = 1; // Scale factor for velocity change
                ball.vx += bullet.vx * bulletImpactScale;
                ball.vy += bullet.vy * bulletImpactScale;

                bullet.visible = false; // Hide the bullet after collision
            }
        }

        // Check for collision between the bullet and wave1
        if (wave1.visible) {
            const distX = bullet.x - wave1.x;
            const distY = bullet.y - wave1.y;
            const distanceToWave1 = Math.sqrt(distX ** 2 + distY ** 2);

            if (distanceToWave1 < wave1.width / 2 + bullet.width / 2) {
                bullet.visible = false; // Hide the bullet
            }
        }

        // Check for collision between the bullet and wave2
        if (wave2.visible) {
            const distX = bullet.x - wave2.x;
            const distY = bullet.y - wave2.y;
            const distanceToWave2 = Math.sqrt(distX ** 2 + distY ** 2);

            if (distanceToWave2 < wave2.width / 2 + bullet.width / 2) {
                bullet.visible = false; // Hide the bullet
            }
        }

        // Check for collision between the bullet and scorpion1
        if (bullet === bullet2 && scorpion1.visible) {
            const distX = bullet.x - (scorpion1.x + scorpion1.width / 2);
            const distY = bullet.y - (scorpion1.y + scorpion1.height / 2);
            const distanceToScorpion1 = Math.sqrt(distX ** 2 + distY ** 2);

            if (distanceToScorpion1 < bullet.width / 2 + scorpion1.width / 2) {

                bullet.visible = false; // Hide the bullet
                resetScorpion(scorpion1); // Reset scorpion1 on collision
            }
        }

        // Check for collision between the bullet and scorpion2
        if (bullet === bullet1 && scorpion2.visible) {
            const distX = bullet.x - (scorpion2.x + scorpion2.width / 2);
            const distY = bullet.y - (scorpion2.y + scorpion2.height / 2);
            const distanceToScorpion2 = Math.sqrt(distX ** 2 + distY ** 2);

            if (distanceToScorpion2 < bullet.width / 2 + scorpion2.width / 2) {
                bullet.visible = false; // Hide the bullet
                resetScorpion(scorpion2); // Reset scorpion2 on collision
            }
        }
    }
}

// Function to draw the bullet
function drawBullet(bullet) {
    if (bullet.visible) {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x - bullet.width / 2, bullet.y - bullet.height / 2, bullet.width, bullet.height);
    }
}

function checkBulletCollision() {
    if (bullet1.visible && bullet2.visible) {
        const distX = bullet1.x - bullet2.x;
        const distY = bullet1.y - bullet2.y;
        const distance = Math.sqrt(distX ** 2 + distY ** 2);

        // Check if the bullets are colliding
        if (distance < bullet1.width / 2 + bullet2.width / 2) {
            bullet1.visible = false; // Hide bullet1
            bullet2.visible = false; // Hide bullet2
        }
    }
}

function playAudio(audioSrc, volume) {
    if (volume === undefined) volume = 1.0; // Default volume if not specified
    const audio = new Audio(audioSrc); // Create a new audio instance
    audio.volume = volume*0.5; // Set the volume (0.0 to 1.0)
    audio.play(); // Play the audio
}

function updateGameObjects(deltaTime) {
    scorpion1.x += scorpion1.vx * deltaTime;
    scorpion1.y += scorpion1.vy * deltaTime;
    scorpion2.x += scorpion2.vx * deltaTime;
    scorpion2.y += scorpion2.vy * deltaTime;

    ball.x += ball.vx * deltaTime;
    ball.y += ball.vy * deltaTime;
}

function handleGamepadInput() {
    const gamepads = navigator.getGamepads(); // Get the list of connected gamepads
    const gamepad1 = gamepads[0]; // Assume the first gamepad controls scorpion1
    const gamepad2 = gamepads[1]; // Assume the second gamepad controls scorpion2

    if (gamepad1) {
        // Map the left stick for movement (scorpion1)
        const leftStickX = gamepad1.axes[0]; // Horizontal axis (-1 to 1)
        const leftStickY = gamepad1.axes[1]; // Vertical axis (-1 to 1)

        // Apply movement based on stick input
        if (Math.abs(leftStickX) > 0.1 || Math.abs(leftStickY) > 0.1) {
            scorpion1.vx += leftStickX*2 * scorpion1.speed;
            scorpion1.vy += leftStickY*2 * scorpion1.speed;

            // Clamp the velocity to the maximum speed
            const speed = Math.sqrt(scorpion1.vx ** 2 + scorpion1.vy ** 2);
            const maxSpeed = 7; // Define the maximum speed
            if (speed > maxSpeed) {
                const scale = maxSpeed / speed;
                scorpion1.vx *= scale;
                scorpion1.vy *= scale;
            }

            // Calculate the angle of the joystick
            scorpion1.direction = Math.atan2(leftStickY, leftStickX); // Angle in radians
        }

        // Map buttons for actions (scorpion1)
        if (gamepad1.buttons[0].pressed) releaseBall(); // Button A for releasing the ball
        if (gamepad1.buttons[2].pressed) dashScorpion1(); // Button B for dashing
        if (gamepad1.buttons[6].pressed) sendWave(scorpion1); // Button X for sending a wave
        if (gamepad1.buttons[7].pressed) sendBullet(scorpion1, bullet1, canShootBullet1, startBulletCooldown1); // Button Y for shooting a bullet
    }

    if (gamepad2) {
        // Map the left stick for movement (scorpion2)
        const leftStickX = gamepad2.axes[0]; // Horizontal axis (-1 to 1)
        const leftStickY = gamepad2.axes[1]; // Vertical axis (-1 to 1)

        // Apply movement based on stick input
        if (Math.abs(leftStickX) > 0.1 || Math.abs(leftStickY) > 0.1) {
            scorpion2.vx += leftStickX*2 * scorpion2.speed;
            scorpion2.vy += leftStickY*2 * scorpion2.speed;

            // Clamp the velocity to the maximum speed
            const speed = Math.sqrt(scorpion2.vx ** 2 + scorpion2.vy ** 2);
            const maxSpeed = 7; // Define the maximum speed
            if (speed > maxSpeed) {
                const scale = maxSpeed / speed;
                scorpion2.vx *= scale;
                scorpion2.vy *= scale;
            }

            // Calculate the angle of the joystick
            scorpion2.direction = Math.atan2(leftStickY, leftStickX); // Angle in radians
        }

        // Map buttons for actions (scorpion2)
        if (gamepad2.buttons[0].pressed) releaseBallScorpion2(); // Button A for releasing the ball
        if (gamepad2.buttons[2].pressed) dashScorpion2(); // Button B for dashing
        if (gamepad2.buttons[6].pressed) sendWave(scorpion2); // Button X for sending a wave
        if (gamepad2.buttons[7].pressed) sendBullet(scorpion2, bullet2, canShootBullet2, startBulletCooldown2); // Button Y for shooting a bullet
    }
}

let lastTime = 0;

// Game loop to update and render the canvas
function gameLoop(timestamp) {
    const backgroundMusic = document.getElementById('backgroundmusic');
    backgroundMusic.play();
    backgroundMusic.volume = 0.5; // Set the volume of the background music
    const deltaTime = (timestamp - lastTime) / 1000; // Time in seconds
    lastTime = timestamp;

    clearCanvas();
    updateGameObjects(deltaTime); // Pass deltaTime to update functions

    drawCornerObjects(); // Draw corner objects
    drawGreenObject(); // Draw the green object
    drawYellowObject(); // Draw the yellow object

    handleGamepadInput();

    // Update the scorpions' directions
    updateScorpionDirection();
    updateScorpion2Direction();

    checkBulletCollision();

    updateWave(wave1);
    updateWave(wave2);

    updateBullet(bullet1);
    updateBullet(bullet2);

    // Draw the waves
    drawWave(wave1);
    drawWave(wave2);

    // Draw the bullets
    drawBullet(bullet1);
    drawBullet(bullet2);

    // Update velocity based on pressed keys for scorpion1
    if (keysPressed['w']) scorpion1.vy -= scorpion1.speed; // Move up
    if (keysPressed['a']) scorpion1.vx -= scorpion1.speed; // Move left
    if (keysPressed['s']) scorpion1.vy += scorpion1.speed; // Move down
    if (keysPressed['d']) scorpion1.vx += scorpion1.speed; // Move right

    // Update velocity based on pressed keys for scorpion2
    if (keysPressed['ArrowUp']) scorpion2.vy -= scorpion2.speed; // Move up
    if (keysPressed['ArrowLeft']) scorpion2.vx -= scorpion2.speed; // Move left
    if (keysPressed['ArrowDown']) scorpion2.vy += scorpion2.speed; // Move down
    if (keysPressed['ArrowRight']) scorpion2.vx += scorpion2.speed; // Move right

    // Apply friction to velocity for scorpion1
    scorpion1.vx *= scorpion1.friction;
    scorpion1.vy *= scorpion1.friction;

    // Apply friction to velocity for scorpion2
    scorpion2.vx *= scorpion2.friction;
    scorpion2.vy *= scorpion2.friction;

    // Update position based on velocity for scorpion1
    scorpion1.x += scorpion1.vx;
    scorpion1.y += scorpion1.vy;

    // Update position based on velocity for scorpion2
    scorpion2.x += scorpion2.vx;
    scorpion2.y += scorpion2.vy;

    // Prevent scorpions from going out of bounds
    if (scorpion1.x < 0) scorpion1.x = 0;
    if (scorpion1.x + scorpion1.width > canvas.width) scorpion1.x = canvas.width - scorpion1.width;
    if (scorpion1.y < 0) scorpion1.y = 0;
    if (scorpion1.y + scorpion1.height > canvas.height) scorpion1.y = canvas.height - scorpion1.height;

    if (scorpion2.x < 0) scorpion2.x = 0;
    if (scorpion2.x + scorpion2.width > canvas.width) scorpion2.x = canvas.width - scorpion2.width;
    if (scorpion2.y < 0) scorpion2.y = 0;
    if (scorpion2.y + scorpion2.height > canvas.height) scorpion2.y = canvas.height - scorpion2.height;

    // Prevent the scorpions from colliding with each other
    if (scorpion1.visible && scorpion2.visible && isCollidingScorpions(scorpion1, scorpion2)) {
        // Resolve collision by moving scorpions apart
        const overlapX = Math.min(
            scorpion1.x + scorpion1.width - scorpion2.x,
            scorpion2.x + scorpion2.width - scorpion1.x
        );

        const overlapY = Math.min(
            scorpion1.y + scorpion1.height - scorpion2.y,
            scorpion2.y + scorpion2.height - scorpion1.y
        );

        if (overlapX < overlapY) {
            if (scorpion1.x < scorpion2.x) {
                scorpion1.x -= overlapX / 2;
                scorpion2.x += overlapX / 2;
            } else {
                scorpion1.x += overlapX / 2;
                scorpion2.x -= overlapX / 2;
            }
        } else {
            if (scorpion1.y < scorpion2.y) {
                scorpion1.y -= overlapY / 2;
                scorpion2.y += overlapY / 2;
            } else {
                scorpion1.y += overlapY / 2;
                scorpion2.y -= overlapY / 2;
            }
        }

        // Stop their velocities to prevent further collision
        scorpion1.vx = 0;
        scorpion1.vy = 0;
        scorpion2.vx = 0;
        scorpion2.vy = 0;
    }

    // Prevent the scorpions from passing through corner objects
    cornerObjects.forEach((obj) => {
        if (isColliding(scorpion1, obj)) {
            // Handle collision for scorpion1
            const overlapX = Math.min(
                scorpion1.x + scorpion1.width - obj.x,
                obj.x + obj.width - scorpion1.x
            );

            const overlapY = Math.min(
                scorpion1.y + scorpion1.height - obj.y,
                obj.y + obj.height - scorpion1.y
            );

            if (overlapX < overlapY) {
                if (scorpion1.x < obj.x) {
                    scorpion1.x = obj.x - scorpion1.width;
                } else {
                    scorpion1.x = obj.x + obj.width;
                }
                scorpion1.vx = 0;
            } else {
                if (scorpion1.y < obj.y) {
                    scorpion1.y = obj.y - scorpion1.height;
                } else {
                    scorpion1.y = obj.y + obj.height;
                }
                scorpion1.vy = 0;
            }
        }

        if (isColliding(scorpion2, obj)) {
            // Handle collision for scorpion2
            const overlapX = Math.min(
                scorpion2.x + scorpion2.width - obj.x,
                obj.x + obj.width - scorpion2.x
            );

            const overlapY = Math.min(
                scorpion2.y + scorpion2.height - obj.y,
                obj.y + obj.height - scorpion2.y
            );

            if (overlapX < overlapY) {
                if (scorpion2.x < obj.x) {
                    scorpion2.x = obj.x - scorpion2.width;
                } else {
                    scorpion2.x = obj.x + obj.width;
                }
                scorpion2.vx = 0;
            } else {
                if (scorpion2.y < obj.y) {
                    scorpion2.y = obj.y - scorpion2.height;
                } else {
                    scorpion2.y = obj.y + obj.height;
                }
                scorpion2.vy = 0;
            }
        }
    });

    // Check collision between scorpion1 and the ball
    if (scorpion1.visible && ball.visible && scorpion1.canPickUpBall && isCollidingWithBall(scorpion1, ball)) {
        ball.visible = false; // Make the ball disappear
        scorpion1.hasBall = true; // Set hasBall to true
    }

    // Check collision between scorpion2 and the ball
    if (scorpion2.visible && ball.visible && scorpion2.canPickUpBall && isCollidingWithBall(scorpion2, ball)) {
        ball.visible = false; // Make the ball disappear
        scorpion2.hasBall = true; // Set hasBall to true
    }

    // Check collision between the ball and the green object
    if (ball.visible && isCollidingWithGreenObject(ball, greenObject)) {
        ball.visible = false; // Make the ball disappear
        scorpion1.score += 1; // Increment scorpion1's score
        updateScoreDisplay(); // Update the score display
        resetGame(); // Reset the game
    }
    // Check collision between the ball and the yellow object
    if (ball.visible && isCollidingWithGreenObject(ball, yellowObject)) {
        ball.visible = false; // Make the ball disappear
        scorpion2.score += 1; // Increment scorpion2's score
        updateScoreDisplay(); // Update the score display
        resetGame(); // Reset the game
    }

    //Check for collision between scorpion and green object
    if (isColliding(scorpion1, greenObject) && scorpion1.hasBall) {
        ball.visible = false; // Make the ball disappear
        scorpion1.score += 1; // Increment scorpion1's score
        updateScoreDisplay(); // Update the score display
        resetGame(); // Reset the game
        
    }

    // Check for collision between scorpion2 and the yellow object
    if (isColliding(scorpion2, yellowObject) && scorpion2.hasBall) {
        ball.visible = false; // Make the ball disappear
        scorpion2.score += 1; // Increment scorpion2's score
        updateScoreDisplay(); // Update the score display
        resetGame(); // Reset the game
    }

    // Update the ball's position
    updateBall();

    // Draw the scorpions
    if (scorpion1.visible) drawScorpion();
    if (scorpion2.visible) drawScorpion2();

    // Draw the ball
    drawBall();

    handleGamepadInput(); // Handle gamepad input

    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop(0);