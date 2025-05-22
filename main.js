// ===== 背景轮播 + 双向渐变 + 下滑到底自动切换 =====
const bgImages = [
    'images/bg1.jpg',
    'images/bg2.jpg',
    'images/bg3.jpg',
    'images/bg4.jpg',
    'images/bg5.jpg',
    'images/bg6.jpg',
    'images/bg7.jpg',
  ];
  
  const imgW = 1280, imgH = 2048;
  const slideDuration = 8000;
  const maxTransitionTime = 1000;
  
  const layer1 = document.getElementById('bg-img-layer-1');
  const layer2 = document.getElementById('bg-img-layer-2');
  let currentLayer = 1; // 1 或 2
  let layerScrollOffsets = [0, 0];
  
  let bgIndex = 0, bgNextIndex = 1;
  let bgSwitching = false;
  let maxOffset = 0;
  let slideStartTime = Date.now();
  
  layer1.style.backgroundImage = `url('${bgImages[bgIndex]}')`;
  layer1.style.opacity = 1;
  layer2.style.opacity = 0;

  function animateTransitionScroll(frontIdx, startTime) {
    const now = Date.now();
    const elapsed = now - startTime;
    const t = Math.min(elapsed / slideDuration, 1);
    layerScrollOffsets[frontIdx] = -maxOffset + t * (2 * maxOffset);
    updateBgPositions();
  
    if (t < 1) {
      requestAnimationFrame(() => animateTransitionScroll(frontIdx, startTime));
    }
  }
  
  
  function getMaxBgOffset() {
    const winW = window.innerWidth, winH = window.innerHeight;
    const scale = Math.max(winW / imgW, winH / imgH);
    const bgShowH = imgH * scale;
    return Math.max(0, (bgShowH - winH) / 2);
  }
  
  function updateBgPositions() {
    layer1.style.backgroundPosition = `center calc(50% + ${layerScrollOffsets[0]}px)`;
    layer2.style.backgroundPosition = `center calc(50% + ${layerScrollOffsets[1]}px)`;
  }
  
  function animateBackgroundScroll() {
    const now = Date.now();
    const elapsed = now - slideStartTime;
    const activeIdx = currentLayer - 1;
  
    maxOffset = getMaxBgOffset();
  
    const t = Math.min(elapsed / slideDuration, 1);
    if (!bgSwitching && maxOffset > 0) {
      // 滑动偏移量从 -maxOffset 到 +maxOffset
      layerScrollOffsets[activeIdx] = -maxOffset + t * (2 * maxOffset);
      updateBgPositions();
      if (t >= 1) switchBg();
    }
  
    if (!bgSwitching && maxOffset === 0 && elapsed >= slideDuration) {
      // 无滑动空间时固定时间切换
      switchBg();
    }
  
    requestAnimationFrame(animateBackgroundScroll);
  }
  animateBackgroundScroll();
  
  function switchBg() {
    if (bgSwitching) return;
    bgSwitching = true;
  
    const prevIndex = bgIndex;
    bgIndex = bgNextIndex;
    bgNextIndex = (bgIndex + 1) % bgImages.length;
  
    let frontLayer, backLayer, frontIdx, backIdx;
    if (currentLayer === 1) {
      frontLayer = layer2; backLayer = layer1;
      frontIdx = 1; backIdx = 0;
      currentLayer = 2;
    } else {
      frontLayer = layer1; backLayer = layer2;
      frontIdx = 0; backIdx = 1;
      currentLayer = 1;
    }
  
    maxOffset = getMaxBgOffset();
    layerScrollOffsets[frontIdx] = -maxOffset;
    frontLayer.style.backgroundImage = `url('${bgImages[bgIndex]}')`;
    updateBgPositions();
  
    const transitionStart = Date.now();
    slideStartTime = transitionStart;
  
    // 启动下一张图在渐入过程中同步滑动
    requestAnimationFrame(() => animateTransitionScroll(frontIdx, transitionStart));
  
    setTimeout(() => {
      frontLayer.style.transition = `opacity ${maxTransitionTime / 1000}s linear`;
      backLayer.style.transition = `opacity ${maxTransitionTime / 1000}s linear`;
      frontLayer.style.opacity = 1;
      backLayer.style.opacity = 0;
  
      setTimeout(() => {
        bgSwitching = false;
      }, maxTransitionTime);
    }, 10);
  }
  
  
  window.addEventListener('resize', () => {
    maxOffset = getMaxBgOffset();
    const activeIdx = currentLayer - 1;
    const elapsed = Date.now() - slideStartTime;
    const t = Math.min(elapsed / slideDuration, 1);
    if (maxOffset > 0) {
      layerScrollOffsets[activeIdx] = -maxOffset + t * (2 * maxOffset);
    } else {
      layerScrollOffsets[activeIdx] = 0;
    }
    updateBgPositions();
  });
