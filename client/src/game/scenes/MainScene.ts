import Phaser from 'phaser';
import { useGameStore } from '@/store/gameStore';

export class MainScene extends Phaser.Scene {
    private workers: Phaser.GameObjects.Sprite[] = [];
    private unsubscribe?: () => void;
    private flowText!: Phaser.GameObjects.Text;
    private ground!: Phaser.GameObjects.TileSprite;
    private rainEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor() {
        super('MainScene');
    }

    create() {
        const { width, height } = this.scale;

        // 1. Background (Tiled Ground) - Covers entire screen
        this.ground = this.add.tileSprite(width / 2, height / 2, width, height, 'ground');
        this.ground.setAlpha(1); // Full visibility
        this.ground.setScrollFactor(0); // Optional: if we had camera movement

        // 2. Isometric Grid Overlay - Dynamic size
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0xffffff, 0.2);

        const tileWidth = 64;
        const tileHeight = 32;
        // Calculate how many tiles we need to cover the screen plus buffer
        const mapSize = Math.ceil(Math.max(width, height) / tileHeight) + 5;

        for (let x = 0; x < mapSize; x++) {
            for (let y = 0; y < mapSize; y++) {
                const isoX = (x - y) * (tileWidth / 2) + width / 2; // Center horizontal
                const isoY = (x + y) * (tileHeight / 2); // Start from top

                graphics.moveTo(isoX, isoY);
                graphics.lineTo(isoX + tileWidth / 2, isoY + tileHeight / 2);
                graphics.lineTo(isoX, isoY + tileHeight);
                graphics.lineTo(isoX - tileWidth / 2, isoY + tileHeight / 2);
                graphics.lineTo(isoX, isoY);
            }
        }

        // Rain Particles (initially paused)
        this.rainEmitter = this.add.particles(0, 0, 'rain_drop', {
            x: { min: 0, max: width },
            y: 0,
            lifespan: 1000,
            speedY: { min: 400, max: 600 },
            speedX: { min: -50, max: 50 },
            scale: { start: 0.5, end: 0.5 },
            quantity: 4,
            blendMode: 'ADD',
            emitting: false
        });

        // Generate a tiny rect for rain if missing
        if (!this.textures.exists('rain_drop')) {
            const g = this.make.graphics({ x: 0, y: 0 });
            g.fillStyle(0xa5f3fc, 0.6);
            g.fillRect(0, 0, 2, 10);
            g.generateTexture('rain_drop', 2, 10);
        }

        // 3. Add Workers - Distributed across the screen
        const workerTypes = ['worker_blue', 'worker_orange', 'worker_green'];

        for (let i = 0; i < 12; i++) { // Increased count for full screen
            // Random position within sensible bounds (padded from edges)
            const startX = Phaser.Math.Between(100, width - 100);
            const startY = Phaser.Math.Between(100, height - 100);
            const type = Phaser.Math.RND.pick(workerTypes);

            const worker = this.add.sprite(startX, startY, type);
            worker.setScale(1.2);

            // Interactivity
            worker.setInteractive({ cursor: 'pointer' });
            worker.on('pointerover', () => worker.setScale(1.4));
            worker.on('pointerout', () => worker.setScale(1.2));
            worker.on('pointerdown', () => {
                this.spawnWorkerBark("I'm fast!");
                this.tweens.add({ targets: worker, y: '-=10', duration: 100, yoyo: true });
            });

            // Random velocity
            (worker as any).vx = (Math.random() - 0.5) * 1.5;
            (worker as any).vy = (Math.random() - 0.5) * 1.5;

            // Bobbing animation (Walking simulation)
            this.tweens.add({
                targets: worker,
                y: '+=5',
                duration: 250,
                yoyo: true,
                repeat: -1
            });

            this.workers.push(worker);
        }

        // React to Store Changes (Zustand subscription)
        const store = useGameStore;

        // 3.1 Spawn Initial Buildings (Persistent)
        const initialDone = store.getState().columns.find(c => c.id === 'done')?.tasks.length || 0;
        for (let i = 0; i < initialDone; i++) {
            this.spawnBuildingEffect();
        }

