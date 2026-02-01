import { Howl, Howler } from 'howler';

interface SoundManifest {
    bgm: Record<string, string>;
    sfx: Record<string, string>;
}

const MANIFEST: SoundManifest = {
    bgm: {
        cozy: 'https://cdn.pixabay.com/audio/2022/02/22/audio_d0c0d87f5a.mp3', // Chill/Planning
        tense: 'https://cdn.pixabay.com/audio/2022/03/10/audio_5076413248.mp3', // More urgent
        rain: 'https://cdn.pixabay.com/audio/2021/08/09/audio_6a2039c366.mp3', // Rain ambience
        construction: 'https://cdn.pixabay.com/audio/2022/10/30/audio_5914652972.mp3', // Construction site ambience
    },
    sfx: {
        click: 'https://cdn.pixabay.com/audio/2022/03/15/audio_c8b911c751.mp3',
        money: 'https://cdn.pixabay.com/audio/2021/08/04/audio_06256f6805.mp3',
        alert: 'https://cdn.pixabay.com/audio/2022/03/24/audio_3338350616.mp3',
        storm: 'https://cdn.pixabay.com/audio/2022/01/21/audio_ac6a64b971.mp3',
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

    resumeAudio() {
        if (Howler.ctx && Howler.ctx.state === 'suspended') {
            Howler.ctx.resume();
        }
    }
}

export const soundManager = new SoundManager();
export default soundManager;
