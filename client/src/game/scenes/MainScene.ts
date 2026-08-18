import Phaser from 'phaser';
import { useGameStore } from '@/store/gameStore';

export class MainScene extends Phaser.Scene {
    private workers: Phaser.GameObjects.Sprite[] = [];
    private completedStructures = 0;
    private unsubscribe?: () => void;
    /** Floors of the progress tower, one per 10% of earnedValue. */
    private progressFloors: Phaser.GameObjects.Rectangle[] = [];
    private progressLabel?: Phaser.GameObjects.Text;
    private flowText!: Phaser.GameObjects.Text;
    private ground!: Phaser.GameObjects.TileSprite;
    private rainEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor() {
        super('MainScene');
    }

    create() {
        const { width, height } = this.scale;

        // 1. Background Image - Full screen cover
        const currentChapter = useGameStore.getState().chapter;
        let bgKey = 'construction_bg';
        if (currentChapter === 2) bgKey = 'bg_mall_site';
        if (currentChapter === 3) bgKey = 'bg_depot';

        if (this.textures.exists(bgKey)) {
            const bg = this.add.image(width / 2, height / 2, bgKey);
            const scaleX = width / bg.width;
            const scaleY = height / bg.height;
            const scale = Math.max(scaleX, scaleY);
            bg.setScale(scale);
            bg.setScrollFactor(0);
            (this as any).bgImage = bg;
        }

        // Fallback tiled ground (hidden behind bg)
        this.ground = this.add.tileSprite(width / 2, height / 2, width, height, 'ground');
        this.ground.setAlpha(0.3);
        this.ground.setScrollFactor(0);

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

        // 3. Crews are driven by how many tasks are actually in Doing, so the site staffing
        //    always mirrors the player's WIP decisions rather than a hard-coded headcount.
        const store = useGameStore;
        this.syncCrewsToDoing(store.getState().columns.find(c => c.id === 'doing')?.tasks.length || 0);
        this.syncProgressTower(store.getState().earnedValue || 0);

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

            // Keep visible crew count in step with active work.
            if (currDoing !== prevDoing) {
                this.syncCrewsToDoing(currDoing);
            }

            // Grow the structure as earned value accrues.
            if (state.earnedValue !== prevState.earnedValue) {
                this.syncProgressTower(state.earnedValue || 0);
            }

            if (currDone > prevDone) {
                this.spawnBuildingEffect();
                this.showFloatingText("+VALUE", '#10b981');
            }

            if (currDoing > prevDoing) {
                // Task started
                this.showFloatingText("PULLING MATERIALS", '#f59e0b');

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
                if (diff > 0) this.showFloatingText(`+$${diff}`, '#10b981');
                else this.showFloatingText(`-$${Math.abs(diff)}`, '#ef4444');
            }

            // Watch for Morale Change
            if (state.lpi.teamMorale !== prevState.lpi.teamMorale) {
                const diff = state.lpi.teamMorale - prevState.lpi.teamMorale;
                if (diff > 0) this.showFloatingText(`MORALE +${diff}`, '#10b981');
                else this.showFloatingText(`MORALE ${diff}`, '#ef4444');
            }

            // Watch for Chapter Change
            if (state.chapter !== prevState.chapter) {
                // Safety check: specific to Phaser scene lifecycle
                if (!this.sys || !this.scene || !this.ground) return;

                let newBgKey = 'construction_bg';

                if (state.chapter === 2) {
                    this.ground.setTexture('ground_mall');
                    newBgKey = 'bg_mall_site';
                    this.spawnBuildingEffect(); // Celebrate chapter change
                } else if (state.chapter === 3) {
                    this.ground.setTexture('ground');
                    newBgKey = 'bg_depot';
                } else {
                    this.ground.setTexture('ground');
                }

                const bgImage = (this as any).bgImage;
                if (bgImage && this.textures.exists(newBgKey)) {
                    bgImage.setTexture(newBgKey);
                    const sourceImg = this.textures.get(newBgKey).getSourceImage();
                    if (sourceImg) {
                        const { width, height } = this.scale;
                        const scaleX = width / sourceImg.width;
                        const scaleY = height / sourceImg.height;
                        bgImage.setScale(Math.max(scaleX, scaleY));
                    }
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

        // Resize background image
        const bgImage = (this as any).bgImage;
        if (bgImage) {
            bgImage.setPosition(width / 2, height / 2);
            const scaleX = width / bgImage.texture.getSourceImage().width;
            const scaleY = height / bgImage.texture.getSourceImage().height;
            bgImage.setScale(Math.max(scaleX, scaleY));
        }

        if (this.ground) {
            this.ground.setPosition(width / 2, height / 2);
            this.ground.setSize(width, height);
        }

        // Keep the flow readout centred in the visible band after an orientation change.
        if (this.flowText) {
            this.flowText.setPosition(width / 2, height * 0.62);
        }

        // Rebuild the tower at the new anchor so it doesn't drift off-screen on rotate/resize.
        if (this.progressFloors.length || this.progressLabel) {
            const ev = useGameStore.getState().earnedValue || 0;
            this.progressFloors.forEach(f => f.destroy());
            this.progressFloors = [];
            this.syncProgressTower(ev);
        }
    }

    setupFlowText() {
        // Sits low-centre, between the top HUD panel and the bottom toolbar, so it is actually
        // on screen. Previously at (10,10) it was completely hidden behind the HUD panel.
        const { width, height } = this.scale;
        this.flowText = this.add.text(width / 2, height * 0.62, 'SITE FLOW: SMOOTH', {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '13px',
            fontStyle: 'bold',
            color: '#6ee7b7',
            backgroundColor: 'rgba(2,6,23,0.55)',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setDepth(900);
    }

    /**
     * A tower that literally rises as earned value accrues: one floor per 10% complete.
     * Gives completion a cumulative, persistent shape instead of only a one-off burst per task,
     * so the player can see overall project progress at a glance on the site itself.
     */
    syncProgressTower(earnedValue: number) {
        const { width, height } = this.scale;
        const targetFloors = Math.max(0, Math.min(10, Math.floor(earnedValue / 10)));

        const floorH = 22;
        const floorW = 84;
        const baseX = width * 0.82;
        const baseY = height * 0.66;

        while (this.progressFloors.length > targetFloors) {
            const f = this.progressFloors.pop();
            if (f) f.destroy();
        }

        while (this.progressFloors.length < targetFloors) {
            const i = this.progressFloors.length;
            const y = baseY - i * floorH;
            // Slight inset per floor so it tapers upward like a real frame.
            const w = floorW - i * 3;
            const rect = this.add
                .rectangle(baseX, y, w, floorH - 3, 0x94a3b8, 0.9)
                .setStrokeStyle(1, 0x475569, 1)
                .setDepth(Math.round(y))
                .setAlpha(0)
                .setScale(1, 0.2);

            this.tweens.add({
                targets: rect,
                alpha: 0.9,
                scaleY: 1,
                duration: 520,
                ease: 'Back.out'
            });
            this.progressFloors.push(rect);
        }

        const pct = Math.round(earnedValue);
        if (!this.progressLabel) {
            this.progressLabel = this.add
                .text(baseX, baseY + 22, '', {
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '11px',
                    fontStyle: 'bold',
                    color: '#cbd5e1',
                    backgroundColor: 'rgba(2,6,23,0.55)',
                    padding: { x: 6, y: 3 }
                })
                .setOrigin(0.5)
                .setDepth(950);
        }
        this.progressLabel.setPosition(baseX, baseY + 22);
        this.progressLabel.setText(`STRUCTURE ${pct}%`);
    }

    /**
     * One visible crew per task in Doing — this is the core Lean lesson made visual.
     * Respecting the WIP limit shows a calm site with a couple of focused crews; breaching it
     * crowds the site with crews who then visibly slow down (see `update`).
     */
    syncCrewsToDoing(doingCount: number) {
        const { width, height } = this.scale;
        const workerTypes = ['worker_blue', 'worker_orange', 'worker_green'];
        // Always keep a small baseline of ambient site presence so an empty board isn't a ghost town.
        const target = Math.max(2, Math.min(doingCount, 10));

        while (this.workers.length > target) {
            const w = this.workers.pop();
            if (!w) break;
            this.tweens.add({
                targets: w,
                alpha: 0,
                y: w.y - 20,
                duration: 400,
                onComplete: () => w.destroy()
            });
        }

        while (this.workers.length < target) {
            const i = this.workers.length;
            // Spread crews across the mid-band; avoids the very bottom where the toolbar sits.
            const startX = Phaser.Math.Between(90, Math.max(140, width - 90));
            const startY = Phaser.Math.Between(Math.round(height * 0.42), Math.round(height * 0.66));
            const type = workerTypes[i % workerTypes.length];

            const worker = this.add.sprite(startX, startY, type);
            worker.setScale(0.9).setDepth(Math.round(startY)).setAlpha(0);
            this.tweens.add({ targets: worker, alpha: 1, duration: 400 });

            worker.setInteractive({ cursor: 'pointer' });
            worker.on('pointerover', () => worker.setScale(1.05));
            worker.on('pointerout', () => worker.setScale(0.9));
            worker.on('pointerdown', () => {
                const barks = ['Working hard!', 'Almost done!', 'Need more materials!', 'Following the plan!'];
                this.spawnWorkerBark(Phaser.Utils.Array.GetRandom(barks));
                this.tweens.add({ targets: worker, y: '-=15', duration: 150, yoyo: true });
            });

            const wd: any = worker;
            wd.vx = (Math.random() - 0.5) * 0.8;
            wd.vy = (Math.random() - 0.5) * 0.4;
            this.tweens.add({
                targets: worker,
                scaleY: 0.85,
                duration: 400,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.workers.push(worker);
        }
    }

    spawnBuildingEffect() {
        // Lay completed structures left-to-right in a steady row along the build line, so the
        // site visibly grows as work finishes. The previous version scattered them at random
        // points on a notional iso grid, which read as noise rather than progress.
        const { width, height } = this.scale;
        const index = this.completedStructures++;
        const perRow = 8;
        const col = index % perRow;
        const row = Math.floor(index / perRow);

        const margin = Math.min(120, width * 0.12);
        const usable = Math.max(120, width - margin * 2);
        const x = margin + (usable / perRow) * (col + 0.5);
        // Later rows sit slightly higher and smaller, giving a cheap sense of depth.
        const y = height * 0.66 - row * 46;

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
            this.spawnWorkerBark("We did it!");
        });

        // 3. Spawn Buildings everywhere to show "Complete"
        for (let i = 0; i < 5; i++) {
            // Fix: Use arrow function to preserve 'this' context
            setTimeout(() => {
                if (this.sys) { // Check if scene is still active
                    this.spawnBuildingEffect();
                }
            }, i * 300);
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

        // Weather: chapter 1 day 3 is the scripted monsoon day that blocks structural work, so
        // reflect it on the site directly instead of only in the Kanban banner. The explicit
        // flag still wins so other chapters/events can drive rain themselves.
        const isRainDay = state.flags['weather_rain'] || (state.chapter === 1 && state.day === 3);
        if (isRainDay) {
            this.rainEmitter.start();
            this.ground.setTint(0x64748b);
            (this as any).bgImage?.setTint(0x94a3b8);
        } else {
            this.rainEmitter.stop();
            this.ground.clearTint();
            (this as any).bgImage?.clearTint();
        }

        const doingCol = state.columns.find(c => c.id === 'doing');
        // Guard the divisor: wipLimit can be 0/undefined (e.g. the dev jump helper builds
        // columns without it), which previously produced Infinity/NaN here.
        const wipLimit = doingCol?.wipLimit && doingCol.wipLimit > 0 ? doingCol.wipLimit : 0;
        const doingCount = doingCol?.tasks.length ?? 0;
        const wipRatio = wipLimit > 0 ? doingCount / wipLimit : 0;

        if (!this.flowText) return;

        // Update Flow Text — names the actual cause so the player links cause to effect.
        if (wipRatio > 1) {
            this.flowText.setText(`SITE FLOW: CONGESTED — ${doingCount} crews, limit ${wipLimit}`);
            this.flowText.setColor('#fca5a5');

            // Spawn Gremlins (Visual Waste)
            if (Math.random() > 0.95) {
                this.spawnGremlin();
            }

        } else if (wipRatio >= 0.8) {
            this.flowText.setText(`SITE FLOW: AT CAPACITY — ${doingCount}/${wipLimit}`);
            this.flowText.setColor('#fcd34d');
        } else if (doingCount === 0) {
            this.flowText.setText('SITE FLOW: IDLE — no work pulled');
            this.flowText.setColor('#94a3b8');
        } else {
            this.flowText.setText(`SITE FLOW: SMOOTH — ${doingCount}/${wipLimit}`);
            this.flowText.setColor('#6ee7b7');
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
