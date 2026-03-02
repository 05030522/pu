// ========================================
// Config
// ========================================
const CONFIG = {
    GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwm4bCL9CMM-x0mdRdwMGR-bfsdQZJTlgiBSxAEgVDX2d9Xj1dqfmY01vqdPE4Daft0/exec',
    START_DATE: '2025-09-26',
    NEXT_MEET_DATE: '2026-03-08',
};

// ========================================
// State
// ========================================
let allLetters = [];
let allDatePlans = [];
let currentFilter = 'all';
let currentSection = 'letters';
let editingPlanIndex = -1;

// ========================================
// Clocks
// ========================================
function updateClocks() {
    const now = new Date();
    const seoulTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const londonTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/London' }));

    document.getElementById('seoul-time').textContent = seoulTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    document.getElementById('seoul-date').textContent = seoulTime.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
    document.getElementById('london-time').textContent = londonTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    document.getElementById('london-date').textContent = londonTime.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
}

// ========================================
// Counters
// ========================================
function updateCounters() {
    const now = new Date();
    const start = new Date(CONFIG.START_DATE);
    const meet = new Date(CONFIG.NEXT_MEET_DATE);

    const days = Math.floor((now - start) / 86400000);
    document.getElementById('together-days').textContent = `${days.toLocaleString()}days`;

    const until = Math.floor((meet - now) / 86400000);
    if (until > 0) document.getElementById('next-meet').textContent = `D-${until}`;
    else if (until === 0) document.getElementById('next-meet').textContent = 'D-Day!';
    else document.getElementById('next-meet').textContent = `D+${Math.abs(until)}`;
}

// ========================================
// Navigation
// ========================================
function showSection(name, el) {
    currentSection = name;
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(`${name}-section`).classList.add('active');
    if (el) el.classList.add('active');
}

function onFabClick() {
    if (currentSection === 'letters') openModal('letter');
    else if (currentSection === 'dateplans') openModal('dateplan');
    else if (currentSection === 'memories') openModal('memory');
}

// ========================================
// Modals
// ========================================
function openModal(type) {
    if (type === 'letter') document.getElementById('letter-modal').classList.add('active');
    else if (type === 'memory') document.getElementById('memory-modal').classList.add('active');
    else if (type === 'dateplan') {
        editingPlanIndex = -1;
        document.getElementById('dateplan-modal').classList.add('active');
    }
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    document.getElementById('letter-form').reset();
    document.getElementById('memory-form').reset();
    document.getElementById('dateplan-form').reset();
    editingPlanIndex = -1;
    resetCourseInputs();
}

function resetCourseInputs() {
    document.getElementById('course-inputs').innerHTML = `
        <div class="course-input-row">
            <input type="time" class="course-time-input">
            <input type="text" class="course-place-input" placeholder="장소" required>
            <input type="text" class="course-desc-input" placeholder="설명">
            <button type="button" class="btn-remove-course" onclick="removeCourseRow(this)">&times;</button>
        </div>`;
}

document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
});

