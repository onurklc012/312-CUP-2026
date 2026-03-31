// ============================================================
// 312 CUP 2026 SEZONU — ADMİN PANELİ
// ============================================================

(function () {
    'use strict';

    const data = TOURNAMENT_DATA;
    const teams = data.teams;
    const fixtures = data.fixtures;

    // Admin password hash - default: "312cup2026"
    // SHA-256 hash will be compared
    const ADMIN_PASSWORD = 'aeCF186a';

    // Load saved data from localStorage (initial fallback)
    let adminResults = { ...data.results };
    let adminGoals = [...data.goals];

    const savedData = localStorage.getItem('312cup_admin_data');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            if (parsed.results) adminResults = parsed.results;
            if (parsed.goals) adminGoals = parsed.goals;
        } catch (e) { /* ignore */ }
    }

    // Initialize Firebase
    let adminFirebaseReady = false;
    if (typeof initFirebase === 'function') {
        adminFirebaseReady = initFirebase();
    }

    // Load data from Firebase (overrides localStorage)
    function loadFromFirebase(callback) {
        if (!adminFirebaseReady || typeof firebaseReadData !== 'function') {
            if (callback) callback();
            return;
        }
        firebaseReadData(function(fbData) {
            if (fbData) {
                if (fbData.results) adminResults = fbData.results;
                if (fbData.goals) adminGoals = Array.isArray(fbData.goals) ? fbData.goals : Object.values(fbData.goals);
                // Also update localStorage
                localStorage.setItem('312cup_admin_data', JSON.stringify({
                    results: adminResults,
                    goals: adminGoals
                }));
            }
            if (callback) callback();
        });
    }

    // ── Login ──
    window.adminLogin = function () {
        const input = document.getElementById('passwordInput');
        const error = document.getElementById('loginError');
        const password = input.value.trim();

        if (password === ADMIN_PASSWORD) {
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('adminDashboard').style.display = 'block';
            sessionStorage.setItem('312cup_admin_auth', 'true');
            // Load latest from Firebase then render
            loadFromFirebase(function() {
                renderAdminContent();
            });
        } else {
            error.style.display = 'block';
            input.style.borderColor = '#ff6b6b';
            setTimeout(() => {
                error.style.display = 'none';
                input.style.borderColor = '';
            }, 3000);
        }
    };

    // Enter key to login
    document.getElementById('passwordInput')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') window.adminLogin();
    });

    // Auto-login if session is active
    if (sessionStorage.getItem('312cup_admin_auth') === 'true') {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        loadFromFirebase(function() {
            renderAdminContent();
        });
    }

    window.adminLogout = function () {
        sessionStorage.removeItem('312cup_admin_auth');
        location.reload();
    };

    // ── Render Admin Content ──
    function renderAdminContent() {
        const container = document.getElementById('adminContent');
        if (!container) return;

        // Group fixtures by week
        const weeks = {};
        fixtures.forEach(m => {
            if (!weeks[m.week]) weeks[m.week] = [];
            weeks[m.week].push(m);
        });

        let html = '';

        Object.keys(weeks).sort((a, b) => a - b).forEach(w => {
            html += `<h2 class="admin-week-header">📅 Hafta ${w}</h2>`;

            weeks[w].forEach(match => {
                const homeTeam = teams[match.home];
                const awayTeam = teams[match.away];
                if (!homeTeam || !awayTeam) return;

                const r = adminResults[match.id];
                const matchGoals = adminGoals.filter(g => g.matchId === match.id);

                const homeScore = r && r.played ? r.homeScore : '';
                const awayScore = r && r.played ? r.awayScore : '';

                const dateStr = formatDateShort(match.date);

                html += `
                <div class="admin-match-card" id="match-card-${match.id}">
                    <h3>📅 ${dateStr} — ⏰ ${match.time} | Hafta ${match.week}</h3>
                    
                    <div class="admin-match-header">
                        <div class="admin-match-team">
                            ${teamBadgeSmall(match.home)}
                            <div style="margin-top:6px;">${homeTeam.name}</div>
                            <div style="font-size:11px; color:var(--text-muted);">🟡 Ev Sahibi</div>
                        </div>
                        
                        <div style="display:flex; align-items:center; gap:8px;">
                            <input type="number" class="admin-score-input" 
                                   id="home-score-${match.id}" 
                                   value="${homeScore}" min="0" max="99"
                                   placeholder="-">
                            <span class="admin-vs">—</span>
                            <input type="number" class="admin-score-input" 
                                   id="away-score-${match.id}" 
                                   value="${awayScore}" min="0" max="99"
                                   placeholder="-">
                        </div>
                        
                        <div class="admin-match-team">
                            ${teamBadgeSmall(match.away)}
                            <div style="margin-top:6px;">${awayTeam.name}</div>
                            <div style="font-size:11px; color:var(--text-muted);">🔴 Deplasman</div>
                        </div>
                    </div>

                    <div class="admin-goals-section">
                        <h4>⚽ Gol Atanlar</h4>
                        <div id="goals-list-${match.id}">
                            ${renderGoalRows(match.id, matchGoals, match.home, match.away)}
                        </div>
                        <button class="admin-add-goal-btn" onclick="addGoalRow(${match.id}, '${match.home}', '${match.away}')">
                            ➕ Gol Ekle
                        </button>
                    </div>

                    <div style="display:flex; gap:8px; margin-top:16px; flex-wrap:wrap;">
                        <button class="admin-btn admin-save-match" onclick="saveMatch(${match.id}, '${match.home}', '${match.away}')">
                            💾 Kaydet
                        </button>
                        ${r && r.played ? `<button class="admin-btn admin-btn-danger admin-save-match" onclick="clearMatch(${match.id})">
                            🗑️ Sonucu Sil
                        </button>` : ''}
                    </div>
                </div>`;
            });
        });

        container.innerHTML = html;
    }

    // ── Team badge for admin ──
    function teamBadgeSmall(teamId) {
        const team = teams[teamId];
        if (!team) return '';
        return `<div class="team-badge" style="background-color:${team.color}; width:45px; height:45px; font-size:14px;">
            <img src="${team.logo}" alt="${team.name}" 
                 style="width:100%;height:100%;border-radius:50%;object-fit:cover;"
                 onerror="this.style.display='none'; this.parentElement.textContent='${team.shortName}';">
        </div>`;
    }

    // ── Render Goal Rows ──
    function renderGoalRows(matchId, goalsList, homeId, awayId) {
        if (goalsList.length === 0) return '<p style="font-size:13px; color:var(--text-muted); margin:8px 0;">Henüz gol eklenmedi</p>';

        let html = '';
        goalsList.forEach((goal, index) => {
            html += `<div class="admin-goal-row" id="goal-row-${matchId}-${index}">
                <input type="text" name="player" placeholder="Oyuncu adı" value="${goal.player || ''}" 
                       data-match="${matchId}" data-index="${index}">
                <select name="team" data-match="${matchId}" data-index="${index}">
                    <option value="${homeId}" ${goal.teamId === homeId ? 'selected' : ''}>${teams[homeId].name}</option>
                    <option value="${awayId}" ${goal.teamId === awayId ? 'selected' : ''}>${teams[awayId].name}</option>
                </select>
                <input type="number" name="minute" placeholder="dk" value="${goal.minute || ''}" min="1" max="90"
                       data-match="${matchId}" data-index="${index}">
                <button class="admin-goal-remove" onclick="removeGoalRow(${matchId}, ${index}, '${homeId}', '${awayId}')">✕</button>
            </div>`;
        });
        return html;
    }

    // ── Add Goal Row ──
    let goalCounters = {};
    window.addGoalRow = function (matchId, homeId, awayId) {
        const container = document.getElementById(`goals-list-${matchId}`);
        if (!container) return;

        // Remove "no goals" message
        const noGoalMsg = container.querySelector('p');
        if (noGoalMsg) noGoalMsg.remove();

        const matchGoals = adminGoals.filter(g => g.matchId === matchId);
        const index = matchGoals.length;

        // Add a temporary goal entry
        adminGoals.push({ matchId, player: '', teamId: homeId, minute: null });

        const row = document.createElement('div');
        row.className = 'admin-goal-row';
        row.id = `goal-row-${matchId}-${index}`;
        row.innerHTML = `
            <input type="text" name="player" placeholder="Oyuncu adı" value="" 
                   data-match="${matchId}" data-index="${index}">
            <select name="team" data-match="${matchId}" data-index="${index}">
                <option value="${homeId}">${teams[homeId].name}</option>
                <option value="${awayId}">${teams[awayId].name}</option>
            </select>
            <input type="number" name="minute" placeholder="dk" value="" min="1" max="90"
                   data-match="${matchId}" data-index="${index}">
            <button class="admin-goal-remove" onclick="removeGoalRow(${matchId}, ${index}, '${homeId}', '${awayId}')">✕</button>
        `;
        container.appendChild(row);

        // Focus the player name input
        row.querySelector('input[name="player"]').focus();
    };

    // ── Remove Goal Row ──
    window.removeGoalRow = function (matchId, index, homeId, awayId) {
        const matchGoals = adminGoals.filter(g => g.matchId === matchId);
        if (index < matchGoals.length) {
            const globalIndex = adminGoals.indexOf(matchGoals[index]);
            if (globalIndex > -1) adminGoals.splice(globalIndex, 1);
        }

        // Re-render goals for this match
        const container = document.getElementById(`goals-list-${matchId}`);
        if (container) {
            const newMatchGoals = adminGoals.filter(g => g.matchId === matchId);
            container.innerHTML = renderGoalRows(matchId, newMatchGoals, homeId, awayId);
        }
    };

    // ── Save Match ──
    window.saveMatch = function (matchId, homeId, awayId) {
        const homeScoreEl = document.getElementById(`home-score-${matchId}`);
        const awayScoreEl = document.getElementById(`away-score-${matchId}`);

        const homeScore = homeScoreEl.value.trim();
        const awayScore = awayScoreEl.value.trim();

        if (homeScore === '' || awayScore === '') {
            showToast('Lütfen her iki takımın skorunu da girin!', 'error');
            return;
        }

        // Save result
        adminResults[matchId] = {
            homeScore: parseInt(homeScore),
            awayScore: parseInt(awayScore),
            played: true
        };

        // Collect goals from the form
        const goalsContainer = document.getElementById(`goals-list-${matchId}`);
        const goalRows = goalsContainer.querySelectorAll('.admin-goal-row');

        // Remove old goals for this match
        adminGoals = adminGoals.filter(g => g.matchId !== matchId);

        // Add new goals from form
        goalRows.forEach(row => {
            const playerInput = row.querySelector('input[name="player"]');
            const teamSelect = row.querySelector('select[name="team"]');
            const minuteInput = row.querySelector('input[name="minute"]');

            const player = playerInput.value.trim();
            if (player) {
                adminGoals.push({
                    matchId: matchId,
                    player: player,
                    teamId: teamSelect.value,
                    minute: minuteInput.value ? parseInt(minuteInput.value) : null
                });
            }
        });

        // Save to localStorage
        saveToLocalStorage();
        showToast('✅ Maç sonucu kaydedildi!', 'success');

        // Re-render to update the "Sonucu Sil" button
        renderAdminContent();
    };

    // ── Clear Match ──
    const pendingDeletes = {};
    window.clearMatch = function (matchId) {
        // Two-step confirmation: first click = "Emin misin?", second click = delete
        if (!pendingDeletes[matchId]) {
            pendingDeletes[matchId] = true;
            // Change button text to confirm
            const card = document.getElementById('match-card-' + matchId);
            if (card) {
                const delBtn = card.querySelector('.admin-btn-danger');
                if (delBtn) {
                    delBtn.innerHTML = '⚠️ Emin misin? Tekrar tıkla!';
                    delBtn.style.background = '#ff3333';
                    delBtn.style.color = '#fff';
                }
            }
            // Reset after 3 seconds if not confirmed
            setTimeout(() => {
                pendingDeletes[matchId] = false;
                const card2 = document.getElementById('match-card-' + matchId);
                if (card2) {
                    const delBtn2 = card2.querySelector('.admin-btn-danger');
                    if (delBtn2) {
                        delBtn2.innerHTML = '🗑️ Sonucu Sil';
                        delBtn2.style.background = '';
                        delBtn2.style.color = '';
                    }
                }
            }, 3000);
            return;
        }

        // Second click — actually delete
        pendingDeletes[matchId] = false;

        // Delete with both string and number keys to handle type mismatch
        delete adminResults[matchId];
        delete adminResults[String(matchId)];
        delete adminResults[Number(matchId)];

        // Use loose equality for goal filtering (handles string/number mismatch)
        adminGoals = adminGoals.filter(g => g.matchId != matchId);

        saveToLocalStorage();
        showToast('🗑️ Maç sonucu silindi!', 'success');

        // Force clear the score inputs before re-render
        const homeInput = document.getElementById('home-score-' + matchId);
        const awayInput = document.getElementById('away-score-' + matchId);
        if (homeInput) homeInput.value = '';
        if (awayInput) awayInput.value = '';

        renderAdminContent();
    };

    // ── Save to localStorage + Firebase ──
    function saveToLocalStorage() {
        const dataToSave = {
            results: adminResults,
            goals: adminGoals
        };
        // Always save to localStorage (fallback)
        localStorage.setItem('312cup_admin_data', JSON.stringify(dataToSave));

        // Also push to Firebase for real-time sync
        if (adminFirebaseReady && typeof firebaseSaveData === 'function') {
            firebaseSaveData(adminResults, adminGoals)
                .then(success => {
                    if (success) {
                        showToast('☁️ Firebase\'e sınkronize edildi!', 'success');
                    }
                });
        }
    }

    // ── Export Data ──
    window.exportData = function () {
        // Collect all current form data first
        fixtures.forEach(match => {
            const homeScoreEl = document.getElementById(`home-score-${match.id}`);
            const awayScoreEl = document.getElementById(`away-score-${match.id}`);

            if (homeScoreEl && awayScoreEl) {
                const h = homeScoreEl.value.trim();
                const a = awayScoreEl.value.trim();
                if (h !== '' && a !== '') {
                    adminResults[match.id] = {
                        homeScore: parseInt(h),
                        awayScore: parseInt(a),
                        played: true
                    };

                    // Collect goals
                    const goalsContainer = document.getElementById(`goals-list-${match.id}`);
                    if (goalsContainer) {
                        const goalRows = goalsContainer.querySelectorAll('.admin-goal-row');
                        // Remove old
                        adminGoals = adminGoals.filter(g => g.matchId !== match.id);
                        goalRows.forEach(row => {
                            const player = row.querySelector('input[name="player"]')?.value.trim();
                            const teamId = row.querySelector('select[name="team"]')?.value;
                            const minute = row.querySelector('input[name="minute"]')?.value;
                            if (player) {
                                adminGoals.push({
                                    matchId: match.id,
                                    player,
                                    teamId,
                                    minute: minute ? parseInt(minute) : null
                                });
                            }
                        });
                    }
                }
            }
        });

        saveToLocalStorage();

        // Generate data.js content
        const resultsStr = JSON.stringify(adminResults, null, 8);
        const goalsStr = JSON.stringify(adminGoals, null, 8);

        const output = `// ============================================================
// 312 CUP 2026 SEZONU — TURNUVA VERİLERİ
// Son güncelleme: ${new Date().toLocaleString('tr-TR')}
// ============================================================

const TOURNAMENT_DATA = {
    teams: ${JSON.stringify(data.teams, null, 8)},

    fixtures: ${JSON.stringify(data.fixtures, null, 8)},

    results: ${resultsStr},

    goals: ${goalsStr},

    rules: ${JSON.stringify(data.rules, null, 8)}
};
`;

        // Download as file
        const blob = new Blob([output], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('📥 data.js indirildi! GitHub\'a push edin.', 'success');
    };

    // ── Toast Notification ──
    function showToast(message, type = 'success') {
        const toast = document.getElementById('adminToast');
        if (!toast) return;
        toast.textContent = message;
        toast.className = `admin-toast ${type} show`;
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3500);
    }

    // ── Helper: Format date ──
    function formatDateShort(dateStr) {
        const d = new Date(dateStr + 'T00:00:00');
        return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
    }

})();
