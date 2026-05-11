import 'phaser';
import {
  DEFAULT_SCOREBOARD_COLOR,
  DEFAULT_SCOREBOARD_WIDTH,
  GAMEOVER_SCOREBOARD_COLOR,
  GAME_HEIGHT,
  SCOREBOARD_SLIDE_DISTANCE,
} from '../config/originalConstants';
import { GameModel } from '../model/GameModel';
import { GameState } from '../model/GameState';

interface Colour {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * Scoreboard rendering and game-over controls.
 */
export class ScoreboardView extends Phaser.GameObjects.Container {
  private readonly bg: Phaser.GameObjects.Rectangle;
  private readonly timeValue: Phaser.GameObjects.Text;
  private readonly scoreValue: Phaser.GameObjects.Text;
  private readonly thisScoreValue: Phaser.GameObjects.Text;
  private readonly highScoreValue: Phaser.GameObjects.Text;
  private readonly multiplierValue: Phaser.GameObjects.Text;
  private readonly restartButton: Phaser.GameObjects.Text;
  private readonly menuButton: Phaser.GameObjects.Text;

  private targetX: number;
  private colour: Colour = { ...DEFAULT_SCOREBOARD_COLOR };

  constructor(
    scene: Phaser.Scene,
    highScore: number,
    onRestart: () => void,
    onMenu: () => void,
  ) {
    const x = scene.cameras.main.width - DEFAULT_SCOREBOARD_WIDTH;
    super(scene, x, 0);
    this.targetX = x;

    this.bg = scene.add.rectangle(0, 0, DEFAULT_SCOREBOARD_WIDTH, GAME_HEIGHT, 0x342f46, 1);
    this.bg.setOrigin(0, 0);
    this.add(this.bg);

    const centerX = DEFAULT_SCOREBOARD_WIDTH / 2;

    this.addLabel(scene, centerX, 154, 'Time', 32);
    this.timeValue = this.addLabel(scene, centerX, 196, '0:00', 28);

    this.addLabel(scene, centerX, 394, 'Score', 32);
    this.scoreValue = this.addLabel(scene, centerX, 436, '0', 28);
    this.thisScoreValue = this.addLabel(scene, centerX, 478, '', 26, '#88ff88');

    this.addLabel(scene, centerX, 634, 'HighScore', 28);
    this.highScoreValue = this.addLabel(scene, centerX, 676, String(highScore), 28);

    this.addLabel(scene, centerX - 20, GAME_HEIGHT - 42, 'X', 36);
    this.multiplierValue = this.addLabel(scene, centerX + 24, GAME_HEIGHT - 42, '1', 36);

    this.restartButton = scene.add.text(centerX, GAME_HEIGHT - 190, 'Restart', {
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 18, y: 10 },
    }).setOrigin(0.5).setInteractive();
    this.restartButton.visible = false;
    this.restartButton.on('pointerdown', onRestart);
    this.add(this.restartButton);

    this.menuButton = scene.add.text(centerX, GAME_HEIGHT - 120, 'Menu', {
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 18, y: 10 },
    }).setOrigin(0.5).setInteractive();
    this.menuButton.visible = false;
    this.menuButton.on('pointerdown', onMenu);
    this.add(this.menuButton);

    scene.add.existing(this);
    this.applyColour();
  }

  updateFromModel(model: GameModel, highScore: number): void {
    this.x += (this.targetX - this.x) / 18;

    const targetColour = model.gameState === GameState.GameOver
      ? GAMEOVER_SCOREBOARD_COLOR
      : DEFAULT_SCOREBOARD_COLOR;

    this.fadeColour(targetColour, 0.12);
    this.applyColour();

    const timeMs = model.gameState === GameState.GameOver
      ? model.lastGameTime
      : model.elapsedTime;
    const totalSeconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    this.timeValue.setText(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    this.scoreValue.setText(String(model.score));
    this.thisScoreValue.setText(model.thisScore > 0 ? `+${model.thisScore}` : '');
    this.highScoreValue.setText(String(highScore));
    this.multiplierValue.setText(model.multiplier.toFixed(1).replace(/\.0$/, ''));
  }

  showGameOverControls(): void {
    this.targetX = this.scene.cameras.main.width - DEFAULT_SCOREBOARD_WIDTH - SCOREBOARD_SLIDE_DISTANCE;
    this.restartButton.visible = true;
    this.menuButton.visible = true;
  }

  reset(): void {
    this.x = this.scene.cameras.main.width - DEFAULT_SCOREBOARD_WIDTH;
    this.targetX = this.x;
    this.colour = { ...DEFAULT_SCOREBOARD_COLOR };
    this.restartButton.visible = false;
    this.menuButton.visible = false;
    this.applyColour();
  }

  private addLabel(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    fontSize: number,
    color = '#ffffff',
  ): Phaser.GameObjects.Text {
    const label = scene.add.text(x, y, text, {
      fontSize: `${fontSize}px`,
      color,
      fontFamily: 'Arial, Helvetica, sans-serif',
    }).setOrigin(0.5);

    this.add(label);
    return label;
  }

  private fadeColour(target: Colour, speed: number): void {
    this.colour.r = this.stepColour(this.colour.r, target.r, speed);
    this.colour.g = this.stepColour(this.colour.g, target.g, speed);
    this.colour.b = this.stepColour(this.colour.b, target.b, speed);
    this.colour.a = this.stepColour(this.colour.a, target.a, speed);
  }

  private stepColour(current: number, target: number, speed: number): number {
    if (current === target) return current;

    const step = Math.ceil(Math.abs(target - current) * speed);
    return current + Math.sign(target - current) * step;
  }

  private applyColour(): void {
    const colour = (this.colour.r << 16) + (this.colour.g << 8) + this.colour.b;
    this.bg.setFillStyle(colour, this.colour.a / 255);
  }
}