        // Store subscription for Store Sync
        this.unsubscribe = store.subscribe((state, prevState) => {
            // Rest of subscription logic...
            const prevDone = prevState.columns.find(c => c.id === 'done')?.tasks.length || 0;
            const currDone = state.columns.find(c => c.id === 'done')?.tasks.length || 0;

            const prevDoing = prevState.columns.find(c => c.id === 'doing')?.tasks.length || 0;
            const currDoing = state.columns.find(c => c.id === 'doing')?.tasks.length || 0;

            if (currDone > prevDone) {
                this.spawnBuildingEffect();
                this.showFloatingText("Value Added! 💰", '#10b981'); // Green
            }

            if (currDoing > prevDoing) {
                // Task started
                this.showFloatingText("Pulling Materials... 🧱", '#f59e0b'); // Orange

                // Random worker bark
                const barks = [
                    "Checking WIP limits...",
                    "Starting new task!",
                    "Plan received, moving out!",
                    "Material pull authorized."
                ];
                this.spawnWorkerBark(Phaser.Utils.Array.GetRandom(barks));
            }

            // Celebration Trigger
            if (state.flags['celebration_triggered'] && !prevState.flags['celebration_triggered']) {
                this.spawnCelebration();
            }

            // Watch for Funds/Morale Change logic continues...
            if (state.funds !== prevState.funds) {
                const diff = state.funds - prevState.funds;
                if (diff > 0) this.showFloatingText(`Funds +$${diff} 💰`, '#10b981');
                else this.showFloatingText(`Funds -$${Math.abs(diff)} 💸`, '#ef4444');
            }

            // Watch for Morale Change
            if (state.lpi.teamMorale !== prevState.lpi.teamMorale) {
                const diff = state.lpi.teamMorale - prevState.lpi.teamMorale;
                if (diff > 0) this.showFloatingText(`Morale +${diff} 😊`, '#10b981');
                else this.showFloatingText(`Morale ${diff} 😓`, '#ef4444');
            }

            // Watch for Chapter Change
            // Watch for Chapter Change
            if (state.chapter !== prevState.chapter) {
                // Safety check: specific to Phaser scene lifecycle
                if (!this.sys || !this.scene || !this.ground) return;

                if (state.chapter === 2) {
                    this.ground.setTexture('ground_mall');
                    this.spawnBuildingEffect(); // Celebrate chapter change
                } else {
                    this.ground.setTexture('ground');
                }
            }
        });

        // Initial Chapter Check
        if (store.getState().chapter === 2) {
            this.ground.setTexture('ground_mall');
        }

        // 4. Handle Window Resize
        this.scale.on('resize', this.resize, this);

        this.setupFlowText();

        // Cleanup on shutdown
        this.events.on('shutdown', () => {
            if (this.unsubscribe) {
                this.unsubscribe();
                this.unsubscribe = undefined;
            }
        });

