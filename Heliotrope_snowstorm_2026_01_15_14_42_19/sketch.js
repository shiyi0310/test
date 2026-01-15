// PROJECT: X-CREATURE
// An interactive system where a digital creature grows and changes through user-input text,visualising identity as a process of continuous accumulation.
// By Shiyi Ge
let creature;       // The main creature object
let foods = [];     // Floating text targets
let inputField, feedButton, startButton; // UI
let particles = []; // Background dust particles
let gameStarted = false; // Title screen

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Courier New'); 
  textStyle(BOLD);          

  // Create the creature in the center 
  // Start word "IDENTITY" becomes the first limb 
  creature = new NeuralCreature("IDENTITY", width / 2, height / 2);

  // =========================
  // 1) UI button style
  // =========================
  inputField = createInput('');
  inputField.position(20, 20);
  inputField.size(200);
  inputField.attribute('placeholder', 'FEED X-CREATURE...'); // Hint text
  // Style
  inputField.style('background-color', '#000');
  inputField.style('color', '#fff');
  inputField.style('border', '1px solid #555');
  inputField.style('padding', '8px');
  inputField.style('font-family', 'Courier New');
  inputField.style('outline', 'none');

  // Press Enter
  inputField.elt.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') injectSemantic();
  });
  inputField.hide();

  // Feed button
  feedButton = createButton('FEED');
  feedButton.position(240, 20);
  feedButton.mousePressed(injectSemantic);

  // UI button style
  feedButton.style('background-color', '#222');
  feedButton.style('color', '#fff');
  feedButton.style('border', '1px solid #555');
  feedButton.style('padding', '8px 15px');
  feedButton.style('cursor', 'pointer');
  feedButton.style('font-family', 'Courier New');
  feedButton.hide();

  // =========================
  // 2) Title screen UI
  // =========================
  startButton = createButton('START EXPERIMENT');
  startButton.position(width/2 - 90, height/2 + 60);
  startButton.size(180, 50);
  startButton.mousePressed(startGame);

  // UI
  startButton.style('background-color', '#000');
  startButton.style('color', '#fff');
  startButton.style('border', '1px solid #fff');
  startButton.style('padding', '10px');
  startButton.style('font-family', 'Courier New');
  startButton.style('font-size', '14px');
  startButton.style('cursor', 'pointer');
  startButton.style('letter-spacing', '2px');

  // Create background particles
  for (let i = 0; i < 80; i++) {
    particles.push({
      pos: createVector(random(width), random(height)),
      vel: createVector(random(-0.1, 0.1), random(-0.1, 0.1)), // make drift
      size: random(0.5, 2),
      alpha: random(50, 150)
    });
  }
}

// Switch to gameplay
function startGame() {
  gameStarted = true;
  startButton.hide();
  inputField.show();
  feedButton.show();

  // Reset to center
  creature.headPos.set(width/2, height/2);
}

// Read text input and set a “food” target
function injectSemantic() {
  const raw = inputField.value();
  const newText = (raw || '').trim().toUpperCase(); // normalize

  if (newText.length > 0) {
    foods.push({
      text: newText,
      pos: findSafeSpawnPos(), // keep away from creature 
      alpha: 0                 
    });
    inputField.value(''); // clear
  }
}

// Find a spawn position not too close to creature
function findSafeSpawnPos() {
  let pos;
  let safe = false;

  
  for (let i = 0; i < 50; i++) {
    pos = createVector(random(100, width - 100), random(100, height - 100));

    // Keep distance > 250
    if (creature && p5.Vector.dist(pos, creature.headPos) > 250) {
      safe = true;
      break;
    }
  }

  if (!safe) pos = createVector(random(width), random(height));
  return pos;
}

function draw() {
  // Low opacity background for trail effect
  background(5, 5, 8, 80);

  // Background dust
  drawParticles();

  if (gameStarted) {
    // =========================
    // GAMEPLAY MODE
    // =========================

   
    push();
    fill(120);
    noStroke();
    textSize(10);
    textAlign(LEFT, TOP);

    // limbCount = how many tentacles
    let limbCount = creature ? creature.tentacles.length : 0;
    let status = (foods.length > 0) ? `TARGETS DETECTED: ${foods.length}` : "SCANNING...";

    text(`SPECIMEN ID: X-CREATURE\nGROWTH STAGE: ${limbCount}\nSTATUS: ${status}`, 20, 70);
    pop();

    // Creature behavior
    if (creature) {
      if (foods.length > 0) {
        // Draw all foods
        for (let f of foods) drawFood(f);

        // If food exists, seek and hunt
        creature.hunt(foods);
      } else {
        // Otherwise wander
        creature.wander();
      }

      // Update physics and render
      creature.update();
      creature.display();
    }

  } else {
    // =========================
    // TITLE SCREEN MODE
    // =========================
    drawTitleScreen();
  }
}

