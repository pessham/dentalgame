// 歯科リズムゲーム JavaScript - 修正版（音楽対応・判定修正）

class DentalRhythmGame {
    constructor() {
        this.gameState = 'start'; // start, playing, result
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.feverGauge = 0;
        this.isPlaying = false;
        this.gameStartTime = 0;
        this.notes = [];
        this.currentTrack = null;
        
        // タップ判定タイミング (ms) - 厳格化
        this.perfectTiming = 50;  // 50ms以内でPerfect
        this.goodTiming = 120;    // 120ms以内でGood
        
        // 落下時間とオフセット
        this.fallDuration = 2500; // 2.5秒で落下（タイミング精度向上）
        this.musicOffset = 0; // 音楽とのオフセット調整
        
        // 要素の取得
        this.elements = {
            startScreen: document.getElementById('start-screen'),
            resultScreen: document.getElementById('result-screen'),
            startButton: document.getElementById('start-button'),
            restartButton: document.getElementById('restart-button'),
            redTap: document.getElementById('red-tap'),
            blueTap: document.getElementById('blue-tap'),
            singleLane: document.getElementById('single-lane'),
            scoreDisplay: document.getElementById('score'),
            comboDisplay: document.getElementById('combo'),
            feverFill: document.getElementById('fever-fill'),
            judgmentDisplay: document.getElementById('judgment-display'),
            finalScore: document.getElementById('final-score'),
            maxComboDisplay: document.getElementById('max-combo'),
            toothMascot: document.getElementById('tooth-mascot'),
            gameArea: document.querySelector('.game-area'),
            bgm: document.getElementById('bgm'),
            debugInfo: document.getElementById('debug-info'),
            gameTime: document.getElementById('game-time'),
            nextNote: document.getElementById('next-note'),
            timingDiff: document.getElementById('timing-diff')
        };
        
        this.initializeEventListeners();
        this.loadSampleTrack();
    }
    
    initializeEventListeners() {
        // ゲーム開始
        this.elements.startButton.addEventListener('click', () => this.startGame());
        this.elements.restartButton.addEventListener('click', () => this.restartGame());
        
        // タップイベント
        this.elements.redTap.addEventListener('touchstart', (e) => this.handleTap('red', e));
        this.elements.redTap.addEventListener('mousedown', (e) => this.handleTap('red', e));
        this.elements.blueTap.addEventListener('touchstart', (e) => this.handleTap('blue', e));
        this.elements.blueTap.addEventListener('mousedown', (e) => this.handleTap('blue', e));
        
        // 音楽の読み込み完了イベント
        this.elements.bgm.addEventListener('loadeddata', () => {
            console.log('BGM loaded successfully');
        });
        
        this.elements.bgm.addEventListener('error', (e) => {
            console.error('BGM loading error:', e);
        });
        
        // モバイル音楽再生用のユーザーインタラクション初期化
        this.audioInitialized = false;
        this.initAudioOnFirstTouch();
        
        // ゲームエリア以外のタッチイベントのみ防ぐ
        document.addEventListener('touchstart', (e) => {
            // ゲームボタン以外のタッチでのみデフォルト動作を防ぐ
            if (!e.target.closest('.tap-button, .start-button, .restart-button')) {
                e.preventDefault();
            }
        }, { passive: false });
        document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    }
    
    initAudioOnFirstTouch() {
        const initAudio = () => {
            if (!this.audioInitialized) {
                this.elements.bgm.muted = false;
                this.elements.bgm.volume = 0.7;
                // モバイルでの音楽初期化
                this.elements.bgm.play().then(() => {
                    this.elements.bgm.pause();
                    this.elements.bgm.currentTime = 0;
                    this.audioInitialized = true;
                    console.log('Audio initialized for mobile');
                }).catch(e => {
                    console.log('Audio initialization failed:', e);
                });
            }
        };
        
        // 最初のタッチで音楽を初期化
        document.addEventListener('touchstart', initAudio, { once: true });
        document.addEventListener('click', initAudio, { once: true });
    }
    
