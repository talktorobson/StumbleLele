import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface CosmicBlasterGameProps {
  onExit: () => void;
  onGameComplete: (score: number) => void;
  level: number;
}

export default function CosmicBlasterGame({ onExit, onGameComplete, level }: CosmicBlasterGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<CosmicBlasterMock | null>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'victory' | 'gameOver'>('menu');
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [wave, setWave] = useState(1);

  useEffect(() => {
    if (canvasRef.current) {
      gameRef.current = new CosmicBlasterMock(canvasRef.current, {
        onStateChange: setGameState,
        onScoreChange: setScore,
        onHealthChange: setHealth,
        onWaveChange: setWave,
        onGameComplete: (finalScore: number) => {
          onGameComplete(finalScore);
        }
      });
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy();
      }
    };
  }, [onGameComplete]);

  const handleStartGame = () => {
    if (gameRef.current) {
      gameRef.current.startGame();
    }
  };

  const handleRestart = () => {
    if (gameRef.current) {
      gameRef.current.restart();
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-black z-50 overflow-hidden">
      {/* Back Button */}
      <Button
        onClick={onExit}
        className="absolute top-4 right-4 z-50 bg-red-500 hover:bg-red-600 text-white rounded-full p-3"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Voltar
      </Button>

      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-transparent cursor-default"
        style={{ touchAction: 'none' }}
      />

      {/* Game UI Overlay */}
      <div className="absolute top-4 left-4 text-white text-sm md:text-lg font-bold z-40 space-y-2">
        <div className="bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg">
          ⭐ Pontuação: {score}
        </div>
        <div className="bg-red-500/30 backdrop-blur-sm px-3 py-2 rounded-lg">
          ❤️ Base: {health}%
        </div>
        <div className="bg-green-500/30 backdrop-blur-sm px-3 py-2 rounded-lg">
          🌊 Onda: {wave}
        </div>
      </div>

      {/* Game Instructions Modal */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-40">
          <div className="bg-black/90 text-white p-6 md:p-8 rounded-2xl text-center max-w-sm md:max-w-md mx-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-yellow-400">
              🚀 Defesa Cósmica da Lele! 🚀
            </h2>
            <div className="text-left mb-6 space-y-2">
              <p><strong>Como jogar:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>📱 TOQUE na tela para atirar</li>
                <li>👆 DESLIZE para mover horizontalmente</li>
                <li>🎯 Evite obstáculos e inimigos</li>
                <li>🌊 Sobreviva às ondas!</li>
              </ul>
              <p className="text-xs opacity-80 mt-4">
                💻 Desktop: ← → para mover, ↑ para acelerar vertical, ESPAÇO para atirar
              </p>
            </div>
            <Button onClick={handleStartGame} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full text-lg font-bold">
              Começar Aventura! 🎮
            </Button>
          </div>
        </div>
      )}

      {/* Victory Modal */}
      {gameState === 'victory' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-40">
          <div className="bg-black/90 text-white p-6 md:p-8 rounded-2xl text-center max-w-sm mx-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-yellow-400">
              Você Venceu! 🚀⭐
            </h2>
            <p className="mb-6 text-lg">Pontuação Final: <span className="text-yellow-400 font-bold">{score}</span></p>
            <Button onClick={handleRestart} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-bold mr-4">
              Jogar Novamente 🎮
            </Button>
            <Button onClick={onExit} className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-bold">
              Sair
            </Button>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameState === 'gameOver' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-40">
          <div className="bg-black/90 text-white p-6 md:p-8 rounded-2xl text-center max-w-sm mx-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-red-400">
              Fim de Jogo! 😢
            </h2>
            <p className="mb-6 text-lg">Pontuação: <span className="text-yellow-400 font-bold">{score}</span></p>
            <Button onClick={handleRestart} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-bold mr-4">
              Tentar de Novo 🎮
            </Button>
            <Button onClick={onExit} className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-bold">
              Sair
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Cosmic Blaster Game Engine Class
class CosmicBlasterMock {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: {
    onStateChange: (state: 'menu' | 'playing' | 'victory' | 'gameOver') => void;
    onScoreChange: (score: number) => void;
    onHealthChange: (health: number) => void;
    onWaveChange: (wave: number) => void;
    onGameComplete: (score: number) => void;
  };
  private gameState: 'menu' | 'playing' | 'victory' | 'gameOver' = 'menu';
  private animationFrameId: number | null = null;
  private audioCtx: AudioContext;
  
  // Game state
  private score = 0;
  private health = 100;
  private wave = 1;
  private waveProgress = 0;
  private waveEnemiesKilled = 0;
  private currentWeapon = 'basic';
  private tempWeapon: string | null = null;
  private tempWeaponTimer = 0;
  private tempWeaponDuration = 15000;
  private shieldActive = false;
  private shieldTimer = 0;
  private baseScrollSpeed = 3;
  private scrollSpeed = 3;
  
  // Game objects
  private player: any;
  private bullets: any[] = [];
  private enemyBullets: any[] = [];
  private enemies: any[] = [];
  private explosions: any[] = [];
  private stars: any[] = [];
  private obstacles: any[] = [];
  private lanes: any[] = [];
  private pickups: any[] = [];
  private towers: any[] = [];
  private helpers: any[] = [];
  
  // Timing
  private lastShot = 0;
  private lastEnemySpawn = 0;
  private enemySpawnRate = 2000;
  private lastObstacleSpawn = 0;
  private obstacleSpawnRate = 4000;
  private lastPickupSpawn = 0;
  private pickupSpawnRate = 8000;
  private difficultyMultiplier = 1;
  
  // Controls
  private keys: { [key: string]: boolean } = {};
  private touchStartX = 0;
  private touchStartY = 0;
  private isTouching = false;
  
  // Lane system
  private numLanes = 2;
  private laneWidth = 0;

  constructor(canvas: HTMLCanvasElement, callbacks: any) {
    this.canvas = canvas;
    this.callbacks = callbacks;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context');
    }
    this.ctx = ctx;
    
    this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    this.initialize();
  }

  private initialize() {
    this.resizeCanvas();
    this.initializeStars();
    this.initializeLanes();
    this.initializePlayer();
    this.bindEvents();
    this.gameLoop();
  }

  private resizeCanvas() {
    const container = this.canvas.parentElement;
    if (container) {
      this.canvas.width = container.clientWidth;
      this.canvas.height = container.clientHeight;
      this.laneWidth = this.canvas.width / this.numLanes;
    }
  }

  private initializeStars() {
    this.stars = [];
    for (let i = 0; i < 100; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 3,
        twinkle: Math.random() * Math.PI * 2
      });
    }
  }

  private initializeLanes() {
    this.lanes = [];
    for (let i = 0; i <= this.numLanes; i++) {
      this.lanes.push({
        x: i * this.laneWidth,
        segments: Array.from({ length: 15 }, (_, j) => ({
          y: j * 80 - 400,
          type: 'normal'
        }))
      });
    }
  }

  private initializePlayer() {
    this.player = {
      x: this.canvas.width / 2,
      y: this.canvas.height - 100,
      width: 60,
      height: 60,
      speed: 12
    };
  }

  private bindEvents() {
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      if (e.key === ' ' && this.gameState === 'playing') {
        e.preventDefault();
        this.shoot();
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
      if (e.key === 'ArrowUp') {
        this.scrollSpeed = this.baseScrollSpeed;
      }
    });

    // Touch controls
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.isTouching = true;
      const touch = e.touches[0];
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
      
      if (this.gameState === 'playing') {
        this.shoot();
      }
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (!this.isTouching || this.gameState !== 'playing') return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - this.touchStartX;
      
      if (Math.abs(deltaX) > 5) {
        const targetX = this.player.x + deltaX * 0.2;
        this.player.x = Math.max(this.laneWidth/2, Math.min(this.canvas.width - this.laneWidth/2, targetX));
        this.touchStartX = touch.clientX;
      }
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.isTouching = false;
    }, { passive: false });

    // Prevent scrolling
    document.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });

    // Window resize
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.initializeLanes();
    });
  }

  public startGame() {
    this.gameState = 'playing';
    this.callbacks.onStateChange(this.gameState);
    this.resetGame();
  }

  public restart() {
    this.resetGame();
    this.gameState = 'playing';
    this.callbacks.onStateChange(this.gameState);
  }

  private resetGame() {
    this.score = 0;
    this.health = 100;
    this.wave = 1;
    this.waveProgress = 0;
    this.waveEnemiesKilled = 0;
    this.currentWeapon = 'basic';
    this.tempWeapon = null;
    this.tempWeaponTimer = 0;
    this.shieldActive = false;
    this.shieldTimer = 0;
    this.scrollSpeed = this.baseScrollSpeed;
    this.difficultyMultiplier = 1;
    
    this.bullets = [];
    this.enemyBullets = [];
    this.enemies = [];
    this.explosions = [];
    this.obstacles = [];
    this.pickups = [];
    this.towers = [];
    this.helpers = [];
    
    this.lastShot = 0;
    this.lastEnemySpawn = 0;
    this.enemySpawnRate = 2000;
    this.lastObstacleSpawn = 0;
    this.obstacleSpawnRate = 4000;
    this.lastPickupSpawn = 0;
    this.pickupSpawnRate = 8000;
    
    this.initializePlayer();
    this.updateCallbacks();
  }

  private updateCallbacks() {
    this.callbacks.onScoreChange(this.score);
    this.callbacks.onHealthChange(this.health);
    this.callbacks.onWaveChange(this.wave);
  }

  private shoot() {
    if (Date.now() - this.lastShot < 250) return;
    
    this.lastShot = Date.now();
    this.playSound('shoot');
    
    this.bullets.push({
      x: this.player.x,
      y: this.player.y - 20,
      vx: 0,
      vy: -8,
      damage: 1,
      color: '#00ff00',
      size: 4,
      type: 'basic',
      special: 'none'
    });
  }

  private spawnEnemy() {
    const types = ['slime', 'bubble', 'crystal'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const colors = {
      slime: '#00ff00',
      bubble: '#00bfff',
      crystal: '#ff69b4'
    };
    
    const lane = Math.floor(Math.random() * this.numLanes);
    const enemy = {
      x: lane * this.laneWidth + this.laneWidth / 2,
      y: -50,
      type: type,
      color: colors[type as keyof typeof colors],
      size: 20,
      speed: 2 * this.difficultyMultiplier,
      health: 1,
      maxHealth: 1,
      lane: lane
    };
    
    this.enemies.push(enemy);
  }

  private updatePlayer() {
    if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
      this.player.x -= this.player.speed;
    }
    if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
      this.player.x += this.player.speed;
    }
    
    if (this.keys['ArrowUp']) {
      this.scrollSpeed = this.baseScrollSpeed * 2;
    }
    
    this.player.x = Math.max(this.laneWidth/2, Math.min(this.canvas.width - this.laneWidth/2, this.player.x));
  }

  private updateBullets() {
    this.bullets = this.bullets.filter(bullet => {
      bullet.x += bullet.vx;
      bullet.y += bullet.vy;
      return bullet.y > -50;
    });
  }

  private updateEnemies() {
    this.enemies = this.enemies.filter(enemy => {
      enemy.y += enemy.speed;
      
      if (enemy.y > this.canvas.height) {
        this.health -= 10;
        this.updateCallbacks();
        return false;
      }
      
      return true;
    });
  }

  private checkCollisions() {
    // Bullet vs Enemy collisions
    this.bullets.forEach((bullet, bulletIndex) => {
      this.enemies.forEach((enemy, enemyIndex) => {
        const dx = bullet.x - enemy.x;
        const dy = bullet.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < enemy.size + bullet.size) {
          this.explosions.push({
            x: enemy.x,
            y: enemy.y,
            time: Date.now(),
            size: 30
          });
          this.playSound('explosion');
          
          this.bullets.splice(bulletIndex, 1);
          this.enemies.splice(enemyIndex, 1);
          
          this.score += 100;
          this.waveEnemiesKilled++;
          this.updateCallbacks();
          this.checkWaveProgress();
        }
      });
    });

    // Player vs Enemy collisions
    this.enemies.forEach((enemy, enemyIndex) => {
      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < enemy.size + 20) {
        if (!this.shieldActive) {
          this.health -= 20;
        }
        this.enemies.splice(enemyIndex, 1);
        this.explosions.push({
          x: enemy.x,
          y: enemy.y,
          time: Date.now(),
          size: 30
        });
        this.playSound('hit');
        this.updateCallbacks();
      }
    });
  }

  private checkWaveProgress() {
    const enemiesNeeded = Math.min(10 + this.wave * 2, 30);
    if (this.waveEnemiesKilled >= enemiesNeeded) {
      this.wave++;
      this.waveEnemiesKilled = 0;
      this.difficultyMultiplier = 1 + (this.wave - 1) * 0.1;
      
      this.enemySpawnRate = Math.max(800, 2000 - this.wave * 50);
      this.health = Math.min(100, this.health + 20);
      
      if (this.wave > 10) {
        this.gameState = 'victory';
        this.callbacks.onStateChange(this.gameState);
        this.callbacks.onGameComplete(this.score);
      }
      
      this.updateCallbacks();
    }
  }

  private playSound(type: string) {
    try {
      if (type === 'shoot') {
        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(880, this.audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(440, this.audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
        oscillator.start();
        setTimeout(() => oscillator.stop(), 100);
      } else if (type === 'explosion') {
        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.value = 150;
        gainNode.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.2);
        oscillator.start();
        setTimeout(() => oscillator.stop(), 200);
      } else if (type === 'hit') {
        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.value = 100;
        gainNode.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.15);
        oscillator.start();
        setTimeout(() => oscillator.stop(), 150);
      }
    } catch (error) {
      // Audio context may not be available
      console.warn('Audio playback failed:', error);
    }
  }

  private drawPlayer() {
    const px = this.player.x;
    const py = this.player.y;
    
    // Draw Lele as a beautiful girl
    this.ctx.fillStyle = '#ffb6c1'; // Skin
    this.ctx.fillRect(px - 15, py - 20, 30, 20); // Upper body
    
    // Dress/skirt
    this.ctx.fillStyle = '#ff69b4'; // Pink dress
    this.ctx.beginPath();
    this.ctx.moveTo(px - 15, py);
    this.ctx.lineTo(px - 25, py + 30);
    this.ctx.lineTo(px + 25, py + 30);
    this.ctx.lineTo(px + 15, py);
    this.ctx.fill();
    
    // Arms with wand
    this.ctx.fillStyle = '#ffb6c1';
    this.ctx.fillRect(px - 20, py - 10, 10, 20); // Left arm
    this.ctx.fillRect(px + 10, py - 10, 10, 20); // Right arm
    this.ctx.fillStyle = '#ffd700'; // Golden wand
    this.ctx.fillRect(px + 15, py - 5, 15, 3); // Wand
    
    // Head with long hair
    this.ctx.fillStyle = '#8b4513'; // Long hair
    this.ctx.beginPath();
    this.ctx.moveTo(px - 12, py - 30);
    this.ctx.quadraticCurveTo(px, py - 40, px + 12, py - 30);
    this.ctx.lineTo(px + 12, py - 10);
    this.ctx.lineTo(px - 12, py - 10);
    this.ctx.fill();
    
    this.ctx.fillStyle = '#ffb6c1'; // Face
    this.ctx.beginPath();
    this.ctx.arc(px, py - 25, 12, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Eyes
    this.ctx.fillStyle = 'white';
    this.ctx.beginPath();
    this.ctx.arc(px - 5, py - 25, 3, 0, Math.PI * 2);
    this.ctx.arc(px + 5, py - 25, 3, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.fillStyle = 'black';
    this.ctx.beginPath();
    this.ctx.arc(px - 5, py - 25, 1.5, 0, Math.PI * 2);
    this.ctx.arc(px + 5, py - 25, 1.5, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Mouth smile
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(px, py - 18, 4, 0, Math.PI);
    this.ctx.stroke();
    
    // Draw shield if active
    if (this.shieldActive) {
      this.ctx.strokeStyle = '#00ffff';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(px, py, 40, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }

  private drawEnemy(enemy: any) {
    this.ctx.fillStyle = enemy.color;
    this.ctx.beginPath();
    this.ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Eyes
    this.ctx.fillStyle = 'white';
    this.ctx.beginPath();
    this.ctx.arc(enemy.x - 8, enemy.y - 5, 5, 0, Math.PI * 2);
    this.ctx.arc(enemy.x + 8, enemy.y - 5, 5, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.fillStyle = 'red';
    this.ctx.beginPath();
    this.ctx.arc(enemy.x - 8, enemy.y - 5, 2, 0, Math.PI * 2);
    this.ctx.arc(enemy.x + 8, enemy.y - 5, 2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw stars
    this.stars.forEach(star => {
      this.ctx.save();
      this.ctx.globalAlpha = 0.3 + Math.sin(star.twinkle) * 0.3;
      this.ctx.fillStyle = 'white';
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
      star.twinkle += 0.1;
    });
    
    // Draw player
    this.drawPlayer();
    
    // Draw bullets
    this.bullets.forEach(bullet => {
      this.ctx.fillStyle = bullet.color;
      this.ctx.beginPath();
      this.ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    // Draw enemies
    this.enemies.forEach(enemy => this.drawEnemy(enemy));
    
    // Draw explosions
    this.explosions = this.explosions.filter(explosion => {
      const age = Date.now() - explosion.time;
      if (age < 500) {
        this.ctx.save();
        this.ctx.globalAlpha = 1 - (age / 500);
        this.ctx.fillStyle = '#ffff00';
        this.ctx.beginPath();
        this.ctx.arc(explosion.x, explosion.y, age / 10, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
        return true;
      }
      return false;
    });
  }

  private gameLoop() {
    if (this.gameState === 'playing') {
      // Spawn enemies
      if (Date.now() - this.lastEnemySpawn > this.enemySpawnRate) {
        this.spawnEnemy();
        this.lastEnemySpawn = Date.now();
      }
      
      this.updatePlayer();
      this.updateBullets();
      this.updateEnemies();
      this.checkCollisions();
      
      // Check game over
      if (this.health <= 0) {
        this.gameState = 'gameOver';
        this.callbacks.onStateChange(this.gameState);
        this.callbacks.onGameComplete(this.score);
      }
    }
    
    this.draw();
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  public destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
    }
  }
}