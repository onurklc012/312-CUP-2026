// ============================================================
// 312 CUP 2026 SEZONU — ANA UYGULAMA
// ============================================================

(function () {
    'use strict';

    const data = TOURNAMENT_DATA;
    const teams = data.teams;
    const fixtures = data.fixtures;

    // Merge localStorage data if available (for admin preview)
    let results = { ...data.results };
    let goals = [...data.goals];

    function loadLocalData() {
        const savedData = localStorage.getItem('312cup_admin_data');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.results) results = parsed.results;
                if (parsed.goals) goals = parsed.goals;
                return true;
            } catch (e) { /* ignore */ }
        }
        return false;
    }
    loadLocalData();

    // Refresh all rendered sections with current data
    function refreshAllSections() {
        renderHeroTeams();
        renderStandings();
        renderFixtures();
        renderTopScorers();
        initNextMatch();
    }

    // ── Helper: Format date ──
    function formatDate(dateStr) {
        const d = new Date(dateStr + 'T00:00:00');
        const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
            'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }

    function formatDateShort(dateStr) {
        const d = new Date(dateStr + 'T00:00:00');
        return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
    }

    // ── Helper: Team badge HTML ──
    function teamBadge(teamId, sizeClass = '') {
        const team = teams[teamId];
        if (!team) return '';
        const cls = sizeClass ? `team-badge ${sizeClass}` : 'team-badge';
        return `<div class="${cls}" style="background-color: ${team.color};" title="${team.name}">
            <img src="${team.logo}" alt="${team.name}" 
                 style="width:100%;height:100%;border-radius:50%;object-fit:cover;"
                 onerror="this.style.display='none'; this.parentElement.textContent='${team.shortName}';">
        </div>`;
    }

    // ══════════════════════════════════════════════
    //  INTRO ANIMATION — CHAMPIONS LEAGUE STAR BALL
    // ══════════════════════════════════════════════
    function playIntroAnimation() {
        const overlay = document.getElementById('introOverlay');
        const particlesContainer = document.getElementById('introParticles');
        const logosRing = document.getElementById('introLogosRing');
        const flash = document.getElementById('introFlash');

        if (!overlay || !logosRing) {
            startMusic();
            const btn = document.getElementById('musicToggle');
            if (btn) btn.style.display = 'flex';
            return;
        }

        // Start music on FIRST user interaction (click/touch anywhere)
        // This satisfies browser autoplay policy
        const startMusicOnInteraction = () => {
            startMusic();
            document.removeEventListener('click', startMusicOnInteraction);
            document.removeEventListener('touchstart', startMusicOnInteraction);
        };
        document.addEventListener('click', startMusicOnInteraction, { once: true });
        document.addEventListener('touchstart', startMusicOnInteraction, { once: true });

        // Block scroll during intro
        document.body.style.overflow = 'hidden';

        const w = window.innerWidth;
        const h = window.innerHeight;

        // ── Phase 1: Create floating gold particles ──
        if (particlesContainer) {
            for (let i = 0; i < 35; i++) {
                const p = document.createElement('div');
                p.className = 'intro-particle';
                const size = 3 + Math.random() * 6;
                p.style.width = size + 'px';
                p.style.height = size + 'px';
                p.style.left = (Math.random() * 100) + '%';
                p.style.top = (Math.random() * 100) + '%';
                p.style.setProperty('--dur', (2 + Math.random() * 4) + 's');
                p.style.setProperty('--delay', (Math.random() * 3) + 's');
                p.style.setProperty('--drift', (-20 - Math.random() * 40) + 'px');
                particlesContainer.appendChild(p);
            }
        }

        // ── Phase 2: Add golden ring border ──
        const goldenRing = document.createElement('div');
        goldenRing.className = 'intro-golden-ring';
        logosRing.parentElement.insertBefore(goldenRing, logosRing);

        // ── Phase 3: Create team logos that fly in → ring positions ──
        const teamKeys = Object.keys(teams);
        const numTeams = teamKeys.length;
        const ringRadius = 155; // distance from center

        teamKeys.forEach((teamId, i) => {
            const team = teams[teamId];
            const angle = (i / numTeams) * Math.PI * 2 - Math.PI / 2;

            // Final position on ring (relative to ring center)
            const finalX = (ringRadius * Math.cos(angle)) + 180 - 36; // center of 360px ring - half logo
            const finalY = (ringRadius * Math.sin(angle)) + 180 - 36;

            // Random start direction (far off screen)
            const directions = [
                { x: -(w / 2 + 200), y: -(h / 2 + 200) },   // top-left
                { x: (w / 2 + 200), y: -(h / 2 + 200) },     // top-right
                { x: -(w / 2 + 200), y: (h / 2 + 200) },     // bottom-left
                { x: (w / 2 + 200), y: (h / 2 + 200) },      // bottom-right
                { x: 0, y: -(h / 2 + 300) },                  // top
            ];
            const dir = directions[i % directions.length];

            const logoEl = document.createElement('div');
            logoEl.className = 'intro-flying-logo';
            logoEl.style.left = finalX + 'px';
            logoEl.style.top = finalY + 'px';

            // Start position (offset from final)
            logoEl.style.setProperty('--start-x', dir.x + 'px');
            logoEl.style.setProperty('--start-y', dir.y + 'px');
            logoEl.style.setProperty('--start-rot', (540 + Math.random() * 360) + 'deg');
            logoEl.style.setProperty('--fly-duration', '2.2s');
            logoEl.style.setProperty('--fly-delay', (0.3 + i * 0.35) + 's');

            const img = document.createElement('img');
            img.src = team.logo;
            img.alt = team.name;
            logoEl.appendChild(img);

            logosRing.appendChild(logoEl);

            // Trigger animation
            requestAnimationFrame(() => {
                logoEl.classList.add('animating');
            });

            // Add sparkles when logo arrives
            const arrivalTime = (0.3 + i * 0.35 + 2.2) * 1000;
            setTimeout(() => {
                for (let s = 0; s < 5; s++) {
                    const sparkle = document.createElement('span');
                    sparkle.className = 'intro-sparkle';
                    sparkle.textContent = '✦';
                    sparkle.style.left = (finalX + 36 + (Math.random() - 0.5) * 60) + 'px';
                    sparkle.style.top = (finalY + 36 + (Math.random() - 0.5) * 60) + 'px';
                    sparkle.style.setProperty('--sparkle-dur', (0.5 + Math.random() * 0.5) + 's');
                    sparkle.style.setProperty('--sparkle-delay', (Math.random() * 0.3) + 's');
                    sparkle.style.fontSize = (10 + Math.random() * 8) + 'px';
                    logosRing.appendChild(sparkle);
                }
            }, arrivalTime);
        });

        // ── Phase 4: Start music ──
        setTimeout(() => {
            startMusic();
        }, 500);

        // ── Phase 5: Flash and reveal ──
        const lastLogoArrival = (0.3 + (numTeams - 1) * 0.35 + 2.2) * 1000;
        const flashTime = lastLogoArrival + 1200;

        setTimeout(() => {
            if (flash) flash.classList.add('active');
        }, flashTime);

        // ── Phase 6: Fade out overlay ──
        setTimeout(() => {
            overlay.classList.add('fade-out');
            document.body.style.overflow = '';

            const musicToggle = document.getElementById('musicToggle');
            if (musicToggle) musicToggle.style.display = 'flex';
        }, flashTime + 600);

        // ── Phase 7: Remove from DOM ──
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, flashTime + 1800);
    }

    // ── Start Music ──
    function startMusic() {
        const audio = document.getElementById('bgMusic');
        const toggleBtn = document.getElementById('musicToggle');
        const icon = document.getElementById('musicIcon');
        if (!audio) return;

        audio.currentTime = 115; // 1:55
        audio.volume = 0.6;     // %60

        // Auto-play
        audio.play().then(() => {
            if (icon) icon.textContent = '🔊';
            if (toggleBtn) toggleBtn.classList.add('playing');
            window._musicPlaying = true;
        }).catch(() => {
            // Autoplay blocked — will try on first user interaction
            if (icon) icon.textContent = '🔇';
            window._musicPlaying = false;

            const tryPlay = () => {
                audio.currentTime = 115;
                audio.volume = 0.6;
                audio.play().then(() => {
                    if (icon) icon.textContent = '🔊';
                    if (toggleBtn) toggleBtn.classList.add('playing');
                    window._musicPlaying = true;
                    document.removeEventListener('click', tryPlay);
                    document.removeEventListener('touchstart', tryPlay);
                }).catch(() => { });
            };
            document.addEventListener('click', tryPlay, { once: false });
            document.addEventListener('touchstart', tryPlay, { once: false });
        });

        // Custom loop from 1:55
        audio.addEventListener('ended', function () {
            audio.currentTime = 115;
            audio.play();
        });
    }

    // ── Music Toggle Button ──
    function initMusicToggle() {
        const audio = document.getElementById('bgMusic');
        const toggleBtn = document.getElementById('musicToggle');
        const icon = document.getElementById('musicIcon');
        if (!audio || !toggleBtn) return;

        toggleBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (window._musicPlaying) {
                audio.pause();
                window._musicPlaying = false;
                icon.textContent = '🔇';
                toggleBtn.classList.remove('playing');
            } else {
                audio.currentTime = audio.currentTime < 115 ? 115 : audio.currentTime;
                audio.volume = 0.6;
                audio.play().then(() => {
                    window._musicPlaying = true;
                    icon.textContent = '🔊';
                    toggleBtn.classList.add('playing');
                }).catch(() => { });
            }
        });
    }

    // ══════════════════════════════════════════════
    //  MAIN APP LOGIC
    // ══════════════════════════════════════════════

    // ── Calculate Standings ──
    function calculateStandings() {
        const table = {};
        Object.keys(teams).forEach(id => {
            table[id] = { id, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
        });

        fixtures.forEach(match => {
            const r = results[match.id];
            if (!r || !r.played) return;
            const home = table[match.home];
            const away = table[match.away];
            if (!home || !away) return;

            home.played++;
            away.played++;
            home.goalsFor += r.homeScore;
            home.goalsAgainst += r.awayScore;
            away.goalsFor += r.awayScore;
            away.goalsAgainst += r.homeScore;

            if (r.homeScore > r.awayScore) {
                home.won++; home.points += 3;
                away.lost++;
            } else if (r.homeScore < r.awayScore) {
                away.won++; away.points += 3;
                home.lost++;
            } else {
                home.drawn++; home.points += 1;
                away.drawn++; away.points += 1;
            }
        });

        return Object.values(table).sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            const avA = a.goalsFor - a.goalsAgainst;
            const avB = b.goalsFor - b.goalsAgainst;
            if (avB !== avA) return avB - avA;
            return b.goalsFor - a.goalsFor;
        });
    }

    // ── Render Standings ──
    function renderStandings() {
        const standings = calculateStandings();
        const container = document.getElementById('standingsTable');
        if (!container) return;

        let html = `<table class="standings-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Takım</th>
                    <th>O</th>
                    <th>G</th>
                    <th>B</th>
                    <th>M</th>
                    <th class="hide-mobile">AG</th>
                    <th class="hide-mobile">YG</th>
                    <th>AV</th>
                    <th>P</th>
                </tr>
            </thead>
            <tbody>`;

        standings.forEach((row, i) => {
            const team = teams[row.id];
            const rank = i + 1;
            const av = row.goalsFor - row.goalsAgainst;
            const avStr = av > 0 ? `+${av}` : av.toString();
            const rankClass = rank <= 3 ? `rank-${rank}` : '';
            const leaderClass = rank === 1 ? 'leader' : '';

            html += `<tr class="${leaderClass}">
                <td><span class="standings-rank ${rankClass}">${rank}</span></td>
                <td>
                    <div class="standings-team">
                        ${teamBadge(row.id)}
                        <span class="standings-team-name">${team.name}</span>
                    </div>
                </td>
                <td>${row.played}</td>
                <td>${row.won}</td>
                <td>${row.drawn}</td>
                <td>${row.lost}</td>
                <td class="hide-mobile">${row.goalsFor}</td>
                <td class="hide-mobile">${row.goalsAgainst}</td>
                <td>${avStr}</td>
                <td class="standings-points">${row.points}</td>
            </tr>`;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    }

    // ── Render Fixtures ──
    function renderFixtures() {
        const tabsEl = document.getElementById('weekTabs');
        const contentsEl = document.getElementById('weekContents');
        if (!tabsEl || !contentsEl) return;

        const weeks = {};
        fixtures.forEach(m => {
            if (!weeks[m.week]) weeks[m.week] = [];
            weeks[m.week].push(m);
        });

        let activeWeek = 1;
        const now = new Date();
        Object.keys(weeks).forEach(w => {
            const weekMatches = weeks[w];
            const hasUnplayed = weekMatches.some(m => !results[m.id] || !results[m.id].played);
            if (hasUnplayed) {
                const matchDate = new Date(weekMatches[0].date + 'T' + weekMatches[0].time + ':00');
                if (matchDate >= now || !activeWeek) {
                    activeWeek = parseInt(w);
                }
            }
        });
        const allPlayed = fixtures.every(m => results[m.id] && results[m.id].played);
        if (allPlayed) activeWeek = Math.max(...Object.keys(weeks).map(Number));

        const firstMatch = new Date(fixtures[0].date + 'T' + fixtures[0].time + ':00');
        if (now < firstMatch && !allPlayed) activeWeek = 1;

        let tabsHtml = '';
        let contentsHtml = '';

        Object.keys(weeks).sort((a, b) => a - b).forEach(w => {
            const isActive = parseInt(w) === activeWeek;
            tabsHtml += `<button class="week-tab ${isActive ? 'active' : ''}" 
                          data-week="${w}" onclick="switchWeek(${w})">
                          Hafta ${w}
                         </button>`;

            contentsHtml += `<div class="week-content ${isActive ? 'active' : ''}" id="week-${w}">`;

            weeks[w].forEach(match => {
                const r = results[match.id];
                const played = r && r.played;
                const homeTeam = teams[match.home];
                const awayTeam = teams[match.away];
                if (!homeTeam || !awayTeam) return;

                const matchGoals = goals.filter(g => g.matchId === match.id);
                const homeGoals = matchGoals.filter(g => g.teamId === match.home);
                const awayGoals = matchGoals.filter(g => g.teamId === match.away);

                contentsHtml += `
                <div class="match-card ${played ? 'played' : ''}">
                    <div class="match-meta">
                        <span class="date-badge">📅 ${formatDateShort(match.date)}</span>
                        <span>⏰ ${match.time}</span>
                        <span class="forma-indicator forma-home">🟡 Sarı</span>
                        <span class="forma-indicator forma-away">🔴 Kırmızı</span>
                    </div>
                    <div class="match-teams">
                        <div class="match-team">
                            ${teamBadge(match.home, 'large')}
                            <span class="match-team-name">${homeTeam.name}</span>
                        </div>
                        <div class="match-score">
                            ${played
                        ? `<span class="match-score-value">${r.homeScore}</span>
                                   <span class="match-score-divider">—</span>
                                   <span class="match-score-value">${r.awayScore}</span>`
                        : `<span class="match-score-pending">— vs —</span>`
                    }
                        </div>
                        <div class="match-team">
                            ${teamBadge(match.away, 'large')}
                            <span class="match-team-name">${awayTeam.name}</span>
                        </div>
                    </div>`;

                if (played && matchGoals.length > 0) {
                    contentsHtml += `<div class="match-goals">`;
                    contentsHtml += `<div style="display:flex; gap:24px; justify-content:center; flex-wrap:wrap;">`;
                    
                    if (homeGoals.length > 0) {
                        contentsHtml += `<div style="flex:1; min-width:140px;">`;
                        homeGoals.forEach(g => {
                            contentsHtml += `<div class="match-goal-item">
                                <span class="goal-icon">⚽</span>
                                <span>${g.player}</span>
                                ${g.minute ? `<span class="goal-minute">${g.minute}'</span>` : ''}
                            </div>`;
                        });
                        contentsHtml += `</div>`;
                    }
                    
                    if (awayGoals.length > 0) {
                        contentsHtml += `<div style="flex:1; min-width:140px; text-align:right;">`;
                        awayGoals.forEach(g => {
                            contentsHtml += `<div class="match-goal-item" style="justify-content:flex-end;">
                                ${g.minute ? `<span class="goal-minute">${g.minute}'</span>` : ''}
                                <span>${g.player}</span>
                                <span class="goal-icon">⚽</span>
                            </div>`;
                        });
                        contentsHtml += `</div>`;
                    }

                    contentsHtml += `</div></div>`;
                }

                contentsHtml += `</div>`;
            });

            contentsHtml += `</div>`;
        });

        tabsEl.innerHTML = tabsHtml;
        contentsEl.innerHTML = contentsHtml;
    }

    window.switchWeek = function (week) {
        document.querySelectorAll('.week-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.week-content').forEach(c => c.classList.remove('active'));
        document.querySelector(`.week-tab[data-week="${week}"]`)?.classList.add('active');
        document.getElementById(`week-${week}`)?.classList.add('active');
    };

    // ── Render Top Scorers ──
    function renderTopScorers() {
        const container = document.getElementById('scorersList');
        if (!container) return;

        if (goals.length === 0) {
            container.innerHTML = `<div class="empty-state">
                <div class="empty-icon">⚽</div>
                <p>Henüz gol atılmadı. Turnuva başladığında gol krallığı burada görünecek.</p>
            </div>`;
            return;
        }

        const scorerMap = {};
        goals.forEach(g => {
            const key = `${g.player}__${g.teamId}`;
            if (!scorerMap[key]) {
                scorerMap[key] = { player: g.player, teamId: g.teamId, goals: 0 };
            }
            scorerMap[key].goals++;
        });

        const sortedScorers = Object.values(scorerMap).sort((a, b) => b.goals - a.goals);

        let html = '';
        sortedScorers.forEach((scorer, i) => {
            const rank = i + 1;
            const team = teams[scorer.teamId];
            const rankClass = rank <= 3 ? `top-${rank}` : '';

            html += `<div class="scorer-card ${rankClass}">
                <span class="scorer-rank ${rank <= 3 ? 'rank-' + rank : ''}">${rank}</span>
                ${teamBadge(scorer.teamId)}
                <div class="scorer-info">
                    <div class="scorer-name">${scorer.player}</div>
                    <div class="scorer-team">${team ? team.name : ''}</div>
                </div>
                <div class="scorer-goals">
                    <span class="ball-icon">⚽</span>
                    ${scorer.goals}
                </div>
            </div>`;
        });

        container.innerHTML = html;
    }

    // ── Render Rules ──
    function renderRules() {
        const container = document.getElementById('rulesList');
        if (!container) return;

        let html = '';
        data.rules.forEach((rule, i) => {
            html += `<div class="rule-item">
                <span class="rule-number">${i + 1}.</span>
                <span class="rule-text">${rule}</span>
            </div>`;
        });
        container.innerHTML = html;
    }

    // ── Render Hero Teams ──
    function renderHeroTeams() {
        const container = document.getElementById('heroTeams');
        if (!container) return;

        let html = '';
        Object.keys(teams).forEach(id => {
            html += teamBadge(id, 'hero-size');
        });
        container.innerHTML = html;
    }

    // ── Next Match Banner + Countdown ──
    function initNextMatch() {
        const banner = document.getElementById('nextMatchBanner');
        const teamsContainer = document.getElementById('nextMatchTeams');
        const dateLabel = document.getElementById('nextMatchDate');
        if (!banner) return;

        const now = new Date();
        let nextMatch = null;

        const sortedFixtures = [...fixtures].sort((a, b) => {
            const dA = new Date(a.date + 'T' + a.time + ':00');
            const dB = new Date(b.date + 'T' + b.time + ':00');
            return dA - dB;
        });

        for (const match of sortedFixtures) {
            if (results[match.id] && results[match.id].played) continue;
            const matchDate = new Date(match.date + 'T' + match.time + ':00');
            if (matchDate > now) {
                nextMatch = match;
                break;
            }
        }

        if (!nextMatch) {
            const allPlayed = fixtures.every(m => results[m.id] && results[m.id].played);
            if (allPlayed) {
                // Find champion (1st in standings)
                const standings = calculateStandings();
                const champion = standings[0];
                const championTeam = teams[champion.id];

                // Find top scorer
                const scorerMap = {};
                goals.forEach(g => {
                    const key = `${g.player}__${g.teamId}`;
                    if (!scorerMap[key]) {
                        scorerMap[key] = { player: g.player, teamId: g.teamId, goals: 0 };
                    }
                    scorerMap[key].goals++;
                });
                const sortedScorers = Object.values(scorerMap).sort((a, b) => b.goals - a.goals);
                const topScorer = sortedScorers.length > 0 ? sortedScorers[0] : null;

                let championHtml = '';
                if (championTeam) {
                    championHtml = `
                        <div style="display:flex; align-items:center; justify-content:center; gap:16px; margin:12px 0;">
                            ${teamBadge(champion.id, 'large')}
                            <div style="text-align:left;">
                                <div style="color:var(--gold); font-size:14px; text-transform:uppercase; letter-spacing:2px;">🏆 Şampiyon</div>
                                <div style="color:#fff; font-size:26px; font-weight:900; font-family:'Oswald',sans-serif; text-transform:uppercase;">${championTeam.name}</div>
                                <div style="color:var(--text-muted); font-size:13px;">${champion.points} Puan | ${champion.won}G ${champion.drawn}B ${champion.lost}M | Averaj: ${champion.goalsFor - champion.goalsAgainst > 0 ? '+' : ''}${champion.goalsFor - champion.goalsAgainst}</div>
                            </div>
                        </div>`;
                }

                let scorerHtml = '';
                if (topScorer) {
                    const scorerTeam = teams[topScorer.teamId];
                    scorerHtml = `
                        <div style="display:flex; align-items:center; justify-content:center; gap:12px; margin-top:14px; padding-top:14px; border-top:1px solid rgba(212,175,55,0.3);">
                            <span style="font-size:28px;">👑</span>
                            <div style="text-align:left;">
                                <div style="color:var(--gold); font-size:13px; text-transform:uppercase; letter-spacing:2px;">Gol Kralı</div>
                                <div style="color:#fff; font-size:20px; font-weight:700;">${topScorer.player}</div>
                                <div style="color:var(--text-muted); font-size:13px;">${scorerTeam ? scorerTeam.name : ''} — ⚽ ${topScorer.goals} Gol</div>
                            </div>
                        </div>`;
                }

                banner.innerHTML = `
                    <div class="next-match-title">🏆 TURNUVA TAMAMLANDI!</div>
                    ${championHtml}
                    ${scorerHtml}`;
            } else {
                banner.innerHTML = `
                    <div class="next-match-title">⏳ SIRADAKİ MAÇ</div>
                    <p style="color: var(--text-muted);">Sonraki maç bilgisi bekleniyor...</p>`;
            }
            return;
        }

        const homeTeam = teams[nextMatch.home];
        const awayTeam = teams[nextMatch.away];

        if (teamsContainer) {
            teamsContainer.innerHTML = `
                <div class="next-match-team-info">
                    ${teamBadge(nextMatch.home, 'large')}
                    <span class="next-match-team-name">${homeTeam.name}</span>
                </div>
                <span class="next-match-vs">VS</span>
                <div class="next-match-team-info">
                    ${teamBadge(nextMatch.away, 'large')}
                    <span class="next-match-team-name">${awayTeam.name}</span>
                </div>
            `;
        }

        if (dateLabel) {
            dateLabel.textContent = `📅 ${formatDate(nextMatch.date)} — ⏰ ${nextMatch.time} — Hafta ${nextMatch.week}`;
        }

        function updateCountdown() {
            const target = new Date(nextMatch.date + 'T' + nextMatch.time + ':00');
            const diff = target - new Date();

            if (diff <= 0) {
                const countdownEl = document.getElementById('countdown');
                if (countdownEl) {
                    countdownEl.innerHTML = `<div style="font-size:24px; color:var(--gold); font-weight:800;">🔴 MAÇ BAŞLADI!</div>`;
                }
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            const daysEl = document.getElementById('countDays');
            const hoursEl = document.getElementById('countHours');
            const minutesEl = document.getElementById('countMinutes');
            const secondsEl = document.getElementById('countSeconds');

            if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
            if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
            if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
            if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
        }

        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    // ── Scroll Animations ──
    function initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.animate-in').forEach(el => observer.observe(el));
    }

    // ── Navbar Scroll Effect ──
    function initNavbar() {
        const navbar = document.getElementById('navbar');
        const toggle = document.getElementById('navToggle');
        const links = document.getElementById('navLinks');

        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        if (toggle && links) {
            toggle.addEventListener('click', () => {
                links.classList.toggle('open');
            });

            links.querySelectorAll('a').forEach(a => {
                a.addEventListener('click', () => {
                    links.classList.remove('open');
                });
            });
        }

        const sections = document.querySelectorAll('.section');
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(s => {
                const top = s.offsetTop - 100;
                if (window.scrollY >= top) {
                    current = s.getAttribute('id');
                }
            });
            document.querySelectorAll('.nav-link').forEach(a => {
                a.classList.remove('active');
                if (a.getAttribute('href') === `#${current}`) {
                    a.classList.add('active');
                }
            });
        });
    }

    // ── Initialize ──
    function init() {
        // Start intro animation first
        playIntroAnimation();

        // Render all content (behind the intro overlay)
        renderHeroTeams();
        renderStandings();
        renderFixtures();
        renderTopScorers();
        renderRules();
        initNextMatch();
        initMusicToggle();
        initScrollAnimations();
        initNavbar();

        // ── Firebase Real-time Integration ──
        if (typeof initFirebase === 'function' && initFirebase()) {
            // Listen for real-time updates from Firebase
            firebaseListen(function(fbData) {
                if (fbData) {
                    if (fbData.results) results = fbData.results;
                    if (fbData.goals) goals = Array.isArray(fbData.goals) ? fbData.goals : Object.values(fbData.goals);
                    // Also cache to localStorage
                    localStorage.setItem('312cup_admin_data', JSON.stringify({
                        results: results,
                        goals: goals
                    }));
                    // Refresh UI
                    refreshAllSections();
                    console.log('🔄 Veriler Firebase\'den güncellendi!');
                }
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
