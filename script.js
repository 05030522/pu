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
let currentLetterKey = null;

// ========================================
// Floating Particles
// ========================================
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    const emojis = ['\u2661', '\u2726', '\u2661', '\u22C6', '\u2661', '\u2727', '\u2661', '\u2B51'];
    const colors = ['#FF8FAB', '#D4B8E8', '#FFE082', '#A8D8EA', '#FFD1DC', '#B5EAD7'];

    for (let i = 0; i < 15; i++) {
        const p = document.createElement('span');
        p.className = 'particle';
        p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDuration = (12 + Math.random() * 18) + 's';
        p.style.animationDelay = (Math.random() * 15) + 's';
        p.style.fontSize = (10 + Math.random() * 10) + 'px';
        p.style.color = colors[Math.floor(Math.random() * colors.length)];
        container.appendChild(p);
    }
}

// ========================================
// Clocks
// ========================================
function updateClocks() {
    const now = new Date();
    const seoul = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const london = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/London' }));

    document.getElementById('seoul-time').textContent = seoul.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    document.getElementById('seoul-date').textContent = seoul.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
    document.getElementById('london-time').textContent = london.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    document.getElementById('london-date').textContent = london.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
}

// ========================================
// Counters
// ========================================
function updateCounters() {
    const now = new Date();
    const days = Math.floor((now - new Date(CONFIG.START_DATE)) / 86400000);
    document.getElementById('together-days').textContent = days.toLocaleString() + 'days';

    const until = Math.floor((new Date(CONFIG.NEXT_MEET_DATE) - now) / 86400000);
    document.getElementById('next-meet').textContent = until > 0 ? 'D-' + until : until === 0 ? 'D-Day!' : 'D+' + Math.abs(until);
}

// ========================================
// Navigation
// ========================================
function showSection(name, el) {
    currentSection = name;
    document.querySelectorAll('.content-section').forEach(function(s) { s.classList.remove('active'); });
    document.querySelectorAll('.nav-tab').forEach(function(t) { t.classList.remove('active'); });
    document.getElementById(name + '-section').classList.add('active');
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
    document.querySelectorAll('.modal').forEach(function(m) { m.classList.remove('active'); });
    document.getElementById('letter-form').reset();
    document.getElementById('memory-form').reset();
    document.getElementById('dateplan-form').reset();
    editingPlanIndex = -1;
    currentLetterKey = null;
    resetCourseInputs();
}

function resetCourseInputs() {
    document.getElementById('course-inputs').innerHTML =
        '<div class="course-input-row">' +
        '<input type="time" class="course-time-input">' +
        '<input type="text" class="course-place-input" placeholder="\uC7A5\uC18C" required>' +
        '<input type="text" class="course-desc-input" placeholder="\uC124\uBA85">' +
        '<button type="button" class="btn-remove-course" onclick="removeCourseRow(this)">&times;</button>' +
        '</div>';
}

document.querySelectorAll('.modal').forEach(function(modal) {
    modal.addEventListener('click', function(e) { if (e.target === modal) closeModal(); });
});

// ========================================
// Letters
// ========================================
async function loadLetters() {
    try {
        var res = await fetch(CONFIG.GOOGLE_SCRIPT_URL + '?action=getLetters');
        allLetters = await res.json();
        displayLetters();
    } catch (e) {
        document.getElementById('letters-container').innerHTML = '<div class="loading">\uD3B8\uC9C0\uB97C \uBD88\uB7EC\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.</div>';
    }
}

function displayLetters() {
    var container = document.getElementById('letters-container');
    var filtered = currentFilter === 'all' ? allLetters : allLetters.filter(function(l) { return l.to === currentFilter; });

    if (!filtered.length) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">\uD83D\uDC8C</div><div class="empty-state-text">\uC544\uC9C1 \uD3B8\uC9C0\uAC00 \uC5C6\uC5B4\uC694</div><div class="empty-state-sub">\uCCAB \uD3B8\uC9C0\uB97C \uC368\uBCF4\uC138\uC694</div></div>';
        return;
    }

    container.innerHTML = filtered.map(function(l, i) {
        var preview = l.content.length > 80 ? l.content.substring(0, 80) : l.content;
        return '<div class="letter-card glass" onclick="showLetterDetail(' + i + ',\'' + currentFilter + '\')">' +
            '<div class="letter-from">' + l.from + ' \u2192 ' + l.to + '</div>' +
            '<div class="letter-date">' + formatDate(l.date) + '</div>' +
            '<div class="letter-content ' + (l.content.length > 80 ? 'truncated' : '') + '">' + preview + '</div>' +
            (l.image ? '<div style="margin-top:0.6rem"><img src="' + l.image + '" style="max-width:100%;border-radius:8px"></div>' : '') +
        '</div>';
    }).join('');
}

