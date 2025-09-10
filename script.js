// Global variables
let audioPlayer;
// Always show both languages in this romantic version
let currentLanguage = 'both';
let isPlaying = false;
let currentTime = 0;
let duration = 0;
let currentLineIndex = -1;
let currentWordIndex = -1;
// Drift calibration
let offsetSeconds = 0; // add/subtract seconds to align start
let rateFactor = 1.065;  // slight backoff for stability while staying fast
let anchorRef = null;   // {effAtAnchor, rawAtAnchor}
// High-frequency ticker for smooth sync
let rafId = null;
let lastProgressUpdate = 0;
let lastMicroAdjust = 0; // timestamp for micro-correction pacing
let leadSeconds = 0.26; // render word highlights slightly ahead, balanced
let lineLeadSeconds = 0.9; // slightly reduced to avoid premature jumps
let autoSync = true;
let lastLineCalib = null; // {raw, eff}
const smoothAlpha = 0.2; // moderate adaptation for rate/offset updates
const MAX_RATE_STEP = 0.006; // limit rate change per boundary (safer)
const MAX_OFFSET_STEP = 0.08; // limit offset change (seconds) per boundary (safer)
// Sync (tap) mode state
let syncMode = false;
let tapState = {
    lineIndex: -1,
    nextWord: 0,
    taps: []
};