// 1. 选中卡片和四个图层
// 卡片3D翻转
const card = document.querySelector('.card');
if (card) {
  card.addEventListener('click', function () {
    card.classList.toggle('flipped');
  });
}


// 拖拽相关变量
let draggingBall = null;
let dragOffsetX = 0, dragOffsetY = 0;
let isMouseDown = false;
let lastMouseX = 0, lastMouseY = 0;
let lastVx = 0, lastVy = 0;

// 1. 初始化canvas
const canvas = document.getElementById('balls-canvas');
const ctx = canvas.getContext('2d');

let balls = [];
const ballImgs = [];
const ballImgFiles = [];
for (let i = 1; i <= 19; i++) {
  ballImgFiles.push(`images/ball${i}.png`);
}
for (let src of ballImgFiles) {
  const img = new Image();
  img.src = src;
  ballImgs.push(img);
}

// 等图片加载完后初始化
window.addEventListener('load', () => {
    resizeAndResetBalls(); // 初始生成
    window.addEventListener('resize', resizeAndResetBalls);
  });
  
function randomRadius() {
    const base = window.innerWidth / 43;
    const variation = base * 0.2 * Math.random();
    return base + variation;
  }
  

// 2. 鼠标监听全部绑定到 document（兼容所有场景）
// 鼠标按下：检测是否按到小球
canvas.addEventListener('mousedown', function(e) {
    isMouseDown = true;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    for (let b of balls) {
      const dx = mouseX - b.x;
      const dy = mouseY - b.y;
      if (dx * dx + dy * dy <= b.r * b.r) {
        draggingBall = b;
        dragOffsetX = mouseX - b.x;
        dragOffsetY = mouseY - b.y;
        b.resting = false;
        lastMouseX = mouseX;
        lastMouseY = mouseY;
        lastVx = 0;
        lastVy = 0;
        break;
      }
    }
  });
  
  document.addEventListener('mousemove', function(e) {
    if (draggingBall && isMouseDown) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
  
      lastVx = mouseX - lastMouseX;
      lastVy = mouseY - lastMouseY;
      lastMouseX = mouseX;
      lastMouseY = mouseY;
  
      draggingBall.x = mouseX - dragOffsetX;
      draggingBall.y = mouseY - dragOffsetY;
      draggingBall.x = Math.max(draggingBall.r, Math.min(canvas.width - draggingBall.r, draggingBall.x));
      draggingBall.y = Math.max(draggingBall.r, Math.min(canvas.height - draggingBall.r, draggingBall.y));
      draggingBall.vx = 0;
      draggingBall.vy = 0;
      draggingBall.resting = false;
    }
  });
  
  document.addEventListener('mouseup', function(e) {
    isMouseDown = false;
    if (draggingBall) {
      draggingBall.vx = lastVx * 0.3;
      draggingBall.vy = lastVy * 0.3;
      draggingBall = null;
    }
  });
  document.addEventListener('mouseleave', function(e) {
    isMouseDown = false;
    draggingBall = null;
  });

// 5. 绘制小球
function initBalls() {
    balls = [];
    for (let i = 0; i < ballImgs.length; i++) {
      balls.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.5,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        r: randomRadius(),
        img: ballImgs[i],
        resting: false
      });
    }
  }
  
  function resizeAndResetBalls() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initBalls();
    draggingBall = null;
  }  
  
function drawBalls() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let b of balls) {
    // 1. 绘制正圆底色和发光
    ctx.save();
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(239, 218, 77, 0.86)'; // 柔和淡黄色
    ctx.shadowBlur = b.r * 0.8; // 发光大小和球半径关联
    ctx.shadowColor = 'rgba(255, 230, 80, 0.92)';
    ctx.fill();
    ctx.closePath();
    ctx.restore();

    // 2. 叠加PNG图片
    if (b.img.complete) {
      const size = b.r * 1.5;
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.drawImage(b.img, b.x - size / 2, b.y - size / 2, size, size);
      ctx.restore();
    }
  }
}

// 6. 小球物理+碰撞
function isBallSupported(ball, balls) {
    // 地面支撑
    if (ball.y + ball.r >= canvas.height - 0.5) return true;
    // 被其他静止小球支撑（斜着接触也算）
    for (let other of balls) {
      if (other === ball) continue;
      if (!other.resting) continue;
      const dx = ball.x - other.x;
      const dy = ball.y - other.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      // 判定为物理接触（允许一点重叠或间隙防止浮点误差）
      if (dist <= ball.r + other.r + 1) {
        // 且自己在对方“上方”即可
        if (dy > 0) return true;
      }
    }
    return false;
  }
  
