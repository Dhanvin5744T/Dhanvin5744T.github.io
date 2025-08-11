// Simple top-down racing game
// Controls: Left/Right arrows or A/D. Click restart to restart. Mobile buttons available.

(function(){
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  // base size - we'll scale canvas based on CSS but keep internal resolution stable
  const W = 400, H = 600;
  canvas.width = W; canvas.height = H;

  // Game state
  let car = { x: W/2, y: H - 120, w: 40, h: 70, speed: 0, dir: 0 };
  let road = { laneWidth: 120, left: (W - 2*120)/2, right: (W + 2*120)/2 };
  let obstacles = [];
  let boosts = [];
  let keys = {};
  let score = 0;
  let speed = 3; // base speed
  let gameOver = false;
  let spawnTimer = 0;
  let boostTimer = 0;
  const maxSpeed = 12;

  // handle resize for crisp look
  function fitToContainer(){
    const rect = canvas.getBoundingClientRect();
    const ratio = W / rect.width;
    // adjust drawing scale if needed via CSS; we rely on canvas width/height
  }
  window.addEventListener('resize', fitToContainer);

  // controls
  window.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
  window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

  document.getElementById('leftBtn').addEventListener('mousedown', ()=> keys['arrowleft']=true);
  document.getElementById('leftBtn').addEventListener('mouseup', ()=> keys['arrowleft']=false);
  document.getElementById('rightBtn').addEventListener('mousedown', ()=> keys['arrowright']=true);
  document.getElementById('rightBtn').addEventListener('mouseup', ()=> keys['arrowright']=false);

  document.getElementById('restartBtn').addEventListener('click', resetGame);

  // modal
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modalBody');
  document.getElementById('howToBtn').addEventListener('click',(e)=>{
    e.preventDefault();
    modalBody.innerHTML = '<h2>How to Play</h2><p>Use Left / Right arrows or A/D to steer. Avoid obstacles. Collect blue nitro boosts to temporarily increase speed. Survive as long as possible — score increases with time and distance.</p>';
    modal.classList.remove('hidden');
  });
  document.getElementById('creditsBtn').addEventListener('click',(e)=>{
    e.preventDefault();
    modalBody.innerHTML = '<h2>Credits</h2><p>Simple HTML5 Canvas racing demo — built for offline play.</p>';
    modal.classList.remove('hidden');
  });
  document.getElementById('closeModal').addEventListener('click',()=>modal.classList.add('hidden'));
  modal.addEventListener('click',(ev)=>{ if(ev.target===modal) modal.classList.add('hidden'); });

  function resetGame(){
    obstacles = [];
    boosts = [];
    score = 0;
    speed = 3;
    gameOver = false;
    car.x = W/2;
    car.speed = 0;
    spawnTimer = 0;
    boostTimer = 0;
    document.getElementById('score').textContent = score;
    document.getElementById('speed').textContent = Math.round(speed);
  }

  function spawnObstacle(){
    // obstacles occupy one of three lanes
    const lanes = [road.left + road.laneWidth/2, road.left + road.laneWidth*1.5, road.left + road.laneWidth*2.5 - road.laneWidth];
    // better: compute 3 lanes centered
    const laneCenters = [
      road.left + road.laneWidth/2,
      road.left + road.laneWidth/2 + road.laneWidth,
      road.left + road.laneWidth/2 + road.laneWidth*2
    ];
    const idx = Math.floor(Math.random()*3);
    const w = 48 + Math.random()*10;
    const h = 60 + Math.random()*20;
    obstacles.push({ x: laneCenters[idx] - w/2, y: -h-20, w, h });
  }

  function spawnBoost(){
    const laneCenters = [
      road.left + road.laneWidth/2,
      road.left + road.laneWidth/2 + road.laneWidth,
      road.left + road.laneWidth/2 + road.laneWidth*2
    ];
    const idx = Math.floor(Math.random()*3);
    boosts.push({ x: laneCenters[idx]-16, y: -40, w:32, h:32 });
  }

  function update(dt){
    if(gameOver) return;
    // steering
    const left = keys['arrowleft'] || keys['a'];
    const right = keys['arrowright'] || keys['d'];
    const steerSpeed = 240; // pixels per second lateral
    if(left && !right) car.x -= steerSpeed * dt;
    if(right && !left) car.x += steerSpeed * dt;
    // clamp
    const minX = road.left + 10;
    const maxX = road.right - car.w - 10;
    if(car.x < minX) car.x = minX;
    if(car.x > maxX) car.x = maxX;

    // speed increases slowly over time
    speed += dt * 0.4; // acceleration
    if(speed > maxSpeed) speed = maxSpeed;

    // spawn obstacles
    spawnTimer += dt;
    if(spawnTimer > Math.max(0.6, 1.6 - speed*0.12)){
      spawnTimer = 0;
      if(Math.random() < 0.85) spawnObstacle();
    }
    // spawn boosts occasionally
    boostTimer += dt;
    if(boostTimer > 6 + Math.random()*4){
      boostTimer = 0;
      spawnBoost();
    }

    // move obstacles
    for(let i=obstacles.length-1;i>=0;i--){
      obstacles[i].y += (speed*60) * dt;
      // collision check
      if(collides(obstacles[i], car)){
        gameOver = true;
      }
      if(obstacles[i].y > H + 200) obstacles.splice(i,1);
    }

    // move boosts
    for(let i=boosts.length-1;i>=0;i--){
      boosts[i].y += (speed*60) * dt;
      if(collides(boosts[i], car)){
        // collect boost
        speed = Math.min(maxSpeed, speed + 3);
        // small score bonus
        score += 20;
        boosts.splice(i,1);
      } else if(boosts[i].y > H + 100){
        boosts.splice(i,1);
      }
    }

    // score increases with time and speed
    score += Math.floor(dt * speed * 12);
    document.getElementById('score').textContent = score;
    document.getElementById('speed').textContent = Math.round(speed);
  }

  function collides(a,b){
    return !(a.x + a.w < b.x || a.x > b.x + b.w || a.y + a.h < b.y || a.y > b.y + b.h);
  }

  function drawRoad(){
    // road background
    ctx.fillStyle = '#101214';
    ctx.fillRect(0,0,W,H);
    // draw side grass
    ctx.fillStyle = '#08120a';
    ctx.fillRect(0,0,road.left,H);
    ctx.fillRect(road.right,0,W-road.right,H);
    // draw road
    ctx.fillStyle = '#202426';
    ctx.fillRect(road.left,0,road.laneWidth*3,H);
    // lane markings
    ctx.strokeStyle = '#8a8f92';
    ctx.lineWidth = 4;
    ctx.setLineDash([24,18]);
    for(let i=1;i<3;i++){
      const x = road.left + road.laneWidth*i;
      ctx.beginPath();
      ctx.moveTo(x, -gameTick* (speed*40 % 100));
      ctx.lineTo(x, H+200);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  function drawCar(){
    // car body
    ctx.fillStyle = '#d32f2f';
    roundRect(ctx, car.x, car.y, car.w, car.h, 6, true, false);
    // windows
    ctx.fillStyle = '#111';
    roundRect(ctx, car.x+6, car.y+12, car.w-12, 24, 4, true, false);
    // wheels
    ctx.fillStyle = '#222';
    ctx.fillRect(car.x+6, car.y+car.h-10, 12,6);
    ctx.fillRect(car.x+car.w-18, car.y+car.h-10, 12,6);
  }

  function drawObstacles(){
    ctx.fillStyle = '#2b2b2b';
    for(const o of obstacles){
      roundRect(ctx, o.x, o.y, o.w, o.h, 8, true, false);
      // hazard stripe
      ctx.fillStyle = '#111';
      ctx.fillRect(o.x+6, o.y+6, o.w-12, 10);
      ctx.fillStyle = '#2b2b2b';
    }
  }

  function drawBoosts(){
    ctx.fillStyle = '#2f7bd3';
    for(const b of boosts){
      roundRect(ctx, b.x, b.y, b.w, b.h, 6, true, false);
      ctx.fillStyle = '#8fd3ff';
      ctx.fillRect(b.x+6, b.y+8, b.w-12, b.h-16);
      ctx.fillStyle = '#2f7bd3';
    }
  }

  function roundRect(ctx, x, y, w, h, r, fill, stroke){
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.arcTo(x+w, y,   x+w, y+h, r);
    ctx.arcTo(x+w, y+h, x,   y+h, r);
    ctx.arcTo(x,   y+h, x,   y,   r);
    ctx.arcTo(x,   y,   x+w, y,   r);
    ctx.closePath();
    if(fill) ctx.fill();
    if(stroke) ctx.stroke();
  }

  // game loop
  let last = performance.now();
  let gameTick = 0;
  function loop(now){
    const dt = Math.min(0.05, (now - last)/1000);
    last = now;
    gameTick += dt;
    update(dt);
    // draw
    ctx.clearRect(0,0,W,H);
    drawRoad();
    drawObstacles();
    drawBoosts();
    drawCar();
    if(gameOver){
      // overlay
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0,0,W,H);
      ctx.fillStyle = '#fff';
      ctx.font = '28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', W/2, H/2 - 10);
      ctx.font = '18px Arial';
      ctx.fillText('Score: ' + score, W/2, H/2 + 24);
      ctx.textAlign = 'start';
    } else {
      requestAnimationFrame(loop);
    }
  }

  // start
  resetGame();
  requestAnimationFrame(loop);
})();