// Complete lyrics data for "Cama y Mesa" by Roberto Carlos
// NOTE: These are placeholder timings - need to be adjusted based on actual audio
const lyricsData = [
    {
        startTime: 15,
        endTime: 20,
        spanish: "Quiero ser tu canción desde principio a fin",
        english: "I want to be your song, from beginning to end"
    },
    {
        startTime: 21,
        endTime: 26,
        spanish: "Quiero rozarme en tus labios y ser tu carmín",
        english: "I want to brush against your lips and be your lipstick"
    },
    {
        startTime: 27,
        endTime: 32,
        spanish: "Ser el jabón que te suaviza, el baño que te baña",
        english: "Be the soap that softens you, the bath that bathes you"
    },
    {
        startTime: 33,
        endTime: 38,
        spanish: "La toalla que deslizas por tu piel mojada",
        english: "The towel you slide across your wet skin"
    },
    {
        startTime: 39,
        endTime: 44,
        spanish: "Yo quiero ser tu almohada, tu edredón de seda",
        english: "I want to be your pillow, your silk blanket"
    },
    {
        startTime: 45,
        endTime: 50,
        spanish: "Besarte mientras sueñas y verte dormir",
        english: "Kiss you while you dream and watch you sleep"
    },
    {
        startTime: 51,
        endTime: 56,
        spanish: "Yo quiero ser el sol que entra y da sobre tu cama",
        english: "I want to be the sun that enters and shines upon your bed"
    },
    {
        startTime: 57,
        endTime: 62,
        spanish: "Despertarte poco a poco, hacerte sonreír",
        english: "Wake you little by little, make you smile"
    },
    {
        startTime: 63,
        endTime: 68,
        spanish: "Quiero estar en el más suave toque de tus dedos",
        english: "I want to be in the softest touch of your fingers"
    },
    {
        startTime: 69,
        endTime: 74,
        spanish: "Entrar en lo más íntimo de tus secretos",
        english: "Enter the most intimate of your secrets"
    },
    {
        startTime: 75,
        endTime: 80,
        spanish: "Quiero ser la cosa buena, liberada o prohibida",
        english: "I want to be the good thing, forbidden or free"
    },
    {
        startTime: 81,
        endTime: 86,
        spanish: "Ser todo en tu vida",
        english: "Be everything in your life"
    },
    {
        startTime: 87,
        endTime: 92,
        spanish: "Todo lo que me quieras dar quiero que me lo des",
        english: "Everything you want to give me, I want you to give"
    },
    {
        startTime: 93,
        endTime: 98,
        spanish: "Yo te doy todo lo que un hombre entrega a una mujer",
        english: "I'll give you all that a man can give a woman"
    },
    {
        startTime: 99,
        endTime: 104,
        spanish: "Ir más allá de ese cariño que siempre me das",
        english: "Go beyond that affection you always show me"
    },
    {
        startTime: 105,
        endTime: 110,
        spanish: "Me imagino tantas cosas, quiero siempre más",
        english: "I imagine so many things, I always want more"
    },
    {
        startTime: 111,
        endTime: 116,
        spanish: "Tú eres mi dulce desayuno, mi pastel perfecto",
        english: "You are my sweet breakfast, my perfect cake"
    },
    {
        startTime: 117,
        endTime: 122,
        spanish: "Mi bebida preferida el plato predilecto",
        english: "My favorite drink, my chosen dish"
    },
    {
        startTime: 123,
        endTime: 128,
        spanish: "Yo como y bebo de lo bueno y no tengo hora fija",
        english: "I eat and drink the best, I have no fixed time"
    },
    {
        startTime: 129,
        endTime: 134,
        spanish: "De mañana, tarde o noche no hago dieta",
        english: "Morning, afternoon or night—I never go on a diet"
    },
    {
        startTime: 135,
        endTime: 140,
        spanish: "Y este amor que alimenta a mi fantasía",
        english: "And this love that feeds my fantasy"
    },
    {
        startTime: 141,
        endTime: 146,
        spanish: "Es mi sueño, es mi fiesta, es mi alegría",
        english: "Is my dream, my feast, my joy"
    },
    {
        startTime: 147,
        endTime: 152,
        spanish: "La comida más sabrosa, mi perfume, mi bebida",
        english: "The tastiest meal, my perfume, my drink"
    },
    {
        startTime: 153,
        endTime: 158,
        spanish: "Es todo en mi vida",
        english: "It's everything in my life"
    },
    {
        startTime: 159,
        endTime: 164,
        spanish: "Todo hombre que sabe querer",
        english: "Every man who knows how to love"
    },
    {
        startTime: 165,
        endTime: 170,
        spanish: "Sabe dar y pedir a la mujer",
        english: "Knows how to give and ask of a woman"
    },
    {
        startTime: 171,
        endTime: 176,
        spanish: "Lo mejor y hacer de este amor",
        english: "The best, and make of this love"
    },
    {
        startTime: 177,
        endTime: 182,
        spanish: "Lo que come, que bebe, que da, que recibe",
        english: "What he eats, what he drinks, what he gives, what he receives"
    },
    {
        startTime: 183,
        endTime: 188,
        spanish: "El hombre que sabe querer",
        english: "The man who knows how to love"
    },
    {
        startTime: 189,
        endTime: 194,
        spanish: "Y se apasiona por una mujer",
        english: "And is passionate about a woman"
    },
    {
        startTime: 195,
        endTime: 200,
        spanish: "Convierte su amor en su vida",
        english: "Turns his love into his life"
    },
    {
        startTime: 201,
        endTime: 206,
        spanish: "Su comida y bebida, en la justa medida",
        english: "His food and drink, in the right measure"
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    audioPlayer = document.getElementById('audioPlayer');
    initializeEventListeners();
    displayLyrics();
});

function initializeEventListeners() {
    // Audio player events
    audioPlayer.addEventListener('loadedmetadata', function() {
        duration = audioPlayer.duration;
        updateProgress();
    });

    audioPlayer.addEventListener('timeupdate', function() {
        currentTime = audioPlayer.currentTime; // keep updated
        // Progress + highlighting handled by RAF for better precision
    });

    audioPlayer.addEventListener('play', function() {
        isPlaying = true;
        updatePlayButton();
    startTicker();
    });

    audioPlayer.addEventListener('pause', function() {
        isPlaying = false;
        updatePlayButton();
    stopTicker();
    });

    audioPlayer.addEventListener('ended', function() {
        isPlaying = false;
        updatePlayButton();
        resetHighlighting();
    stopTicker();
    });

    // Sync controls
    // Developer sync controls removed for the romantic version

    // Keyboard for tap mode
    document.addEventListener('keydown', (ev) => {
        // Global calibration nudges
    // Keyboard developer shortcuts removed
    });
}

// Language switcher removed — always both

