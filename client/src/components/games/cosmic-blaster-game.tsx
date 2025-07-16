
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

  // Add logging to React state changes
  const handleStateChange = (newState: 'menu' | 'playing' | 'victory' | 'gameOver') => {
    console.log('React: State change requested from', gameState, 'to', newState);
    setGameState(newState);
  };

  useEffect(() => {
    if (canvasRef.current && !gameRef.current) {
      try {
        console.log('Creating CosmicBlasterMock instance...');
        gameRef.current = new CosmicBlasterMock(canvasRef.current!, {
          onStateChange: handleStateChange,
          onScoreChange: setScore,
          onHealthChange: setHealth,
          onWaveChange: setWave,
          onGameComplete: (finalScore: number) => {
            onGameComplete(finalScore);
          }
        });
        console.log('CosmicBlasterMock instance created successfully');
      } catch (error) {
        console.error('Game initialization error:', error);
      }
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy();
        gameRef.current = null;
      }
    };
  }, []); // Remove onGameComplete dependency to prevent re-creation

  const handleStartGame = () => {
    console.log('handleStartGame called, gameRef.current:', !!gameRef.current);
    console.log('Current React gameState:', gameState);
    if (gameRef.current) {
      gameRef.current.startGame();
    } else {
      console.error('No game instance available!');
    }
  };

  const handleRestart = () => {
    if (gameRef.current) {
      gameRef.current.restart();
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-black z-[9999] overflow-hidden">
      {/* Back Button */}
      <Button
        onClick={onExit}
        className="absolute top-4 right-4 z-[10000] bg-red-500 hover:bg-red-600 text-white rounded-full p-3"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Voltar
      </Button>

      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-transparent cursor-default"
        style={{ 
          touchAction: 'none',
          pointerEvents: 'auto',
          position: 'relative',
          zIndex: 1000
        }}
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
              <p><strong>Como jogar (estilo 1945 Air Force):</strong></p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>👆 ARRASTE o dedo na tela para mover a Lele</li>
                <li>🎯 Tiros são AUTOMÁTICOS - apenas se mova!</li>
                <li>💎 Colete power-ups para melhorar armas</li>
                <li>🌊 Sobreviva às ondas de inimigos!</li>
              </ul>
              <p className="text-xs opacity-80 mt-4">
                💻 Desktop: Clique e arraste o mouse para mover
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
  private weaponLevel = 1; // Auto-upgrade weapon system
  private weaponUpgradeTimer = 0;
  private weaponUpgradeDuration = 10000; // 10 seconds per upgrade
  private shieldActive = false;
  private shieldTimer = 0;
  private baseScrollSpeed = 3;
  private scrollSpeed = 3;
  private autoShootRate = 150; // Automatic shooting every 150ms
  private lastAutoShot = 0;
  
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
    console.log('=== COSMIC BLASTER CONSTRUCTOR ===');
    this.canvas = canvas;
    this.callbacks = callbacks;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context');
    }
    this.ctx = ctx;
    
    // Initialize audio context with error handling and proper state management
    try {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if suspended (required for many browsers)
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(error => {
          console.warn('Audio context resume failed:', error);
        });
      }
    } catch (error) {
      console.warn('Audio context initialization failed:', error);
      // Create a mock audio context to prevent errors
      this.audioCtx = {
        createOscillator: () => ({ connect: () => {}, start: () => {}, stop: () => {} }),
        createGain: () => ({ connect: () => {}, gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }),
        destination: {},
        currentTime: 0,
        state: 'suspended',
        close: () => Promise.resolve(),
        resume: () => Promise.resolve()
      } as any;
    }
    
    this.initialize();
  }

  private initialize() {
    console.log('Initializing game...');
    this.resizeCanvas();
    this.initializeStars();
    this.initializeLanes();
    this.initializePlayer();
    this.bindEvents();
    console.log('Starting game loop...');
    // Initialize the animation frame ID to start the loop
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  private resizeCanvas() {
    try {
      const container = this.canvas.parentElement;
      if (container && container.clientWidth > 0 && container.clientHeight > 0) {
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.laneWidth = this.canvas.width / this.numLanes;
      } else {
        // Fallback dimensions
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.laneWidth = this.canvas.width / this.numLanes;
      }
    } catch (error) {
      console.warn('Canvas resize error:', error);
      // Use safe defaults
      this.canvas.width = 800;
      this.canvas.height = 600;
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
      y: this.canvas.height - 150, // Position higher up for better visibility
      width: 40,
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

    // Touch controls - 1945 Air Force style
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Touch start detected, gameState:', this.gameState);
      if (this.gameState !== 'playing') return;
      
      this.isTouching = true;
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const canvasX = touch.clientX - rect.left;
      const canvasY = touch.clientY - rect.top;
      
      // Convert to canvas coordinates
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      
      this.player.x = canvasX * scaleX;
      this.player.y = canvasY * scaleY;
      
      // Keep player within bounds
      this.player.x = Math.max(30, Math.min(this.canvas.width - 30, this.player.x));
      this.player.y = Math.max(50, Math.min(this.canvas.height - 50, this.player.y));
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Touch move detected');
      if (!this.isTouching || this.gameState !== 'playing') return;
      
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const canvasX = touch.clientX - rect.left;
      const canvasY = touch.clientY - rect.top;
      
      // Convert to canvas coordinates
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      
      // Smooth movement - player follows finger exactly
      this.player.x = canvasX * scaleX;
      this.player.y = canvasY * scaleY;
      
      // Keep player within bounds
      this.player.x = Math.max(30, Math.min(this.canvas.width - 30, this.player.x));
      this.player.y = Math.max(50, Math.min(this.canvas.height - 50, this.player.y));
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
    console.log('=== GAME START CALLED ===');
    // Initialize audio on first user interaction
    this.initializeAudioOnUserInteraction();
    
    this.resetGame();
    this.gameState = 'playing';
    console.log('Game state set to:', this.gameState);
    console.log('Calling onStateChange callback...');
    this.callbacks.onStateChange(this.gameState);
    console.log('onStateChange callback called');
    // Reset timers to allow immediate spawning
    this.lastAutoShot = Date.now() - this.autoShootRate; // Allow immediate shooting
    this.lastEnemySpawn = Date.now() - this.enemySpawnRate; // Allow immediate enemy spawn
    this.lastPickupSpawn = Date.now() - this.pickupSpawnRate; // Allow immediate pickup spawn
    console.log('Timers reset for immediate spawning');
  }

  public restart() {
    // Initialize audio on user interaction
    this.initializeAudioOnUserInteraction();
    
    this.resetGame();
    this.gameState = 'playing';
    this.callbacks.onStateChange(this.gameState);
    // Reset timers to allow immediate spawning
    this.lastAutoShot = Date.now() - this.autoShootRate; // Allow immediate shooting
    this.lastEnemySpawn = Date.now() - this.enemySpawnRate; // Allow immediate enemy spawn
    this.lastPickupSpawn = Date.now() - this.pickupSpawnRate; // Allow immediate pickup spawn
  }

  private initializeAudioOnUserInteraction() {
    try {
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().then(() => {
          console.log('Audio context resumed successfully');
        }).catch(error => {
          console.warn('Failed to resume audio context:', error);
        });
      }
    } catch (error) {
      console.warn('Audio initialization on user interaction failed:', error);
    }
  }

  private resetGame() {
    this.score = 0;
    this.health = 100;
    this.wave = 1;
    this.waveProgress = 0;
    this.waveEnemiesKilled = 0;
    this.weaponLevel = 1; // Start with basic auto-weapon
    this.weaponUpgradeTimer = 0;
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
    console.log('Updating callbacks - gameState:', this.gameState, 'score:', this.score);
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
      color: '#ffd700',
      size: 4,
      type: 'basic',
      special: 'none'
    });
  }

  private autoShoot() {
    if (this.gameState !== 'playing') return;
    if (!this.player) return;
    if (Date.now() - this.lastAutoShot < this.autoShootRate) return;
    
    console.log('Auto shooting!');
    this.lastAutoShot = Date.now();
    this.playSound('shoot');
    
    // Automatic weapon progression based on weapon level
    switch (this.weaponLevel) {
      case 1: // Basic dual shots
        this.bullets.push({
          x: this.player.x - 8,
          y: this.player.y - 20,
          vx: 0,
          vy: -10,
          damage: 1,
          color: '#ffd700',
          size: 3,
          type: 'auto',
          special: 'none'
        });
        this.bullets.push({
          x: this.player.x + 8,
          y: this.player.y - 20,
          vx: 0,
          vy: -10,
          damage: 1,
          color: '#ffd700',
          size: 3,
          type: 'auto',
          special: 'none'
        });
        break;
        
      case 2: // Triple shots
        for (let i = -1; i <= 1; i++) {
          this.bullets.push({
            x: this.player.x + i * 12,
            y: this.player.y - 20,
            vx: i * 1,
            vy: -10,
            damage: 1,
            color: '#00ff00',
            size: 3,
            type: 'auto',
            special: 'spread'
          });
        }
        break;
        
      case 3: // Rapid fire with spread
        for (let i = -2; i <= 2; i++) {
          this.bullets.push({
            x: this.player.x + i * 8,
            y: this.player.y - 20,
            vx: i * 0.5,
            vy: -12,
            damage: 1,
            color: '#ff6600',
            size: 2,
            type: 'auto',
            special: 'rapid'
          });
        }
        break;
        
      default: // Max level - powerful shots
        this.bullets.push({
          x: this.player.x,
          y: this.player.y - 20,
          vx: 0,
          vy: -15,
          damage: 3,
          color: '#ff0099',
          size: 6,
          type: 'auto',
          special: 'power'
        });
        break;
    }
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

  private spawnObstacle() {
    const types = ['wall', 'gate'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const colors = {
      wall: '#8B4513',
      gate: '#FFD700'
    };
    
    const lane = Math.floor(Math.random() * this.numLanes);
    const obstacle = {
      x: lane * this.laneWidth + this.laneWidth / 2,
      y: -100,
      type: type,
      color: colors[type as keyof typeof colors],
      width: this.laneWidth - 20,
      height: 80,
      speed: this.scrollSpeed * this.difficultyMultiplier,
      lane: lane,
      health: 5, // Example health
      lastShot: Date.now()
    };
    
    this.obstacles.push(obstacle);
  }

  private spawnPickup() {
    const types = ['weapon', 'health', 'shield'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const colors = {
      weapon: '#ffd700',  // Gold for weapon upgrades
      health: '#ff6b6b',  // Red for health
      shield: '#4ecdc4'   // Cyan for shield
    };
    
    const lane = Math.floor(Math.random() * this.numLanes);
    const pickup = {
      x: lane * this.laneWidth + this.laneWidth / 2,
      y: -30,
      type: type,
      color: colors[type as keyof typeof colors],
      size: 15,
      speed: 2,
      pulseTime: Date.now(),
      lane: lane
    };
    
    this.pickups.push(pickup);
  }

  private updatePickups() {
    this.pickups = this.pickups.filter(pickup => {
      pickup.y += pickup.speed;
      
      // Remove pickups that go off screen
      if (pickup.y > this.canvas.height + 50) {
        return false;
      }
      
      return true;
    });
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
    try {
      // Bullet vs Enemy collisions - iterate backwards to avoid index issues
      for (let bulletIndex = this.bullets.length - 1; bulletIndex >= 0; bulletIndex--) {
        const bullet = this.bullets[bulletIndex];
        if (!bullet) continue;
        
        for (let enemyIndex = this.enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
          const enemy = this.enemies[enemyIndex];
          if (!enemy) continue;
          
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
            
            // Remove collided objects
            this.bullets.splice(bulletIndex, 1);
            this.enemies.splice(enemyIndex, 1);
            
            this.score += 100;
            this.waveEnemiesKilled++;
            this.updateCallbacks();
            this.checkWaveProgress();
            break; // Exit enemy loop since bullet is destroyed
          }
        }
      }

      // Player vs Pickup collisions - automatic collection and weapon upgrade
      for (let pickupIndex = this.pickups.length - 1; pickupIndex >= 0; pickupIndex--) {
        const pickup = this.pickups[pickupIndex];
        if (!pickup || !this.player) continue;
        
        const dx = this.player.x - pickup.x;
        const dy = this.player.y - pickup.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < pickup.size + 20) {
          // Automatic weapon upgrade on pickup collection
          if (pickup.type === 'weapon' && this.weaponLevel < 6) {
            this.weaponLevel++;
            this.autoShootRate = Math.max(100, this.autoShootRate - 10); // Faster shooting
          } else if (pickup.type === 'health') {
            this.health = Math.min(100, this.health + 30);
          } else if (pickup.type === 'shield') {
            this.shieldActive = true;
            this.shieldTimer = Date.now() + 5000; // 5 seconds shield
          }
          
          this.pickups.splice(pickupIndex, 1);
          this.explosions.push({
            x: pickup.x,
            y: pickup.y,
            time: Date.now(),
            size: 20,
            color: pickup.type === 'weapon' ? '#ffd700' : pickup.type === 'health' ? '#ff6b6b' : '#4ecdc4'
          });
          this.playSound('pickup');
          this.score += 50;
          this.updateCallbacks();
        }
      }

      // Player vs Enemy collisions - iterate backwards
      for (let enemyIndex = this.enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
        const enemy = this.enemies[enemyIndex];
        if (!enemy || !this.player) continue;
        
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
      }
    } catch (error) {
      console.warn('Collision detection error:', error);
    }
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
      // Check if audio context is available and in a valid state
      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        return; // Silently skip audio if context is not available
      }

      // Resume audio context if suspended (user interaction required)
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {
          // Failed to resume, skip audio
          return;
        });
        return; // Don't play sound this time, wait for context to resume
      }

      // Only play sound if context is running
      if (this.audioCtx.state !== 'running') {
        return;
      }

      if (type === 'shoot') {
        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        if (!oscillator || !gainNode) return;
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(880, this.audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(440, this.audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
        oscillator.start();
        setTimeout(() => {
          try { oscillator.stop(); } catch (e) { /* ignore */ }
        }, 100);
      } else if (type === 'explosion') {
        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        if (!oscillator || !gainNode) return;
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.value = 150;
        gainNode.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.2);
        oscillator.start();
        setTimeout(() => {
          try { oscillator.stop(); } catch (e) { /* ignore */ }
        }, 200);
      } else if (type === 'hit') {
        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        if (!oscillator || !gainNode) return;
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.value = 100;
        gainNode.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.15);
        oscillator.start();
        setTimeout(() => {
          try { oscillator.stop(); } catch (e) { /* ignore */ }
        }, 150);
      } else if (type === 'pickup') {
        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        if (!oscillator || !gainNode) return;
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(660, this.audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1320, this.audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.2);
        oscillator.start();
        setTimeout(() => {
          try { oscillator.stop(); } catch (e) { /* ignore */ }
        }, 200);
      }
    } catch (error) {
      // Audio context may not be available - silently fail
      // Don't log warnings as this is expected behavior in many cases
    }
  }

  private drawPlayer() {
    if (!this.player || !this.ctx) return;
    
    const px = this.player.x || 0;
    const py = this.player.y || 0;
    
    try {
      // Draw longer flowing hair first (behind the head)
      this.ctx.fillStyle = '#8b4513'; // Brown hair
      this.ctx.beginPath();
      // Hair flowing down both sides and back
      this.ctx.moveTo(px - 16, py - 35);
      this.ctx.quadraticCurveTo(px - 8, py - 45, px + 16, py - 35);
      this.ctx.quadraticCurveTo(px + 20, py - 10, px + 18, py + 15); // Right side hair flowing down
      this.ctx.quadraticCurveTo(px + 10, py + 20, px, py + 18); // Hair bottom curve
      this.ctx.quadraticCurveTo(px - 10, py + 20, px - 18, py + 15); // Left side hair flowing down
      this.ctx.quadraticCurveTo(px - 20, py - 10, px - 16, py - 35);
      this.ctx.fill();
      
      // Body with blue shirt (like in image)
      this.ctx.fillStyle = '#4169E1'; // Royal blue
      this.ctx.fillRect(px - 12, py - 5, 24, 25); // Body
      
      // Add white dots on blue shirt
      this.ctx.fillStyle = 'white';
      this.ctx.beginPath();
      this.ctx.arc(px - 6, py + 5, 2, 0, Math.PI * 2);
      this.ctx.arc(px + 6, py + 5, 2, 0, Math.PI * 2);
      this.ctx.arc(px, py + 12, 2, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Arms
      this.ctx.fillStyle = '#ffb6c1'; // Skin color
      this.ctx.fillRect(px - 18, py - 5, 8, 18); // Left arm
      this.ctx.fillRect(px + 10, py - 5, 8, 18); // Right arm
      
      // Face (round and cute)
      this.ctx.fillStyle = '#ffb6c1'; // Skin
      this.ctx.beginPath();
      this.ctx.arc(px, py - 25, 14, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Eyes (big and expressive like in image)
      this.ctx.fillStyle = 'white';
      this.ctx.beginPath();
      this.ctx.arc(px - 6, py - 27, 4, 0, Math.PI * 2);
      this.ctx.arc(px + 6, py - 27, 4, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Eye pupils (brown/dark)
      this.ctx.fillStyle = '#8b4513';
      this.ctx.beginPath();
      this.ctx.arc(px - 6, py - 27, 2, 0, Math.PI * 2);
      this.ctx.arc(px + 6, py - 27, 2, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Eye highlights
      this.ctx.fillStyle = 'white';
      this.ctx.beginPath();
      this.ctx.arc(px - 5, py - 28, 1, 0, Math.PI * 2);
      this.ctx.arc(px + 7, py - 28, 1, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Small orange nose
      this.ctx.fillStyle = '#ff8c69';
      this.ctx.beginPath();
      this.ctx.arc(px, py - 23, 1, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Pink smile
      this.ctx.strokeStyle = '#ff1493';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(px, py - 18, 5, 0, Math.PI);
      this.ctx.stroke();
      
      // Hair bangs/fringe in front
      this.ctx.fillStyle = '#8b4513';
      this.ctx.beginPath();
      this.ctx.moveTo(px - 12, py - 32);
      this.ctx.quadraticCurveTo(px - 6, py - 38, px, py - 32);
      this.ctx.quadraticCurveTo(px + 6, py - 38, px + 12, py - 32);
      this.ctx.quadraticCurveTo(px + 8, py - 30, px, py - 30);
      this.ctx.quadraticCurveTo(px - 8, py - 30, px - 12, py - 32);
      this.ctx.fill();
      
      // Draw shield if active
      if (this.shieldActive) {
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(px, py, 40, 0, Math.PI * 2);
        this.ctx.stroke();
      }
    } catch (error) {
      console.warn('Player drawing error:', error);
    }
  }

  private drawEnemy(enemy: any) {
    if (!enemy || !this.ctx) return;
    
    try {
      this.ctx.fillStyle = enemy.color || '#ff0000';
      this.ctx.beginPath();
      this.ctx.arc(enemy.x || 0, enemy.y || 0, enemy.size || 10, 0, Math.PI * 2);
      this.ctx.fill();
    
      // Eyes
      this.ctx.fillStyle = 'white';
      this.ctx.beginPath();
      this.ctx.arc((enemy.x || 0) - 8, (enemy.y || 0) - 5, 5, 0, Math.PI * 2);
      this.ctx.arc((enemy.x || 0) + 8, (enemy.y || 0) - 5, 5, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.fillStyle = 'red';
      this.ctx.beginPath();
      this.ctx.arc((enemy.x || 0) - 8, (enemy.y || 0) - 5, 2, 0, Math.PI * 2);
      this.ctx.arc((enemy.x || 0) + 8, (enemy.y || 0) - 5, 2, 0, Math.PI * 2);
      this.ctx.fill();
    } catch (error) {
      console.warn('Enemy drawing error:', error);
    }
  }

  private draw() {
    try {
      if (!this.ctx || !this.canvas) return;
      
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Draw stars
      if (this.stars && this.stars.length > 0) {
        this.stars.forEach(star => {
          if (!star) return;
          try {
            this.ctx.save();
            this.ctx.globalAlpha = 0.3 + Math.sin(star.twinkle || 0) * 0.3;
            this.ctx.fillStyle = 'white';
            this.ctx.beginPath();
            this.ctx.arc(star.x || 0, star.y || 0, star.size || 1, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
            star.twinkle = (star.twinkle || 0) + 0.1;
          } catch (e) {
            console.warn('Star drawing error:', e);
          }
        });
      }
      
      // Draw player
      if (this.player) {
        this.drawPlayer();
      }
      
      // Draw bullets
      if (this.bullets && this.bullets.length > 0) {
        this.bullets.forEach(bullet => {
          if (!bullet) return;
          try {
            this.ctx.fillStyle = bullet.color || '#00ff00';
            this.ctx.beginPath();
            this.ctx.arc(bullet.x || 0, bullet.y || 0, bullet.size || 2, 0, Math.PI * 2);
            this.ctx.fill();
          } catch (e) {
            console.warn('Bullet drawing error:', e);
          }
        });
      }
      
      // Draw enemies
      if (this.enemies && this.enemies.length > 0) {
        this.enemies.forEach(enemy => {
          if (enemy) {
            this.drawEnemy(enemy);
          }
        });
      }
      
      // Draw pickups
      if (this.pickups && this.pickups.length > 0) {
        this.pickups.forEach(pickup => {
          if (!pickup) return;
          try {
            const pulseEffect = 0.8 + Math.sin((Date.now() - pickup.pulseTime) * 0.01) * 0.2;
            this.ctx.save();
            this.ctx.globalAlpha = pulseEffect;
            this.ctx.fillStyle = pickup.color || '#ffd700';
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            
            // Draw pickup with icon based on type
            if (pickup.type === 'weapon') {
              // Draw star shape for weapon upgrade
              this.ctx.beginPath();
              const centerX = pickup.x || 0;
              const centerY = pickup.y || 0;
              const radius = pickup.size || 15;
              const spikes = 5;
              for (let i = 0; i < spikes * 2; i++) {
                const angle = (i * Math.PI) / spikes;
                const r = i % 2 === 0 ? radius : radius * 0.5;
                const x = centerX + Math.cos(angle) * r;
                const y = centerY + Math.sin(angle) * r;
                if (i === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
              }
              this.ctx.closePath();
              this.ctx.fill();
              this.ctx.stroke();
            } else if (pickup.type === 'health') {
              // Draw cross for health
              const size = pickup.size || 15;
              this.ctx.fillRect(pickup.x - size/4, pickup.y - size, size/2, size*2);
              this.ctx.fillRect(pickup.x - size, pickup.y - size/4, size*2, size/2);
            } else if (pickup.type === 'shield') {
              // Draw shield shape
              this.ctx.beginPath();
              this.ctx.arc(pickup.x || 0, pickup.y || 0, pickup.size || 15, 0, Math.PI * 2);
              this.ctx.fill();
              this.ctx.stroke();
            }
            
            this.ctx.restore();
          } catch (e) {
            console.warn('Pickup drawing error:', e);
          }
        });
      }
      
      // Draw explosions
      if (this.explosions && this.explosions.length > 0) {
        this.explosions = this.explosions.filter(explosion => {
          if (!explosion) return false;
          try {
            const age = Date.now() - (explosion.time || 0);
            if (age < 500) {
              this.ctx.save();
              this.ctx.globalAlpha = 1 - (age / 500);
              this.ctx.fillStyle = '#ffff00';
              this.ctx.beginPath();
              this.ctx.arc(explosion.x || 0, explosion.y || 0, age / 10, 0, Math.PI * 2);
              this.ctx.fill();
              this.ctx.restore();
              return true;
            }
            return false;
          } catch (e) {
            console.warn('Explosion drawing error:', e);
            return false;
          }
        });
      }
    } catch (error) {
      console.error('Draw method error:', error);
    }
  }

  private gameLoop() {
    try {
      // Log game loop execution every few seconds
      if (Date.now() % 3000 < 16) {
        console.log('GameLoop running, state:', this.gameState, 'enemies:', this.enemies.length, 'bullets:', this.bullets.length);
      }
      
      if (this.gameState === 'playing') {
        // Spawn enemies
        if (Date.now() - this.lastEnemySpawn > this.enemySpawnRate) {
          console.log('Spawning enemy...');
          this.spawnEnemy();
          this.lastEnemySpawn = Date.now();
        }
        
        // Spawn obstacles
        if (Date.now() - this.lastObstacleSpawn > this.obstacleSpawnRate) {
          console.log('Spawning obstacle...');
          this.spawnObstacle();
          this.lastObstacleSpawn = Date.now();
        }
        
        // Spawn pickups for automatic weapon upgrades
        if (Date.now() - this.lastPickupSpawn > this.pickupSpawnRate) {
          this.spawnPickup();
          this.lastPickupSpawn = Date.now();
        }
        
        this.updatePlayer();
        this.autoShoot(); // Automatic shooting like 1945 Air Force
        this.updateBullets();
        this.updateEnemies();
        this.updatePickups();
        this.checkCollisions();
        
        // Check game over
        if (this.health <= 0) {
          this.gameState = 'gameOver';
          this.callbacks.onStateChange(this.gameState);
          this.callbacks.onGameComplete(this.score);
        }
      }
      
      this.draw();
      
      // Continue game loop only if not destroyed
      if (this.animationFrameId !== null) {
        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
      }
    } catch (error) {
      console.error('Game loop error:', error);
      // Try to continue the game loop after error
      if (this.animationFrameId !== null) {
        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
      }
    }
  }

  public destroy() {
    try {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      if (this.audioCtx && this.audioCtx.state !== 'closed') {
        this.audioCtx.close().catch(() => {
          // Ignore close errors
        });
      }
    } catch (error) {
      console.warn('Error during game destruction:', error);
    }
  }
}