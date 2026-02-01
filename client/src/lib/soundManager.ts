import { Howl } from 'howler';

interface SoundManifest {
    bgm: Record<string, string>;
    sfx: Record<string, string>;
}

const MANIFEST: SoundManifest = {
    bgm: {
        cozy: 'https://assets.mixkit.co/music/preview/mixkit-house-design-158.mp3', // Relaxed/Planning
        tense: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibe-130.mp3', // High WIP / Tangled
        rain: 'https://assets.mixkit.co/music/preview/mixkit-rain-light-01-2495.mp3', // Ambience for Day 3
    },
    sfx: {
        click: 'https://assets.mixkit.co/sfx/preview/mixkit-modern-technology-select-3124.mp3',
        money: 'https://assets.mixkit.co/sfx/preview/mixkit-clinking-coins-720.mp3',
        alert: 'https://assets.mixkit.co/sfx/preview/mixkit-interface-hint-notification-911.mp3',
        storm: 'https://assets.mixkit.co/sfx/preview/mixkit-thunder-and-rainstorm-2396.mp3',
    }
};

class SoundManager {
    private bgm: Howl | null = null;
    private sfxLoops: Record<string, Howl> = {};
    private currentBgmKey: string | null = null;

    playBGM(key: string, volume: number = 0.5) {
        if (this.currentBgmKey === key) return;

        if (this.bgm) {
            this.bgm.fade(this.bgm.volume(), 0, 1000);
            const oldBgm = this.bgm;
            setTimeout(() => oldBgm.stop(), 1000);
        }

        this.bgm = new Howl({
            src: [MANIFEST.bgm[key]],
            html5: true,
            loop: true,
            volume: 0,
        });

        this.bgm.play();
        this.bgm.fade(0, volume, 1000);
        this.currentBgmKey = key;
    }

    playSFX(key: string, volume: number = 1.0) {
        const sound = new Howl({
            src: [MANIFEST.sfx[key]],
            volume,
        });
        sound.play();
    }

    updateVolumes(bgmVol: number, sfxVol: number, isMuted: boolean) {
        const multiplier = isMuted ? 0 : 1;
        if (this.bgm) {
            this.bgm.volume(bgmVol * multiplier);
        }
        Howler.volume(sfxVol * multiplier);
    }
}

export const soundManager = new SoundManager();
export default soundManager;
