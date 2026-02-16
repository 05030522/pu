// ========================================
// 설정 (Google Sheets 연동)
// ========================================

// TODO: 아래 값들을 실제 값으로 변경하세요
const CONFIG = {
    // Google Apps Script Web App URL (배포 후 받은 URL)
    GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwVeFO-ff878DmptANdbNJ2dxXkRLcA3v0brP7o1YPVHmWznqlCIAGkhtz-xLsUA9XK/exec',
    
    // 시작 날짜 (만난 날)
    START_DATE: '2025-09-26', // YYYY-MM-DD 형식으로 변경하세요
    
    // 다음 만남 날짜
    NEXT_MEET_DATE: '2026-02-28', // YYYY-MM-DD 형식으로 변경하세요
};

// ========================================
// 시간대 시계
// ========================================

function updateClocks() {
    const now = new Date();
    
    // 서울 시간 (KST, UTC+9)
    const seoulTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const seoulTimeStr = seoulTime.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
    });
    const seoulDateStr = seoulTime.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    });
    
    // 런던 시간 (GMT/BST, UTC+0 또는 UTC+1)
    const londonTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/London' }));
    const londonTimeStr = londonTime.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
    });
    const londonDateStr = londonTime.toLocaleDateString('en-GB', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    });
    
    document.getElementById('seoul-time').textContent = seoulTimeStr;
    document.getElementById('seoul-date').textContent = seoulDateStr;
    document.getElementById('london-time').textContent = londonTimeStr;
    document.getElementById('london-date').textContent = londonDateStr;
}

// ========================================
// D-Day 카운터
// ========================================

function updateCounters() {
    const now = new Date();
    const startDate = new Date(CONFIG.START_DATE);
    const nextMeetDate = new Date(CONFIG.NEXT_MEET_DATE);
    
    // 함께한 시간 계산
    const daysTogether = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    document.getElementById('together-days').textContent = `${daysTogether.toLocaleString()}일`;
    
    // 다음 만남까지 계산
    const daysUntilMeet = Math.floor((nextMeetDate - now) / (1000 * 60 * 60 * 24));
    if (daysUntilMeet > 0) {
        document.getElementById('next-meet').textContent = `D-${daysUntilMeet}`;
    } else if (daysUntilMeet === 0) {
        document.getElementById('next-meet').textContent = 'D-Day!';
    } else {
        document.getElementById('next-meet').textContent = `D+${Math.abs(daysUntilMeet)}`;
    }
}

// ========================================
// 네비게이션
// ========================================

function showSection(sectionName) {
    // 모든 섹션 숨기기
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // 모든 탭 비활성화
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 선택한 섹션 표시
    document.getElementById(`${sectionName}-section`).classList.add('active');
    
    // 선택한 탭 활성화
    event.target.classList.add('active');
}

// ========================================
// 모달 관리
// ========================================

function openModal(type) {
    if (type === 'letter') {
        document.getElementById('letter-modal').classList.add('active');
    } else if (type === 'memory') {
        document.getElementById('memory-modal').classList.add('active');
    }
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    
    // 폼 초기화
    document.getElementById('letter-form').reset();
    document.getElementById('memory-form').reset();
}

// 모달 외부 클릭시 닫기
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
});

// ========================================
// Google Sheets 연동 함수
// ========================================

// 편지 불러오기
async function loadLetters() {
    try {
        const response = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?action=getLetters`);
        const letters = await response.json();
        
        const container = document.getElementById('letters-container');
        
        if (letters.length === 0) {
            container.innerHTML = '<div class="loading">아직 편지가 없습니다. 첫 편지를 써보세요! 💌</div>';
            return;
        }
        
        container.innerHTML = letters.map(letter => `
            <div class="letter-card" style="animation-delay: ${Math.random() * 0.3}s">
                <div class="letter-from">From: ${letter.from}</div>
                <div class="letter-date">${formatDate(letter.date)}</div>
                <div class="letter-content">${letter.content}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('편지 불러오기 실패:', error);
        document.getElementById('letters-container').innerHTML = 
            '<div class="loading">편지를 불러올 수 없습니다. 구글 시트 설정을 확인해주세요.</div>';
    }
}

