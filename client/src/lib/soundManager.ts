import { Howl, Howler } from 'howler';

interface SoundManifest {
    bgm: Record<string, string>;
}

const MANIFEST: SoundManifest = {
    bgm: {
        menu: '',
        cozy: '',
        tense: '',
        rain: '',
        construction: '',
        planning: '',
    },
};

type SFXKey =
    | 'click' | 'success' | 'complete' | 'alert' | 'money'
    | 'ding' | 'whoosh' | 'warning' | 'unlock' | 'typing'
    | 'drag' | 'drop' | 'quiz_correct' | 'quiz_wrong'
    | 'day_transition' | 'fanfare' | 'storm' | 'card_flip'
    | 'constraint' | 'badge' | 'morale_up' | 'morale_down';

class SoundManager {
    private bgm: Howl | null = null;
    private currentBgmKey: string | null = null;
    private audioCtx: AudioContext | null = null;
    private sfxVolume: number = 1.0;
    private bgmVolume: number = 0.5;
    private isMuted: boolean = false;

    private getCtx(): AudioContext {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        return this.audioCtx;
    }

    private playTone(
        frequency: number,
        duration: number,
        volume: number,
        type: OscillatorType = 'sine',
        attack: number = 0.01,
        decay: number = 0.1,
        rampTo?: number
    ) {
        if (this.isMuted) return;
        const ctx = this.getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        if (rampTo) {
            osc.frequency.linearRampToValueAtTime(rampTo, ctx.currentTime + duration);
        }
        const vol = volume * this.sfxVolume;
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + attack);
        gain.gain.linearRampToValueAtTime(vol * 0.7, ctx.currentTime + attack + decay);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
    }

    private playNoise(duration: number, volume: number, bandpass?: number) {
        if (this.isMuted) return;
        const ctx = this.getCtx();
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        const vol = volume * this.sfxVolume;
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

        if (bandpass) {
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = bandpass;
            filter.Q.value = 1;
            source.connect(filter);
            filter.connect(gain);
        } else {
            source.connect(gain);
        }
        gain.connect(ctx.destination);
        source.start(ctx.currentTime);
        source.stop(ctx.currentTime + duration);
    }

    playSFX(key: SFXKey, volume: number = 1.0) {
        if (this.isMuted) return;
        const v = volume * this.sfxVolume;
        switch (key) {
            case 'click':
                this.playTone(800, 0.08, v * 0.3, 'sine', 0.005, 0.02);
                this.playTone(1200, 0.06, v * 0.15, 'sine', 0.005, 0.02);
                break;

            case 'success':
                this.playTone(523, 0.15, v * 0.35, 'sine', 0.01, 0.05);
                setTimeout(() => this.playTone(659, 0.15, v * 0.35, 'sine', 0.01, 0.05), 120);
                setTimeout(() => this.playTone(784, 0.25, v * 0.4, 'sine', 0.01, 0.08), 240);
                break;

            case 'complete':
                this.playTone(440, 0.12, v * 0.3, 'triangle', 0.01, 0.04);
                setTimeout(() => this.playTone(554, 0.12, v * 0.3, 'triangle', 0.01, 0.04), 100);
                setTimeout(() => this.playTone(659, 0.2, v * 0.35, 'triangle', 0.01, 0.06), 200);
                break;

            case 'ding':
                this.playTone(1047, 0.3, v * 0.25, 'sine', 0.005, 0.15);
                this.playTone(1568, 0.2, v * 0.1, 'sine', 0.005, 0.1);
                break;

            case 'money':
                this.playTone(1319, 0.08, v * 0.25, 'square', 0.005, 0.02);
                setTimeout(() => this.playTone(1568, 0.08, v * 0.25, 'square', 0.005, 0.02), 60);
                setTimeout(() => this.playTone(2093, 0.12, v * 0.2, 'square', 0.005, 0.04), 120);
                break;

            case 'alert':
                this.playTone(880, 0.15, v * 0.3, 'sawtooth', 0.01, 0.05);
                setTimeout(() => this.playTone(880, 0.15, v * 0.3, 'sawtooth', 0.01, 0.05), 200);
                break;

            case 'warning':
                this.playTone(440, 0.2, v * 0.3, 'sawtooth', 0.01, 0.08);
                setTimeout(() => this.playTone(370, 0.25, v * 0.35, 'sawtooth', 0.01, 0.1), 220);
                break;

            case 'whoosh':
                this.playNoise(0.2, v * 0.15, 2000);
                this.playTone(400, 0.2, v * 0.1, 'sine', 0.01, 0.05, 800);
                break;

            case 'typing':
                const freq = 600 + Math.random() * 400;
                this.playTone(freq, 0.04, v * 0.12, 'square', 0.003, 0.01);
                break;

            case 'drag':
                this.playTone(300, 0.1, v * 0.2, 'sine', 0.005, 0.03, 500);
                break;

            case 'drop':
                this.playTone(600, 0.12, v * 0.25, 'sine', 0.005, 0.04, 350);
                this.playNoise(0.06, v * 0.08, 3000);
                break;

            case 'card_flip':
                this.playNoise(0.08, v * 0.1, 4000);
                this.playTone(700, 0.08, v * 0.15, 'triangle', 0.005, 0.02);
                break;

            case 'quiz_correct':
                this.playTone(523, 0.1, v * 0.3, 'sine', 0.01, 0.03);
                setTimeout(() => this.playTone(659, 0.1, v * 0.3, 'sine', 0.01, 0.03), 80);
                setTimeout(() => this.playTone(784, 0.18, v * 0.35, 'sine', 0.01, 0.06), 160);
                break;

            case 'quiz_wrong':
                this.playTone(330, 0.15, v * 0.3, 'sawtooth', 0.01, 0.05);
                setTimeout(() => this.playTone(277, 0.2, v * 0.3, 'sawtooth', 0.01, 0.08), 150);
                break;

            case 'day_transition':
                this.playTone(440, 0.15, v * 0.2, 'triangle', 0.01, 0.05);
                setTimeout(() => this.playTone(554, 0.15, v * 0.2, 'triangle', 0.01, 0.05), 150);
                setTimeout(() => this.playTone(659, 0.15, v * 0.2, 'triangle', 0.01, 0.05), 300);
                setTimeout(() => this.playTone(880, 0.3, v * 0.25, 'triangle', 0.01, 0.1), 450);
                break;

            case 'fanfare':
                this.playTone(523, 0.12, v * 0.3, 'triangle', 0.01, 0.04);
                setTimeout(() => this.playTone(659, 0.12, v * 0.3, 'triangle', 0.01, 0.04), 100);
                setTimeout(() => this.playTone(784, 0.12, v * 0.3, 'triangle', 0.01, 0.04), 200);
                setTimeout(() => this.playTone(1047, 0.35, v * 0.4, 'triangle', 0.01, 0.12), 300);
                setTimeout(() => this.playTone(784, 0.12, v * 0.2, 'sine', 0.01, 0.04), 500);
                setTimeout(() => this.playTone(1047, 0.5, v * 0.4, 'triangle', 0.01, 0.15), 600);
                break;

            case 'storm':
                this.playNoise(1.5, v * 0.2);
                this.playTone(80, 0.8, v * 0.15, 'sawtooth', 0.1, 0.3, 40);
                break;

            case 'unlock':
                this.playTone(523, 0.08, v * 0.25, 'sine', 0.005, 0.02);
                setTimeout(() => this.playTone(659, 0.08, v * 0.25, 'sine', 0.005, 0.02), 70);
                setTimeout(() => this.playTone(784, 0.08, v * 0.25, 'sine', 0.005, 0.02), 140);
                setTimeout(() => this.playTone(1047, 0.2, v * 0.3, 'sine', 0.01, 0.08), 210);
                break;

            case 'constraint':
                this.playTone(200, 0.15, v * 0.25, 'sawtooth', 0.01, 0.05);
                this.playTone(250, 0.12, v * 0.15, 'square', 0.02, 0.04);
                break;

            case 'badge':
                this.playTone(784, 0.1, v * 0.25, 'sine', 0.005, 0.03);
                setTimeout(() => this.playTone(988, 0.1, v * 0.25, 'sine', 0.005, 0.03), 80);
                setTimeout(() => this.playTone(1175, 0.1, v * 0.25, 'sine', 0.005, 0.03), 160);
                setTimeout(() => this.playTone(1568, 0.3, v * 0.35, 'sine', 0.01, 0.1), 240);
                break;

            case 'morale_up':
                this.playTone(440, 0.1, v * 0.2, 'triangle', 0.01, 0.03, 660);
                break;

            case 'morale_down':
                this.playTone(440, 0.15, v * 0.2, 'triangle', 0.01, 0.05, 280);
                break;

            default:
                this.playTone(600, 0.08, v * 0.2, 'sine', 0.005, 0.02);
                break;
        }
    }

    playBGM(key: string, volume: number = 0.5) {
        if (this.currentBgmKey === key) return;
        if (!MANIFEST.bgm[key] || MANIFEST.bgm[key] === '') {
            this.stopBGM();
            return;
        }

        if (this.bgm) {
            this.bgm.fade(this.bgm.volume(), 0, 1000);
            const oldBgm = this.bgm;
            setTimeout(() => oldBgm.stop(), 1000);
        }

        const effectiveVol = this.isMuted ? 0 : volume * this.bgmVolume;

        this.bgm = new Howl({
            src: [MANIFEST.bgm[key]],
            html5: true,
            loop: true,
            volume: 0,
        });

        this.bgm.play();
        this.bgm.fade(0, effectiveVol, 1500);
        this.currentBgmKey = key;
    }

    stopBGM() {
        if (this.bgm) {
            this.bgm.fade(this.bgm.volume(), 0, 800);
            const oldBgm = this.bgm;
            setTimeout(() => {
                oldBgm.stop();
                oldBgm.unload();
            }, 800);
            this.bgm = null;
            this.currentBgmKey = null;
        }
    }

    updateVolumes(bgmVol: number, sfxVol: number, isMuted: boolean) {
        this.bgmVolume = bgmVol;
        this.sfxVolume = sfxVol;
        this.isMuted = isMuted;
        const multiplier = isMuted ? 0 : 1;
        if (this.bgm) {
            this.bgm.volume(bgmVol * multiplier);
        }
    }

    resumeAudio() {
        if (Howler.ctx && Howler.ctx.state === 'suspended') {
            Howler.ctx.resume();
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    getCurrentBGM(): string | null {
        return this.currentBgmKey;
    }
}

export const soundManager = new SoundManager();
export default soundManager;