// ---draw title screen---
function drawTitleScreen() {
  push();
  textAlign(CENTER, CENTER);
  translate(width/2, height/2 - 40);

  
  drawingContext.shadowBlur = 0;

  fill(255);
  noStroke();
  textSize(45);
  text("PROJECT: X-CREATURE", 0, 0);

  textSize(14);
  fill(150);
  text("AN UNIDENTIFIED DIGITAL ORGANISM", 0, 40);

  
  noFill();
  stroke(255, 50);
  strokeWeight(1);

  // sin makes smooth expand/contract 
  let breath1 = sin(frameCount * 0.02) * 30;
  let breath2 = sin(frameCount * 0.03 + PI) * 20; // opposite phase 

  ellipse(0, 0, 450 + breath1, 450 + breath1);
  ellipse(0, 0, 380 + breath2, 380 + breath2);
  pop();
}

// Background particles drifting slowly
function drawParticles() {
  push();
  noStroke();
  for (let p of particles) {
    p.pos.add(p.vel);

    // Wrap around / 边缘穿越
    if (p.pos.x < 0) p.pos.x = width;
    if (p.pos.x > width) p.pos.x = 0;
    if (p.pos.y < 0) p.pos.y = height;
    if (p.pos.y > height) p.pos.y = 0;

    fill(255, p.alpha);
    ellipse(p.pos.x, p.pos.y, p.size);
  }
  pop();
}

// Draw food with glow + crosshair
function drawFood(f) {
  // Smooth fade in
  f.alpha = lerp(f.alpha, 255, 0.05);

  push();
  translate(f.pos.x, f.pos.y);

  // Glow
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = color(255);

  noFill();
  stroke(255, f.alpha);
  strokeWeight(1);

  // Rotating crosshair 
  rotate(frameCount * 0.1);
  line(-5, 0, 5, 0);
  line(0, -5, 0, 5);

  // Text stays upright
  rotate(-frameCount * 0.1);
  fill(255, f.alpha);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(12);
  text(f.text, 0, -15);

  drawingContext.shadowBlur = 0;
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (startButton) {
    startButton.position(width/2 - 90, height/2 + 60);
  }
}

// ==========================================
// NEURAL CREATURE CLASS
// Controls movement, physics, and drawing
// ==========================================
class NeuralCreature {
  constructor(startWord, x, y) {
    this.headPos = createVector(x, y); // Body center 
    this.tentacles = [];               // All limbs 
    this.headingAngle = 0; // Facing direction 
    this.spinAngle = 0;    // Visual rotation
    this.metabolism = 0;   // Energy (0-1) 

    // Grow the first limb from starting word 
    this.growTentacle(startWord);
  }

  // Create a new limb based on input word
  growTentacle(word) {
    let len = word.length;

    // Decide type by length 
    // Long words (>7) on Tail/Axon 
    // Others on Head
    let isAxon = len > 7;

    let baseCol, sizeMult;

    // Visual differences 
    if (isAxon) {
      baseCol = color(200, 200, 200);
      sizeMult = 0.7;
    } else {
      baseCol = color(255, 255, 255);
      sizeMult = 0.9;
    }

    // A limb is basically: letters + positions + randomness seed
    
    let newLimb = {
      chars: word.split(''),     // split into letters
      positions: [],             // each letter has a point
      id: random(10000),         // noise seed
      colorBase: baseCol,
      isAxon: isAxon,
      sizeMult: sizeMult,
      radialAngle: random(TWO_PI) // attachment angle around body 
    };

    // Initialize all points at head position 
    for (let i = 0; i < newLimb.chars.length; i++) {
      newLimb.positions.push(this.headPos.copy());
    }

    this.tentacles.push(newLimb);
  }

