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

    // Temporizador
    const timerDisplay = document.getElementById('timer-display');
    const minutesInput = document.getElementById('minutes');
    const startBtn = document.getElementById('start-timer');
    const pauseBtn = document.getElementById('pause-timer');
    const resetBtn = document.getElementById('reset-timer');
    let timerInterval;
    let remainingTime;
    const gong = document.getElementById('gong-sound');

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
            logSession(minutesInput.value);
            startBtn.disabled = false;
            pauseBtn.disabled = true;
        }
    }

    function updateTimerDisplay() {
        const mins = Math.floor(remainingTime / 60);
        const secs = remainingTime % 60;
        timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Sons Ambiente
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
            logSession(10); // Exemplo, ajuste por duração
        });
    });

    // Meditação Rápida
    document.getElementById('start-quick').addEventListener('click', () => {
        minutesInput.value = 5;
        startBtn.click();
        navButtons[1].click(); // Vai para temporizador
    });

    // Estatísticas
    const totalSessionsSpan = document.getElementById('total-sessions');
    const totalTimeSpan = document.getElementById('total-time');
    const streakSpan = document.getElementById('streak');
    const chartCtx = document.getElementById('progress-chart').getContext('2d');

    function logSession(minutes) {
        let stats = JSON.parse(localStorage.getItem('zenStats')) || { sessions: 0, time: 0, lastDate: null, streak: 0 };
        stats.sessions++;
        stats.time += parseInt(minutes);
        
        const today = new Date().toDateString();
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
    }

    function updateStats() {
        const stats = JSON.parse(localStorage.getItem('zenStats')) || { sessions: 0, time: 0, streak: 0 };
        totalSessionsSpan.textContent = stats.sessions;
        totalTimeSpan.textContent = stats.time;
        streakSpan.textContent = stats.streak;

        // Gráfico simples
        new Chart(chartCtx, {
            type: 'line',
            data: {
                labels: ['Dia 1', 'Dia 2', 'Dia 3', 'Dia 4', 'Dia 5'],
                datasets: [{ label: 'Minutos', data: [5, 10, 15, 10, 20], borderColor: var(--primary-color) }]
            },
            options: { scales: { y: { beginAtZero: true } } }
        });
    }
    updateStats();

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

    const notificationsToggle = document.getElementById('notifications');
    notificationsToggle.addEventListener('change', () => {
        if (notificationsToggle.checked) {
            Notification.requestPermission();
        }
    });

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
                console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
        });
    });
});