        this.events.on('destroy', () => {
            if (this.unsubscribe) {
                this.unsubscribe();
                this.unsubscribe = undefined;
            }
        });
    }

    resize(gameSize: Phaser.Structs.Size) {
        const width = gameSize.width;
        const height = gameSize.height;

        this.cameras.main.setViewport(0, 0, width, height);

        if (this.ground) {
            this.ground.setPosition(width / 2, height / 2);
            this.ground.setSize(width, height);
        }
    }

    setupFlowText() {
        this.flowText = this.add.text(10, 10, 'Workflow: Stable', {
            font: '20px Arial',
            color: '#333',
            backgroundColor: '#ffffff'
        });
        this.flowText.setPadding(10);
    }

    spawnBuildingEffect() {
        // Find a random spot on the isometric grid
        const isoX = Math.floor(Math.random() * 10) * 64; // Grid size assumption
        const isoY = Math.floor(Math.random() * 10) * 32;

        const x = (this.scale.width / 2) + (isoX - isoY);
        const y = (this.scale.height / 4) + ((isoX + isoY) / 2);

        // Create a "building" (using a tinted box or sprite for now if asset missing)
        // Since we don't have a building asset yet, lets use a particle burst or a 'foundation' sprite
        // Create a "building"
        const building = this.add.sprite(x, y, 'house_complete')
            .setOrigin(0.5, 0.75) // Adjusted origin for aesthetic grounding
            .setAlpha(0)
            .setDepth(y); // Sorting

        this.tweens.add({
            targets: building,
            y: y - 100, // Rise up
            alpha: 1,
            scaleY: 1.5,
            duration: 1000,
            ease: 'Back.out',
            onComplete: () => {
                // Settle down
                this.tweens.add({
                    targets: building,
                    y: y,
                    scaleY: 1,
                    duration: 500,
                    ease: 'Bounce.out'
                });
            }
        });

        // Floating Text
        const text = this.add.text(x, y - 50, 'Construction Complete!', {
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(2000);

        this.tweens.add({
            targets: text,
            y: y - 150,
            alpha: 0,
            duration: 2000,
            onComplete: () => text.destroy()
        });
    }

    showFloatingText(message: string, color: string) {
        if (!this.add) return;
        const { width, height } = this.scale;
        const text = this.add.text(width / 2, height / 2 - 100, message, {
            fontSize: '24px',
            fontStyle: 'bold',
            color: color,
            stroke: '#ffffff',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(2000);

        this.tweens.add({
            targets: text,
            y: '-=50',
            alpha: 0,
            duration: 2500,
            onComplete: () => text.destroy()
        });
    }

    spawnWorkerBark(text: string) {
        if (!this.add || this.workers.length === 0) return;
        const worker = Phaser.Utils.Array.GetRandom(this.workers);

        const bubble = this.add.text(worker.x, worker.y - 40, text, {
            fontSize: '12px',
            backgroundColor: '#ffffff',
            color: '#000',
            padding: { x: 4, y: 4 }
        }).setOrigin(0.5).setDepth(1500);

        this.tweens.add({
            targets: bubble,
            y: worker.y - 80,
            alpha: 0,
            duration: 2000,
            onComplete: () => bubble.destroy()
        });
    }

    spawnCelebration() {
        const { width, height } = this.scale;

        // 1. Confetti Explosion
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
        const emitter = this.add.particles(0, 0, 'rain_drop', {
            x: width / 2,
            y: height / 2,
            speed: { min: 200, max: 600 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.6, end: 0 },
            lifespan: 2000,
            gravityY: 200,
            quantity: 50,
            emitting: false
        });

        // Tint particles randomly? Phaser particles tinting is per emitter usually, or per particle in newer versions.
        // For simplicity, just burst.
        emitter.explode(100, width / 2, height / 2);

        // 2. Workers Cheer (Jump Tween)
        this.workers.forEach(worker => {
            this.tweens.add({
                targets: worker,
                y: '-=50',
                duration: 300,
                yoyo: true,
                repeat: 3,
                ease: 'Bounce.out'
            });
            this.spawnWorkerBark("YAY! We did it! 🎉");
        });

        // 3. Spawn Buildings everywhere to show "Complete"
        for (let i = 0; i < 5; i++) {
            setTimeout(() => this.spawnBuildingEffect(), i * 300);
        }
    }

    spawnGremlin() {
        if (this.workers.length === 0) return;
        const worker = Phaser.Utils.Array.GetRandom(this.workers);

        // Gremlin: A small dark smoke puff (or "Muda" spirit)
        const gremlin = this.add.circle(worker.x + (Math.random() * 40 - 20), worker.y - 20, 10, 0x1f2937, 0.8);
        gremlin.setDepth(1000);

        // Animation: Rise and fade
        this.tweens.add({
            targets: gremlin,
            y: gremlin.y - 40,
            scale: 1.5,
            alpha: 0,
            duration: 1500,
            onComplete: () => gremlin.destroy()
        });
    }

    update() {
        // Get State from Zustand
        const state = useGameStore.getState();

        // Weather Check
        if (state.flags['weather_rain']) {
            this.rainEmitter.start();
            this.ground.setTint(0x888888); // Darken ground
        } else {
            this.rainEmitter.stop();
            this.ground.clearTint();
        }

        const doingCol = state.columns.find(c => c.id === 'doing');
        const wipRatio = doingCol ? doingCol.tasks.length / doingCol.wipLimit : 0.5;

        // Update Flow Text
        if (wipRatio > 1) {
            this.flowText.setText('Workflow: CONGESTED! (Over WIP)');
            this.flowText.setColor('#ef4444');

            // Spawn Gremlins (Visual Waste)
            if (Math.random() > 0.95) {
                this.spawnGremlin();
            }

        } else if (wipRatio > 0.8) {
            this.flowText.setText('Workflow: Busy');
            this.flowText.setColor('#f59e0b');
        } else {
            this.flowText.setText('Workflow: Smooth');
            this.flowText.setColor('#10b981');
        }

        // Move Workers based on Flow
        // If congested, they move SLOWLY or STOP.
        const speedMultiplier = wipRatio > 1 ? 0.2 : 1.0;

        this.workers.forEach((worker: any) => {
            worker.x += worker.vx * speedMultiplier;
            worker.y += worker.vy * speedMultiplier;

            // Flip sprite based on direction
            if (worker.vx < 0) worker.setFlipX(true);
            else worker.setFlipX(false);

            // Bounce bounds (dynamic)
            const { width, height } = this.scale;
            if (worker.x < 50 || worker.x > width - 50) worker.vx *= -1;
            if (worker.y < 50 || worker.y > height - 50) worker.vy *= -1;
        });
    }
}