function updateBalls() {
    for (let b of balls) {
        if (b.resting && !isBallSupported(b, balls)) {
          b.resting = false;
        }
      }
    
  // 小球之间碰撞检测和弹性反应
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const a = balls[i];
      const b = balls[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = a.r + b.r;
      if (dist < minDist && dist !== 0) {
        // 1. 让两球不重叠
        const overlap = 0.5 * (minDist - dist + 0.1); // +0.1防止浮点残留
        const nx = dx / dist;
        const ny = dy / dist;
        a.x -= nx * overlap;
        a.y -= ny * overlap;
        b.x += nx * overlap;
        b.y += ny * overlap;

        // 限制碰撞后不出边界
        a.x = Math.max(a.r, Math.min(canvas.width - a.r, a.x));
        b.x = Math.max(b.r, Math.min(canvas.width - b.r, b.x));

        // 2. 计算相对速度
        const dvx = b.vx - a.vx;
        const dvy = b.vy - a.vy;
        // 3. 投影到碰撞法线方向
        const dot = dvx * nx + dvy * ny;
        if (dot < 0) { // 只有相向才处理
          // 4. 1D弹性碰撞公式，假设质量一样
          const restitution = 0.85; // 可调，1为完全弹性，<1为损耗
          const impulse = (2 * dot) / 2; // 质量都为1
          a.vx += nx * impulse * restitution;
          a.vy += ny * impulse * restitution;
          b.vx -= nx * impulse * restitution;
          b.vy -= ny * impulse * restitution;
        }
      }
    }
  }

  for (let b of balls) {
    
    // 拖拽时不应用物理
    if (b === draggingBall) continue;
  
    if (!b.resting) {
      b.x += b.vx;
      b.y += b.vy;
      b.vy += 0.18; // 重力
  
      // -- 支撑检测 --
      if (isBallSupported(b, balls) && Math.abs(b.vy) < 2) {
        b.resting = true;
        b.vy = 0;
        b.vx *= 0.92;
        if (Math.abs(b.vx) < 0.12) b.vx = 0;
  
        // 位置修正（如果和地面接触，y锁定地面，否则贴在支撑球表面）
        let foundSupport = false;
        if (b.y + b.r > canvas.height - 0.5) {
          b.y = canvas.height - b.r;
          foundSupport = true;
        } else {
          for (let other of balls) {
            if (other === b || !other.resting) continue;
            const dx = b.x - other.x;
            const dy = b.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= b.r + other.r + 1 && dy > 0) {
              // 按当前连线，定位到刚好接触
              b.x = other.x + (dx / dist) * (b.r + other.r);
              b.y = other.y + (dy / dist) * (b.r + other.r);
              foundSupport = true;
              break;
            }
          }
        }
        // 若没找到（极端情况），不变
      } else if (b.y + b.r >= canvas.height) {
        // 正常弹跳
        b.y = canvas.height - b.r;
        b.vy *= -0.7;
        b.vx *= 0.95;
      }
  
      // 左右反弹
      if (b.x - b.r < 0 || b.x + b.r > canvas.width) {
        b.vx *= -0.8;
        if (b.x - b.r < 0) b.x = b.r;
        if (b.x + b.r > canvas.width) b.x = canvas.width - b.r;
      }
    } else {
      // 静止球只处理摩擦，保持底部
      if (b.y + b.r > canvas.height - 0.5) {
        b.y = canvas.height - b.r;
      }
      if (b.vx !== 0) {
        b.x += b.vx;
        // 左右边界检测
        if (b.x - b.r < 0) {
          b.x = b.r;
          b.vx = 0;
        }
        if (b.x + b.r > canvas.width) {
          b.x = canvas.width - b.r;
          b.vx = 0;
        }
        b.vx *= 0.98;
        if (Math.abs(b.vx) < 0.12) b.vx = 0;
      }
    }
  }
  
}

// 7. 动画循环
function animate() {
  updateBalls();
  drawBalls();
  requestAnimationFrame(animate);
}
animate();

// 8. 滚轮时底部弹跳
window.addEventListener('wheel', (e) => {
  balls.forEach(b => {
    if (b.y + b.r >= canvas.height - 2) {
      b.vy = -11 - Math.random() * 6;
      b.vx += (Math.random() - 0.5) * 5;
      b.resting = false; // 重新激活
    }
  });
});
