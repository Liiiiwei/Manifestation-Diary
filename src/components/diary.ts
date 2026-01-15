import { syncToNotion, fetchRecordedDates } from '../api/notion';
import { animate } from 'animejs';

export const createSection = (title: string, contentHtml: string) => {
  const section = document.createElement('div');
  section.className = 'glass-card fade-in';
  section.innerHTML = `
    <h2 class="section-title">${title}</h2>
    <div class="section-content">${contentHtml}</div>
  `;
  return section;
};

export const createNightlyWriter = () => {
  const container = document.createElement('div');
  container.className = 'nightly-writer-container';
  container.innerHTML = `
    <div class="writing-stack">
       <textarea class="input-area" id="affirmation-input" placeholder="撰寫今晚的顯化肯定語..." rows="2"></textarea>
       <div class="progress-dots" style="margin: 15px 0;">
         <div class="progress-dot"></div>
         <div class="progress-dot"></div>
         <div class="progress-dot"></div>
       </div>
       <button id="btn-submit-writing" class="btn-primary">確認發出</button>
    </div>
  `;

  let count = 0;
  const btn = container.querySelector('#btn-submit-writing') as HTMLButtonElement;
  const input = container.querySelector('#affirmation-input') as HTMLTextAreaElement;
  const dots = container.querySelectorAll('.progress-dot');

  btn.onclick = async () => {
    const value = input.value.trim();
    if (!value) return;

    // 更新點點狀態
    dots[count].classList.add('active');
    count++;

    input.classList.add('slide-up');
    setTimeout(() => input.classList.remove('slide-up'), 500);

    if (count >= 3) {
      btn.innerText = '正在連結宇宙能量...';
      btn.disabled = true;
      input.disabled = true;

      // 同步至 Notion
      const res = await syncToNotion({
        category: '夜間寫作',
        affirmation: value
      });

      if (res.success) {
        btn.innerText = '顯化能量已注入';

        // --- 強化回饋動畫 ---
        const ripple = document.createElement('div');
        ripple.className = 'success-ripple';
        btn.appendChild(ripple);

        animate(ripple, {
          width: [10, 500],
          height: [10, 500],
          opacity: [0.6, 0],
          duration: 1200,
          easing: 'easeOutExpo',
          complete: () => ripple.remove()
        });

        animate(btn, {
          backgroundColor: ['#F0EDE5', '#C9A961', '#F0EDE5'],
          scale: [1, 1.1, 1],
          duration: 800,
          easing: 'easeOutElastic(1, .5)'
        });

        const card = container.closest('.glass-card') as HTMLElement;
        if (card) {
          animate(card, {
            translateY: [0, -10, 0],
            boxShadow: [
              '0 2px 8px rgba(0, 0, 0, 0.04)',
              '0 15px 30px rgba(201, 169, 97, 0.3)',
              '0 4px 16px rgba(0, 0, 0, 0.06)'
            ],
            duration: 1000,
            easing: 'easeOutQuad'
          });
        }
      } else {
        btn.innerText = '同步失敗 (點擊重試)';
        btn.disabled = false;
        btn.style.background = 'rgba(255, 0, 0, 0.05)';
        alert(`同步失敗：${res.error}`);
      }
    } else {
      input.value = "";
      input.placeholder = `請再次書寫以加強連結 (${count + 1}/3)...`;
    }
  };

  return container;
};