// ========================================
// Letters (Google Sheets)
// ========================================
async function loadLetters() {
    try {
        const res = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?action=getLetters`);
        allLetters = await res.json();
        displayLetters();
    } catch (e) {
        console.error('Letters load failed:', e);
        document.getElementById('letters-container').innerHTML = '<div class="loading">편지를 불러올 수 없습니다.</div>';
    }
}

function displayLetters() {
    const container = document.getElementById('letters-container');
    let filtered = currentFilter === 'all' ? allLetters : allLetters.filter(l => l.to === currentFilter);

    if (!filtered.length) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">💌</div><div class="empty-state-text">아직 편지가 없어요</div><div class="empty-state-sub">첫 편지를 써보세요</div></div>';
        return;
    }

    container.innerHTML = filtered.map((l, i) => {
        const preview = l.content.length > 80 ? l.content.substring(0, 80) : l.content;
        return `<div class="letter-card glass" onclick="showLetterDetail(${i},'${currentFilter}')">
            <div class="letter-from">${l.from} &rarr; ${l.to}</div>
            <div class="letter-date">${formatDate(l.date)}</div>
            <div class="letter-content ${l.content.length > 80 ? 'truncated' : ''}">${preview}</div>
            ${l.image ? `<div style="margin-top:0.8rem"><img src="${l.image}" style="max-width:100%;border-radius:8px"></div>` : ''}
        </div>`;
    }).join('');
}

function filterLetters(filter, el) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (el) el.classList.add('active');
    displayLetters();
}

function showLetterDetail(index, filter) {
    let filtered = filter === 'all' ? allLetters : allLetters.filter(l => l.to === filter);
    const letter = filtered[index];
    document.getElementById('letter-detail-title').textContent = `${letter.from}의 편지`;
    document.getElementById('letter-detail-from').textContent = `${letter.from} → ${letter.to}`;
    document.getElementById('letter-detail-date').textContent = formatDate(letter.date);
    let html = letter.content;
    if (letter.image) html += `<br><br><img src="${letter.image}" style="max-width:100%;border-radius:10px">`;
    document.getElementById('letter-detail-text').innerHTML = html;
    document.getElementById('letter-detail-modal').classList.add('active');
}

async function saveLetter(data) {
    try {
        await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
            method: 'POST', mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'addLetter', data })
        });
        alert('편지가 전송되었습니다!');
        closeModal();
        setTimeout(loadLetters, 1000);
    } catch (e) {
        alert('전송 실패. 다시 시도해주세요.');
    }
}

// ========================================
// Memories (Google Sheets)
// ========================================
async function loadMemories() {
    try {
        const res = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?action=getMemories`);
        const memories = await res.json();
        const container = document.getElementById('timeline-container');

        if (!memories.length) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">✨</div><div class="empty-state-text">아직 추억이 없어요</div><div class="empty-state-sub">특별한 순간을 기록해보세요</div></div>';
            return;
        }

        memories.sort((a, b) => new Date(b.date) - new Date(a.date));
        container.innerHTML = memories.map((m, i) => `
            <div class="timeline-item" style="animation-delay:${i * 0.08}s">
                <div class="timeline-dot"></div>
                <div class="timeline-content glass">
                    <div class="timeline-date">${formatDate(m.date)}</div>
                    <div class="timeline-title">${m.title}</div>
                    <div class="timeline-text">${m.content}</div>
                    ${m.image ? `<img src="${m.image}" style="max-width:100%;border-radius:10px;margin-top:0.8rem">` : ''}
                </div>
            </div>
        `).join('');
    } catch (e) {
        document.getElementById('timeline-container').innerHTML = '<div class="loading">추억을 불러올 수 없습니다.</div>';
    }
}

async function saveMemory(data) {
    try {
        await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
            method: 'POST', mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'addMemory', data })
        });
        alert('추억이 저장되었습니다!');
        closeModal();
        setTimeout(loadMemories, 1000);
    } catch (e) {
        alert('저장 실패. 다시 시도해주세요.');
    }
}

