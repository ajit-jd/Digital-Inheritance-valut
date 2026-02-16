const container = document.querySelector('.box-of-security');
const boxes = container.querySelectorAll('.box');

boxes.forEach(box => {

  box.addEventListener('mousemove', (e) => {
    const rect = box.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -(y - centerY) / 10;
    const rotateY = (x - centerX) / 10;

    box.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  box.addEventListener('mouseleave', () => {
    box.style.transform = `rotateX(0deg) rotateY(0deg)`;
  });

  box.addEventListener('click', (e) => {
    createBurst(e, container);
  });

});

function createBurst(event, container) {

  const rect = container.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  for (let i = 0; i < 15; i++) {
    const ball = document.createElement('div');
    ball.classList.add('ball');
    container.appendChild(ball);

    ball.style.left = x + 'px';
    ball.style.top = y + 'px';

    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * 80 + 40;

    const moveX = Math.cos(angle) * distance;
    const moveY = Math.sin(angle) * distance;

    ball.animate([
      { transform: 'translate(0,0)', opacity: 1 },
      { transform: `translate(${moveX}px, ${moveY}px)`, opacity: 0 }
    ], {
      duration: 600,
      easing: 'ease-out'
    });

    setTimeout(() => ball.remove(), 600);
  }
}