export const createHappyThings = () => {
  const container = document.createElement('div');
  container.innerHTML = `
    <p style="margin-bottom: 12px; font-size: 0.8125rem; color: var(--sumi-muted);">今天哪三件工作以外的小事讓你感到愉快？</p>
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <input type="text" class="input-area happy-input happy-input-large" placeholder="第一件事..." id="happy-1">
      <input type="text" class="input-area happy-input happy-input-large" placeholder="第二件事..." id="happy-2">
      <input type="text" class="input-area happy-input happy-input-large" placeholder="第三件事..." id="happy-3">
      <button id="btn-submit-happy" class="btn-primary" style="margin-top: 8px;">感受當下</button>
    </div>
  `;

  const btn = container.querySelector('#btn-submit-happy') as HTMLButtonElement;
  btn.onclick = async () => {
    const h1 = (container.querySelector('#happy-1') as HTMLInputElement).value;
    const h2 = (container.querySelector('#happy-2') as HTMLInputElement).value;
    const h3 = (container.querySelector('#happy-3') as HTMLInputElement).value;

    if (!h1 && !h2 && !h3) return;

    btn.innerText = '已記錄美好時刻';
    btn.disabled = true;

    const res = await syncToNotion({
      category: '快樂小事',
      happyThings: [h1, h2, h3]
    });

    if (!res.success) {
      btn.innerText = '同步失敗';
      btn.disabled = false;
      alert(`同步失敗：${res.error}`);
    }
  };

  return container;
};

export const createEnvelope = () => {
  const container = document.createElement('div');
  container.id = 'envelope-container';
  container.style.textAlign = 'center';
  container.innerHTML = `
    <div id="envelope-display" style="padding: 2.5rem; border-radius: var(--radius-md); border: 1px dashed var(--accent-border); color: var(--sumi-muted); cursor: pointer; transition: all 0.4s; font-family: 'Noto Serif JP', serif;">
      收悉一份感謝內容
    </div>
    <p style="margin-top: 12px; font-size: 0.750rem; color: var(--sumi-muted); letter-spacing: 0.05em;">點擊封存今日的豐盛感受</p>
  `;

  const envIcon = container.querySelector('#envelope-display') as HTMLDivElement;
  envIcon.onclick = async () => {
    envIcon.style.transform = 'scale(1.05)';
    envIcon.style.borderColor = 'var(--accent-gold)';

    const res = await syncToNotion({
      category: '已接收感謝',
      reflections: '今日收悉一份感謝能量'
    });

    if (!res.success) {
      alert(`同步失敗：${res.error}`);
      // Reset style
      envIcon.style.transform = 'scale(1)';
      envIcon.style.borderColor = 'var(--accent-border)';
      return;
    }

    setTimeout(() => {
      envIcon.textContent = '感謝已密封';
      envIcon.style.background = 'var(--kinari-cream)';
      envIcon.style.color = 'var(--accent-gold)';
    }, 400);
  };

  return container;
};

export const createStreakTracker = () => {
  const container = document.createElement('div');
  container.className = 'streak-container fade-in';
  container.innerHTML = `<div style="font-size:0.625rem; color:var(--sumi-muted);">同步中...</div>`;

  fetchRecordedDates().then(dates => {
    let streak = 0;
    const now = new Date();
    const dateStrings = new Set(dates);

    // 從今天開始往回算
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const checkStr = checkDate.toISOString().split('T')[0];

      if (dateStrings.has(checkStr)) {
        streak++;
      } else if (i === 0) {
        // 如果今天還沒寫，繼續往昨天看
        continue;
      } else {
        // 斷掉了
        break;
      }
    }

    container.innerHTML = `
      <div class="streak-badge">${streak}</div>
      <div class="streak-label">連續顯化日</div>
    `;
  });

  return container;
};

