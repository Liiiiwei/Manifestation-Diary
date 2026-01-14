import './style.css'
import { createSection, createNightlyWriter, createHappyThings, createEnvelope, createSpaceClearing, createStreakTracker, createCalendarView, createDopamineDetox } from './components/diary'
import { animate } from 'animejs'

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <header class="header">
    <h1>顯化日記</h1>
    <p style="color: var(--sumi-muted); font-size: 0.875rem; margin-top: 1rem;">連結宇宙能量，感受當下豐盛</p>
  </header>
  
  <div id="main-content" style="display: flex; flex-direction: column; gap: var(--space-md);">
    <div id="section-status" style="display: grid; grid-template-columns: 1fr 2fr; gap: var(--space-sm);">
      <div id="streak-tracker"></div>
      <div id="calendar-view"></div>
    </div>
    <div id="section-envelope"></div>
    <div id="section-writing"></div>
    <div id="section-happy"></div>
    <div id="section-clearing"></div>
    <div id="section-detox"></div>
  </div>
  
  <footer style="text-align: center; margin-top: var(--space-xl); color: var(--sumi-muted); font-size: 0.75rem; padding-bottom: var(--space-lg); letter-spacing: 0.1em;">
    保持鬆弛感，宇宙會為妳導航
  </footer>
`

// Liquid Background Blobs
const liquidBg = document.getElementById('liquid-bg')!;
for (let i = 0; i < 4; i++) {
  const blob = document.createElement('div');
  blob.className = 'blob';
  const size = 300 + Math.random() * 300;
  blob.style.width = `${size}px`;
  blob.style.height = `${size}px`;
  blob.style.top = `${Math.random() * 100}%`;
  blob.style.left = `${Math.random() * 100}%`;
  liquidBg.appendChild(blob);

  animate(blob, {
    translateX: [0, () => Math.random() * 200 - 100],
    translateY: [0, () => Math.random() * 200 - 100],
    scale: [1, 1.2, 1],
    rotate: '1turn',
    duration: 15000 + Math.random() * 10000,
    easing: 'linear',
    loop: true,
    playbackDirection: 'alternate'
  });
}

// Injecting status components
document.getElementById('streak-tracker')!.appendChild(createStreakTracker());
document.getElementById('calendar-view')!.appendChild(createCalendarView());

// Injecting components with staggered animation
const sections = [
  { id: 'section-envelope', title: '已接收感謝', component: createEnvelope() },
  { id: 'section-writing', title: '夜間顯化書寫', component: createNightlyWriter() },
  { id: 'section-happy', title: '活在當下', component: createHappyThings() },
  { id: 'section-clearing', title: '能量空間清理', component: createSpaceClearing() },
  { id: 'section-detox', title: '多巴安戒斷', component: createDopamineDetox() }
];

sections.forEach((section, index) => {
  const container = document.getElementById(section.id)!;
  const sectionElement = createSection(section.title, '');
  sectionElement.style.animationDelay = `${(index + 2) * 0.1}s`; // Offset by status components
  container.appendChild(sectionElement);

  const contentArea = sectionElement.querySelector('.section-content')!;
  contentArea.appendChild(section.component);
});

// Re-bind envelope interaction after DOM insertion
const envelopeSection = document.getElementById('section-envelope')!;
const envContainer = envelopeSection.querySelector('#envelope-container') as HTMLDivElement;
if (envContainer) {
  const envIcon = envContainer.querySelector('#envelope-display') as HTMLDivElement;
  if (envIcon) {
    envIcon.onclick = () => {
      envIcon.style.transform = 'scale(1.15) rotate(5deg)';
      envIcon.classList.add('shimmer');
      setTimeout(() => {
        envIcon.textContent = '已收悉';
        envIcon.style.transform = 'scale(1) rotate(0deg)';
        envIcon.style.background = 'var(--sakura-subtle)';
        envIcon.style.color = 'var(--accent-gold)';
        setTimeout(() => envIcon.classList.remove('shimmer'), 500);
      }, 600);
    };
  }
}
