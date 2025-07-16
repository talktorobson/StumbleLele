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
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'victory' | 'gameOver' | 'paused'>('menu');
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [wave, setWave] = useState(1);

  // Add logging to React state changes
  const handleStateChange = (newState: 'menu' | 'playing' | 'victory' | 'gameOver' | 'paused') => {
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

  const handlePause = () => {
    if (gameRef.current) {
      gameRef.current.pauseGame();
    }
  };

  const handleResume = () => {
    if (gameRef.current) {
      gameRef.current.resumeGame();
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
      <div className="absolute top-4 left-4 text-white text-sm md:text-lg font-bold z-[1001] space-y-2">
        <div className="bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg">
          ⭐ Pontuação: {score}
        </div>
        <div className="bg-red-500/30 backdrop-blur-sm px-3 py-2 rounded-lg">
          ❤️ Health: {health}%
        </div>
        <div className="bg-green-500/30 backdrop-blur-sm px-3 py-2 rounded-lg">
          🌊 Fase: {wave}
        </div>
      </div>

      {/* Pause Button */}
      {gameState === 'playing' && (
        <Button
          onClick={handlePause}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1001] bg-gray-500 hover:bg-gray-600 text-white rounded-full p-2 text-xs opacity-50"
        >
          Pausa
        </Button>
      )}

      {/* Game Instructions Modal */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[1001]">
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

      {/* Pause Modal */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[1001]">
          <div className="bg-black/90 text-white p-6 md:p-8 rounded-2xl text-center max-w-sm mx-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-yellow-400">
              Jogo Pausado! ⏸️
            </h2>
            <Button onClick={handleResume} className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-bold text-lg">
              Continuar 🎮
            </Button>
          </div>
        </div>
      )}

      {/* Victory Modal */}
      {gameState === 'victory' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[1001]">
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
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[1001]">
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
    onStateChange: (state: 'menu' | 'playing' | 'victory' | 'gameOver' | 'paused') => void;
    onScoreChange: (score: number) => void;
    onHealthChange: (health: number) => void;
    onWaveChange: (wave: number) => void;
    onGameComplete: (score: number) => void;
  };
  private gameState: 'menu' | 'playing' | 'victory' | 'gameOver' | 'paused' = 'menu';
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
  private boss: any = null;
  
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

  // Background
  private backgroundY = 0;

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
      speed: 12,
      wings: 0 // For extra wing power-up
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
    this.lastObstacleSpawn = Date.now() - this.obstacleSpawnRate;
    this.lastPickupSpawn = Date.now() - this.pickupSpawnRate; // Allow immediate pickup spawn
    console.log('Timers reset for immediate spawning');
  }

  public pauseGame() {
    this.gameState = 'paused';
    this.callbacks.onStateChange(this.gameState);
  }

  public resumeGame() {
    this.gameState = 'playing';
    this.callbacks.onStateChange(this.gameState);
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
    this.lastObstacleSpawn = Date.now() - this.obstacleSpawnRate;
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
    this.boss = null;
    
    this.lastShot = 0;
    this.lastEnemySpawn = 0;
    this.enemySpawnRate = 2000;
    this.lastObstacleSpawn = 0;
    this.obstacleSpawnRate = 4000;
    this.lastPickupSpawn = 0;
    this.pickupSpawnRate = 8000;
    
    this.backgroundY = 0;
    
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
    let numShots = this.weaponLevel;
    for (let i = -Math.floor(numShots / 2); i <= Math.floor(numShots / 2); i++) {
      this.bullets.push({
        x: this.player.x + i * 10,
        y: this.player.y - 20,
        vx: i * 0.5,
        vy: -10,
        damage: 1,
        color: '#ffd700',
        size: 3,
        type: 'auto',
        special: 'none'
      });
    }
    
    // Extra wings
    if (this.player.wings > 0) {
      for (let j = 0; j < this.player.wings; j++) {
        this.bullets.push({
          x: this.player.x + (j + 1) * 15,
          y: this.player.y,
          vx: 0,
          vy: -10,
          damage: 1,
          color: '#ffff00',
          size: 3
        });
        this.bullets.push({
          x: this.player.x - (j + 1) * 15,
          y: this.player.y,
          vx: 0,
          vy: -10,
          damage: 1,
          color: '#ffff00',
          size: 3
        });
      }
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
    
    const sizes = {
      slime: 15,
      bubble: 25,
      crystal: 35
    };
    
    const speeds = {
      slime: 3,
      bubble: 2,
      crystal: 1
    };
    
    const healths = {
      slime: 1,
      bubble: 2,
      crystal: 3
    };
    
    const x = Math.random() * (this.canvas.width - 50) + 25; // Any horizontal position
    const enemy = {
      x: x,
      y: -50,
      vx: (Math.random() - 0.5) * 2, // Horizontal movement
      type: type,
      color: colors[type as keyof typeof colors],
      size: sizes[type as keyof typeof sizes],
      speed: speeds[type as keyof typeof speeds] * this.difficultyMultiplier,
      health: healths[type as keyof typeof healths],
      maxHealth: healths[type as keyof typeof healths],
      canShoot: type === 'slime', // Slime can shoot
      canAccelerate: type === 'bubble', // Bubble can accelerate
      lastShot: Date.now(),
      blinkTime: Date.now() + Math.random() * 1000 // For blinking eyes
    };
    
    this.enemies.push(enemy);
  }

  private spawnBoss() {
    const bossTypes = ['megaSlime', 'megaBubble', 'megaCrystal'];
    const type = bossTypes[this.wave % bossTypes.length];
    
    const colors = {
      megaSlime: '#00ff00',
      megaBubble: '#00bfff',
      megaCrystal: '#ff69b4'
    };
    
    const sizes = 80 + this.wave * 10;
    
    const healths = 20 + this.wave * 5;
    
    const boss = {
      x: this.canvas.width / 2,
      y: -100,
      vx: (Math.random() - 0.5) * 2,
      type: type,
      color: colors[type as keyof typeof colors],
      size: sizes,
      speed: 1 * this.difficultyMultiplier,
      health: healths,
      maxHealth: healths,
      canShoot: true,
      canAccelerate: true,
      lastShot: Date.now(),
      specialAttackTimer: Date.now() + 5000, // Special attack every 5s
      blinkTime: Date.now() + Math.random() * 1000
    };
    
    this.boss = boss;
  }

  private spawnObstacle() {
    const types = ['wall', 'gate', 'fence'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const colors = {
      wall: '#8B4513',
      gate: '#FFD700',
      fence: '#A9A9A9'
    };
    
    const x = Math.random() * (this.canvas.width - 100) + 50; // Random horizontal
    const obstacle = {
      x: x,
      y: -100,
      type: type,
      color: colors[type as keyof typeof colors],
      width: Math.random() * 80 + 40,
      height: 50,
      speed: this.scrollSpeed * this.difficultyMultiplier,
      health: Math.random() * 3 + 2,
      maxHealth: Math.random() * 3 + 2,
      textureTime: Date.now() // For animation
    };
    
    this.obstacles.push(obstacle);
  }

  private spawnPickup() {
    const types = ['weapon', 'health', 'shield', 'helper', 'mine', 'wing'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const colors = {
      weapon: '#ffd700',
      health: '#ff6b6b',
      shield: '#4ecdc4',
      helper: '#00ff00',
      mine: '#ff0000',
      wing: '#ffff00'
    };
    
    const x = Math.random() * (this.canvas.width - 50) + 25;
    const pickup = {
      x: x,
      y: -30,
      type: type,
      color: colors[type as keyof typeof colors],
      size: 15,
      speed: 2,
      pulseTime: Date.now()
    };
    
    this.pickups.push(pickup);
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
    
    this.player.x = Math.max(30, Math.min(this.canvas.width - 30, this.player.x));
  }

  private updateBullets() {
    this.bullets = this.bullets.filter(bullet => {
      bullet.y += bullet.vy;
      return bullet.y > -50;
    });
  }

  private updateEnemyBullets() {
    this.enemyBullets = this.enemyBullets.filter(bullet => {
      bullet.y += bullet.vy;
      return bullet.y < this.canvas.height + 50;
    });
  }

  private updatePickups() {
    this.pickups = this.pickups.filter(pickup => {
      pickup.y += pickup.speed;
      
      if (pickup.y > this.canvas.height + 50) {
        return false;
      }
      
      return true;
    });
  }

  private updateEnemies() {
    this.enemies = this.enemies.filter(enemy => {
      enemy.x += enemy.vx;
      enemy.y += enemy.speed;
      
      if (enemy.x < 25 || enemy.x > this.canvas.width - 25) {
        enemy.vx = -enemy.vx; // Bounce on walls
      }
      
      if (enemy.canAccelerate && Math.random() > 0.98) {
        enemy.speed *= 1.5;
      }
      
      if (enemy.canShoot && Date.now() - enemy.lastShot > 2000) {
        this.enemyBullets.push({
          x: enemy.x,
          y: enemy.y + enemy.size,
          vy: 5,
          damage: 10,
          size: 4,
          color: '#ff0000'
        });
        enemy.lastShot = Date.now();
        this.playSound('enemyShoot');
      }
      
      if (enemy.y > this.canvas.height) {
        this.health -= 10;
        this.updateCallbacks();
        return false;
      }
      
      return true;
    });
  }

  private updateBoss() {
    if (this.boss) {
      this.boss.x += this.boss.vx;
      this.boss.y += this.boss.speed;
      
      if (this.boss.x < this.boss.size || this.boss.x > this.canvas.width - this.boss.size) {
        this.boss.vx = -this.boss.vx;
      }
      
      if (Date.now() - this.boss.lastShot > 1000) {
        this.enemyBullets.push({
          x: this.boss.x,
          y: this.boss.y + this.boss.size,
          vy: 5,
          damage: 15,
          size: 6,
          color: '#ff0000'
        });
        this.boss.lastShot = Date.now();
      }
      
      if (Date.now() - this.boss.specialAttackTimer > 5000) {
        // Special attack based on type
        if (this.boss.type === 'megaSlime') {
          // Shoot multiple bullets
          for (let i = -2; i <= 2; i++) {
            this.enemyBullets.push({
              x: this.boss.x,
              y: this.boss.y + this.boss.size,
              vx: i * 1,
              vy: 5,
              damage: 10,
              size: 4,
              color: '#ff0000'
            });
          }
        } else if (this.boss.type === 'megaBubble') {
          // Accelerate and ram
          this.boss.speed *= 2;
          setTimeout(() => this.boss.speed /= 2, 2000);
        } else if (this.boss.type === 'megaCrystal') {
          // Summon minions
          for (let i = 0; i < 3; i++) {
            this.spawnEnemy();
          }
        }
        this.boss.specialAttackTimer = Date.now();
      }
      
      if (this.boss.y > this.canvas.height) {
        this.health -= 50;
        this.boss = null;
      }
    }
  }

  private updateObstacles() {
    this.obstacles = this.obstacles.filter(obstacle => {
      obstacle.y += obstacle.speed;
      
      if (obstacle.y > this.canvas.height) {
        return false;
      }
      
      return true;
    });
  }

  private updateBackground() {
    this.backgroundY += this.scrollSpeed / 2; // Slower than foreground for parallax
    if (this.backgroundY > this.canvas.height) {
      this.backgroundY = 0;
    }
  }

  private updateHelpers() {
    this.helpers = this.helpers.filter(helper => {
      // Helpers stay on side of player
      helper.x = this.player.x + (helper.side * 40);
      helper.y = this.player.y;
      
      if (Date.now() - helper.lastShot > 500) {
        this.bullets.push({
          x: helper.x,
          y: helper.y - 10,
          vx: 0,
          vy: -10,
          damage: 1,
          color: '#00ff00',
          size: 3
        });
        helper.lastShot = Date.now();
      }
      
      if (Date.now() - helper.startTime > 20000) { // Stay longer: 20 seconds
        return false;
      }
      return true;
    });
  }

  private checkCollisions() {
    // Bullet vs Enemy
    for (let bulletIndex = this.bullets.length - 1; bulletIndex >= 0; bulletIndex--) {
      const bullet = this.bullets[bulletIndex];
      for (let enemyIndex = this.enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
        const enemy = this.enemies[enemyIndex];
        const dx = bullet.x - enemy.x;
        const dy = bullet.y - enemy.y;
        if (Math.sqrt(dx*dx + dy*dy) < enemy.size + bullet.size) {
          enemy.health -= bullet.damage;
          this.bullets.splice(bulletIndex, 1);
          if (enemy.health <= 0) {
            this.enemies.splice(enemyIndex, 1);
            this.explosions.push({ x: enemy.x, y: enemy.y, time: Date.now(), size: 30 });
            this.playSound('explosion');
            this.score += enemy.maxHealth * 20;
            this.waveEnemiesKilled++;
            this.checkWaveProgress();
          }
          break;
        }
      }
    }

    // Bullet vs Boss
    if (this.boss) {
      for (let bulletIndex = this.bullets.length - 1; bulletIndex >= 0; bulletIndex--) {
        const bullet = this.bullets[bulletIndex];
        const dx = bullet.x - this.boss.x;
        const dy = bullet.y - this.boss.y;
        if (Math.sqrt(dx*dx + dy*dy) < this.boss.size + bullet.size) {
          this.boss.health -= bullet.damage;
          this.bullets.splice(bulletIndex, 1);
          if (this.boss.health <= 0) {
            this.explosions.push({ x: this.boss.x, y: this.boss.y, time: Date.now(), size: 60 });
            this.playSound('explosion');
            this.score += 1000;
            this.boss = null;
            this.checkWaveProgress();
          }
          break;
        }
      }
    }

    // Bullet vs Obstacle
    for (let bulletIndex = this.bullets.length - 1; bulletIndex >= 0; bulletIndex--) {
      const bullet = this.bullets[bulletIndex];
      for (let obsIndex = this.obstacles.length - 1; obsIndex >= 0; obsIndex--) {
        const obs = this.obstacles[obsIndex];
        if (bullet.x > obs.x - obs.width/2 && bullet.x < obs.x + obs.width/2 &&
            bullet.y > obs.y - obs.height/2 && bullet.y < obs.y + obs.height/2) {
          obs.health -= bullet.damage;
          this.bullets.splice(bulletIndex, 1);
          if (obs.health <= 0) {
            this.obstacles.splice(obsIndex, 1);
            this.explosions.push({ x: obs.x, y: obs.y, time: Date.now(), size: 40 });
            this.playSound('explosion');
            this.score += 50;
          }
          break;
        }
      }
    }

    // Player vs Pickup
    for (let pickupIndex = this.pickups.length - 1; pickupIndex >= 0; pickupIndex--) {
      const pickup = this.pickups[pickupIndex];
      const dx = this.player.x - pickup.x;
      const dy = this.player.y - pickup.y;
      if (Math.sqrt(dx*dx + dy*dy) < pickup.size + 20) {
        this.pickups.splice(pickupIndex, 1);
        this.playSound('pickup');
        this.score += 100;
        
        if (pickup.type === 'weapon') {
          this.weaponLevel = Math.min(3, this.weaponLevel + 1);
        } else if (pickup.type === 'health') {
          this.health = Math.min(100, this.health + 20);
        } else if (pickup.type === 'shield') {
          this.shieldActive = true;
          this.shieldTimer = 10000;
        } else if (pickup.type === 'helper') {
          this.helpers.push({
            side: this.helpers.length % 2 === 0 ? 1 : -1, // Left or right
            lastShot: Date.now(),
            startTime: Date.now()
          });
        } else if (pickup.type === 'mine') {
          // Explode all enemies on screen
          this.enemies = [];
          this.explosions.push({ x: this.canvas.width / 2, y: this.canvas.height / 2, time: Date.now(), size: 200, isMine: true });
          this.playSound('explosion');
        } else if (pickup.type === 'wing') {
          this.player.wings = (this.player.wings || 0) + 1;
          setTimeout(() => this.player.wings--, 10000);
        }
        
        this.updateCallbacks();
      }
    }

    // Player vs Enemy
    for (let enemyIndex = this.enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
      const enemy = this.enemies[enemyIndex];
      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      if (Math.sqrt(dx*dx + dy*dy) < enemy.size + 20) {
        if (!this.shieldActive) {
          this.health -= 10;
        }
        this.enemies.splice(enemyIndex, 1);
        this.explosions.push({ x: enemy.x, y: enemy.y, time: Date.now(), size: 30 });
        this.playSound('hit');
        this.updateCallbacks();
      }
    }

    // Player vs Boss
    if (this.boss) {
      const dx = this.player.x - this.boss.x;
      const dy = this.player.y - this.boss.y;
      if (Math.sqrt(dx*dx + dy*dy) < this.boss.size + 20) {
        if (!this.shieldActive) {
          this.health -= 20;
        }
        this.explosions.push({ x: this.player.x, y: this.player.y, time: Date.now(), size: 30 });
        this.playSound('hit');
        this.updateCallbacks();
      }
    }

    // Enemy bullets vs Player
    for (let bulletIndex = this.enemyBullets.length - 1; bulletIndex >= 0; bulletIndex--) {
      const bullet = this.enemyBullets[bulletIndex];
      const dx = this.player.x - bullet.x;
      const dy = this.player.y - bullet.y;
      if (Math.sqrt(dx*dx + dy*dy) < 20 + bullet.size) {
        if (!this.shieldActive) {
          this.health -= bullet.damage;
        }
        this.enemyBullets.splice(bulletIndex, 1);
        this.playSound('hit');
        this.updateCallbacks();
      }
    }

    // Mine explosion vs Enemies
    this.explosions.forEach(explosion => {
      if (explosion.isMine) {
        for (let enemyIndex = this.enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
          const enemy = this.enemies[enemyIndex];
          const dx = explosion.x - enemy.x;
          const dy = explosion.y - enemy.y;
          if (Math.sqrt(dx*dx + dy*dy) < 100) {
            this.enemies.splice(enemyIndex, 1);
            this.score += 50;
          }
        }
      }
    });
  }

  private checkWaveProgress() {
    const enemiesNeeded = Math.min(10 + this.wave * 2, 30);
    if (this.waveEnemiesKilled >= enemiesNeeded && !this.boss) {
      this.spawnBoss();
    }
    if (this.waveEnemiesKilled >= enemiesNeeded && !this.boss) {
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
      } else if (type === 'enemyShoot') {
        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        if (!oscillator || !gainNode) return;
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(440, this.audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(220, this.audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
        oscillator.start();
        setTimeout(() => {
          try { oscillator.stop(); } catch (e) { /* ignore */ }
        }, 100);
      }
    } catch (error) {
      // Silent fail
    }
  }

  private drawPlayer() {
    if (!this.player || !this.ctx) return;
    
    const px = this.player.x;
    const py = this.player.y;
    
    // Draw spaceship body
    this.ctx.fillStyle = '#0000ff'; // Blue body
    this.ctx.beginPath();
    this.ctx.moveTo(px, py - 30); // Top point
    this.ctx.lineTo(px - 20, py + 20); // Left bottom
    this.ctx.lineTo(px + 20, py + 20); // Right bottom
    this.ctx.closePath();
    this.ctx.fill();
    
    // Wings
    this.ctx.fillStyle = '#00bfff'; // Light blue wings
    this.ctx.beginPath();
    this.ctx.moveTo(px - 10, py + 10);
    this.ctx.lineTo(px - 30, py + 30);
    this.ctx.lineTo(px - 15, py + 20);
    this.ctx.fill();
    
    this.ctx.beginPath();
    this.ctx.moveTo(px + 10, py + 10);
    this.ctx.lineTo(px + 30, py + 30);
    this.ctx.lineTo(px + 15, py + 20);
    this.ctx.fill();
    
    // Cockpit
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(px, py - 15, 8, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw shield if active
    if (this.shieldActive) {
      this.ctx.strokeStyle = '#00ffff';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(px, py, 40, 0, Math.PI * 2);
      this.ctx.stroke();
    }
    
    // Extra wings if active
    if (this.player.wings > 0) {
      this.ctx.fillStyle = '#ffff00';
      for (let i = 1; i <= this.player.wings; i++) {
        this.ctx.beginPath();
        this.ctx.moveTo(px - 20 - i * 10, py + 10);
        this.ctx.lineTo(px - 40 - i * 10, py + 30);
        this.ctx.lineTo(px - 25 - i * 10, py + 20);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.moveTo(px + 20 + i * 10, py + 10);
        this.ctx.lineTo(px + 40 + i * 10, py + 30);
        this.ctx.lineTo(px + 25 + i * 10, py + 20);
        this.ctx.fill();
      }
    }
  }

  private drawEnemy(enemy: any) {
    // Enhanced visuals
    this.ctx.fillStyle = enemy.color;
    if (enemy.type === 'slime') {
      // Gosma with dripping effect
      this.ctx.beginPath();
      this.ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = enemy.color + '80'; // Transparent drip
      this.ctx.fillRect(enemy.x - 5, enemy.y + enemy.size, 10, 10 + Math.sin(Date.now() * 0.01) * 5);
    } else if (enemy.type === 'bubble') {
      // Bubble with shine
      this.ctx.beginPath();
      this.ctx.ellipse(enemy.x, enemy.y, enemy.size * 1.2, enemy.size, 0, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = 'white';
      this.ctx.globalAlpha = 0.3;
      this.ctx.beginPath();
      this.ctx.arc(enemy.x - 10, enemy.y - 10, 5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalAlpha = 1;
    } else if (enemy.type === 'crystal') {
      // Crystal with facets
      this.ctx.beginPath();
      this.ctx.moveTo(enemy.x, enemy.y - enemy.size);
      this.ctx.lineTo(enemy.x - enemy.size * 0.5, enemy.y - enemy.size * 0.5);
      this.ctx.lineTo(enemy.x - enemy.size, enemy.y + enemy.size * 0.5);
      this.ctx.lineTo(enemy.x, enemy.y + enemy.size);
      this.ctx.lineTo(enemy.x + enemy.size, enemy.y + enemy.size * 0.5);
      this.ctx.lineTo(enemy.x + enemy.size * 0.5, enemy.y - enemy.size * 0.5);
      this.ctx.closePath();
      this.ctx.fill();
    }
    
    // Health bar if health > 1
    if (enemy.maxHealth > 1) {
      this.ctx.fillStyle = 'red';
      this.ctx.fillRect(enemy.x - enemy.size, enemy.y - enemy.size - 5, enemy.size * 2 * (enemy.health / enemy.maxHealth), 3);
    }
    
    // Face (eyes with blink)
    const blink = Math.sin((Date.now() - enemy.blinkTime) * 0.01) > 0.9 ? 1 : 3; // Blink effect
    this.ctx.fillStyle = 'white';
    this.ctx.beginPath();
    this.ctx.arc(enemy.x - 5, enemy.y - 5, blink, 0, Math.PI * 2);
    this.ctx.arc(enemy.x + 5, enemy.y - 5, blink, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.fillStyle = 'black';
    this.ctx.beginPath();
    this.ctx.arc(enemy.x - 5, enemy.y - 5, 1, 0, Math.PI * 2);
    this.ctx.arc(enemy.x + 5, enemy.y - 5, 1, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawBoss(boss: any) {
    // Larger version of enemy visuals
    this.drawEnemy(boss); // Reuse enhanced draw with larger size
    // Add extra details for boss
    this.ctx.strokeStyle = '#ff0000';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(boss.x, boss.y, boss.size + 10, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  private drawObstacle(obstacle: any) {
    this.ctx.fillStyle = obstacle.color;
    if (obstacle.type === 'wall') {
      // Brick wall texture
      this.ctx.fillRect(obstacle.x - obstacle.width/2, obstacle.y - obstacle.height/2, obstacle.width, obstacle.height);
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 2;
      for (let i = 0; i < obstacle.width; i += 10) {
        this.ctx.beginPath();
        this.ctx.moveTo(obstacle.x - obstacle.width/2 + i, obstacle.y - obstacle.height/2);
        this.ctx.lineTo(obstacle.x - obstacle.width/2 + i, obstacle.y + obstacle.height/2);
        this.ctx.stroke();
      }
    } else if (obstacle.type === 'gate') {
      // Metal gate with bars
      this.ctx.fillRect(obstacle.x - obstacle.width/2, obstacle.y - obstacle.height/2, obstacle.width, obstacle.height);
      this.ctx.fillStyle = '#000000';
      for (let i = 0; i < obstacle.width; i += 10) {
        this.ctx.fillRect(obstacle.x - obstacle.width/2 + i, obstacle.y - obstacle.height/2, 5, obstacle.height);
      }
    } else if (obstacle.type === 'fence') {
      // Chain fence with animation
      this.ctx.strokeStyle = obstacle.color;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(obstacle.x - obstacle.width/2, obstacle.y - obstacle.height/2);
      this.ctx.lineTo(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2);
      this.ctx.moveTo(obstacle.x + obstacle.width/2, obstacle.y - obstacle.height/2);
      this.ctx.lineTo(obstacle.x - obstacle.width/2, obstacle.y + obstacle.height/2);
      this.ctx.stroke();
    }
    
    // Health bar
    this.ctx.fillStyle = 'red';
    this.ctx.fillRect(obstacle.x - obstacle.width/2, obstacle.y - obstacle.height/2 - 5, obstacle.width * (obstacle.health / obstacle.maxHealth), 3);
  }

  private drawBackground() {
    // Simple city spatial background, now with lower opacity to stay in back
    this.ctx.globalAlpha = 0.5; // Make background faint
    this.ctx.fillStyle = '#1e3c72';
    this.ctx.fillRect(0, this.backgroundY, this.canvas.width, this.canvas.height);
    this.ctx.fillRect(0, this.backgroundY - this.canvas.height, this.canvas.width, this.canvas.height);
    
    // Draw buildings
    for (let i = 0; i < 5; i++) {
      this.ctx.fillStyle = '#4a90e2';
      this.ctx.fillRect(i * 150 + 50, this.backgroundY + 100, 100, 200);
      this.ctx.fillStyle = '#2a5298';
      this.ctx.fillRect(i * 150 + 60, this.backgroundY + 120, 80, 180);
    }
    
    // Draw clouds
    for (let i = 0; i < 3; i++) {
      this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
      this.ctx.beginPath();
      this.ctx.arc(i * 200 + 100, this.backgroundY + 50, 50, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1; // Reset opacity for front layer
  }

  private draw() {
    try {
      if (!this.ctx || !this.canvas) return;
      
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.drawBackground();
      
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
      
      // Draw enemy bullets
      this.enemyBullets.forEach(bullet => {
        this.ctx.fillStyle = bullet.color;
        this.ctx.beginPath();
        this.ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
        this.ctx.fill();
      });
      
      // Draw enemies
      this.enemies.forEach(enemy => this.drawEnemy(enemy));
      
      // Draw boss
      if (this.boss) this.drawBoss(this.boss);
      
      // Draw obstacles
      this.obstacles.forEach(obs => this.drawObstacle(obs));
      
      // Draw pickups
      this.pickups.forEach(pickup => {
        const pulseEffect = 0.8 + Math.sin((Date.now() - pickup.pulseTime) * 0.01) * 0.2;
        this.ctx.save();
        this.ctx.globalAlpha = pulseEffect;
        this.ctx.fillStyle = pickup.color;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        
        if (pickup.type === 'weapon') {
          const centerX = pickup.x;
          const centerY = pickup.y;
          const radius = pickup.size;
          const spikes = 5;
          this.ctx.beginPath();
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
          const size = pickup.size;
          this.ctx.fillRect(pickup.x - size/4, pickup.y - size, size/2, size*2);
          this.ctx.fillRect(pickup.x - size, pickup.y - size/4, size*2, size/2);
        } else if (pickup.type === 'shield') {
          this.ctx.beginPath();
          this.ctx.arc(pickup.x, pickup.y, pickup.size, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.stroke();
        } else if (pickup.type === 'helper') {
          this.ctx.beginPath();
          this.ctx.moveTo(pickup.x, pickup.y - 10);
          this.ctx.lineTo(pickup.x - 10, pickup.y + 10);
          this.ctx.lineTo(pickup.x + 10, pickup.y + 10);
          this.ctx.closePath();
          this.ctx.fill();
        } else if (pickup.type === 'mine') {
          this.ctx.beginPath();
          this.ctx.arc(pickup.x, pickup.y, 10, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.fillRect(pickup.x - 2, pickup.y - 15, 4, 5);
        } else if (pickup.type === 'wing') {
          this.ctx.beginPath();
          this.ctx.moveTo(pickup.x - 10, pickup.y);
          this.ctx.lineTo(pickup.x, pickup.y - 10);
          this.ctx.lineTo(pickup.x + 10, pickup.y);
          this.ctx.fill();
        }
        
        this.ctx.restore();
      });
      
      // Draw helpers
      this.helpers.forEach(helper => {
        this.ctx.fillStyle = '#00ff00';
        this.ctx.beginPath();
        this.ctx.moveTo(helper.x, helper.y - 10);
        this.ctx.lineTo(helper.x - 8, helper.y + 10);
        this.ctx.lineTo(helper.x + 8, helper.y + 10);
        this.ctx.closePath();
        this.ctx.fill();
      });
      
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
    } catch (error) {
      console.error('Draw method error:', error);
    }
  }

  private gameLoop() {
    if (this.gameState === 'paused') {
      // Don't update game when paused
      this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
      return;
    }
    
    try {
      // Log game loop execution every few seconds
      if (Date.now() % 3000 < 16) {
        console.log('GameLoop running, state:', this.gameState, 'enemies:', this.enemies.length, 'bullets:', this.bullets.length);
      }
      
      if (this.gameState === 'playing') {
        this.updateBackground();
        this.updateHelpers();
        
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
        
        // Spawn pickups
        if (Date.now() - this.lastPickupSpawn > this.pickupSpawnRate) {
          console.log('Spawning pickup...');
          this.spawnPickup();
          this.lastPickupSpawn = Date.now();
        }
        
        this.updatePlayer();
        this.autoShoot(); // Automatic shooting like 1945 Air Force
        this.updateBullets();
        this.updateEnemies();
        this.updateBoss();
        this.updateObstacles();
        this.updatePickups();
        this.updateEnemyBullets();
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