function displayLyrics() {
    const lyricsDisplay = document.getElementById('lyricsDisplay');
    
    if (lyricsData.length === 0) {
        lyricsDisplay.innerHTML = `
            <p class="loading-text">🎶 Cargue un archivo de audio y configure las letras...</p>
            <p class="loading-text">🎶 Load an audio file and configure the lyrics...</p>
        `;
        return;
    }
    
    let html = '';
    
    lyricsData.forEach((line, index) => {
        ensureWordsForLine(line);
        let lineClass = 'lyric-line future';
        const tLine = getLineEffectiveTime();
        if (tLine >= line.startTime && tLine <= line.endTime) {
            lineClass = 'lyric-line current';
        } else if (tLine > line.endTime) {
            lineClass = 'lyric-line past';
        }
        
        html += `<div class="${lineClass}" data-line-index="${index}">`;
        
        const spans = createWordSpans(line.spanish, line.words, index);
        if (currentLanguage === 'spanish') {
            html += `<div class="spanish-lyrics">${spans}</div>`;
        } else if (currentLanguage === 'english') {
            const spaWords = line.words || [];
            const engBuckets = mapEnglishToBuckets(line.english || '', spaWords.length);
            if (spaWords.length > 0) {
                html += `<div class="english-lyrics">${spaWords.map((w, i) => `<span class="word" data-line="${index}" data-word="${i}">${engBuckets[i]}</span>`).join(' ')}</div>`;
            } else {
                html += `<div class="english-lyrics">${line.english || ''}</div>`;
            }
        } else {
            // both
            html += `<div class="spanish-lyrics">${spans}</div>`;
            const spaWords = line.words || [];
            const engBuckets = mapEnglishToBuckets(line.english || '', spaWords.length);
            if (spaWords.length > 0) {
                html += `<div class="english-lyrics">${spaWords.map((w, i) => `<span class="word" data-line="${index}" data-word="${i}">${engBuckets[i]}</span>`).join(' ')}</div>`;
            } else {
                html += `<div class="english-lyrics">${line.english || ''}</div>`;
            }
        }
        
        html += '</div>';
    });
    
    lyricsDisplay.innerHTML = html;
}

function createWordSpans(text, words, lineIndex) {
    if (!words || words.length === 0) {
        return text;
    }
    
    let html = '';
    words.forEach((word, wordIndex) => {
        const englishTranslation = word.englishWord ? `data-english="${word.englishWord}"` : '';
        html += `<span class="word" data-line="${lineIndex}" data-word="${wordIndex}" ${englishTranslation}>${word.text}</span> `;
    });
    
    return html;
}

