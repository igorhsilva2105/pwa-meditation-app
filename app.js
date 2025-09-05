// app.js
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    const navButtons = document.querySelectorAll('nav button');

    // Navegação
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            sections.forEach(sec => sec.classList.remove('active'));
            document.getElementById(button.id.replace('-btn', '')).classList.add('active');
        });
    });

    // Carousel Diário
    const carouselItems = document.querySelectorAll('.carousel-item');
    let currentCarousel = 0;
    setInterval(() => {
        carouselItems[currentCarousel].classList.remove('active');
        currentCarousel = (currentCarousel + 1) % carouselItems.length;
        carouselItems[currentCarousel].classList.add('active');
    }, 5000);

    // Temporizador (mesmo com adições)
    const timerDisplay = document.getElementById('timer-display');
    const minutesInput = document.getElementById('minutes');
    const startBtn = document.getElementById('start-timer');
    const pauseBtn = document.getElementById('pause-timer');
    const resetBtn = document.getElementById('reset-timer');
    let timerInterval;
    let remainingTime;
    const gong = document.getElementById('gong-sound');
    const vibrateToggle = document.getElementById('vibrate');

    startBtn.addEventListener('click', () => {
        remainingTime = minutesInput.value * 60;
        updateTimerDisplay();
        timerInterval = setInterval(updateTimer, 1000);
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        gong.play();
    });

    pauseBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        startBtn.textContent = 'Continuar';
    });

    resetBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        remainingTime = 0;
        updateTimerDisplay();
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        startBtn.textContent = 'Iniciar';
    });

    function updateTimer() {
        if (remainingTime > 0) {
            remainingTime--;
            updateTimerDisplay();
        } else {
            clearInterval(timerInterval);
            gong.play();
            if (vibrateToggle.checked && 'vibrate' in navigator) {
                navigator.vibrate(200);
            }
            logSession(minutesInput.value, 'timer');
            startBtn.disabled = false;
            pauseBtn.disabled = true;
        }
    }

    function updateTimerDisplay() {
        const mins = Math.floor(remainingTime / 60);
        const secs = remainingTime % 60;
        timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Sons Ambiente (adicionados mais)
    const ambientButtons = document.querySelectorAll('#ambient-sounds button');
    let currentAmbient;
    ambientButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentAmbient) currentAmbient.pause();
            currentAmbient = document.getElementById(`${btn.dataset.sound}-sound`);
            currentAmbient.play();
            ambientButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Meditações Guiadas
    const guidedList = document.querySelectorAll('#guided-list li');
    const guidedAudio = document.getElementById('guided-audio');
    guidedList.forEach(li => {
        li.addEventListener('click', () => {
            guidedAudio.src = li.dataset.audio;
            guidedAudio.play();
            logSession(li.dataset.duration, 'guided');
        });
    });

    // Meditação Rápida e Diário
    document.getElementById('start-quick').addEventListener('click', () => {
        minutesInput.value = 5;
        startBtn.click();
        navButtons[1].click();
    });

    document.querySelector('.start-daily').addEventListener('click', () => {
        // Lógica para meditação do dia
        minutesInput.value = 10;
        startBtn.click();
        navButtons[1].click();
    });

    document.querySelector('.start-challenge').addEventListener('click', () => {
        // Lógica para desafio
        alert('Desafio aceito! Comece sua meditação.');
    });

    // Exercícios de Respiração
    const breathButtons = document.querySelectorAll('#breathwork button[data-type]');
    const breathGuide = document.getElementById('breath-guide');
    const startBreath = document.getElementById('start-breath');
    let breathInterval;
    let breathType;

    breathButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            breathType = btn.dataset.type;
            breathGuide.textContent = 'Prepare-se...';
            startBreath.disabled = false;
        });
    });

    startBreath.addEventListener('click', () => {
        if (breathType === '4-7-8') {
            breathCycle(['Inspire por 4s', 'Segure por 7s', 'Expire por 8s'], [4000, 7000, 8000]);
        } else if (breathType === 'box') {
            breathCycle(['Inspire por 4s', 'Segure por 4s', 'Expire por 4s', 'Segure por 4s'], [4000, 4000, 4000, 4000]);
        }
        logSession(5, 'breathwork'); // Exemplo de 5 min
    });

    function breathCycle(steps, times) {
        let i = 0;
        breathInterval = setInterval(() => {
            breathGuide.textContent = steps[i];
            i = (i + 1) % steps.length;
        }, times.reduce((a, b) => a + b, 0) / steps.length); // Aproximado
        setTimeout(() => clearInterval(breathInterval), 300000); // 5 min
    }

    // Diário
    const journalEntry = document.getElementById('journal-entry');
    const saveJournal = document.getElementById('save-journal');
    const journalList = document.getElementById('journal-list');

    saveJournal.addEventListener('click', () => {
        const entry = { date: new Date().toLocaleString(), text: journalEntry.value };
        let entries = JSON.parse(localStorage.getItem('zenJournal')) || [];
        entries.push(entry);
        localStorage.setItem('zenJournal', JSON.stringify(entries));
        journalEntry.value = '';
        updateJournalList();
    });

    function updateJournalList() {
        journalList.innerHTML = '';
        const entries = JSON.parse(localStorage.getItem('zenJournal')) || [];
        entries.forEach(entry => {
            const li = document.createElement('li');
            li.textContent = `${entry.date}: ${entry.text.substring(0, 50)}...`;
            journalList.appendChild(li);
        });
    }
    updateJournalList();

    // Estatísticas Melhoradas
    const totalSessionsSpan = document.getElementById('total-sessions');
    const totalTimeSpan = document.getElementById('total-time');
    const streakSpan = document.getElementById('streak');
    const chartCtx = document.getElementById('progress-chart').getContext('2d');
    const achievementsList = document.getElementById('achievements').querySelector('ul');

    function logSession(minutes, type) {
        let stats = JSON.parse(localStorage.getItem('zenStats')) || { sessions: 0, time: 0, lastDate: null, streak: 0, history: [] };
        stats.sessions++;
        stats.time += parseInt(minutes);
        const today = new Date().toDateString();
        stats.history.push({ date: today, minutes: parseInt(minutes), type });
        
        if (stats.lastDate !== today) {
            if (new Date(stats.lastDate).getTime() + 86400000 === new Date(today).getTime()) {
                stats.streak++;
            } else {
                stats.streak = 1;
            }
            stats.lastDate = today;
        }
        
        localStorage.setItem('zenStats', JSON.stringify(stats));
        updateStats();
        checkAchievements(stats);
    }

    function updateStats() {
        const stats = JSON.parse(localStorage.getItem('zenStats')) || { sessions: 0, time: 0, streak: 0, history: [] };
        totalSessionsSpan.textContent = stats.sessions;
        totalTimeSpan.textContent = stats.time;
        streakSpan.textContent = stats.streak;

        // Gráfico com dados reais
        const dates = [...new Set(stats.history.map(h => h.date))].slice(-7);
        const data = dates.map(d => stats.history.filter(h => h.date === d).reduce((sum, h) => sum + h.minutes, 0));
        
        new Chart(chartCtx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{ label: 'Minutos por Dia', data, borderColor: var(--primary-color), fill: false }]
            },
            options: { scales: { y: { beginAtZero: true } } }
        });
    }
    updateStats();

    function checkAchievements(stats) {
        achievementsList.innerHTML = '';
        if (stats.streak >= 7) addAchievement('Sequência de 7 Dias!');
        if (stats.time >= 100) addAchievement('100 Minutos Meditados!');
        if (stats.sessions >= 10) addAchievement('10 Sessões Completas!');
        // Mais conquistas
    }

    function addAchievement(text) {
        const li = document.createElement('li');
        li.textContent = text;
        achievementsList.appendChild(li);
    }

    // Configurações
    const darkModeToggle = document.getElementById('dark-mode');
    darkModeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark');
        localStorage.setItem('darkMode', darkModeToggle.checked);
    });
    if (localStorage.getItem('darkMode') === 'true') {
        darkModeToggle.checked = true;
        document.body.classList.add('dark');
    }

    const themeSelect = document.getElementById('theme-select');
    themeSelect.addEventListener('change', () => {
        document.body.className = ''; // Remove todos
        document.body.classList.add(themeSelect.value);
        localStorage.setItem('theme', themeSelect.value);
    });
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        themeSelect.value = savedTheme;
        document.body.classList.add(savedTheme);
    }

    const notificationsToggle = document.getElementById('notifications');
    notificationsToggle.addEventListener('change', () => {
        if (notificationsToggle.checked) {
            Notification.requestPermission().then(perm => {
                if (perm === 'granted') {
                    registerPush();
                }
            });
        }
    });

    function registerPush() {
        if ('PushManager' in window) {
            navigator.serviceWorker.ready.then(reg => {
                reg.pushManager.subscribe({ userVisibleOnly: true }).then(sub => {
                    // Envie sub para servidor se necessário, aqui simule daily notification
                    setInterval(() => {
                        reg.showNotification('ZenFlow: Hora de Meditar!', { body: 'Faça sua meditação diária agora.' });
                    }, 86400000); // Diário
                });
            });
        }
    }

    // Instalação PWA
    let deferredPrompt;
    const installBtn = document.getElementById('install-btn');
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtn.style.display = 'block';
    });

    installBtn.addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('Instalado');
            }
            deferredPrompt = null;
        });
    });
});