    loadSampleTrack() {
        // Smile Wide.mp3 に合わせた譜面データ
        this.currentTrack = {
            trackId: "smile_wide_dental",
            bpm: 128, // Smile Wideのテンポに合わせて調整
            duration: 75, // 75秒に延長
            notes: [
                // 楽曲に合わせたタイミング調整
                { time: 1.0, type: "blue" },
                { time: 1.5, type: "red" },
                { time: 2.0, type: "blue" },
                { time: 2.5, type: "blue" },
                { time: 3.0, type: "red" },
                { time: 3.5, type: "blue" },
                { time: 4.0, type: "red" },
                { time: 4.5, type: "blue" },
                { time: 5.0, type: "red" },
                { time: 5.5, type: "blue" },
                { time: 6.0, type: "blue" },
                { time: 6.5, type: "red" },
                { time: 7.0, type: "blue" },
                { time: 7.5, type: "red" },
                { time: 8.0, type: "blue" },
                { time: 8.5, type: "red" },
                { time: 9.0, type: "blue" },
                { time: 9.5, type: "blue" },
                { time: 10.0, type: "red" },
                { time: 10.5, type: "blue" },
                { time: 11.0, type: "red" },
                { time: 11.5, type: "blue" },
                { time: 12.0, type: "red" },
                { time: 12.5, type: "blue" },
                { time: 13.0, type: "blue" },
                { time: 13.5, type: "red" },
                { time: 14.0, type: "blue" },
                { time: 14.5, type: "red" },
                { time: 15.0, type: "blue" },
                { time: 15.5, type: "red" },
                { time: 16.0, type: "blue" },
                { time: 16.5, type: "blue" },
                { time: 17.0, type: "red" },
                { time: 17.5, type: "blue" },
                { time: 18.0, type: "red" },
                { time: 18.5, type: "blue" },
                { time: 19.0, type: "red" },
                { time: 19.5, type: "blue" },
                { time: 20.0, type: "blue" },
                { time: 20.5, type: "red" },
                { time: 21.0, type: "blue" },
                { time: 21.5, type: "red" },
                { time: 22.0, type: "blue" },
                { time: 22.5, type: "red" },
                { time: 23.0, type: "blue" },
                { time: 23.5, type: "blue" },
                { time: 24.0, type: "red" },
                { time: 24.5, type: "blue" },
                { time: 25.0, type: "red" },
                { time: 25.5, type: "blue" },
                { time: 26.0, type: "red" },
                { time: 26.5, type: "blue" },
                { time: 27.0, type: "blue" },
                { time: 27.5, type: "red" },
                { time: 28.0, type: "blue" },
                { time: 28.5, type: "red" },
                { time: 29.0, type: "blue" },
                { time: 29.5, type: "red" },
                // 新たに追加したノーツ（30-75秒）
                { time: 31.0, type: "blue" },
                { time: 32.0, type: "red" },
                { time: 33.0, type: "blue" },
                { time: 33.5, type: "blue" },
                { time: 34.0, type: "red" },
                { time: 35.0, type: "blue" },
                { time: 36.0, type: "red" },
                { time: 37.0, type: "blue" },
                { time: 37.5, type: "red" },
                { time: 38.0, type: "blue" },
                { time: 39.0, type: "red" },
                { time: 40.0, type: "blue" },
                { time: 40.5, type: "blue" },
                { time: 41.0, type: "red" },
                { time: 42.0, type: "blue" },
                { time: 43.0, type: "red" },
                { time: 44.0, type: "blue" },
                { time: 44.5, type: "red" },
                { time: 45.0, type: "blue" },
                { time: 46.0, type: "red" },
                { time: 47.0, type: "blue" },
                { time: 47.5, type: "blue" },
                { time: 48.0, type: "red" },
                { time: 49.0, type: "blue" },
                { time: 50.0, type: "red" },
                { time: 51.0, type: "blue" },
                { time: 51.5, type: "red" },
                { time: 52.0, type: "blue" },
                { time: 53.0, type: "red" },
                { time: 54.0, type: "blue" },
                { time: 54.5, type: "blue" },
                { time: 55.0, type: "red" },
                { time: 56.0, type: "blue" },
                { time: 57.0, type: "red" },
                { time: 58.0, type: "blue" },
                { time: 58.5, type: "red" },
                { time: 59.0, type: "blue" },
                { time: 60.0, type: "red" },
                { time: 61.0, type: "blue" },
                { time: 61.5, type: "blue" },
                { time: 62.0, type: "red" },
                { time: 63.0, type: "blue" },
                { time: 64.0, type: "red" },
                { time: 65.0, type: "blue" },
                { time: 65.5, type: "red" },
                { time: 66.0, type: "blue" },
                { time: 67.0, type: "red" },
                { time: 68.0, type: "blue" },
                { time: 68.5, type: "blue" },
                { time: 69.0, type: "red" },
                { time: 70.0, type: "blue" },
                { time: 71.0, type: "red" },
                { time: 72.0, type: "blue" },
                { time: 72.5, type: "red" },
                { time: 73.0, type: "blue" },
                { time: 74.0, type: "red" },
                { time: 75.0, type: "blue" }
            ]
        };
    }
    