export const createCalendarView = () => {
  const container = document.createElement('div');
  container.className = 'calendar-view';
  container.innerHTML = `<div style="text-align:center; font-size:0.75rem; color:var(--sumi-muted);">連結星辰中...</div>`;

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();

  const renderGrid = (mode: 'weekly' | 'monthly', recordedDates: string[]) => {
    const gridHtml = `
      <div class="calendar-header">
        <span style="font-size: 0.875rem; font-weight: 500;">
          ${mode === 'weekly' ? '本週進度' : (now.getMonth() + 1) + '月'}
        </span>
        <div class="view-toggle">
          <button class="toggle-btn ${mode === 'weekly' ? 'active' : ''}" data-view="weekly">週</button>
          <button class="toggle-btn ${mode === 'monthly' ? 'active' : ''}" data-view="monthly">月</button>
        </div>
      </div>
      <div class="calendar-grid">
        ${['日', '一', '二', '三', '四', '五', '六'].map(d => `<div class="day-label">${d}</div>`).join('')}
        ${Array.from({ length: mode === 'weekly' ? 7 : daysInMonth }).map((_, i) => {
      const dateObj = mode === 'weekly'
        ? new Date(now.getFullYear(), now.getMonth(), currentDay - now.getDay() + i)
        : new Date(now.getFullYear(), now.getMonth(), i + 1);

      const dayNum = dateObj.getDate();
      const dateStr = dateObj.toISOString().split('T')[0];

      const isToday = dateObj.toDateString() === now.toDateString();
      const isThisMonth = dateObj.getMonth() === now.getMonth();
      const hasData = recordedDates.includes(dateStr);

      return `<div class="calendar-day ${isToday ? 'today' : ''} ${hasData ? 'has-data' : ''}">${(mode === 'monthly' || isThisMonth) ? dayNum : ''}</div>`;
    }).join('')}
      </div>
    `;
    container.innerHTML = gridHtml;

    // Re-bind toggle events
    container.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        renderGrid(target.dataset.view as 'weekly' | 'monthly', recordedDates);
      });
    });
  };

  // Initial Fetch
  fetchRecordedDates().then(dates => {
    renderGrid('weekly', dates);
  });

  return container;
};

export const createSpaceClearing = () => {
  const list = [
    '清理錢包收據',
    '整理書桌 3 樣雜物',
    '刪除 1 個沒用的 App',
    '把鈔票整理整齊',
    '清理電子郵件垃圾箱',
    '刪除手機中 5 張不需要的照片',
    '清潔電腦鍵盤或手機螢幕',
    '處理掉一件過期或不再需要的雜物'
  ];

  // 隨機選取 3 個不重複的任務
  const selectedTasks = [...list].sort(() => 0.5 - Math.random()).slice(0, 3);

  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '12px';

  selectedTasks.forEach((task, index) => {
    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.alignItems = 'center';
    item.style.gap = '12px';
    item.style.padding = '4px 0';

    item.innerHTML = `
            <input type="checkbox" id="clear-check-${index}" style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent-gold);">
            <label for="clear-check-${index}" style="font-size: 0.875rem; color: var(--sumi-ink); cursor: pointer;">${task}</label>
        `;

    const checkbox = item.querySelector(`#clear-check-${index}`) as HTMLInputElement;
    const label = item.querySelector('label')!;

    checkbox.onchange = async () => {
      if (checkbox.checked) {
        label.style.textDecoration = 'line-through';
        label.style.opacity = '0.5';
        checkbox.disabled = true;

        const res = await syncToNotion({
          category: '空間清理',
          affirmation: `已完成：${task}`
        });

        if (!res.success) {
          alert(`同步失敗：${res.error}`);
          // Revert UI
          label.style.textDecoration = 'none';
          label.style.opacity = '1';
          checkbox.disabled = false;
          checkbox.checked = false;
        }
      }
    };
    container.appendChild(item);
  });

  return container;
}