// ========================================
// Date Plans (localStorage + Google Sheets sync)
// ========================================
function loadDatePlans() {
    // Load from localStorage first
    try {
        allDatePlans = JSON.parse(localStorage.getItem('datePlans') || '[]');
    } catch (e) {
        allDatePlans = [];
    }
    displayDatePlans();

    // Try Google Sheets in background
    fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?action=getDatePlans`)
        .then(res => res.json())
        .then(plans => {
            if (Array.isArray(plans) && plans.length > 0) {
                allDatePlans = plans;
                localStorage.setItem('datePlans', JSON.stringify(plans));
                displayDatePlans();
            }
        })
        .catch(() => {}); // silently fail, use localStorage data
}

function saveDatePlansLocal() {
    localStorage.setItem('datePlans', JSON.stringify(allDatePlans));
}

function displayDatePlans() {
    const container = document.getElementById('dateplans-container');

    if (!allDatePlans.length) {
        container.innerHTML = `<div class="empty-state">
            <div class="empty-state-icon">📅</div>
            <div class="empty-state-text">아직 데이트 일정이 없어요</div>
            <div class="empty-state-sub">+ 버튼으로 첫 데이트를 계획해보세요</div>
        </div>`;
        return;
    }

    const sorted = [...allDatePlans].sort((a, b) => new Date(a.date) - new Date(b.date));
    const now = new Date(); now.setHours(0, 0, 0, 0);

    container.innerHTML = sorted.map((plan, i) => {
        const diff = Math.floor((new Date(plan.date) - now) / 86400000);
        let dday = diff > 0 ? `D-${diff}` : diff === 0 ? 'D-Day!' : `D+${Math.abs(diff)}`;

        const courses = (plan.courses || []).map(c => `
            <div class="course-item">
                <div class="course-time">${c.time || ''}</div>
                <div class="course-dot"></div>
                <div class="course-detail">
                    <div class="course-place">${esc(c.place)}</div>
                    ${c.desc ? `<div class="course-desc">${esc(c.desc)}</div>` : ''}
                </div>
            </div>`).join('');

        const realIdx = allDatePlans.indexOf(plan);

        return `<div class="date-plan-card glass" style="animation:fadeUp 0.5s ease-out ${i * 0.08}s both">
            <div class="date-plan-header">
                <div class="date-plan-title">${esc(plan.title)}</div>
                <div class="date-plan-meta">
                    <span class="date-plan-date">${formatDate(plan.date)}</span>
                    <span class="date-plan-dday">${dday}</span>
                </div>
            </div>
            <div class="course-list">${courses}</div>
            ${plan.memo ? `<div class="course-memo">${esc(plan.memo)}</div>` : ''}
            <div class="date-plan-actions">
                <button type="button" class="btn-small" onclick="editDatePlan(${realIdx})">수정</button>
                <button type="button" class="btn-small btn-delete" onclick="deleteDatePlan(${realIdx})">삭제</button>
            </div>
        </div>`;
    }).join('');
}

function addDatePlan(data) {
    allDatePlans.push(data);
    saveDatePlansLocal();
    displayDatePlans();

    // Also try to sync to Google Sheets
    fetch(CONFIG.GOOGLE_SCRIPT_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addDatePlan', data })
    }).catch(() => {});
}

function updateDatePlanData(index, data) {
    allDatePlans[index] = data;
    saveDatePlansLocal();
    displayDatePlans();

    fetch(CONFIG.GOOGLE_SCRIPT_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateDatePlan', index, data })
    }).catch(() => {});
}

function deleteDatePlan(index) {
    if (!confirm('이 데이트 일정을 삭제할까요?')) return;
    allDatePlans.splice(index, 1);
    saveDatePlansLocal();
    displayDatePlans();

    fetch(CONFIG.GOOGLE_SCRIPT_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteDatePlan', index })
    }).catch(() => {});
}

function editDatePlan(index) {
    const plan = allDatePlans[index];
    editingPlanIndex = index;

    document.getElementById('dateplan-date').value = plan.date;
    document.getElementById('dateplan-title').value = plan.title;
    document.getElementById('dateplan-memo').value = plan.memo || '';

    const container = document.getElementById('course-inputs');
    const courses = plan.courses || [];
    if (!courses.length) {
        resetCourseInputs();
    } else {
        container.innerHTML = courses.map(c => `
            <div class="course-input-row">
                <input type="time" class="course-time-input" value="${c.time || ''}">
                <input type="text" class="course-place-input" placeholder="장소" value="${escAttr(c.place)}" required>
                <input type="text" class="course-desc-input" placeholder="설명" value="${escAttr(c.desc || '')}">
                <button type="button" class="btn-remove-course" onclick="removeCourseRow(this)">&times;</button>
            </div>`).join('');
    }

    document.getElementById('dateplan-modal').classList.add('active');
}

function addCourseRow() {
    const container = document.getElementById('course-inputs');
    const row = document.createElement('div');
    row.className = 'course-input-row';
    row.innerHTML = `
        <input type="time" class="course-time-input">
        <input type="text" class="course-place-input" placeholder="장소" required>
        <input type="text" class="course-desc-input" placeholder="설명">
        <button type="button" class="btn-remove-course" onclick="removeCourseRow(this)">&times;</button>`;
    container.appendChild(row);
    row.querySelector('.course-place-input').focus();
}

function removeCourseRow(btn) {
    const container = document.getElementById('course-inputs');
    if (container.children.length > 1) btn.closest('.course-input-row').remove();
}

// ========================================
// Form Handlers
// ========================================
function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
            preview.innerHTML = `<img src="${e.target.result}"><div class="remove-image" onclick="removeImage('${input.id}','${previewId}')">제거</div>`;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function removeImage(inputId, previewId) {
    document.getElementById(inputId).value = '';
    document.getElementById(previewId).innerHTML = '';
}

async function getBase64(file) {
    return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.readAsDataURL(file);
        r.onload = () => resolve(r.result);
        r.onerror = e => reject(e);
    });
}

document.getElementById('letter-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = '전송 중...';
    try {
        const img = document.getElementById('letter-image').files[0];
        await saveLetter({
            from: document.getElementById('letter-from').value,
            to: document.getElementById('letter-to').value,
            content: document.getElementById('letter-content').value,
            image: img ? await getBase64(img) : null,
            date: new Date().toISOString()
        });
    } catch (e) { alert('전송 실패'); }
    finally { btn.disabled = false; btn.textContent = '보내기'; }
});

document.getElementById('memory-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = '저장 중...';
    try {
        const img = document.getElementById('memory-image').files[0];
        await saveMemory({
            date: document.getElementById('memory-date').value,
            title: document.getElementById('memory-title').value,
            content: document.getElementById('memory-content').value,
            image: img ? await getBase64(img) : null
        });
    } catch (e) { alert('저장 실패'); }
    finally { btn.disabled = false; btn.textContent = '저장'; }
});

document.getElementById('dateplan-form').addEventListener('submit', e => {
    e.preventDefault();
    const rows = document.querySelectorAll('#course-inputs .course-input-row');
    const courses = [];
    rows.forEach(row => {
        const place = row.querySelector('.course-place-input').value.trim();
        if (place) courses.push({
            time: row.querySelector('.course-time-input').value || '',
            place,
            desc: row.querySelector('.course-desc-input').value.trim()
        });
    });

    const data = {
        date: document.getElementById('dateplan-date').value,
        title: document.getElementById('dateplan-title').value,
        courses,
        memo: document.getElementById('dateplan-memo').value.trim()
    };

    if (editingPlanIndex >= 0) {
        updateDatePlanData(editingPlanIndex, data);
        alert('수정되었습니다!');
    } else {
        addDatePlan(data);
        alert('데이트 일정이 저장되었습니다!');
    }
    closeModal();
});

document.getElementById('letter-from').addEventListener('change', e => {
    const to = document.getElementById('letter-to');
    if (e.target.value === '진혁') to.value = '윤서';
    else if (e.target.value === '윤서') to.value = '진혁';
});

// ========================================
// Utilities
// ========================================
function formatDate(str) {
    return new Date(str).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

function escAttr(s) {
    return s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ========================================
// Init
// ========================================
function init() {
    updateClocks();
    setInterval(updateClocks, 1000);
    updateCounters();
    setInterval(updateCounters, 60000);
    loadLetters();
    loadMemories();
    loadDatePlans();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