    startGame() {
        this.gameState = 'playing';
        this.isPlaying = true;
        this.gameStartTime = Date.now();
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.feverGauge = 0;
        this.notes = [];
        
        // 画面切り替え
        this.elements.startScreen.classList.add('hidden');
        this.elements.resultScreen.classList.add('hidden');
        this.elements.debugInfo.style.display = 'block';
        
        // BGM再生開始（モバイル対応）
        this.elements.bgm.currentTime = 0;
        if (this.audioInitialized) {
            this.elements.bgm.play().catch(e => {
                console.error('BGM play failed:', e);
                // 音楽が再生できなくてもゲームは続行
            });
        } else {
            // 音楽初期化がまだの場合は無音でゲーム開始
            console.log('Audio not initialized, starting game without music');
        }
        
        // ノーツスポーン開始
        this.spawnNotes();
        
        // ゲームループ開始
        this.gameLoop();
        
        this.updateDisplay();
    }
    
    spawnNotes() {
        this.currentTrack.notes.forEach(noteData => {
            setTimeout(() => {
                if (this.isPlaying) {
                    this.createNote(noteData);
                }
            }, Math.max(0, (noteData.time * 1000) - this.fallDuration + this.musicOffset)); // 負の値を防ぐ
        });
        
        // ゲーム終了タイマー
        setTimeout(() => {
            if (this.isPlaying) {
                this.endGame();
            }
        }, this.currentTrack.duration * 1000);
    }
    
    createNote(noteData) {
        const note = document.createElement('div');
        note.className = 'note';
        note.dataset.type = noteData.type;
        note.dataset.time = noteData.time;
        note.dataset.spawnTime = Date.now();
        
        // 色に応じてクラスとテキストを設定
        if (noteData.type === 'red') {
            note.classList.add('note-red');
            note.textContent = '強';
        } else if (noteData.type === 'blue') {
            note.classList.add('note-blue');
            note.textContent = '軽';
        }
        
        // シングルレーンに配置
        this.elements.singleLane.appendChild(note);
        
        // アニメーション設定（正確なタイミングで落下）
        note.style.animationDuration = `${this.fallDuration}ms`;
        note.style.animationTimingFunction = 'linear'; // 等速落下
        
        // ノーツ管理配列に追加
        this.notes.push({
            element: note,
            data: noteData,
            hit: false,
            spawnTime: Date.now()
        });
        
        // 自動削除（ミス判定）
        setTimeout(() => {
            if (note.parentNode && !note.dataset.hit) {
                this.missNote(note);
            }
        }, this.fallDuration + 100); // タイミングを短縮
    }
    
    handleTap(color, event) {
        event.preventDefault();
        
        if (!this.isPlaying) return;
        
        const currentTime = Date.now();
        
        // モバイルでの音楽再生チェック（フォールバック）
        if (!this.audioInitialized || this.elements.bgm.paused) {
            this.elements.bgm.play().catch(() => {});
        }
        
        // タップエフェクト
        this.addTapEffect(color);
        
        // ノーツ判定
        this.checkNoteHit(color, currentTime);
    }
    