function highlightCurrentLyrics() {
    const tWord = getEffectiveTime();
    const tLine = getLineEffectiveTime();
    // Determine active line and word
    let activeLine = -1;
    let activeWord = -1;
    for (let i = 0; i < lyricsData.length; i++) {
        const line = lyricsData[i];
        if (tLine >= line.startTime && tLine <= line.endTime) {
            activeLine = i;
            ensureWordsForLine(line);
            if (line.manualTimings) {
                for (let j = 0; j < line.words.length; j++) {
                    const w = line.words[j];
                    if (typeof w.startTime === 'number' && typeof w.endTime === 'number') {
                        if (tWord >= w.startTime && tWord <= w.endTime) { activeWord = j; break; }
                    }
                }
            }
            if (activeWord < 0) {
                // Use normalized position within the line to pick the word index
                const dur = Math.max(0.001, line.endTime - line.startTime);
                let frac = (tWord - line.startTime) / dur;
                if (!isFinite(frac)) frac = 0;
                frac = Math.max(0, Math.min(0.999, frac));
                activeWord = Math.floor(frac * line.words.length);
            }
            break;
        }
    }

    const prevLine = currentLineIndex;
    const lineChanged = activeLine !== currentLineIndex;
    currentLineIndex = activeLine;
    currentWordIndex = activeWord;
    // Re-render entire lyrics only when line changes to reduce DOM churn
    if (lineChanged) displayLyrics();

    // Apply word highlight
    document.querySelectorAll('.word.highlighted').forEach(el => el.classList.remove('highlighted'));
    if (activeLine >= 0 && activeWord >= 0) {
        const activeEl = document.querySelector(`.word[data-line="${activeLine}"][data-word="${activeWord}"]`);
        if (activeEl) activeEl.classList.add('highlighted');
    // Also highlight same-index word in alternate language row
    document.querySelectorAll(`.english-lyrics .word[data-line="${activeLine}"][data-word="${activeWord}"]`).forEach(el => el.classList.add('highlighted'));
    document.querySelectorAll(`.spanish-lyrics .word[data-line="${activeLine}"][data-word="${activeWord}"]`).forEach(el => el.classList.add('highlighted'));
    }
    if (lineChanged) scrollToCurrentLine();

    // Auto-sync at line boundaries: when a new line becomes active, recalibrate slightly
    if (autoSync && activeLine >= 0 && activeLine !== prevLine) {
        const L = lyricsData[activeLine];
        const rawNow = audioPlayer.currentTime;
        const effTarget = L.startTime; // where we should be at line start
    if (lastLineCalib) {
            const raw1 = lastLineCalib.raw;
            const eff1 = lastLineCalib.eff;
            const raw2 = rawNow;
            const eff2 = effTarget;
            const denom = (raw2 - raw1);
            if (Math.abs(denom) > 0.1) {
                const calcRate = (eff2 - eff1) / denom;
                const calcOffset = eff1 - calcRate * raw1;
        // Incremental, clamped updates to avoid jumps
        const rateDelta = Math.max(-MAX_RATE_STEP, Math.min(MAX_RATE_STEP, (calcRate - rateFactor) * smoothAlpha));
        const offsetDelta = Math.max(-MAX_OFFSET_STEP, Math.min(MAX_OFFSET_STEP, (calcOffset - offsetSeconds) * smoothAlpha));
        rateFactor = Math.max(0.9, Math.min(1.2, rateFactor + rateDelta));
        offsetSeconds = offsetSeconds + offsetDelta;
                const rateInput = document.getElementById('rateInput'); if (rateInput) rateInput.value = rateFactor.toFixed(3);
                const offsetInput = document.getElementById('offsetInput'); if (offsetInput) offsetInput.value = offsetSeconds.toFixed(2);
            }
        }
        lastLineCalib = { raw: rawNow, eff: effTarget };
    }
}

function scrollToCurrentLine() {
    const currentLine = document.querySelector('.lyric-line.current');
    if (currentLine) {
        currentLine.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}

function updateProgress() {
    if (duration > 0) {
        const progress = (audioPlayer.currentTime / duration) * 100;
        document.getElementById('progressBar').style.width = progress + '%';
        
        // Update current time display
        const timeDisplay = document.getElementById('currentTimeDisplay');
        if (timeDisplay) {
            timeDisplay.textContent = `Current time: ${formatTime(audioPlayer.currentTime)}`;
        }
    }
}

function togglePlayPause() {
    if (isPlaying) {
        audioPlayer.pause();
    } else {
        audioPlayer.play();
    }
}

function updatePlayButton() {
    const button = document.getElementById('playPauseBtn');
    if (isPlaying) {
    button.textContent = '⏸️ Pause';
    } else {
    button.textContent = '▶️ Play';
    }
}

function resetSong() {
    audioPlayer.currentTime = 0;
    currentTime = 0;
    currentLineIndex = -1;
    currentWordIndex = -1;
    resetHighlighting();
    displayLyrics();
    updateProgress();
}

function resetHighlighting() {
    currentLineIndex = -1;
    currentWordIndex = -1;
    displayLyrics();
}

function loadAudioFile(event) {
    const file = event.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        audioPlayer.src = url;
        audioPlayer.load();
        
        audioPlayer.addEventListener('loadedmetadata', function() {
            const minutes = Math.floor(audioPlayer.duration / 60);
            const seconds = Math.floor(audioPlayer.duration % 60);
            console.log(`Audio cargado: ${file.name} - Duración: ${minutes}:${seconds.toString().padStart(2, '0')}`);
        });
    }
}

function getCurrentTime() {
    return audioPlayer.currentTime;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return `${minutes}:${secs.padStart(5, '0')}`;
}

