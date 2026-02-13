// ===== script.js =====
document.addEventListener('DOMContentLoaded', () => {
  // ---------- screen elements ----------
  const intro = document.getElementById('intro-screen');
  const level1 = document.getElementById('level1');
  const level2 = document.getElementById('level2');
  const level3 = document.getElementById('level3');
  const finalScreen = document.getElementById('final-screen');
  const screens = [intro, level1, level2, level3, finalScreen];

  // ---------- buttons ----------
  const startBtn = document.getElementById('start-quest');
  const next1Btn = document.getElementById('next-level-1');
  const next2Btn = document.getElementById('next-level-2');
  const continueBossBtn = document.getElementById('continue-after-boss');
  const valentineBtn = document.getElementById('valentine-button');

  // ---------- level1 elements ----------
  const cards = document.querySelectorAll('.card');
  const level1Messages = [
    'Because you’re my favorite notification.',
    'Because you’re the best person to argue with.',
    'Because being with you always feels right.'
  ];
  let revealedCount = 0;

  // ---------- level2 globals ----------
  const constellationWrapper = document.getElementById('constellation-wrapper');
  const level2MessageDiv = document.getElementById('constellation-message');
  let completedConstellations = 0;
  const totalConstellations = 4;

  // ---------- level3 globals ----------
  const bossImg = document.getElementById('boss-image');
  const hpFill = document.getElementById('hp-bar-fill');
  const hpText = document.getElementById('hp-text');
  let bossHP = 100;
  const maxHP = 100;

  // ---------- helper: show screen ----------
  function showScreen(targetScreen) {
    screens.forEach(s => s.classList.remove('active'));
    targetScreen.classList.add('active');
  }

  // ---------- reset level 1 ----------
  function resetLevel1() {
    cards.forEach((card, idx) => {
      card.classList.remove('revealed');
      card.textContent = '✨';
      // restore message in dataset (just in case)
      card.dataset.message = level1Messages[idx];
    });
    revealedCount = 0;
    next1Btn.disabled = true;
  }

  // ---------- level 1 card click ----------
  cards.forEach((card, index) => {
    card.addEventListener('click', function () {
      if (this.classList.contains('revealed')) return; // already opened
      this.classList.add('revealed');
      this.textContent = this.dataset.message; // show the message
      revealedCount++;
      if (revealedCount === 3) {
        next1Btn.disabled = false;
      }
    });
  });

  // ---------- level 2: build constellations ----------
  function buildConstellations() {
    constellationWrapper.innerHTML = ''; // clean
    completedConstellations = 0;
    level2MessageDiv.textContent = '';
    next2Btn.disabled = true;

    // Define four constellations: Cat, Heart, Cloud, Star
    const constellations = [
      { name: 'cat', nodes: [[30,30], [70,30], [50,50], [30,70], [70,70]],
        edges: [[0,2], [1,2], [2,3], [2,4]] },
      { name: 'heart', nodes: [[50,20], [20,40], [50,80], [80,40]],
        edges: [[0,1], [0,3], [1,2], [3,2]] },
      { name: 'cloud', nodes: [[20,50], [35,30], [65,30], [80,50], [50,70]],
        edges: [[0,1], [1,2], [2,3], [3,4], [4,0]] },
      { name: 'star', nodes: [[50,20], [30,40], [40,60], [60,60], [70,40]],
        edges: [[0,1], [1,2], [2,3], [3,4], [4,0]] }  // star outline
    ];

    constellations.forEach((c, idx) => {
      // container card
      const card = document.createElement('div');
      card.className = 'constellation-card';
      card.dataset.constellation = c.name;

      // create SVG
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 100 100');
      svg.classList.add('constellation-svg');

      // store lines and nodes in arrays
      const lines = [];
      const nodes = [];
      const nodeElements = [];
      const lineElements = [];

      // draw edges first (so they are behind)
      c.edges.forEach(([a, b]) => {
        const [x1, y1] = c.nodes[a];
        const [x2, y2] = c.nodes[b];
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.classList.add('constellation-line');
        svg.appendChild(line);
        lineElements.push(line);
      });

      // draw nodes
      c.nodes.forEach(([cx, cy], i) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', 6);
        circle.classList.add('constellation-node');
        circle.dataset.index = i;
        circle.dataset.constellation = c.name;
        svg.appendChild(circle);
        nodeElements.push(circle);
      });

      card.appendChild(svg);
      constellationWrapper.appendChild(card);

      // state for this constellation
      const state = {
        nodesClicked: new Array(c.nodes.length).fill(false),
        totalNodes: c.nodes.length,
        nodeElements,
        lineElements,
        completed: false
      };

      // click handler for each node in this constellation
      nodeElements.forEach((node, nodeIdx) => {
        node.addEventListener('click', function eHandler() {
          if (state.completed) return; // already fully lit
          if (state.nodesClicked[nodeIdx]) return; // already clicked

          // mark clicked
          state.nodesClicked[nodeIdx] = true;
          this.classList.add('active');  // glowing node

          // check if all nodes in this constellation are clicked
          const allClicked = state.nodesClicked.every(v => v === true);
          if (allClicked) {
            state.completed = true;
            // connect lines: show them with glow
            lineElements.forEach(line => {
              line.classList.add('active-line');
            });
            // also slightly dim already active nodes? no need
            completedConstellations++;

            // if all four constellations completed
            if (completedConstellations === totalConstellations) {
              level2MessageDiv.textContent = 'You deserve all the love I have to give.';
              next2Btn.disabled = false;
            }
          }
        });
      });
    });
  }

  // ---------- reset level 3 ----------
  function resetLevel3() {
    bossHP = maxHP;
    hpFill.style.width = '100%';
    hpText.textContent = '❤️ 100 / 100';
    continueBossBtn.disabled = true;
    bossImg.classList.remove('shake'); // just in case
  }

  // ---------- boss click handler (mounted later) ----------
  function handleBossClick() {
    if (bossHP <= 0) return; // already dead

    bossHP = Math.max(0, bossHP - 10);
    const percent = (bossHP / maxHP) * 100;
    hpFill.style.width = percent + '%';
    hpText.textContent = `❤️ ${bossHP} / ${maxHP}`;

    // shake effect
    bossImg.classList.add('shake');
    setTimeout(() => bossImg.classList.remove('shake'), 300);

    if (bossHP <= 0) {
      // show level complete & enable continue
      continueBossBtn.disabled = false;
      // optional: change boss image style? not needed
    }
  }

  // ---------- navigation flow ----------

  // intro → level1
  startBtn.addEventListener('click', () => {
    resetLevel1();
    showScreen(level1);
  });

  // level1 → level2
  next1Btn.addEventListener('click', () => {
    buildConstellations(); // fresh level2
    showScreen(level2);
  });

  // level2 → level3
  next2Btn.addEventListener('click', () => {
    resetLevel3();
    showScreen(level3);
  });

  // level3 continue → final screen
  continueBossBtn.addEventListener('click', () => {
    showScreen(finalScreen);
  });

  // final button reveal achievement
  valentineBtn.addEventListener('click', () => {
    document.getElementById('achievement-text').classList.remove('hidden');
    valentineBtn.disabled = true; // optional, avoid second click
  });

  // attach boss click event (after DOM)
  bossImg.addEventListener('click', handleBossClick);

  // ---------- extra: make sure next buttons start disabled ----------
  // initial states (already set in html)
  // also if user goes back, we don't handle but it's fine for mini game

  // ensure level 2 starts empty (just in case)
  // and final achievement hidden
});