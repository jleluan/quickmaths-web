import 'phaser';
import { GameModel } from '../model/GameModel';
import { BlockView } from '../views/BlockView';
import { GameState } from '../model/GameState';
import {
  SCOREBOARD_WIDTH,
  BORDER_SIZE,
  SCOREBOARD_SLIDE_DISTANCE,
  DEFAULT_SCOREBOARD_COLOR,
  GAMEOVER_SCOREBOARD_COLOR,
} from '../config/originalConstants';
import { StorageService } from '../services/StorageService';
import { AudioService } from '../services/AudioService';

/**
 * GameScene coordinates the rendering of the game model and handles user
 * interactions. It keeps a mapping from model block IDs to their
 * corresponding views. On each update it advances the model and
 * synchronises the views. Right- and left-click events on blocks
 * propagate to the model via handler methods.
 */
export class GameScene extends Phaser.Scene {
  private model: GameModel;
  private blockViews: Map<number, BlockView>;

  // Floating texts for decaying block effects. Each entry stores
  // the text object along with its horizontal and vertical velocity
  // and alpha decay rate. These values are updated every frame to
  // create falling, fading numbers after a correct sum.
  private decayingTexts: { text: Phaser.GameObjects.Text; vx: number; vy: number; alphaDecay: number }[] = [];

  // Scoreboard UI elements
  private scoreboardContainer!: Phaser.GameObjects.Container;
  private scoreboardBg!: Phaser.GameObjects.Rectangle;
  private timeLabel!: Phaser.GameObjects.Text;
  private timeValue!: Phaser.GameObjects.Text;
  private scoreLabel!: Phaser.GameObjects.Text;
  private scoreValue!: Phaser.GameObjects.Text;
  private plusValue!: Phaser.GameObjects.Text;
  private highLabel!: Phaser.GameObjects.Text;
  private highValue!: Phaser.GameObjects.Text;
  private multiplierLabel!: Phaser.GameObjects.Text;
  private multiplierValue!: Phaser.GameObjects.Text;
  // Restart and menu buttons shown when the game is over
  private restartButton!: Phaser.GameObjects.Text;
  private menuButton!: Phaser.GameObjects.Text;
  // Scoreboard position and colour state
  private scoreboardX = 0;
  private scoreboardNewX = 0;
  private scoreboardColor = { ...DEFAULT_SCOREBOARD_COLOR };
  // High score persistence
  private storage!: StorageService;
  private highScore = 0;
  // Flag to run game over logic once
  private processedGameOver = false;
  // Audio service
  private audio!: AudioService;

  constructor() {
    super({ key: 'GameScene' });
    this.model = new GameModel();
    this.blockViews = new Map();
  }

  create(): void {
    // Initialise storage and load high score
    this.storage = new StorageService();
    this.highScore = this.storage.getNumber('quickmaths_highscore', 0);
    // Initialise audio service
    this.audio = new AudioService(this);
    // Set up the scoreboard UI
    this.setupScoreboard();
    // Start the game
    this.model.gameState = GameState.Running;
  }