    checkNoteHit(color, tapTime) {
        const gameTime = (tapTime - this.gameStartTime) / 1000;
        
        // 判定対象のノーツを探す（色が一致するもの）
        let closestNote = null;
        let minTimeDiff = Infinity;
        let bestMatchInfo = null;
        
        this.notes.forEach(noteObj => {
            if (noteObj.hit) return;
            if (noteObj.data.type !== color) return; // 色が一致しない場合は無視
            
            // ノーツが判定エリアに到達する正確な時刻を計算
            const noteTargetTime = noteObj.data.time;
            const timeDiff = Math.abs(gameTime - noteTargetTime);
            
            // デバッグ情報更新
            if (timeDiff < minTimeDiff) {
                bestMatchInfo = {
                    noteTime: noteTargetTime,
                    currentTime: gameTime,
                    diff: timeDiff * 1000,
                    color: color,
                    noteColor: noteObj.data.type
                };
            }
            
            // 判定範囲内の最も近いノーツを選択
            if (timeDiff < minTimeDiff && timeDiff <= this.goodTiming / 1000) {
                minTimeDiff = timeDiff;
                closestNote = noteObj;
            }
        });
        
        // デバッグ情報表示
        if (bestMatchInfo) {
            this.elements.timingDiff.textContent = `${bestMatchInfo.diff.toFixed(1)}ms (${bestMatchInfo.color}->${bestMatchInfo.noteColor})`;
        } else {
            this.elements.timingDiff.textContent = 'No notes available';
        }
        
        if (closestNote) {
            this.hitNote(closestNote, minTimeDiff * 1000);
        } else {
            // 判定範囲外のタップは無視（ミスにしない）
            console.log(`Tap outside judgment range: ${bestMatchInfo ? bestMatchInfo.diff.toFixed(1) : 'N/A'}ms`);
        }
    }
    
    hitNote(noteObj, timeDiff) {
        noteObj.hit = true;
        noteObj.element.dataset.hit = 'true';
        
        // 判定計算
        let judgment, points;
        if (timeDiff <= this.perfectTiming) {
            judgment = 'perfect';
            points = noteObj.data.type === 'red' ? 200 : 100;
        } else {
            judgment = 'good';
            points = noteObj.data.type === 'red' ? 100 : 50;
        }
        
        this.score += points;
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        
        // フィーバーゲージ上昇（赤ノーツは大幅上昇）
        const feverIncrease = noteObj.data.type === 'red' ? 15 : 8;
        this.feverGauge = Math.min(100, this.feverGauge + feverIncrease);
        
        this.showJudgment(judgment);
        this.createExplosionEffect(judgment);
        this.removeNote(noteObj.element);
        this.updateDisplay();
        
        // デバッグ情報更新
        this.elements.timingDiff.textContent = `${timeDiff.toFixed(1)}ms (${judgment})`;
        
        // 特殊エフェクト
        if (noteObj.data.type === 'red') {
            this.addRedNoteEffect();
        }
        
        // フィーバーエフェクト
        if (this.feverGauge >= 100) {
            this.activateFever();
        }
    }
    
    missNote(noteElement) {
        this.combo = 0;
        this.feverGauge = Math.max(0, this.feverGauge - 15);
        
        this.showJudgment('miss');
        this.removeNote(noteElement);
        this.updateDisplay();
    }
    
    removeNote(noteElement) {
        if (noteElement && noteElement.parentNode) {
            noteElement.style.opacity = '0';
            setTimeout(() => {
                if (noteElement.parentNode) {
                    noteElement.parentNode.removeChild(noteElement);
                }
            }, 200);
        }
    }
    
    showJudgment(type) {
        const judgmentText = {
            'perfect': 'PERFECT!',
            'good': 'GOOD',
            'miss': 'MISS'
        };
        
        this.elements.judgmentDisplay.textContent = judgmentText[type];
        this.elements.judgmentDisplay.className = `judgment-display judgment-${type}`;
        
        setTimeout(() => {
            this.elements.judgmentDisplay.textContent = '';
            this.elements.judgmentDisplay.className = 'judgment-display';
        }, 500);
    }
    
    createExplosionEffect(judgment) {
        // 爆発エフェクトの作成
        const explosion = document.createElement('div');
        explosion.className = `explosion-effect explosion-${judgment}`;
        
        // ターゲットエリアの中央に配置
        const targetArea = document.querySelector('.target-area');
        const rect = targetArea.getBoundingClientRect();
        explosion.style.left = (rect.left + rect.width/2 - 50) + 'px';
        explosion.style.top = (rect.top + rect.height/2 - 50) + 'px';
        
        document.body.appendChild(explosion);
        
        // パーティクルエフェクトを追加
        this.createParticleEffect(judgment, rect.left + rect.width/2, rect.top + rect.height/2);
        
        // エフェクトを自動削除
        setTimeout(() => {
            if (explosion.parentNode) {
                explosion.parentNode.removeChild(explosion);
            }
        }, 600);
    }
    