function filterLetters(filter, el) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
    if (el) el.classList.add('active');
    displayLetters();
}

function showLetterDetail(index, filter) {
    var filtered = filter === 'all' ? allLetters : allLetters.filter(function(l) { return l.to === filter; });
    var letter = filtered[index];

    document.getElementById('letter-detail-title').textContent = letter.from + '\uC758 \uD3B8\uC9C0';
    document.getElementById('letter-detail-from').textContent = letter.from + ' \u2192 ' + letter.to;
    document.getElementById('letter-detail-date').textContent = formatDate(letter.date);

    var html = letter.content;
    if (letter.image) html += '<br><br><img src="' + letter.image + '" style="max-width:100%;border-radius:10px">';
    document.getElementById('letter-detail-text').innerHTML = html;

    currentLetterKey = 'letter_' + letter.date + '_' + letter.from;
    renderComments();

    document.getElementById('letter-detail-modal').classList.add('active');
}

async function saveLetter(data) {
    try {
        await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
            method: 'POST', mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'addLetter', data: data })
        });
        alert('\uD3B8\uC9C0\uAC00 \uC804\uC1A1\uB418\uC5C8\uC2B5\uB2C8\uB2E4!');
        closeModal();
        setTimeout(loadLetters, 1000);
    } catch (e) { alert('\uC804\uC1A1 \uC2E4\uD328'); }
}

// ========================================
// Comments (localStorage)
// ========================================
function getComments(letterKey) {
    try {
        var all = JSON.parse(localStorage.getItem('letterComments') || '{}');
        return all[letterKey] || [];
    } catch (e) { return []; }
}

function saveCommentData(letterKey, comment) {
    try {
        var all = JSON.parse(localStorage.getItem('letterComments') || '{}');
        if (!all[letterKey]) all[letterKey] = [];
        all[letterKey].push(comment);
        localStorage.setItem('letterComments', JSON.stringify(all));
    } catch (e) {}
}

function renderComments() {
    var list = document.getElementById('comment-list');
    if (!currentLetterKey) { list.innerHTML = ''; return; }

    var comments = getComments(currentLetterKey);
    if (!comments.length) {
        list.innerHTML = '<div class="no-comments">\uC544\uC9C1 \uB313\uAE00\uC774 \uC5C6\uC5B4\uC694</div>';
        return;
    }

    list.innerHTML = comments.map(function(c) {
        return '<div class="comment-item">' +
            '<div class="comment-header">' +
                '<span class="comment-author">' + esc(c.author) + '</span>' +
                '<span>' + formatDateTime(c.date) + '</span>' +
            '</div>' +
            '<div class="comment-text">' + esc(c.text) + '</div>' +
        '</div>';
    }).join('');
}

function addComment() {
    if (!currentLetterKey) return;
    var input = document.getElementById('comment-input');
    var text = input.value.trim();
    if (!text) return;

    var author = document.getElementById('comment-author').value;
    saveCommentData(currentLetterKey, {
        author: author,
        text: text,
        date: new Date().toISOString()
    });

    input.value = '';
    renderComments();
}

// ========================================
// Memories
// ========================================
async function loadMemories() {
    try {
        var res = await fetch(CONFIG.GOOGLE_SCRIPT_URL + '?action=getMemories');
        var memories = await res.json();
        var container = document.getElementById('timeline-container');

        if (!memories.length) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">\u2728</div><div class="empty-state-text">\uC544\uC9C1 \uCD94\uC5B5\uC774 \uC5C6\uC5B4\uC694</div></div>';
            return;
        }

        memories.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
        container.innerHTML = memories.map(function(m, i) {
            return '<div class="timeline-item" style="animation-delay:' + (i * 0.06) + 's">' +
                '<div class="timeline-dot"></div>' +
                '<div class="timeline-content glass">' +
                    '<div class="timeline-date">' + formatDate(m.date) + '</div>' +
                    '<div class="timeline-title">' + m.title + '</div>' +
                    '<div class="timeline-text">' + m.content + '</div>' +
                    (m.image ? '<img src="' + m.image + '" style="max-width:100%;border-radius:10px;margin-top:0.6rem">' : '') +
                '</div>' +
            '</div>';
        }).join('');
    } catch (e) {
        document.getElementById('timeline-container').innerHTML = '<div class="loading">\uCD94\uC5B5\uC744 \uBD88\uB7EC\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.</div>';
    }
}

async function saveMemory(data) {
    try {
        await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
            method: 'POST', mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'addMemory', data: data })
        });
        alert('\uCD94\uC5B5\uC774 \uC800\uC7A5\uB418\uC5C8\uC2B5\uB2C8\uB2E4!');
        closeModal();
        setTimeout(loadMemories, 1000);
    } catch (e) { alert('\uC800\uC7A5 \uC2E4\uD328'); }
}

