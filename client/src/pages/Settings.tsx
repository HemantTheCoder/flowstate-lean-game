import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Music, Zap, ArrowLeft, Terminal } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import soundManager from '@/lib/soundManager';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Settings() {
  const { audioSettings, setAudioVolume, toggleMute } = useGameStore();

  const handleBgmChange = (value: number[]) => {
    setAudioVolume('bgm', value[0]);
    soundManager.updateVolumes(value[0], audioSettings.sfxVolume, audioSettings.isMuted);
  };

  const handleSfxChange = (value: number[]) => {
    setAudioVolume('sfx', value[0]);
    soundManager.updateVolumes(audioSettings.bgmVolume, value[0], audioSettings.isMuted);
  };

  const handleToggleMute = () => {
    toggleMute();
    const newMuted = !audioSettings.isMuted;
    soundManager.updateVolumes(audioSettings.bgmVolume, audioSettings.sfxVolume, newMuted);
  };

  return (
    <div className="w-full min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(251,146,60,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(59,130,246,0.06) 0%, transparent 50%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md"
      >
        <h2
          data-testid="text-settings-title"
          className="text-2xl md:text-3xl font-bold text-orange-100 mb-6 text-center tracking-wide"
          style={{ textShadow: '0 2px 8px rgba(251,146,60,0.3)' }}
        >
          Settings
        </h2>

        <Card className="bg-slate-800/80 border-slate-700/60 p-5 md:p-6 space-y-6 backdrop-blur-sm">
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-orange-400" />
                  <span className="text-slate-200 font-medium text-sm">BGM Volume</span>
                </div>
                <span data-testid="text-bgm-value" className="text-xs text-slate-400 tabular-nums">
                  {Math.round(audioSettings.bgmVolume * 100)}%
                </span>
              </div>
              <Slider
                data-testid="input-bgm-volume"
                value={[audioSettings.bgmVolume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleBgmChange}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-sky-400" />
                  <span className="text-slate-200 font-medium text-sm">SFX Volume</span>
                </div>
                <span data-testid="text-sfx-value" className="text-xs text-slate-400 tabular-nums">
                  {Math.round(audioSettings.sfxVolume * 100)}%
                </span>
              </div>
              <Slider
                data-testid="input-sfx-volume"
                value={[audioSettings.sfxVolume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleSfxChange}
                className="w-full"
              />
            </div>

            <div className="pt-1">
              <Button
                data-testid="button-toggle-mute"
                variant="outline"
                onClick={handleToggleMute}
                className="w-full border-slate-600 text-slate-200"
              >
                {audioSettings.isMuted ? (
                  <VolumeX className="w-4 h-4 mr-2 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4 mr-2 text-green-400" />
                )}
                {audioSettings.isMuted ? 'Unmute All' : 'Mute All'}
              </Button>
            </div>
          </div>
        </Card>

        <div className="mt-6 space-y-3">
          <Link href="/dev">
            <Button
              data-testid="link-dev-console"
              variant="outline"
              className="w-full border-slate-600 text-slate-300"
            >
              <Terminal className="w-4 h-4 mr-2" />
              Developer Console
            </Button>
          </Link>

          <Link href="/">
            <Button
              data-testid="link-back-home"
              variant="ghost"
              className="w-full text-slate-400"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