  update(time: number, delta: number): void {
    // Advance the game logic
    this.model.update(delta);

    // If the model transitioned into GameOver, process end-of-game logic once
    if (this.model.gameState === GameState.GameOver && !this.processedGameOver) {
      this.processedGameOver = true;
      this.onGameOver();
    }
    // Synchronise block views with the model
    for (const block of this.model.blocks) {
      // Create a view for any new block
      if (!this.blockViews.has(block.id)) {
        const view = new BlockView(this, block);
        this.blockViews.set(block.id, view);
        // Set up input handlers
        view.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          // Left click (primary button)
          if (pointer.button === 0) {
            this.model.handleBlockLeftClick(block.id);
            this.audio.playClick();
          }
          // Middle click (button 1) to evaluate equality
          else if (pointer.button === 1) {
            this.model.handleBlockTargetClick(block.id);
            // Prevent default to avoid scroll or context menu
            pointer.event.preventDefault();
          }
        });
        // Prevent context menu on non-left clicks
        view.on('pointerup', (pointer: Phaser.Input.Pointer) => {
          if (pointer.button !== 0) {
            pointer.event.preventDefault();
          }
        });
      }
    }
    // Update existing views and remove inactive ones
    for (const [id, view] of this.blockViews) {
      const block = this.model.blocks.find((b) => b.id === id);
      if (block) {
        view.updateFromModel();
        // Apply bounce offset to the view's position
        view.y = block.y + this.model.bounceYOffset;
      }
    }
    // Remove views for blocks that are no longer active and have fallen off screen
    for (const [id, view] of Array.from(this.blockViews)) {
      const block = this.model.blocks.find((b) => b.id === id);
      if (!block || (!block.active && block.y > this.cameras.main.height + 100)) {
        view.destroy();
        this.blockViews.delete(id);
      }
    }

    // Create decaying texts for removed blocks. The model collects
    // removed positions and values during handleBlockTargetClick and
    // update() when blocks are removed. We consume the list here
    // and spawn floating numbers that drift and fade over time. Each
    // decaying text has a random horizontal velocity and an upward
    // initial velocity; gravity and alpha decay are applied in the
    // update loop below.
    const removed = this.model.consumeRemovedBlocks();
    for (const { x, y, value } of removed) {
      const txt = this.add.text(x, y, String(value), {
        fontSize: '20px',
        color: '#ffaaff',
        fontFamily: 'monospace',
      }).setOrigin(0.5);
      // Start above bounce offset
      txt.y += this.model.bounceYOffset;
      const vx = (Math.random() - 0.5) * 0.06; // horizontal drift (px/ms)
      const vy = -0.15 - Math.random() * 0.15; // initial upward speed (px/ms)
      const alphaDecay = 0.0006; // per ms
      this.decayingTexts.push({ text: txt, vx, vy, alphaDecay });
    }

    // Update decaying texts: apply velocity, gravity and fade out
    for (let i = this.decayingTexts.length - 1; i >= 0; i--) {
      const dec = this.decayingTexts[i];
      // Apply gravity: accelerate downward slightly each ms
      dec.vy += 0.0004 * delta;
      dec.text.x += dec.vx * delta;
      dec.text.y += dec.vy * delta + this.model.bounceYOffset;
      // Fade out
      dec.text.setAlpha(dec.text.alpha - dec.alphaDecay * delta);
      // Remove if fully faded or off-screen
      if (dec.text.alpha <= 0 || dec.text.y > this.cameras.main.height + 50) {
        dec.text.destroy();
        this.decayingTexts.splice(i, 1);
      }
    }

    // Apply bounce offset to scoreboard container
    this.scoreboardContainer.y = this.model.bounceYOffset;
    // Update the scoreboard UI each frame
    this.updateScoreboard(delta);
  }

  /**
   * Set up the scoreboard container, background and text elements. The
   * scoreboard is positioned to the right of the playfield and will
   * slide left on game over. Restart and menu buttons are created but
   * hidden until the game ends.
   */
  private setupScoreboard(): void {
    const { width, height } = this.cameras.main;
    this.scoreboardX = width - SCOREBOARD_WIDTH;
    this.scoreboardNewX = this.scoreboardX;
    // Container to hold all scoreboard elements
    this.scoreboardContainer = this.add.container(this.scoreboardX, 0);
    // Background rectangle
    this.scoreboardBg = this.add.rectangle(0, 0, SCOREBOARD_WIDTH, height, 0xffffff, 1);
    this.scoreboardBg.setOrigin(0, 0);
    this.scoreboardContainer.add(this.scoreboardBg);
    // Labels and values
    const padding = 20;
    let currentY = padding;
    const centerX = SCOREBOARD_WIDTH / 2;
    // Time
    this.timeLabel = this.add.text(centerX, currentY, 'Time', { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
    currentY += 36;
    this.timeValue = this.add.text(centerX, currentY, '0:00', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);
    currentY += 60;
    // Score
    this.scoreLabel = this.add.text(centerX, currentY, 'Score', { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
    currentY += 36;
    this.scoreValue = this.add.text(centerX, currentY, '0', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);
    currentY += 36;
    this.plusValue = this.add.text(centerX, currentY, '', { fontSize: '20px', color: '#88ff88' }).setOrigin(0.5);
    currentY += 60;
    // High score
    this.highLabel = this.add.text(centerX, currentY, 'HighScore', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);
    currentY += 36;
    this.highValue = this.add.text(centerX, currentY, String(this.highScore), { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);
    currentY += 60;
    // Multiplier label (X) and value
    this.multiplierLabel = this.add.text(centerX - 20, height - 60, 'X', { fontSize: '32px', color: '#ffffff' }).setOrigin(0.5);
    this.multiplierValue = this.add.text(centerX + 20, height - 60, '1', { fontSize: '32px', color: '#ffffff' }).setOrigin(0.5);
    // Add texts to container
    this.scoreboardContainer.add([
      this.timeLabel,
      this.timeValue,
      this.scoreLabel,
      this.scoreValue,
      this.plusValue,
      this.highLabel,
      this.highValue,
      this.multiplierLabel,
      this.multiplierValue,
    ]);
    // Restart button
    this.restartButton = this.add.text(centerX, height - 180, 'Restart', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#444444',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive();
    this.restartButton.visible = false;
    this.restartButton.on('pointerdown', () => {
      this.audio.playClick();
      this.restartGame();
    });
    this.scoreboardContainer.add(this.restartButton);
    // Menu button
    this.menuButton = this.add.text(centerX, height - 120, 'Menu', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#444444',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive();
    this.menuButton.visible = false;
    this.menuButton.on('pointerdown', () => {
      this.audio.playClick();
      // Return to the start scene
      this.scene.start('StartScene');
    });
    this.scoreboardContainer.add(this.menuButton);
    // Set initial colour
    this.applyScoreboardColor();
  }

  /**
   * Update scoreboard content, position and colour every frame. This
   * includes sliding the scoreboard towards its target X coordinate,
   * interpolating its colour between default and game-over values,
   * updating the timer, score, plus and high score labels, and
   * refreshing the multiplier display.
   */
  private updateScoreboard(delta: number): void {
    // Slide scoreboard horizontally towards its target
    this.scoreboardX += (this.scoreboardNewX - this.scoreboardX) / 18;
    this.scoreboardContainer.x = this.scoreboardX;
    // Interpolate colour towards the target colour
    const targetColor = this.model.gameState === GameState.GameOver ? GAMEOVER_SCOREBOARD_COLOR : DEFAULT_SCOREBOARD_COLOR;
    const fadeSpeed = 0.12;
    this.scoreboardColor.r += Math.sign(targetColor.r - this.scoreboardColor.r) * Math.ceil(Math.abs(targetColor.r - this.scoreboardColor.r) * fadeSpeed);
    this.scoreboardColor.g += Math.sign(targetColor.g - this.scoreboardColor.g) * Math.ceil(Math.abs(targetColor.g - this.scoreboardColor.g) * fadeSpeed);
    this.scoreboardColor.b += Math.sign(targetColor.b - this.scoreboardColor.b) * Math.ceil(Math.abs(targetColor.b - this.scoreboardColor.b) * fadeSpeed);
    this.scoreboardColor.a += Math.sign(targetColor.a - this.scoreboardColor.a) * Math.ceil(Math.abs(targetColor.a - this.scoreboardColor.a) * fadeSpeed);
    this.applyScoreboardColor();
    // Update timer display. If game is running, show current elapsed time;
    // if over, show total time of last game.
    const totalMs = this.model.gameState === GameState.GameOver ? this.model.lastGameTime : this.model.elapsedTime;
    const totalSeconds = Math.floor(totalMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    this.timeValue.setText(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    // Update score and plus displays
    this.scoreValue.setText(String(this.model.score));
    if (this.model.thisScore > 0) {
      this.plusValue.setText('+' + String(this.model.thisScore));
    } else {
      this.plusValue.setText('');
    }
    // Update high score display
    this.highValue.setText(String(this.highScore));
    // Update multiplier display
    this.multiplierValue.setText(this.model.multiplier.toFixed(1).replace(/\.0$/, ''));
  }

  /**
   * Apply the current scoreboard colour to the background rectangle.
   */
  private applyScoreboardColor(): void {
    const { r, g, b, a } = this.scoreboardColor;
    const colour = (r << 16) + (g << 8) + b;
    this.scoreboardBg.setFillStyle(colour, a / 255);
  }

  /**
   * Called once when the model enters the GameOver state. Captures
   * final time, updates the high score if necessary, sets the
   * scoreboard to slide left, shows restart/menu buttons and stores
   * the high score.
   */
  private onGameOver(): void {
    // Capture last game time
    this.model.lastGameTime = this.model.elapsedTime;
    // Transfer any pending points into the main score
    this.model.score += this.model.thisScore;
    this.model.thisScore = 0;
    // Update high score
    if (this.model.score > this.highScore) {
      this.highScore = this.model.score;
      this.storage.setNumber('quickmaths_highscore', this.highScore);
    }
    // Set target position for scoreboard slide
    this.scoreboardNewX = this.scoreboardX - SCOREBOARD_SLIDE_DISTANCE;
    // Show restart and menu buttons
    this.restartButton.visible = true;
    this.menuButton.visible = true;
  }

  /**
   * Reset the game to a fresh state. Creates a new model, hides
   * buttons, resets scoreboard position/colour and restarts the
   * gameplay loop.
   */
  private restartGame(): void {
    // Reset scoreboard state
    const { width } = this.cameras.main;
    this.scoreboardX = width - SCOREBOARD_WIDTH;
    this.scoreboardNewX = this.scoreboardX;
    this.scoreboardColor = { ...DEFAULT_SCOREBOARD_COLOR };
    this.applyScoreboardColor();
    this.restartButton.visible = false;
    this.menuButton.visible = false;
    // Clear existing block views
    for (const [id, view] of this.blockViews) {
      view.destroy();
    }
    this.blockViews.clear();
    // Create a new model
    this.model = new GameModel();
    // Reset flags
    this.processedGameOver = false;
    // Start the game
    this.model.gameState = GameState.Running;
  }
}