function logCurrentTime() {
    const raw = getCurrentTime();
    const eff = getEffectiveTime();
    console.log(`⏰ Audio time: ${formatTime(raw)} (${raw.toFixed(2)}s) | effective: ${formatTime(eff)} (${eff.toFixed(2)}s)`);
    console.log(`🎯 Tip: use Offset and Rate to correct progressive drift (offset=${offsetSeconds.toFixed(2)}, rate=${rateFactor.toFixed(3)})`);
    return eff;
}

// Show timing helper in console
console.log("🎵 Sync helper (dev):");
console.log("• getCurrentTime() - get current time");
console.log("• logCurrentTime() - log current time formatted");
console.log("• formatTime(seconds) - convert to mm:ss");
console.log("📍 HOW TO SYNC (dev):");
console.log("1. Play the song");
console.log("2. When each line starts singing, run: logCurrentTime()");
console.log("3. Note down times if you want to fine-tune");
console.log("4. Share the times to adjust perfectly");

// --------- Helpers for effective time and words ----------
function getEffectiveTime() {
    return offsetSeconds + rateFactor * audioPlayer.currentTime + leadSeconds;
}

function getLineEffectiveTime() {
    return offsetSeconds + rateFactor * audioPlayer.currentTime + lineLeadSeconds;
}

function ensureWordsForLine(line) {
    if (line.words && Array.isArray(line.words) && line.words.length) return;
    const tokens = splitWordsKeepingPunct(line.spanish);
    const total = Math.max(tokens.length, 1);
    const span = Math.max(0.01, (line.endTime - line.startTime) / total);
    line.words = tokens.map((txt, i) => ({
        text: txt,
        startTime: line.startTime + i * span,
        endTime: line.startTime + (i + 1) * span
    }));
    // Make sure last word ends exactly at line end
    if (line.words.length) line.words[line.words.length - 1].endTime = line.endTime;
}

function splitWordsKeepingPunct(text) {
    // Split by spaces but keep commas and accents attached to words
    // Also collapse multiple spaces
    return text.trim().split(/\s+/);
}

function mapEnglishToBuckets(englishText, bucketCount) {
    if (bucketCount <= 0) return [];
    const words = splitWordsKeepingPunct(englishText);
    if (words.length === 0) return new Array(bucketCount).fill('');
    if (words.length === bucketCount) return words;
    // Distribute approximately evenly across buckets preserving word order
    const buckets = new Array(bucketCount).fill('').map(() => []);
    for (let i = 0; i < words.length; i++) {
        const idx = Math.floor(i * bucketCount / words.length);
        buckets[Math.min(idx, bucketCount - 1)].push(words[i]);
    }
    return buckets.map(arr => arr.join(' '));
}

// --------- Tap Sync Mode ----------
function toggleSyncMode() {
    syncMode = !syncMode;
    const btn = document.getElementById('syncModeBtn');
    if (btn) btn.textContent = syncMode ? '🎬 Modo Sincronización: ON' : '🎬 Modo Sincronización: OFF';
    if (syncMode) {
        // Initialize to current line by time
        const t = getEffectiveTime();
        tapState.lineIndex = findLineIndexAt(t);
        tapState.nextWord = 0;
        tapState.taps = [];
    console.log('🟢 Tap mode ON. Space=word, Enter=close line, Backspace=undo. Line:', tapState.lineIndex);
    } else {
        console.log('🔴 Tap mode OFF');
    }
}

function findLineIndexAt(t) {
    for (let i = 0; i < lyricsData.length; i++) {
        const L = lyricsData[i];
        if (t >= L.startTime && t <= L.endTime) return i;
    }
    // fallback to closest ahead
    let minDelta = Infinity, minIdx = -1;
    for (let i = 0; i < lyricsData.length; i++) {
        const d = Math.abs(t - lyricsData[i].startTime);
        if (d < minDelta) { minDelta = d; minIdx = i; }
    }
    return minIdx;
}

function jumpLine(delta) {
    if (tapState.lineIndex < 0) tapState.lineIndex = 0;
    tapState.lineIndex = Math.max(0, Math.min(lyricsData.length - 1, tapState.lineIndex + delta));
    tapState.nextWord = 0;
    tapState.taps = [];
    const L = lyricsData[tapState.lineIndex];
    ensureWordsForLine(L);
    // Seek audio to the line start (raw time considering inverse of calibration)
    const targetEff = L.startTime;
    const raw = (targetEff - offsetSeconds) / Math.max(0.0001, rateFactor);
    if (!isNaN(raw) && raw >= 0) audioPlayer.currentTime = raw;
    console.log('➡️ Current line for tap:', tapState.lineIndex, '-', L.spanish);
}