    createParticleEffect(judgment, centerX, centerY) {
        // 8方向にパーティクルを飛ばす
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = `particle particle-${judgment}`;
            
            const angle = (i * 45) * Math.PI / 180;
            const distance = 60 + Math.random() * 40;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            particle.style.left = (centerX - 3) + 'px';
            particle.style.top = (centerY - 3) + 'px';
            particle.style.setProperty('--particle-x', x + 'px');
            particle.style.setProperty('--particle-y', y + 'px');
            
            document.body.appendChild(particle);
            
            // パーティクルを自動削除
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 800);
        }
    }
    
    createSuccessSound() {
        // Web Audio APIでキラリーン音を生成
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // キラリーン音の周波数設定
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
            oscillator.frequency.exponentialRampToValueAtTime(1600, audioContext.currentTime + 0.2);
            
            // 音量設定
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.type = 'sine';
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            console.log('Audio effect not supported:', e);
        }
    }
    
    addTapEffect(color) {
        const button = color === 'red' ? this.elements.redTap : this.elements.blueTap;
        button.style.transform = 'scale(0.95)';
        button.style.filter = 'brightness(1.2)';
        
        // モバイルでのフィードバック強化
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
        
        setTimeout(() => {
            button.style.transform = '';
            button.style.filter = '';
        }, 150);
    }
    
    addRedNoteEffect() {
        // 赤ノーツ特殊エフェクト（強く噛む）
        this.elements.toothMascot.style.transform = 'scale(1.3) rotate(15deg)';
        this.elements.toothMascot.style.filter = 'drop-shadow(0 0 10px #f44336)';
        
        setTimeout(() => {
            this.elements.toothMascot.style.transform = '';
            this.elements.toothMascot.style.filter = '';
        }, 300);
    }
    
    activateFever() {
        this.elements.gameArea.classList.add('fever-mode');
        this.feverGauge = 0;
        
        setTimeout(() => {
            this.elements.gameArea.classList.remove('fever-mode');
        }, 3000);
    }
    
    updateDisplay() {
        this.elements.scoreDisplay.textContent = this.score;
        this.elements.comboDisplay.textContent = this.combo;
        this.elements.feverFill.style.width = `${this.feverGauge}%`;
        
        // デバッグ情報更新
        if (this.isPlaying) {
            const gameTime = (Date.now() - this.gameStartTime) / 1000;
            this.elements.gameTime.textContent = gameTime.toFixed(2);
            
            // 次のノーツ情報
            const nextNote = this.notes.find(n => !n.hit);
            if (nextNote) {
                this.elements.nextNote.textContent = `${nextNote.data.type} @ ${nextNote.data.time}s`;
            } else {
                this.elements.nextNote.textContent = 'None';
            }
        }
    }
    
    gameLoop() {
        if (!this.isPlaying) return;
        
        // ゲーム状態更新
        this.updateDisplay();
        
        // 次フレーム
        requestAnimationFrame(() => this.gameLoop());
    }
    
    endGame() {
        this.isPlaying = false;
        this.gameState = 'result';
        
        // BGM停止
        this.elements.bgm.pause();
        
        // デバッグ情報非表示
        this.elements.debugInfo.style.display = 'none';
        
        // リザルト表示
        this.elements.finalScore.textContent = this.score;
        this.elements.maxComboDisplay.textContent = this.maxCombo;
        this.elements.resultScreen.classList.remove('hidden');
        
        // キラリーン効果音再生
        setTimeout(() => {
            this.createSuccessSound();
        }, 500);
        
        // 残っているノーツを削除
        document.querySelectorAll('.note').forEach(note => {
            if (note.parentNode) {
                note.parentNode.removeChild(note);
            }
        });
    }
    
    restartGame() {
        // BGM停止
        this.elements.bgm.pause();
        
        this.elements.resultScreen.classList.add('hidden');
        this.elements.startScreen.classList.remove('hidden');
        this.elements.debugInfo.style.display = 'none';
        this.gameState = 'start';
        
        // ゲーム状態リセット
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.feverGauge = 0;
        this.notes = [];
        
        // エフェクトをリセット
        this.elements.gameArea.classList.remove('fever-mode');
        
        this.updateDisplay();
    }
}

// ゲーム初期化
document.addEventListener('DOMContentLoaded', () => {
    const game = new DentalRhythmGame();
});