  // Update physics each frame
  update() {
    // Metabolism decays slowly
    this.metabolism = lerp(this.metabolism, 0, 0.05);

    // Spin faster when metabolism is high
    this.spinAngle += 0.01 + this.metabolism * 0.05;

    let totalLimbs = this.tentacles.length;
    let axonCount = this.tentacles.filter(t => t.isAxon).length; // count tails / 尾巴数量
    let axonIndex = 0; // for spreading tails 

    for (let i = 0; i < totalLimbs; i++) {
      let t = this.tentacles[i];
      let root = t.positions[0]; // anchor point
      if (!root) continue;

      // =========================
      // 1) Position the root point
      // =========================
      if (t.isAxon) {
        // Tail/Axon: spread behind movement direction
        
        let tailSpread = PI / 1.5;
        let offsetAngle = map(axonIndex, 0, axonCount, -tailSpread/2, tailSpread/2);
        if (axonCount <= 1) offsetAngle = 0;

        // Put root behind the head
        let rearAngle = this.headingAngle + PI + offsetAngle;
        let radius = 30; // distance from head 
        let offset = p5.Vector.fromAngle(rearAngle).mult(radius);
        let targetPos = p5.Vector.add(this.headPos, offset);

        axonIndex++;

        // Lerp for smooth trailing
        root.lerp(targetPos, 0.2);

      } else {
        // Head spikes/dendrites: lock around a ring/core
        let currentAngle = t.radialAngle + this.spinAngle;
        let attachmentRadius = 22; // IMPORTANT: small radius = tight head effect

        let rootX = this.headPos.x + cos(currentAngle) * attachmentRadius;
        let rootY = this.headPos.y + sin(currentAngle) * attachmentRadius;
        root.set(rootX, rootY);
      }

      // =========================
      // 2) Chain physics (Inverse kinematics style)
      
      // =========================
      for (let j = 1; j < t.positions.length; j++) {
        let prev = t.positions[j - 1];
        let curr = t.positions[j];

        // Target spacing between letters
        let distTarget = t.isAxon ? 18 : 12;

        // Pull back if too far
        let dir = p5.Vector.sub(curr, prev);
        let m = dir.mag();
        if (m > distTarget) {
          dir.setMag(distTarget);
          curr.set(p5.Vector.add(prev, dir));
        }

        // =---Extra outward push for head spikes---=
        if (!t.isAxon) {
          let outwardDir = p5.Vector.sub(curr, this.headPos);
          outwardDir.normalize();
          let outwardForce = map(j, 1, t.positions.length, 2.0, 0.5);
          curr.add(outwardDir.mult(outwardForce));
        }

        // Organic jitter using Perlin noise
        let twitch = this.metabolism * 2.0;
        let nx = (noise(frameCount * 0.01, j * 0.2, t.id) - 0.5) * (1 + twitch);
        let ny = (noise(frameCount * 0.01 + 100, j * 0.2, t.id) - 0.5) * (1 + twitch);

        // Tail shakes
        curr.x += nx * (t.isAxon ? 2 : 1);
        curr.y += ny * (t.isAxon ? 2 : 1);
      }
    }
  }

  // Seek nearest food and move towards it
  hunt(foodArray) {
    let nearestDist = Infinity;
    let target = null;
    let targetIndex = -1;

    // Find nearest target
    for (let i = 0; i < foodArray.length; i++) {
      let d = p5.Vector.dist(this.headPos, foodArray[i].pos);
      if (d < nearestDist) {
        nearestDist = d;
        target = foodArray[i];
        targetIndex = i;
      }
    }
    if (!target) return;

    // Angle to target
    let dir = p5.Vector.sub(target.pos, this.headPos);
    let targetAngle = dir.heading();

    // Smooth turning with wrap fix
    let angleDiff = targetAngle - this.headingAngle;
    while (angleDiff > PI) angleDiff -= TWO_PI;
    while (angleDiff < -PI) angleDiff += TWO_PI;

    // Turn speed
    this.headingAngle += angleDiff * 0.05;

    // Draw a faint connection line when close
    if (nearestDist < 300) {
      push();
      let alpha = map(nearestDist, 0, 300, 255, 0);
      stroke(255, alpha);
      strokeWeight(0.5);
      let midX = (this.headPos.x + target.pos.x)/2 + random(-2,2);
      let midY = (this.headPos.y + target.pos.y)/2 + random(-2,2);
      noFill();
      beginShape();
      vertex(this.headPos.x, this.headPos.y);
      vertex(midX, midY);
      vertex(target.pos.x, target.pos.y);
      endShape();
      pop();
    }

    // Eat if close
    if (nearestDist < 50) {
      this.metabolism = 1.0;            // spike energy
      this.growTentacle(target.text);   // grow a new limb
      foodArray.splice(targetIndex, 1); // remove food
    } else {
      // Move forward
      let speed = 2.5;
      if (this.metabolism > 0.5) speed = 0.5; // slow when “eating” 
      let vel = p5.Vector.fromAngle(this.headingAngle).mult(speed);
      this.headPos.add(vel);

      //--Keep inside the screen-- 
      this.headPos.x = constrain(this.headPos.x, 50, width - 50);
      this.headPos.y = constrain(this.headPos.y, 50, height - 50);
    }
  }