function tapWord() {
    const i = tapState.lineIndex;
    if (i < 0) return;
    const L = lyricsData[i];
    ensureWordsForLine(L);
    const t = getEffectiveTime();
    const k = tapState.nextWord;
    if (k >= L.words.length) { console.log('⚠️ All words for this line captured. Press Enter.'); return; }
    // Set start for current word and end of previous
    if (k === 0) {
        L.words[0].startTime = Math.max(L.startTime, Math.min(t, L.endTime));
    } else {
        L.words[k - 1].endTime = Math.max(L.words[k - 1].startTime + 0.01, Math.min(t, L.endTime));
        L.words[k].startTime = L.words[k - 1].endTime;
    }
    tapState.taps.push(t);
    tapState.nextWord++;
    displayLyrics();
    highlightCurrentLyrics();
}

function endCurrentLine() {
    const i = tapState.lineIndex;
    if (i < 0) return;
    const L = lyricsData[i];
    ensureWordsForLine(L);
    // Close last word to line end
    const lastIdx = Math.min(L.words.length - 1, Math.max(0, tapState.nextWord - 1));
    L.words[lastIdx].endTime = L.endTime;
    // Distribute any remaining words evenly to fill until end
    for (let m = tapState.nextWord; m < L.words.length; m++) {
        const prevEnd = L.words[m - 1] ? L.words[m - 1].endTime : L.startTime;
        const remain = (L.endTime - prevEnd) / (L.words.length - m);
        L.words[m].startTime = prevEnd;
        L.words[m].endTime = prevEnd + remain;
    }
    L.manualTimings = true;
    displayLyrics();
    highlightCurrentLyrics();
    console.log('✅ Line closed. You can move to the next (⏭️).');
}

function undoTap() {
    const i = tapState.lineIndex;
    if (i < 0) return;
    const L = lyricsData[i];
    ensureWordsForLine(L);
    if (tapState.nextWord <= 0) return;
    tapState.nextWord--;
    tapState.taps.pop();
    // Reset current and previous boundaries safely
    if (tapState.nextWord === 0) {
        // restore evenly spaced from line start
        const total = L.words.length;
        const span = Math.max(0.01, (L.endTime - L.startTime) / total);
        for (let q = 0; q < total; q++) {
            L.words[q].startTime = L.startTime + q * span;
            L.words[q].endTime = L.startTime + (q + 1) * span;
        }
        L.words[total - 1].endTime = L.endTime;
    } else {
        const prevIdx = tapState.nextWord - 1;
        // set end of prev word back to halfway between its start and next word end
        L.words[prevIdx].endTime = Math.min(L.endTime, L.words[prevIdx].startTime + 0.2);
        // re-chain following words evenly
        const startFrom = prevIdx + 1;
        const available = L.endTime - L.words[prevIdx].endTime;
        const remainWords = L.words.length - startFrom;
        const span = remainWords > 0 ? available / remainWords : available;
        for (let q = startFrom; q < L.words.length; q++) {
            const base = L.words[prevIdx].endTime + (q - startFrom) * span;
            L.words[q].startTime = base;
            L.words[q].endTime = q === L.words.length - 1 ? L.endTime : base + span;
        }
    }
    // Keep manualTimings if any taps exist
    L.manualTimings = tapState.nextWord > 0;
    displayLyrics();
    highlightCurrentLyrics();
}

function clearCurrentLineTimings() {
    if (currentLineIndex < 0) return;
    const L = lyricsData[currentLineIndex];
    ensureWordsForLine(L);
    const total = L.words.length;
    const span = Math.max(0.01, (L.endTime - L.startTime) / total);
    for (let q = 0; q < total; q++) {
        L.words[q].startTime = L.startTime + q * span;
        L.words[q].endTime = L.startTime + (q + 1) * span;
    }
    L.words[total - 1].endTime = L.endTime;
    L.manualTimings = false;
    tapState.nextWord = 0;
    tapState.taps = [];
    displayLyrics();
    highlightCurrentLyrics();
}

