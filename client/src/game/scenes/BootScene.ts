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
    }

    create() {
        // Animation removed for now until we have a proper spritesheet
        this.scene.start('MainScene');
    }
}