// ========================================
// Date Plans (localStorage)
// ========================================
function loadDatePlans() {
    try { allDatePlans = JSON.parse(localStorage.getItem('datePlans') || '[]'); }
    catch (e) { allDatePlans = []; }
    displayDatePlans();

    fetch(CONFIG.GOOGLE_SCRIPT_URL + '?action=getDatePlans')
        .then(function(r) { return r.json(); })
        .then(function(plans) {
            if (Array.isArray(plans) && plans.length) {
                allDatePlans = plans;
                localStorage.setItem('datePlans', JSON.stringify(plans));
                displayDatePlans();
            }
        }).catch(function() {});
}

function saveDatePlansLocal() { localStorage.setItem('datePlans', JSON.stringify(allDatePlans)); }

function displayDatePlans() {
    var container = document.getElementById('dateplans-container');
    if (!allDatePlans.length) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">\uD83D\uDCC5</div><div class="empty-state-text">\uC544\uC9C1 \uB370\uC774\uD2B8 \uC77C\uC815\uC774 \uC5C6\uC5B4\uC694</div><div class="empty-state-sub">+ \uBC84\uD2BC\uC73C\uB85C \uCCAB \uB370\uC774\uD2B8\uB97C \uACC4\uD68D\uD574\uBCF4\uC138\uC694</div></div>';
        return;
    }

    var sorted = allDatePlans.slice().sort(function(a, b) { return new Date(a.date) - new Date(b.date); });
    var now = new Date(); now.setHours(0,0,0,0);

    container.innerHTML = sorted.map(function(plan, i) {
        var diff = Math.floor((new Date(plan.date) - now) / 86400000);
        var dday = diff > 0 ? 'D-' + diff : diff === 0 ? 'D-Day!' : 'D+' + Math.abs(diff);
        var courses = (plan.courses || []).map(function(c) {
            return '<div class="course-item">' +
                '<div class="course-time">' + (c.time || '') + '</div>' +
                '<div class="course-dot"></div>' +
                '<div class="course-detail"><div class="course-place">' + esc(c.place) + '</div>' + (c.desc ? '<div class="course-desc">' + esc(c.desc) + '</div>' : '') + '</div>' +
            '</div>';
        }).join('');
        var realIdx = allDatePlans.indexOf(plan);
        return '<div class="date-plan-card glass" style="animation:fadeUp 0.4s ease-out ' + (i * 0.06) + 's both">' +
            '<div class="date-plan-header">' +
                '<div class="date-plan-title">' + esc(plan.title) + '</div>' +
                '<div class="date-plan-meta"><span class="date-plan-date">' + formatDate(plan.date) + '</span><span class="date-plan-dday">' + dday + '</span></div>' +
            '</div>' +
            '<div class="course-list">' + courses + '</div>' +
            (plan.memo ? '<div class="course-memo">' + esc(plan.memo) + '</div>' : '') +
            '<div class="date-plan-actions">' +
                '<button type="button" class="btn-small" onclick="editDatePlan(' + realIdx + ')">\uC218\uC815</button>' +
                '<button type="button" class="btn-small btn-delete" onclick="deleteDatePlan(' + realIdx + ')">\uC0AD\uC81C</button>' +
            '</div>' +
        '</div>';
    }).join('');
}

function addDatePlan(data) {
    allDatePlans.push(data); saveDatePlansLocal(); displayDatePlans();
    fetch(CONFIG.GOOGLE_SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'addDatePlan', data: data }) }).catch(function() {});
}

function updateDatePlanData(index, data) {
    allDatePlans[index] = data; saveDatePlansLocal(); displayDatePlans();
}

function deleteDatePlan(index) {
    if (!confirm('\uC774 \uB370\uC774\uD2B8 \uC77C\uC815\uC744 \uC0AD\uC81C\uD560\uAE4C\uC694?')) return;
    allDatePlans.splice(index, 1); saveDatePlansLocal(); displayDatePlans();
}

function editDatePlan(index) {
    var plan = allDatePlans[index];
    editingPlanIndex = index;
    document.getElementById('dateplan-date').value = plan.date;
    document.getElementById('dateplan-title').value = plan.title;
    document.getElementById('dateplan-memo').value = plan.memo || '';

    var container = document.getElementById('course-inputs');
    var courses = plan.courses || [];
    if (!courses.length) { resetCourseInputs(); }
    else {
        container.innerHTML = courses.map(function(c) {
            return '<div class="course-input-row">' +
                '<input type="time" class="course-time-input" value="' + (c.time || '') + '">' +
                '<input type="text" class="course-place-input" placeholder="\uC7A5\uC18C" value="' + escAttr(c.place) + '" required>' +
                '<input type="text" class="course-desc-input" placeholder="\uC124\uBA85" value="' + escAttr(c.desc || '') + '">' +
                '<button type="button" class="btn-remove-course" onclick="removeCourseRow(this)">&times;</button>' +
            '</div>';
        }).join('');
    }
    document.getElementById('dateplan-modal').classList.add('active');
}