function downloadTimings() {
    const data = lyricsData.map(l => ({
        startTime: l.startTime,
        endTime: l.endTime,
        spanish: l.spanish,
        english: l.english,
        words: (l.words || []).map(w => ({ text: w.text, startTime: +w.startTime.toFixed(3), endTime: +w.endTime.toFixed(3) }))
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cama-y-mesa-timings.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

// ------- Calibration anchors --------
function setAnchorStartFromNow() {
    // Anchor current raw time to the start of the current line
    const tRaw = audioPlayer.currentTime;
    const idx = findLineIndexAt(getEffectiveTime());
    if (idx < 0) return;
    const L = lyricsData[idx];
    // Set offset so effective time equals line.startTime at this moment
    // line.startTime = offset + rate * tRaw => offset = line.startTime - rate * tRaw
    offsetSeconds = L.startTime - rateFactor * tRaw;
    const offsetInput = document.getElementById('offsetInput');
    if (offsetInput) offsetInput.value = offsetSeconds.toFixed(2);
    anchorRef = { effAtAnchor: L.startTime, rawAtAnchor: tRaw };
    console.log(`⚓ Anchored: offset=${offsetSeconds.toFixed(2)} (line ${idx})`);
}

function computeRateFromAnchor() {
    // Use two-point calibration: (raw1, eff1) from anchor and (raw2, eff2) now
    if (!anchorRef) { console.log('Use "⚓ Anchor start" on the first sung line first.'); return; }
    const raw2 = audioPlayer.currentTime;
    // Estimate current effective time to find nearest line, then take its startTime as eff2
    const effEstimate = getEffectiveTime();
    const idx = findLineIndexAt(effEstimate);
    if (idx < 0) { console.log('Could not identify current line. Go to a sung line and try again.'); return; }
    const eff2 = lyricsData[idx].startTime;

    const raw1 = anchorRef.rawAtAnchor;
    const eff1 = anchorRef.effAtAnchor;
    const denom = (raw2 - raw1);
    if (Math.abs(denom) < 0.05) { console.log('Pick a second point further in time to compute the rate.'); return; }
    const newRate = (eff2 - eff1) / denom;
    const newOffset = eff1 - newRate * raw1;
    rateFactor = newRate;
    offsetSeconds = newOffset;
    const rateInput = document.getElementById('rateInput');
    const offsetInput = document.getElementById('offsetInput');
    if (rateInput) rateInput.value = rateFactor.toFixed(3);
    if (offsetInput) offsetInput.value = offsetSeconds.toFixed(2);
    console.log(`📏 Calibrated: offset=${offsetSeconds.toFixed(2)}, rate=${rateFactor.toFixed(3)} (line ${idx})`);
}

// --------- RAF ticker for smoother sync ---------
function tick(now) {
    // Gentle micro-correction inside lines: nudge effective mapping towards current line
    if (autoSync && currentLineIndex >= 0) {
        const L = lyricsData[currentLineIndex];
        const eff = getEffectiveTime();
        const mid = (L.startTime + L.endTime) / 2;
        const err = (mid - eff);
        const nowMs = performance.now();
        if (!lastMicroAdjust) lastMicroAdjust = nowMs;
        const dt = Math.min(0.1, Math.max(0, (nowMs - lastMicroAdjust) / 1000));
        if (nowMs - lastMicroAdjust > 50) {
            // Tiny proportional correction scaled by elapsed time, capped
            const k = 0.5; // small gain per second
            const adjust = Math.max(-0.003, Math.min(0.003, k * err * dt));
            offsetSeconds += adjust;
            lastMicroAdjust = nowMs;
        }
    }
    highlightCurrentLyrics();
    if (!lastProgressUpdate || now - lastProgressUpdate > 100) {
        updateProgress();
        lastProgressUpdate = now;
    }
    rafId = requestAnimationFrame(tick);
}

function startTicker() {
    if (rafId != null) return;
    rafId = requestAnimationFrame(tick);
}

function stopTicker() {
    if (rafId != null) cancelAnimationFrame(rafId);
    rafId = null;
}