export const createDopamineDetox = () => {
  const tasks = [
    '不滑社交平台、短影片',
    '少吃甜食、炸物、垃圾食物',
    '12:00前睡覺'
  ];

  const container = document.createElement('div');
  container.className = 'detox-container';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '12px';

  tasks.forEach((task, index) => {
    const item = document.createElement('div');
    item.className = 'detox-item';
    item.style.display = 'flex';
    item.style.alignItems = 'center';
    item.style.gap = '12px';
    item.style.padding = '8px 12px';
    item.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
    item.style.borderRadius = '8px';
    item.style.transition = 'all 0.3s ease';

    item.innerHTML = `
      <input type="checkbox" id="detox-check-${index}" style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent-gold);">
      <label for="detox-check-${index}" style="font-size: 0.875rem; color: var(--sumi-ink); cursor: pointer; flex: 1;">${task}</label>
    `;

    const checkbox = item.querySelector(`#detox-check-${index}`) as HTMLInputElement;
    const label = item.querySelector('label')!;

    checkbox.onchange = async () => {
      if (checkbox.checked) {
        label.style.textDecoration = 'line-through';
        label.style.opacity = '0.6';
        checkbox.disabled = true;
        item.style.backgroundColor = 'var(--kinari-cream)';

        // Simple success animation
        animate(item, {
          scale: [1, 1.02, 1],
          duration: 400,
          easing: 'easeOutQuad'
        });

        const res = await syncToNotion({
          category: '多巴安戒斷',
          affirmation: `已完成：${task}`
        });

        if (!res.success) {
          alert(`同步失敗：${res.error}`);
          // Revert UI
          label.style.textDecoration = 'none';
          label.style.opacity = '1';
          checkbox.disabled = false;
          checkbox.checked = false;
          item.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        }
      }
    };
    container.appendChild(item);
  });

  return container;
};

export const createMomentUploader = () => {
  const container = document.createElement('div');
  container.className = 'moment-uploader-container';
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 15px;">
      <p style="font-size: 0.8125rem; color: var(--sumi-muted);">記錄今天最有能量的一個瞬間</p>
      <div id="image-preview-container" style="width: 100%; aspect-ratio: 16/9; background: rgba(0,0,0,0.02); border: 1px dashed var(--accent-border); border-radius: 12px; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; cursor: pointer;">
        <span id="preview-placeholder" style="color: var(--sumi-muted); font-size: 0.75rem;">點擊上傳圖片</span>
        <img id="image-preview" style="width: 100%; height: 100%; object-fit: cover; display: none;">
      </div>
      <input type="file" id="moment-file-input" accept="image/*" style="display: none;">
      <button id="btn-submit-moment" class="btn-primary" disabled>封存這個瞬間</button>
    </div>
  `;

  const fileInput = container.querySelector('#moment-file-input') as HTMLInputElement;
  const previewContainer = container.querySelector('#image-preview-container') as HTMLDivElement;
  const previewImg = container.querySelector('#image-preview') as HTMLImageElement;
  const placeholder = container.querySelector('#preview-placeholder') as HTMLSpanElement;
  const btn = container.querySelector('#btn-submit-moment') as HTMLButtonElement;

  previewContainer.onclick = () => fileInput.click();

  fileInput.onchange = () => {
    const file = fileInput.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImg.src = e.target?.result as string;
        previewImg.style.display = 'block';
        placeholder.style.display = 'none';
        btn.disabled = false;
      };
      reader.readAsDataURL(file);
    }
  };

  btn.onclick = async () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    // 取得環境變數
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      alert('請先在環境變數中設定 Cloudinary 的 Cloud Name 與 Upload Preset');
      return;
    }

    btn.innerText = '正在上傳至雲端中...';
    btn.disabled = true;

    try {
      // 1. Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });

      const uploadResult = await uploadRes.json();
      if (uploadResult.error) throw new Error(uploadResult.error.message);

      const imageUrl = uploadResult.secure_url;

      // 2. Sync to Notion
      const res = await syncToNotion({
        category: '生活瞬間',
        affirmation: '今日美好瞬間',
        imageUrl: imageUrl
      });

      if (res.success) {
        btn.innerText = '已留存永恆能量';
        animate(previewContainer, {
          boxShadow: ['0 0 0 rgba(201,169,97,0)', '0 0 20px rgba(201,169,97,0.5)', '0 0 0 rgba(201,169,97,0)'],
          duration: 1500,
          easing: 'easeInOutQuad'
        });
      } else {
        throw new Error(res.error || 'Notion 同步失敗');
      }
    } catch (err: any) {
      console.error('上傳出錯:', err);
      alert(`失敗：${err.message}`);
      btn.innerText = '重試發送';
      btn.disabled = false;
    }
  };

  return container;
};