function addCourseRow() {
    var container = document.getElementById('course-inputs');
    var row = document.createElement('div');
    row.className = 'course-input-row';
    row.innerHTML = '<input type="time" class="course-time-input"><input type="text" class="course-place-input" placeholder="\uC7A5\uC18C" required><input type="text" class="course-desc-input" placeholder="\uC124\uBA85"><button type="button" class="btn-remove-course" onclick="removeCourseRow(this)">&times;</button>';
    container.appendChild(row);
    row.querySelector('.course-place-input').focus();
}

function removeCourseRow(btn) {
    var container = document.getElementById('course-inputs');
    if (container.children.length > 1) btn.closest('.course-input-row').remove();
}

// ========================================
// Form Handlers
// ========================================
function previewImage(input, previewId) {
    var preview = document.getElementById(previewId);
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = '<img src="' + e.target.result + '"><div class="remove-image" onclick="removeImage(\'' + input.id + '\',\'' + previewId + '\')">\uC81C\uAC70</div>';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function removeImage(inputId, previewId) {
    document.getElementById(inputId).value = '';
    document.getElementById(previewId).innerHTML = '';
}

async function getBase64(file) {
    return new Promise(function(resolve, reject) {
        var r = new FileReader();
        r.readAsDataURL(file);
        r.onload = function() { resolve(r.result); };
        r.onerror = function(e) { reject(e); };
    });
}

document.getElementById('letter-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    var btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = '\uC804\uC1A1 \uC911...';
    try {
        var img = document.getElementById('letter-image').files[0];
        await saveLetter({
            from: document.getElementById('letter-from').value,
            to: document.getElementById('letter-to').value,
            content: document.getElementById('letter-content').value,
            image: img ? await getBase64(img) : null,
            date: new Date().toISOString()
        });
    } catch (e) { alert('\uC804\uC1A1 \uC2E4\uD328'); }
    finally { btn.disabled = false; btn.textContent = '\uBCF4\uB0B4\uAE30'; }
});

document.getElementById('memory-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    var btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = '\uC800\uC7A5 \uC911...';
    try {
        var img = document.getElementById('memory-image').files[0];
        await saveMemory({
            date: document.getElementById('memory-date').value,
            title: document.getElementById('memory-title').value,
            content: document.getElementById('memory-content').value,
            image: img ? await getBase64(img) : null
        });
    } catch (e) { alert('\uC800\uC7A5 \uC2E4\uD328'); }
    finally { btn.disabled = false; btn.textContent = '\uC800\uC7A5'; }
});

document.getElementById('dateplan-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var courses = [];
    document.querySelectorAll('#course-inputs .course-input-row').forEach(function(row) {
        var place = row.querySelector('.course-place-input').value.trim();
        if (place) courses.push({
            time: row.querySelector('.course-time-input').value || '',
            place: place,
            desc: row.querySelector('.course-desc-input').value.trim()
        });
    });
    var data = {
        date: document.getElementById('dateplan-date').value,
        title: document.getElementById('dateplan-title').value,
        courses: courses,
        memo: document.getElementById('dateplan-memo').value.trim()
    };
    if (editingPlanIndex >= 0) { updateDatePlanData(editingPlanIndex, data); alert('\uC218\uC815\uB418\uC5C8\uC2B5\uB2C8\uB2E4!'); }
    else { addDatePlan(data); alert('\uB370\uC774\uD2B8 \uC77C\uC815\uC774 \uC800\uC7A5\uB418\uC5C8\uC2B5\uB2C8\uB2E4!'); }
    closeModal();
});

document.getElementById('letter-from').addEventListener('change', function(e) {
    var to = document.getElementById('letter-to');
    if (e.target.value === '\uC9C4\uD600') to.value = '\uC724\uC11C';
    else if (e.target.value === '\uC724\uC11C') to.value = '\uC9C4\uD600';
});

// Enter key for comment
document.getElementById('comment-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') { e.preventDefault(); addComment(); }
});

// ========================================
// Utilities
// ========================================
function formatDate(str) {
    return new Date(str).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatDateTime(str) {
    var d = new Date(str);
    return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

function escAttr(s) { return s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ========================================
// Init
// ========================================
function init() {
    createParticles();
    updateClocks();
    setInterval(updateClocks, 1000);
    updateCounters();
    setInterval(updateCounters, 60000);
    loadLetters();
    loadMemories();
    loadDatePlans();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