  // Wander when no food
  wander() {
    let noiseVal = noise(frameCount * 0.01);

    // Small random rotation
    this.headingAngle += map(noiseVal, 0, 1, -0.05, 0.05);

    let vel = p5.Vector.fromAngle(this.headingAngle).mult(1.5);
    this.headPos.add(vel);

    // Bounce off walls 
    if (this.headPos.x < 50 || this.headPos.x > width - 50) {
      this.headingAngle = PI - this.headingAngle;
      this.headPos.x = constrain(this.headPos.x, 51, width - 51);
    }
    if (this.headPos.y < 50 || this.headPos.y > height - 50) {
      this.headingAngle = -this.headingAngle;
      this.headPos.y = constrain(this.headPos.y, 51, height - 51);
    }
  }

  // Draw everything
  display() {
    // Draw tails first
    for (let t of this.tentacles) {
      if (t.isAxon) this.drawFiber(t);
    }

    // Draw the core
    this.drawBlackHole();

    // Draw head spikes last
    for (let t of this.tentacles) {
      if (!t.isAxon) this.drawFiber(t);
    }
  }

  // Black hole core 
  drawBlackHole() {
    push();
    translate(this.headPos.x, this.headPos.y);

    // Glowing ring
    let pulse = 10 + this.metabolism * 20;
    drawingContext.shadowBlur = 20 + pulse;
    drawingContext.shadowColor = color(255, 255, 255);

    noFill();
    stroke(255);
    strokeWeight(1 + this.metabolism * 2);

    // Breathing ring
    let ringSize = 40 + sin(frameCount * 0.05) * 2;
    ellipse(0, 0, ringSize, ringSize);

    // Black core 
    drawingContext.shadowBlur = 0;
    fill(0);
    noStroke();

    // Slight jitter when eating
    let coreSize = 38;
    if (this.metabolism > 0.1) coreSize = 34 + random(2);
    ellipse(0, 0, coreSize, coreSize);

    pop();
  }

  // Draw one limb: noisy lines + letters
  drawFiber(limb) {
    let isTail = limb.isAxon;

    // Base alpha
    let alpha = isTail ? 60 : 150;
    if (this.metabolism > 0.1) alpha += 50; 

    stroke(255, alpha);
    strokeWeight(isTail ? 0.5 : 1.0);
    noFill();

    
    let numStrands = isTail ? 2 : 1;

    // ---- Lines ----
    for (let k = 0; k < numStrands; k++) {
      beginShape();
      for (let i = 0; i < limb.positions.length; i++) {
        let p = limb.positions[i];

        // Roughness using noise
        let roughX = (noise(i * 0.5, frameCount * 0.01, k) - 0.5) * 4;
        let roughY = (noise(i * 0.5 + 100, frameCount * 0.01, k) - 0.5) * 4;

        // Extra wave for head spikes
        if (!isTail) {
          roughX += sin(i + frameCount * 0.1) * 2;
          roughY += cos(i + frameCount * 0.1) * 2;
        }

        // curveVertex = smoother curve
        curveVertex(p.x + roughX, p.y + roughY);

        // Duplicate endpoints for curveVertex stability
        if (i === 0 || i === limb.positions.length - 1) {
          curveVertex(p.x + roughX, p.y + roughY);
        }
      }
      endShape();
    }

    // ---- Letters ----
    for (let i = 0; i < limb.chars.length; i++) {
      let p = limb.positions[i];
      if (!p) continue;
      push();
      translate(p.x, p.y);
      // Small floating motion
      let floatX = (noise(frameCount * 0.01, i) - 0.5) * 5;
      let floatY = (noise(frameCount * 0.01 + 50, i) - 0.5) * 5;
      translate(floatX, floatY);
      // Text color
      fill(255, alpha + 50);
      noStroke();
      // Glow when eating
      if (this.metabolism > 0.1) {
        drawingContext.shadowBlur = 5;
        drawingContext.shadowColor = color(255);
      } else {
        drawingContext.shadowBlur = 0;
      }

      // Size control,tail's is smaller
      let fontSize = 14 * limb.sizeMult;
      textSize(fontSize);
      textAlign(CENTER, CENTER);
      // Slight rotation jitter
      rotate((noise(i, frameCount * 0.01) - 0.5) * 0.5);
      text(limb.chars[i], 0, 0);
      pop();
    }
  }
}
