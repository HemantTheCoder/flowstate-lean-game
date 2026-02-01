import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { gameConfig } from '@/game/config';
import { BootScene } from '@/game/scenes/BootScene';
import { MainScene } from '@/game/scenes/MainScene';

export const GameCanvas: React.FC = () => {
    const gameRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && !gameRef.current) {
            // Initialize the game
            const config = {
                ...gameConfig,
                scene: [
                    BootScene,
                    MainScene
                ]
            };

            gameRef.current = new Phaser.Game(config);
        }

        return () => {
            // Cleanup on unmount
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, []);

    return (
        <div
            id="phaser-container"
            className="w-full h-full absolute top-0 left-0 -z-10 overflow-hidden"
        />
    );
};
