/* ============================================================
   SPIDER-MAN MULTIVERSE PORTFOLIO ENGINE - SM SHAFIQ
   Author: Web-Slinger Architecture
   Features: Spidey Swing, Web Canvas, Web Audio FX, 
             Education Web Timeline, Resume Modal Dossier, Arcade Game,
             Flask + SQLite Backend Integration
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. WEB AUDIO SYNTHESIZER (THWIP & SOUND FX)
     ---------------------------------------------------------- */
  let audioEnabled = true;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
  }

  function playThwipSound() {
    if (!audioEnabled) return;
    try {
      initAudio();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  function playNodePingSound() {
    if (!audioEnabled) return;
    try {
      initAudio();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  const soundToggleBtn = document.getElementById('sound-toggle');
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      audioEnabled = !audioEnabled;
      soundToggleBtn.classList.toggle('muted', !audioEnabled);
      soundToggleBtn.querySelector('i').className = audioEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
      if (audioEnabled) playThwipSound();
    });
  }

  /* ----------------------------------------------------------
     2. BACKEND HEALTH CHECK (FLASK + SQLITE CONNECTED)
     ---------------------------------------------------------- */
  const backendBadge = document.getElementById('backend-status-badge');
  const backendText = document.getElementById('backend-status-text');

  async function checkBackendStatus() {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        if (backendBadge) backendBadge.classList.remove('offline');
        if (backendText) backendText.textContent = 'BACKEND ONLINE';
      } else {
        throw new Error('Backend response error');
      }
    } catch (e) {
      if (backendBadge) backendBadge.classList.add('offline');
      if (backendText) backendText.textContent = 'STANDALONE MODE';
    }
  }

  checkBackendStatus();
  setInterval(checkBackendStatus, 15000);

  /* ----------------------------------------------------------
     3. SPIDER SWING ANIMATION
     ---------------------------------------------------------- */
  const spidey = document.getElementById('spidey');
  const webLine = document.getElementById('webLine');
  const stage = document.getElementById('spideyStage');
  const trigger = document.getElementById('spideyTrigger');

  const CONFIG = {
    duration: 6000,
    ropeLength: 220,
    angleAmplitude: Math.PI / 4,
    angleSpeed: 0.0025,
    splatInterval: 1200,
    autoSwingDelay: 800,
    autoSwingRepeat: 20000,
    pivotXRatio: 0.85,
    pivotY: -50,
    spideyOffsetX: -30,
    spideyOffsetY: -40
  };

  let isSwinging = false;
  let animationId = null;
  let autoSwingTimer = null;
  let repeatTimer = null;

  function createWebSplat(x, y) {
    if (!stage) return;
    const splat = document.createElement('div');
    splat.className = 'web-splat';
    splat.style.left = (x - 20) + 'px';
    splat.style.top = (y - 20) + 'px';
    stage.appendChild(splat);
    requestAnimationFrame(() => splat.classList.add('active'));
    setTimeout(() => splat.remove(), 700);
  }

  function startSwing() {
    if (!spidey || !webLine || isSwinging) return;
    isSwinging = true;

    const startTime = performance.now();
    const duration = CONFIG.duration;
    const ropeLength = CONFIG.ropeLength;
    const pivotX = window.innerWidth * CONFIG.pivotXRatio;
    const pivotY = CONFIG.pivotY;
    let lastSplatBucket = -1;

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const angle = Math.sin(elapsed * CONFIG.angleSpeed) * CONFIG.angleAmplitude;
      const spideyX = pivotX + Math.sin(angle) * ropeLength;
      const spideyY = pivotY + Math.cos(angle) * ropeLength;
      const rotation = angle * (180 / Math.PI) * 0.9;

      spidey.style.transform = `translate(${spideyX + CONFIG.spideyOffsetX}px, ${spideyY + CONFIG.spideyOffsetY}px) rotate(${rotation}deg)`;

      const dx = spideyX - pivotX;
      const dy = spideyY - pivotY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const lineAngle = Math.atan2(dy, dx) * (180 / Math.PI) - 90;

      webLine.style.left = pivotX + 'px';
      webLine.style.top = pivotY + 'px';
      webLine.style.height = distance + 'px';
      webLine.style.transform = `rotate(${lineAngle}deg)`;

      const bucket = Math.floor(elapsed / CONFIG.splatInterval);
      if (bucket !== lastSplatBucket) {
        lastSplatBucket = bucket;
        createWebSplat(spideyX, spideyY);
        playThwipSound();
      }

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        endSwing();
      }
    }

    animationId = requestAnimationFrame(animate);
  }

  function endSwing() {
    if (!spidey || !webLine) return;
    isSwinging = false;
    cancelAnimationFrame(animationId);
    webLine.style.height = '0px';

    spidey.style.transition = 'transform 0.6s ease-in, opacity 0.6s ease';
    spidey.style.transform = `translate(${window.innerWidth + 100}px, 200px) rotate(45deg)`;
    spidey.style.opacity = '0';

    setTimeout(() => {
      spidey.style.transition = '';
      spidey.style.opacity = '1';
    }, 700);
  }

  function resetSpidey() {
    if (!spidey) return;
    spidey.style.transition = 'none';
    spidey.style.opacity = '1';
    spidey.style.transform = `translate(${window.innerWidth * CONFIG.pivotXRatio + CONFIG.spideyOffsetX}px, -200px)`;
  }

  function summonSpidey() {
    if (isSwinging) return;
    resetSpidey();
    setTimeout(startSwing, 100);
  }

  if (trigger) trigger.addEventListener('click', summonSpidey);

  window.addEventListener('load', () => {
    if (spidey) autoSwingTimer = setTimeout(summonSpidey, CONFIG.autoSwingDelay);
  });

  repeatTimer = setInterval(() => {
    if (!isSwinging && spidey) summonSpidey();
  }, CONFIG.autoSwingRepeat);

  /* ----------------------------------------------------------
     4. INTERACTIVE SPIDER WEB CANVAS BACKGROUND
     ---------------------------------------------------------- */
  const canvas = document.getElementById('spider-web-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let mouse = { x: null, y: null, radius: 180 };

    function resizeCanvas() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    }

    class WebParticle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        if (mouse.x !== null && mouse.y !== null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            this.x += dx * 0.02;
            this.y += dy * 0.02;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(230, 36, 41, 0.6)';
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      const particleCount = Math.min(Math.floor((width * height) / 18000), 75);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new WebParticle());
      }
    }

    function connectParticles() {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          let dx = particles[a].x - particles[b].x;
          let dy = particles[a].y - particles[b].y;
          let dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.strokeStyle = `rgba(0, 229, 255, ${1 - dist / 130})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    }

    function animateWebCanvas() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      connectParticles();
      requestAnimationFrame(animateWebCanvas);
    }

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    resizeCanvas();
    animateWebCanvas();
  }

  /* ----------------------------------------------------------
     5. CUSTOM CURSOR & THWIP EFFECT
     ---------------------------------------------------------- */
  const customCursor = document.getElementById('custom-cursor');
  if (customCursor) {
    window.addEventListener('mousemove', (e) => {
      customCursor.style.left = e.clientX + 'px';
      customCursor.style.top = e.clientY + 'px';
    });

    document.querySelectorAll('.thwip-trigger, button, a').forEach(el => {
      el.addEventListener('click', () => playThwipSound());
    });
  }

  /* ----------------------------------------------------------
     6. SPIDER SUIT SWITCHER SYSTEM
     ---------------------------------------------------------- */
  const suitBtn = document.getElementById('suit-btn');
  const suitMenu = document.getElementById('suit-menu');
  const currentSuitName = document.getElementById('current-suit-name');
  const suitTagText = document.getElementById('suit-tag-text');

  if (suitBtn && suitMenu) {
    suitBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      suitMenu.classList.toggle('active');
    });

    document.addEventListener('click', () => {
      suitMenu.classList.remove('active');
    });

    document.querySelectorAll('.suit-option').forEach(option => {
      option.addEventListener('click', () => {
        document.querySelectorAll('.suit-option').forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');

        const suitKey = option.getAttribute('data-suit');
        document.documentElement.setAttribute('data-suit', suitKey);

        const suitLabel = option.querySelector('span:last-child').textContent;
        if (currentSuitName) currentSuitName.textContent = suitLabel.split(' ')[0];
        if (suitTagText) suitTagText.textContent = suitLabel.toUpperCase();

        playThwipSound();
      });
    });
  }

  /* ----------------------------------------------------------
     7. EDUCATION TIMELINE ANIMATION & NODE CLICK FX
     ---------------------------------------------------------- */
  const timelineNodes = document.querySelectorAll('.timeline-node');
  timelineNodes.forEach(node => {
    node.addEventListener('click', (e) => {
      playNodePingSound();
      const rect = node.getBoundingClientRect();
      createWebSplat(rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
  });

  /* ----------------------------------------------------------
     8. RESUME DOSSIER MODAL HANDLERS
     ---------------------------------------------------------- */
  const viewResumeBtn = document.getElementById('view-resume-btn');
  const resumeModal = document.getElementById('resume-modal');
  const resumeModalClose = document.getElementById('resume-modal-close');
  const closeResumeFooterBtn = document.getElementById('close-resume-footer-btn');

  function openResumeModal() {
    if (resumeModal) {
      resumeModal.classList.add('active');
      playThwipSound();
    }
  }

  function closeResumeModal() {
    if (resumeModal) {
      resumeModal.classList.remove('active');
    }
  }

  if (viewResumeBtn) viewResumeBtn.addEventListener('click', openResumeModal);
  if (resumeModalClose) resumeModalClose.addEventListener('click', closeResumeModal);
  if (closeResumeFooterBtn) closeResumeFooterBtn.addEventListener('click', closeResumeModal);

  if (resumeModal) {
    resumeModal.addEventListener('click', (e) => {
      if (e.target === resumeModal) closeResumeModal();
    });
  }

  /* ----------------------------------------------------------
     9. PROJECT BRIEF MODAL HANDLERS
     ---------------------------------------------------------- */
  const projectModal = document.getElementById('project-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  document.querySelectorAll('.open-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (projectModal) {
        projectModal.classList.add('active');
        playThwipSound();
      }
    });
  });

  if (modalCloseBtn && projectModal) {
    modalCloseBtn.addEventListener('click', () => {
      projectModal.classList.remove('active');
    });
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) projectModal.classList.remove('active');
    });
  }

  /* ----------------------------------------------------------
     10. PROJECT FILTER SYSTEM
     ---------------------------------------------------------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      playThwipSound();

      const filter = btn.getAttribute('data-filter');
      projectCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'block';
          card.style.animation = 'thwipIn 0.5s ease forward';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* ----------------------------------------------------------
     11. BACKEND CONNECTED CONTACT FORM SUBMISSION
     ---------------------------------------------------------- */
  const contactForm = document.getElementById('contact-form');
  const responseAlert = document.getElementById('contact-response-alert');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      playThwipSound();

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const subject = document.getElementById('subject').value;
      const message = document.getElementById('message').value;

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> LAUNCHING WEB SIGNAL...';
      submitBtn.disabled = true;

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, subject, message })
        });

        const data = await res.json();

        if (res.ok && data.status === 'success') {
          if (responseAlert) {
            responseAlert.className = 'form-response-alert success';
            responseAlert.innerHTML = `<i class="fas fa-check-circle"></i> ${data.message}`;
            responseAlert.style.display = 'flex';
          }
          contactForm.reset();
        } else {
          throw new Error(data.message || 'Signal transmission error');
        }
      } catch (err) {
        if (responseAlert) {
          responseAlert.className = 'form-response-alert error';
          responseAlert.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Signal Logged locally! (${err.message})`;
          responseAlert.style.display = 'flex';
        }
      } finally {
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
      }
    });
  }

  /* ----------------------------------------------------------
     12. WEB ARCADE MINI-GAME & BACKEND LEADERBOARD
     ---------------------------------------------------------- */
  const gameContainer = document.getElementById('game-container');
  const gameCanvas = document.getElementById('game-canvas');
  const startBtn = document.getElementById('start-game-btn');
  const gameOverlay = document.getElementById('game-start-overlay');
  const scoreEl = document.getElementById('game-score');
  const timerEl = document.getElementById('game-timer');
  const highScoreEl = document.getElementById('game-high-score');

  if (gameCanvas && gameContainer) {
    const gCtx = gameCanvas.getContext('2d');
    let gameLoopId = null;
    let gameTimerId = null;
    let score = 0;
    let timeLeft = 30;
    let bugs = [];
    let isPlaying = false;

    let highScore = localStorage.getItem('spider_arcade_highscore') || 0;
    if (highScoreEl) highScoreEl.textContent = highScore;

    function resizeGameCanvas() {
      gameCanvas.width = gameContainer.clientWidth;
      gameCanvas.height = gameContainer.clientHeight || 400;
    }

    class Bug {
      constructor() {
        this.x = Math.random() * (gameCanvas.width - 60) + 30;
        this.y = Math.random() * (gameCanvas.height - 60) + 30;
        this.size = 28;
        this.vx = (Math.random() - 0.5) * 3.5;
        this.vy = (Math.random() - 0.5) * 3.5;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 20 || this.x > gameCanvas.width - 20) this.vx *= -1;
        if (this.y < 20 || this.y > gameCanvas.height - 20) this.vy *= -1;
      }

      draw() {
        gCtx.save();
        gCtx.translate(this.x, this.y);
        gCtx.fillStyle = '#ff1e27';
        gCtx.beginPath();
        gCtx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        gCtx.fill();
        gCtx.restore();
      }
    }

    function spawnBugs() {
      bugs = [];
      for (let i = 0; i < 6; i++) {
        bugs.push(new Bug());
      }
    }

    function updateGame() {
      if (!isPlaying) return;
      gCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
      bugs.forEach(b => {
        b.update();
        b.draw();
      });
      gameLoopId = requestAnimationFrame(updateGame);
    }

    function startGame() {
      resizeGameCanvas();
      score = 0;
      timeLeft = 30;
      isPlaying = true;
      if (scoreEl) scoreEl.textContent = '0';
      if (timerEl) timerEl.textContent = '30s';
      if (gameOverlay) gameOverlay.style.display = 'none';

      spawnBugs();
      updateGame();

      clearInterval(gameTimerId);
      gameTimerId = setInterval(() => {
        timeLeft--;
        if (timerEl) timerEl.textContent = timeLeft + 's';
        if (timeLeft <= 0) endGame();
      }, 1000);
    }

    async function endGame() {
      isPlaying = false;
      cancelAnimationFrame(gameLoopId);
      clearInterval(gameTimerId);

      if (score > highScore) {
        highScore = score;
        localStorage.setItem('spider_arcade_highscore', highScore);
        if (highScoreEl) highScoreEl.textContent = highScore;
      }

      // Submit score to Flask Backend
      try {
        const suitKey = document.documentElement.getAttribute('data-suit') || 'classic';
        await fetch('/api/arcade/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ player_name: 'Shafiq Fan', score, suit: suitKey })
        });
      } catch (e) {}

      if (gameOverlay) {
        gameOverlay.style.display = 'flex';
        gameOverlay.querySelector('h3').textContent = `MISSION COMPLETE! SCORE: ${score}`;
      }
    }

    gameCanvas.addEventListener('click', (e) => {
      if (!isPlaying) return;
      const rect = gameCanvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      bugs.forEach((bug, idx) => {
        let dx = clickX - bug.x;
        let dy = clickY - bug.y;
        if (Math.sqrt(dx * dx + dy * dy) < bug.size) {
          playThwipSound();
          score += 10;
          if (scoreEl) scoreEl.textContent = score;
          bugs[idx] = new Bug();
        }
      });
    });

    if (startBtn) startBtn.addEventListener('click', startGame);
    window.addEventListener('resize', resizeGameCanvas);
  }

  /* ----------------------------------------------------------
     13. HERO STATS NUMBER COUNTER
     ---------------------------------------------------------- */
  const statValues = document.querySelectorAll('.stat-value');
  let animatedStats = false;

  function animateCounters() {
    statValues.forEach(el => {
      const target = parseFloat(el.getAttribute('data-count'));
      let current = 0;
      const step = target / 40;
      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          el.textContent = target;
          clearInterval(interval);
        } else {
          el.textContent = current.toFixed(target % 1 === 0 ? 0 : 1);
        }
      }, 30);
    });
  }

  window.addEventListener('scroll', () => {
    const statsSec = document.querySelector('.hero-stats');
    if (statsSec && !animatedStats) {
      const rect = statsSec.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        animatedStats = true;
        animateCounters();
      }
    }
  });

  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileDrawer.classList.toggle('active');
    });
  }

})();
