import Phaser from 'phaser';

export const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'phaser-container',
    backgroundColor: '#f5f5f5', // Gentle pastel background default
    pixelArt: false, // We want smooth sprites for the anime look
    scale: {
        mode: Phaser.Scale.RESIZE,
        width: '100%',
        height: '100%',
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0, x: 0 }, // Isometric usually needs no gravity
            debug: false
        }
    },
    scene: [] // Scenes will be added dynamically or imported here
};
