

const container = document.querySelector('.box-of-security');
const boxes = container.querySelectorAll('.box');

boxes.forEach(box => {

  /* ================= 3D TILT ================= */
  box.addEventListener('mousemove', (e) => {
    const rect = box.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -(y - centerY) / 12;
    const rotateY = (x - centerX) / 12;

    box.style.transform = `
      translateY(-1vh)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
    `;
  });

  box.addEventListener('mouseleave', () => {
    box.style.transform = `translateY(0px) rotateX(0deg) rotateY(0deg)`;
  });

  /* ================= CLICK EFFECT ================= */
  box.addEventListener('click', (e) => {
    createBurst(e, container);
    createSonicBoom(e, container);

    // Impact compression effect
    box.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(0.95)' },
      { transform: 'scale(1)' }
    ], { duration: 200 });
  });

});


/* ================= PARTICLE BURST ================= */
function createBurst(event, container) {
  const rect = container.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const screenFactor = Math.min(window.innerWidth, window.innerHeight) / 1000; 
  // smaller screens → smaller particles; larger screens → bigger particles

  for (let i = 0; i <30; i++) {
    const ball = document.createElement('div');
    const color = `hsl(${Math.random() * 360}, 100%, 60%)`; // random bright color
    ball.style.backgroundColor = color;
    ball.classList.add('ball');
    container.appendChild(ball);

    // Dynamic particle size
    const size = 1 * screenFactor * 10; // in px
    ball.style.width = `${size}px`;
    ball.style.height = `${size}px`;

    ball.style.left = x + 'px';
    ball.style.top = y + 'px';
    ball.style.transform = 'translate(-50%, -50%)';

    const angle = Math.random() * 2 * Math.PI;

    // Dynamic distance
    const distance = (Math.random() * 80 + 40) * screenFactor; 
    const moveX = Math.cos(angle) * distance;
    const moveY = Math.sin(angle) * distance;

    ball.animate([
      { transform: `translate(-50%, -50%) translate(0,0)`, opacity: 1 },
      { transform: `translate(-50%, -50%) translate(${moveX}px, ${moveY}px)`, opacity: 0 }
    ], {
      duration: 600,
      easing: 'ease-out'
    });

    setTimeout(() => ball.remove(), 600);
  }
}


/* ================= SONIC BOOM SHOCKWAVE ================= */
function createSonicBoom(event, container) {
  const rect = container.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const wave = document.createElement('div');
  wave.classList.add('sonic-wave');
  container.appendChild(wave);

  wave.style.left = x + 'px';
  wave.style.top = y + 'px';

  wave.animate([
    { transform: 'translate(-50%, -50%) scale(0)', opacity: 0.9 },
    { transform: 'translate(-50%, -50%) scale(4)', opacity: 0 }
  ], {
    duration: 600,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
  });

  setTimeout(() => wave.remove(), 600);
}