// 편지 저장하기
async function saveLetter(letterData) {
    try {
        const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'addLetter',
                data: letterData
            })
        });
        
        // no-cors 모드에서는 응답을 읽을 수 없으므로 성공으로 가정
        alert('편지가 전송되었습니다! 💌');
        closeModal();
        
        // 잠시 후 편지 목록 새로고침
        setTimeout(loadLetters, 1000);
    } catch (error) {
        console.error('편지 저장 실패:', error);
        alert('편지 전송에 실패했습니다. 다시 시도해주세요.');
    }
}

// 추억 불러오기
async function loadMemories() {
    try {
        const response = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?action=getMemories`);
        const memories = await response.json();
        
        const container = document.getElementById('timeline-container');
        
        if (memories.length === 0) {
            container.innerHTML = '<div class="loading">아직 추억이 없습니다. 특별한 순간을 기록해보세요! ✨</div>';
            return;
        }
        
        // 날짜순 정렬 (최신순)
        memories.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        container.innerHTML = memories.map((memory, index) => `
            <div class="timeline-item" style="animation-delay: ${index * 0.1}s">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <div class="timeline-date">${formatDate(memory.date)}</div>
                    <div class="timeline-title">${memory.title}</div>
                    <div class="timeline-text">${memory.content}</div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('추억 불러오기 실패:', error);
        document.getElementById('timeline-container').innerHTML = 
            '<div class="loading">추억을 불러올 수 없습니다. 구글 시트 설정을 확인해주세요.</div>';
    }
}

// 추억 저장하기
async function saveMemory(memoryData) {
    try {
        const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'addMemory',
                data: memoryData
            })
        });
        
        alert('추억이 저장되었습니다! ✨');
        closeModal();
        
        // 잠시 후 추억 목록 새로고침
        setTimeout(loadMemories, 1000);
    } catch (error) {
        console.error('추억 저장 실패:', error);
        alert('추억 저장에 실패했습니다. 다시 시도해주세요.');
    }
}

// ========================================
// 폼 제출 처리
// ========================================

document.getElementById('letter-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const letterData = {
        from: document.getElementById('letter-from').value,
        to: document.getElementById('letter-to').value,
        content: document.getElementById('letter-content').value,
        date: new Date().toISOString()
    };
    
    saveLetter(letterData);
});

document.getElementById('memory-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const memoryData = {
        date: document.getElementById('memory-date').value,
        title: document.getElementById('memory-title').value,
        content: document.getElementById('memory-content').value
    };
    
    saveMemory(memoryData);
});

// ========================================
// 유틸리티 함수
// ========================================

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// ========================================
// 초기화
// ========================================

function init() {
    // 시계 시작
    updateClocks();
    setInterval(updateClocks, 1000);
    
    // 카운터 업데이트
    updateCounters();
    setInterval(updateCounters, 60000); // 1분마다
    
    // 데이터 로드
    loadLetters();
    loadMemories();
    
    // 추억 추가 버튼 이벤트 (옵션: 더블클릭으로 추억 추가 모달 열기)
    document.getElementById('memories-section').addEventListener('dblclick', () => {
        openModal('memory');
    });
}

// 페이지 로드 완료시 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ========================================
// 보내는 사람에 따라 받는 사람 자동 설정
// ========================================

document.getElementById('letter-from').addEventListener('change', (e) => {
    const from = e.target.value;
    const toSelect = document.getElementById('letter-to');
    
    if (from === '진혁') {
        toSelect.value = '윤서';
    } else if (from === '윤서') {
        toSelect.value = '진혁';
    }
});