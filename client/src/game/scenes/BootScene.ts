import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load assets here
        // this.load.image('logo', 'assets/logo.png');
        // For now, we will use placeholders/primitives
        // Character Portraits
        this.load.image('mira', '/assets/mira.png');
        this.load.image('rao', '/assets/rao.png');
        this.load.image('architect', '/assets/architect.png');

        // Environment
        this.load.image('ground', '/assets/ground.png');

        // Workers (SVGs for perfect transparency)
        this.load.svg('worker_blue', '/assets/worker_blue.svg', { width: 64, height: 64 });
        this.load.svg('worker_orange', '/assets/worker_orange.svg', { width: 64, height: 64 });
        this.load.svg('worker_green', '/assets/worker_green.svg', { width: 64, height: 64 });

        // Buildings
        this.load.image('house_complete', '/assets/house_complete.png');
    }

    create() {
        // Generate Placeholder Textures if assets missing (Fallback)
        // 1. Ground
        if (!this.textures.exists('ground')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xe5e7eb, 1); // Slate-200
            g.fillRect(0, 0, 64, 64);
            g.generateTexture('ground', 64, 64);
        }

        // 2. Workers (Colored Circles)
        const colors = { 'worker_blue': 0x3b82f6, 'worker_orange': 0xf97316, 'worker_green': 0x22c55e };
        Object.entries(colors).forEach(([key, color]) => {
            if (!this.textures.exists(key)) {
                const g = this.make.graphics({ x: 0, y: 0, add: false });
                g.fillStyle(color, 1);
                g.fillCircle(32, 32, 20); // Circle body
                g.fillStyle(0xffffff, 1); // Helmet
                g.fillCircle(32, 25, 12);
                g.generateTexture(key, 64, 64);
            }
        });

        // 3. Portraits (Simple colored squares for UI)
        // Note: For UI images (HTML), this won't help, but for Phaser sprites it will.
        // The React UI uses string paths, so we need real files there.
        // But the user reported purple boxes in "app" which likely refers to Canvas.

        this.scene.start('MainScene');
    }
}
