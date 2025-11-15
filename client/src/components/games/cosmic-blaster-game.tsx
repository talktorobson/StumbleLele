// @ts-nocheck
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
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'victory' | 'gameOver' | 'paused' | 'waveTransition' | 'bossAnnouncement' | 'bossDefeated'>('menu');
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(150);
  const [wave, setWave] = useState(1);
  const [weaponLevel, setWeaponLevel] = useState(1);
  const [bossName, setBossName] = useState('');

  // Helena's friends list for boss names
  const helenaFriends = [
    'TomTom', 'Duda', 'Emily', 'Julia Prima', 'Paola', 
    'Alice', 'Bruno', 'Bento', 'Arthur', 'Lucas Couto'
  ];

  // Add logging to React state changes
  const handleStateChange = (newState: 'menu' | 'playing' | 'victory' | 'gameOver' | 'paused' | 'waveTransition' | 'bossAnnouncement' | 'bossDefeated') => {
    console.log('React: State change requested from', gameState, 'to', newState);
    setGameState(newState);
  };

  const handleBossNameChange = (name: string) => {
    setBossName(name);
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
          onWeaponLevelChange: setWeaponLevel,
          onBossNameChange: handleBossNameChange,
          helenaFriends: helenaFriends,
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

  // ESC key support for pause/resume
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        if (gameState === 'playing') {
          handlePause();
        } else if (gameState === 'paused') {
          handleResume();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

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
          ❤️ Vida: {health}/150
        </div>
        <div className="bg-green-500/30 backdrop-blur-sm px-3 py-2 rounded-lg">
          🌊 Fase: {wave}
        </div>
        <div className="bg-yellow-500/30 backdrop-blur-sm px-3 py-2 rounded-lg">
          🚀 Arma: Nível {weaponLevel}
        </div>
      </div>

      {/* Pause Button */}
      {gameState === 'playing' && (
        <Button
          onClick={handlePause}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1001] bg-gray-500 hover:bg-gray-600 text-white rounded-full p-2 text-xs opacity-50"
        >
          ⏸️ Pausa
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
              <p><strong>🎮 Como jogar:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>👆 ARRASTE o dedo na tela para mover a Lele</li>
                <li>🎯 Tiros são AUTOMÁTICOS - apenas se mova!</li>
                <li>🔫 Colete power-ups para melhorar armas</li>
                <li>❤️ Pegue corações para recuperar vida</li>
                <li>🛡️ Escudos te protegem temporariamente</li>
                <li>🌊 Sobreviva às ondas de inimigos!</li>
                <li>👹 Derrote o BOSS no final de cada fase!</li>
              </ul>
              <p className="text-xs opacity-80 mt-4">
                💻 Desktop: Clique e arraste o mouse para mover
              </p>
            </div>
            <Button onClick={handleStartGame} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full text-lg font-bold">
              🚀 Começar Aventura! 🎮
            </Button>
          </div>
        </div>
      )}

      {/* Pause Modal */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[1001]">
          <div className="bg-black/90 text-white p-6 md:p-8 rounded-2xl text-center max-w-sm mx-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-yellow-400">
              ⏸️ Jogo Pausado! ⏸️
            </h2>
            <p className="mb-6 text-gray-300">Pressione ESC para pausar/continuar</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleResume} className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-bold text-lg">
                ▶️ Continuar
              </Button>
              <Button onClick={onExit} className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full font-bold text-lg">
                🚪 Sair
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Victory Modal */}
      {gameState === 'victory' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[1001]">
          <div className="bg-black/90 text-white p-6 md:p-8 rounded-2xl text-center max-w-sm mx-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-yellow-400">
              🎉 Você Venceu! 🏆⭐
            </h2>
            <p className="mb-6 text-lg">✨ Pontuação Final: <span className="text-yellow-400 font-bold">{score}</span> ✨</p>
            <Button onClick={handleRestart} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-bold mr-4">
              🎮 Jogar Novamente
            </Button>
            <Button onClick={onExit} className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-bold">
              🚪 Sair
            </Button>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameState === 'gameOver' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[1001]">
          <div className="bg-black/90 text-white p-6 md:p-8 rounded-2xl text-center max-w-sm mx-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-red-400">
              💥 Fim de Jogo! 😵
            </h2>
            <p className="mb-6 text-lg">⭐ Pontuação: <span className="text-yellow-400 font-bold">{score}</span> ⭐</p>
            <Button onClick={handleRestart} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-bold">
              🎮 Jogar de Novo
            </Button>
          </div>
        </div>
      )}
      
      {/* Wave Transition Modal */}
      {gameState === 'waveTransition' && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-[1001]">
          <div className="bg-black/90 text-white p-6 md:p-8 rounded-2xl text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-yellow-400 animate-pulse">
              🌊 Fase {wave} 🌊
            </h2>
          </div>
        </div>
      )}
      
      {/* Boss Announcement Modal */}
      {gameState === 'bossAnnouncement' && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-[1001]">
          <div className="bg-black/90 text-white p-6 md:p-8 rounded-2xl text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-red-500 animate-pulse">
              🔥 Fase {wave} - BOSS! 👹
            </h2>
            <p className="text-2xl md:text-3xl font-bold text-yellow-400 mt-4 animate-bounce">
              Boss {bossName}
            </p>
            <p className="text-lg text-orange-300 mt-2">
              {bossName} desafia a Helena!
            </p>
          </div>
        </div>
      )}

      {/* Boss Defeated Modal */}
      {gameState === 'bossDefeated' && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-[1001]">
          <div className="bg-black/90 text-white p-6 md:p-8 rounded-2xl text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-green-400 animate-pulse">
              🎉 Boss {bossName} Derrotado! 🏆
            </h2>
            <p className="text-xl text-yellow-300 mt-4">
              Helena venceu {bossName}!
            </p>
            <p className="text-lg text-blue-300 mt-2">
              ☮️ 5 segundos de paz... ☮️
            </p>
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
    onStateChange: (state: 'menu' | 'playing' | 'victory' | 'gameOver' | 'paused' | 'waveTransition' | 'bossAnnouncement' | 'bossDefeated') => void;
    onScoreChange: (score: number) => void;
    onHealthChange: (health: number) => void;
    onWaveChange: (wave: number) => void;
    onWeaponLevelChange: (level: number) => void;
    onBossNameChange: (name: string) => void;
    onGameComplete: (score: number) => void;
    helenaFriends: string[];
  };
  private gameState: 'menu' | 'playing' | 'victory' | 'gameOver' | 'paused' | 'waveTransition' | 'bossAnnouncement' | 'bossDefeated' = 'menu';
  private animationFrameId: number | null = null;
  private audioCtx: AudioContext;
  
  // Game state
  private score = 0;
  private health = 150; // Increased starting health
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
  private pickupSpawnRate = 5000; // More frequent pickups
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
  private backgroundElements: { buildings: any[], clouds: any[] } = { buildings: [], clouds: [] };

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
      this.audioCtx = new AudioContext();
      
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
    this.initializeBackground();
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
  
  private initializeBackground() {
    this.backgroundElements.buildings = [];
    this.backgroundElements.clouds = [];
    
    // Create stable buildings
    const numBuildings = Math.ceil(this.canvas.width / 120);
    for (let i = 0; i < numBuildings * 2; i++) { // Double for continuous scrolling
      const width = 60 + Math.random() * 40;
      const height = 100 + Math.random() * 150;
      const windowsPerRow = Math.floor(width / 15);
      const windowRows = Math.floor(height / 20);
      const windows = [];
      
      // Pre-generate window positions
      for (let row = 0; row < windowRows; row++) {
        for (let col = 0; col < windowsPerRow; col++) {
          if (Math.random() > 0.3) { // Some windows are lit
            windows.push({ row, col });
          }
        }
      }
      
      this.backgroundElements.buildings.push({
        x: (i * 120) % this.canvas.width,
        y: i < numBuildings ? 0 : -this.canvas.height, // Two sets for seamless scrolling
        width,
        height,
        color: Math.random() > 0.5 ? '#4a90e2' : '#2a5298',
        hasWindows: Math.random() > 0.3,
        windows // Static window positions
      });
    }
    
    // Create stable clouds
    const numClouds = Math.ceil(this.canvas.width / 200);
    for (let i = 0; i < numClouds * 2; i++) { // Double for continuous scrolling
      this.backgroundElements.clouds.push({
        x: (i * 200 + Math.random() * 100) % this.canvas.width,
        y: i < numClouds ? Math.random() * 200 : Math.random() * 200 - this.canvas.height,
        size: 20 + Math.random() * 40,
        opacity: 0.1 + Math.random() * 0.2
      });
    }
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

    // Touch controls - drag to move style
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
      this.initializeBackground();
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
    this.health = 150; // Increased starting health
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
    this.callbacks.onWeaponLevelChange(this.weaponLevel);
  }
  
  private showBossAnnouncement() {
    this.gameState = 'bossAnnouncement';
    this.callbacks.onStateChange(this.gameState);
    
    // Announce the boss name with text-to-speech
    if (this.boss && this.boss.friendName) {
      this.speakBossAnnouncement(this.boss.friendName);
    }
    
    setTimeout(() => {
      if (this.gameState === 'bossAnnouncement') {
        this.gameState = 'playing';
        this.callbacks.onStateChange(this.gameState);
      }
    }, 2000);
  }
  
  private showWaveTransition() {
    this.gameState = 'waveTransition';
    this.callbacks.onStateChange(this.gameState);
    setTimeout(() => {
      if (this.gameState === 'waveTransition') {
        this.gameState = 'playing';
        this.callbacks.onStateChange(this.gameState);
      }
    }, 2000);
  }
  
  private shootBossWeapon() {
    if (!this.boss || this.boss.phase !== 'fighting') return;
    
    // Each boss type has unique weapon
    switch (this.boss.type) {
      case 'megaSlime':
        // Triple shot
        for (let i = -1; i <= 1; i++) {
          this.enemyBullets.push({
            x: this.boss.x + i * 20,
            y: this.boss.y + this.boss.size,
            vx: i * 0.5,
            vy: 4,
            damage: 8,
            size: 5,
            color: '#00ff00'
          });
        }
        break;
        
      case 'megaBubble':
        // Big slow bubbles
        this.enemyBullets.push({
          x: this.boss.x,
          y: this.boss.y + this.boss.size,
          vx: 0,
          vy: 2,
          damage: 12,
          size: 15,
          color: '#00bfff'
        });
        break;
        
      case 'megaCrystal':
        // Crystal shards in spread pattern
        for (let i = 0; i < 5; i++) {
          const angle = (i - 2) * 0.3;
          this.enemyBullets.push({
            x: this.boss.x,
            y: this.boss.y + this.boss.size,
            vx: Math.sin(angle) * 3,
            vy: Math.cos(angle) * 3 + 2,
            damage: 6,
            size: 4,
            color: '#ff69b4'
          });
        }
        break;
        
      case 'megaFire':
        // Laser beam (multiple rapid shots)
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            if (this.boss) {
              this.enemyBullets.push({
                x: this.boss.x,
                y: this.boss.y + this.boss.size,
                vx: 0,
                vy: 8,
                damage: 10,
                size: 3,
                color: '#ff4500'
              });
            }
          }, i * 100);
        }
        break;
        
      case 'megaIce':
        // Guided missile towards player
        const dx = this.player.x - this.boss.x;
        const dy = this.player.y - this.boss.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.enemyBullets.push({
          x: this.boss.x,
          y: this.boss.y + this.boss.size,
          vx: (dx / distance) * 2,
          vy: (dy / distance) * 2,
          damage: 15,
          size: 8,
          color: '#00ffff',
          guided: true,
          target: { x: this.player.x, y: this.player.y }
        });
        break;
        
      case 'megaThunder':
        // Lightning bolt (instant hit chance)
        if (Math.random() < 0.3) {
          this.health -= 5;
          this.playSound('hit');
          this.updateCallbacks();
          // Visual lightning effect
          this.explosions.push({ 
            x: this.player.x, 
            y: this.player.y, 
            time: Date.now(), 
            size: 30, 
            isLightning: true 
          });
        }
        break;
        
      case 'megaShadow':
        // Shadow missiles from sides
        this.enemyBullets.push({
          x: 0,
          y: this.boss.y,
          vx: 3,
          vy: 2,
          damage: 9,
          size: 6,
          color: '#8b008b'
        });
        this.enemyBullets.push({
          x: this.canvas.width,
          y: this.boss.y,
          vx: -3,
          vy: 2,
          damage: 9,
          size: 6,
          color: '#8b008b'
        });
        break;
        
      case 'megaGold':
        // Gold rain
        for (let i = 0; i < 8; i++) {
          this.enemyBullets.push({
            x: this.boss.x + (Math.random() - 0.5) * 100,
            y: this.boss.y + this.boss.size,
            vx: (Math.random() - 0.5) * 2,
            vy: 3 + Math.random() * 2,
            damage: 5,
            size: 4,
            color: '#ffd700'
          });
        }
        break;
        
      case 'megaVoid':
        // Void pull bullets
        const angle = Math.atan2(this.player.y - this.boss.y, this.player.x - this.boss.x);
        this.enemyBullets.push({
          x: this.boss.x,
          y: this.boss.y + this.boss.size,
          vx: Math.cos(angle) * 4,
          vy: Math.sin(angle) * 4,
          damage: 12,
          size: 10,
          color: '#4b0082'
        });
        break;
        
      case 'megaFinal':
        // Ultimate weapon - combination attack
        // Laser
        this.enemyBullets.push({
          x: this.boss.x,
          y: this.boss.y + this.boss.size,
          vx: 0,
          vy: 6,
          damage: 15,
          size: 8,
          color: '#ff00ff'
        });
        // Side missiles
        for (let side of [-1, 1]) {
          this.enemyBullets.push({
            x: this.boss.x + side * 50,
            y: this.boss.y,
            vx: side * 2,
            vy: 3,
            damage: 10,
            size: 6,
            color: '#ff00ff'
          });
        }
        break;
    }
  }
  
  private bossSpecialAttack() {
    if (!this.boss || this.boss.phase !== 'fighting') return;
    
    switch (this.boss.type) {
      case 'megaSlime':
        // Spawn slime minions
        for (let i = 0; i < 3; i++) {
          this.spawnEnemy();
        }
        break;
        
      case 'megaBubble':
        // Dash attack
        this.boss.vy = 5;
        setTimeout(() => {
          if (this.boss) this.boss.vy = 0;
        }, 1000);
        break;
        
      case 'megaCrystal':
        // Crystal barrier
        for (let i = 0; i < 6; i++) {
          this.spawnObstacle();
        }
        break;
        
      case 'megaFire':
        // Fire tornado
        for (let i = 0; i < 20; i++) {
          const angle = (i / 20) * Math.PI * 2;
          this.enemyBullets.push({
            x: this.boss.x,
            y: this.boss.y,
            vx: Math.cos(angle) * 4,
            vy: Math.sin(angle) * 4,
            damage: 8,
            size: 6,
            color: '#ff4500'
          });
        }
        break;
        
      case 'megaIce':
        // Freeze screen effect + ice missiles
        for (let i = 0; i < 10; i++) {
          this.enemyBullets.push({
            x: Math.random() * this.canvas.width,
            y: -50,
            vx: 0,
            vy: 6,
            damage: 10,
            size: 8,
            color: '#00ffff'
          });
        }
        break;
        
      case 'megaThunder':
        // Lightning storm
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            if (Math.random() < 0.8) {
              this.health -= 3;
              this.playSound('hit');
              this.updateCallbacks();
            }
          }, i * 200);
        }
        break;
        
      case 'megaShadow':
        // Teleport and shadow clones
        this.boss.x = Math.random() * (this.canvas.width - this.boss.size * 2) + this.boss.size;
        for (let i = 0; i < 4; i++) {
          this.enemyBullets.push({
            x: this.boss.x + (Math.random() - 0.5) * 200,
            y: this.boss.y,
            vx: (Math.random() - 0.5) * 4,
            vy: 3,
            damage: 8,
            size: 8,
            color: '#8b008b'
          });
        }
        break;
        
      case 'megaGold':
        // Gold shower
        for (let i = 0; i < 15; i++) {
          this.enemyBullets.push({
            x: Math.random() * this.canvas.width,
            y: -50,
            vx: (Math.random() - 0.5) * 3,
            vy: 2 + Math.random() * 3,
            damage: 6,
            size: 5,
            color: '#ffd700'
          });
        }
        break;
        
      case 'megaVoid':
        // Void pull effect
        const pullDx = this.boss.x - this.player.x;
        const pullDy = this.boss.y - this.player.y;
        this.player.x += pullDx * 0.05;
        this.player.y += pullDy * 0.05;
        // Keep player in bounds
        this.player.x = Math.max(30, Math.min(this.canvas.width - 30, this.player.x));
        this.player.y = Math.max(50, Math.min(this.canvas.height - 50, this.player.y));
        break;
        
      case 'megaFinal':
        // Ultimate combo attack
        // Spawn enemies
        for (let i = 0; i < 5; i++) {
          this.spawnEnemy();
        }
        // Fire tornado
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2;
          this.enemyBullets.push({
            x: this.boss.x,
            y: this.boss.y,
            vx: Math.cos(angle) * 5,
            vy: Math.sin(angle) * 5,
            damage: 12,
            size: 8,
            color: '#ff00ff'
          });
        }
        break;
    }
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
    // Different boss types for each wave - MUCH stronger for epic battles
    const bossConfigs = [
      { type: 'megaSlime', color: '#00ff00', baseHealth: 150, baseSize: 80, speed: 0.3 },
      { type: 'megaBubble', color: '#00bfff', baseHealth: 200, baseSize: 90, speed: 0.4 },
      { type: 'megaCrystal', color: '#ff69b4', baseHealth: 250, baseSize: 100, speed: 0.2 },
      { type: 'megaFire', color: '#ff4500', baseHealth: 300, baseSize: 95, speed: 0.5 },
      { type: 'megaIce', color: '#00ffff', baseHealth: 350, baseSize: 105, speed: 0.2 },
      { type: 'megaThunder', color: '#ffff00', baseHealth: 400, baseSize: 110, speed: 0.4 },
      { type: 'megaShadow', color: '#8b008b', baseHealth: 450, baseSize: 115, speed: 0.3 },
      { type: 'megaGold', color: '#ffd700', baseHealth: 500, baseSize: 120, speed: 0.3 },
      { type: 'megaVoid', color: '#4b0082', baseHealth: 600, baseSize: 125, speed: 0.4 },
      { type: 'megaFinal', color: '#ff00ff', baseHealth: 800, baseSize: 150, speed: 0.2 }
    ];
    
    const config = bossConfigs[Math.min(this.wave - 1, bossConfigs.length - 1)];
    
    // Get Helena's friend name for this wave
    const friendName = this.callbacks.helenaFriends[Math.min(this.wave - 1, this.callbacks.helenaFriends.length - 1)];
    
    const boss = {
      x: this.canvas.width / 2,
      y: -config.baseSize,
      vx: (Math.random() - 0.5) * 1, // Slower horizontal movement
      vy: config.speed, // Vertical speed for entry
      type: config.type,
      color: config.color,
      size: config.baseSize,
      baseSpeed: config.speed,
      health: config.baseHealth + this.wave * 25, // Much more health scaling
      maxHealth: config.baseHealth + this.wave * 25,
      canShoot: true,
      canAccelerate: true,
      lastShot: Date.now(),
      specialAttackTimer: Date.now() + 3000, // Faster special attacks
      blinkTime: Date.now() + Math.random() * 1000,
      wave: this.wave,
      phase: 'entering', // entering, fighting, retreating
      targetY: 100, // Target position for fighting phase
      retreatTimer: Date.now() + 60000, // Retreat after 60 seconds if not defeated (longer battle)
      movementTimer: Date.now(),
      friendName: friendName // Helena's friend name
    };
    
    this.boss = boss;
    
    // Update the boss name in React state
    this.callbacks.onBossNameChange(friendName);
    this.playBossWarningSound();
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
    // Weighted distribution to favor health pickups
    const types = ['weapon', 'health', 'health', 'shield', 'helper', 'mine', 'wing', 'health'];
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
      // Handle guided missiles
      if (bullet.guided && bullet.target) {
        const dx = this.player.x - bullet.x;
        const dy = this.player.y - bullet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 0) {
          bullet.vx += (dx / distance) * 0.2; // Slight homing
          bullet.vy += (dy / distance) * 0.2;
        }
      }
      
      bullet.x += bullet.vx || 0;
      bullet.y += bullet.vy;
      return bullet.y < this.canvas.height + 50 && bullet.x > -50 && bullet.x < this.canvas.width + 50;
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
          vx: 0,
          vy: 5,
          damage: 5, // Reduced enemy bullet damage
          size: 4,
          color: '#ff0000'
        });
        enemy.lastShot = Date.now();
        this.playSound('enemyShoot');
      }
      
      if (enemy.y > this.canvas.height) {
        this.health -= 5; // Reduced damage from escaped enemies
        this.updateCallbacks();
        return false;
      }
      
      return true;
    });
  }

  private updateBoss() {
    if (this.boss) {
      // Boss movement phases
      if (this.boss.phase === 'entering') {
        // Move down to fighting position
        this.boss.y += this.boss.vy;
        if (this.boss.y >= this.boss.targetY) {
          this.boss.phase = 'fighting';
          this.boss.vy = 0;
        }
      } else if (this.boss.phase === 'fighting') {
        // Complex movement pattern in fighting phase
        const time = (Date.now() - this.boss.movementTimer) * 0.001;
        
        // Horizontal movement
        this.boss.x += this.boss.vx;
        if (this.boss.x < this.boss.size || this.boss.x > this.canvas.width - this.boss.size) {
          this.boss.vx = -this.boss.vx;
        }
        
        // Vertical oscillation
        this.boss.y = this.boss.targetY + Math.sin(time * 2) * 20;
        
        // Occasionally move up and down more dramatically
        if (Math.random() < 0.005) {
          this.boss.targetY = 50 + Math.random() * 150;
        }
        
        // Check retreat condition
        if (Date.now() > this.boss.retreatTimer) {
          this.boss.phase = 'retreating';
          this.boss.vy = -2; // Move up to retreat
        }
      } else if (this.boss.phase === 'retreating') {
        // Move up and away
        this.boss.y += this.boss.vy;
        if (this.boss.y < -this.boss.size * 2) {
          // Boss escaped
          this.health -= 20;
          this.boss = null;
          this.updateCallbacks();
          return;
        }
      }
      
      // Boss shooting with unique weapons (slower rate for longer battles)
      if (Date.now() - this.boss.lastShot > 1200) {
        this.shootBossWeapon();
        this.boss.lastShot = Date.now();
      }
      
      // Special attacks less frequently for longer battles
      if (Date.now() - this.boss.specialAttackTimer > 12000) {
        this.bossSpecialAttack();
        this.boss.specialAttackTimer = Date.now();
      }
      
      if (this.boss.y > this.canvas.height) {
        this.health -= 20; // Reduced damage from escaped boss
        this.boss = null;
        this.updateCallbacks();
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
            
            // Show boss defeated message first
            this.gameState = 'bossDefeated';
            this.callbacks.onStateChange(this.gameState);
            
            // Announce boss defeat with voice
            this.speakBossDefeat(this.boss.friendName);
            
            this.boss = null;
            // Complete the wave when boss is defeated (with delay for celebration)
            setTimeout(() => {
              this.completeWave();
            }, 2000); // 2 second celebration before 5 second peace
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
          this.weaponLevel = Math.min(6, this.weaponLevel + 1); // Allow up to 6 weapon levels
        } else if (pickup.type === 'health') {
          this.health = Math.min(150, this.health + 30); // More health from pickups
        } else if (pickup.type === 'shield') {
          this.shieldActive = true;
          this.shieldTimer = Date.now() + 10000; // Shield lasts 10 seconds
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
          this.health -= 5; // Reduced collision damage
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
          this.health -= 10; // Reduced boss collision damage
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
    
    // Spawn boss when enough enemies killed and no boss exists
    if (this.waveEnemiesKilled >= enemiesNeeded && !this.boss && this.gameState === 'playing') {
      this.spawnBoss();
      // Announce boss arrival
      this.showBossAnnouncement();
    }
  }
  
  private completeWave() {
    // Play victory sound for boss defeat
    this.playBossVictorySound();
    
    // 5 seconds of peace - no enemy spawning (Helena's request!)
    this.lastEnemySpawn = Date.now() + 5000;
    this.lastObstacleSpawn = Date.now() + 5000;
    
    setTimeout(() => {
      this.wave++;
      this.waveEnemiesKilled = 0;
      this.difficultyMultiplier = 1 + (this.wave - 1) * 0.1;
      
      this.enemySpawnRate = Math.max(1000, 2000 - this.wave * 80);
      this.health = Math.min(150, this.health + 40);
      
      if (this.wave > 10) {
        this.gameState = 'victory';
        this.callbacks.onStateChange(this.gameState);
        this.callbacks.onGameComplete(this.score);
      } else {
        // Show wave transition after peace period
        this.showWaveTransition();
      }
      
      this.updateCallbacks();
    }, 5000); // Extended to 5 seconds of peace
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
  
  private playBossWarningSound() {
    try {
      if (!this.audioCtx || this.audioCtx.state !== 'running') return;
      
      // Dramatic warning sound
      const oscillator1 = this.audioCtx.createOscillator();
      const oscillator2 = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();
      
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);
      
      oscillator1.type = 'sine';
      oscillator2.type = 'triangle';
      oscillator1.frequency.setValueAtTime(200, this.audioCtx.currentTime);
      oscillator2.frequency.setValueAtTime(400, this.audioCtx.currentTime);
      
      // Dramatic rise
      oscillator1.frequency.exponentialRampToValueAtTime(100, this.audioCtx.currentTime + 0.5);
      oscillator2.frequency.exponentialRampToValueAtTime(200, this.audioCtx.currentTime + 0.5);
      
      gainNode.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 1);
      
      oscillator1.start();
      oscillator2.start();
      setTimeout(() => {
        try { 
          oscillator1.stop(); 
          oscillator2.stop(); 
        } catch (e) { /* ignore */ }
      }, 1000);
    } catch (error) {
      // Silent fail
    }
  }
  
  private playBossVictorySound() {
    try {
      if (!this.audioCtx || this.audioCtx.state !== 'running') return;
      
      // Victory fanfare
      const notes = [440, 554, 659, 880]; // A, C#, E, A octave
      
      notes.forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = this.audioCtx.createOscillator();
          const gainNode = this.audioCtx.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(this.audioCtx.destination);
          
          oscillator.type = 'triangle';
          oscillator.frequency.value = freq;
          gainNode.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.3);
          
          oscillator.start();
          setTimeout(() => {
            try { oscillator.stop(); } catch (e) { /* ignore */ }
          }, 300);
        }, index * 150);
      });
    } catch (error) {
      // Silent fail
    }
  }

  private speakBossAnnouncement(friendName: string) {
    try {
      // Check if speech synthesis is supported
      if (!window.speechSynthesis) {
        console.log('Speech synthesis not supported');
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Create the announcement text in Portuguese
      const announcements = [
        `Chegou o Boss ${friendName}!`,
        `Atenção Helena! Boss ${friendName} chegou!`,
        `Prepare-se Helena! É o Boss ${friendName}!`,
        `Boss ${friendName} desafia você!`
      ];
      
      // Pick a random announcement for variety
      const announcement = announcements[Math.floor(Math.random() * announcements.length)];
      
      // Function to speak with proper voice loading
      const speakAnnouncement = () => {
        const utterance = new SpeechSynthesisUtterance(announcement);
        
        // Configure speech for Portuguese Brazilian child voice
        utterance.lang = 'pt-BR'; // Portuguese Brazilian
        utterance.rate = 0.9; // Slightly slower for dramatic effect
        utterance.pitch = 1.2; // Higher pitch for excitement
        utterance.volume = 0.8; // Loud but not overwhelming
        
        // Try to find a suitable voice
        const voices = window.speechSynthesis.getVoices();
        const portugueseVoice = voices.find(voice => 
          voice.lang.includes('pt') || voice.lang.includes('PT')
        ) || voices.find(voice => 
          voice.name.toLowerCase().includes('brasil') || 
          voice.name.toLowerCase().includes('brazil')
        );
        
        if (portugueseVoice) {
          utterance.voice = portugueseVoice;
          console.log('Using Portuguese voice:', portugueseVoice.name);
        } else {
          console.log('Portuguese voice not found, using default');
        }
        
        // Add error handling
        utterance.onerror = (event) => {
          console.log('Speech synthesis error:', event.error);
        };
        
        utterance.onend = () => {
          console.log('Boss announcement speech completed');
        };
        
        // Speak the announcement
        window.speechSynthesis.speak(utterance);
      };
      
      // Handle voice loading delay
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        // Voices not loaded yet, wait for voiceschanged event
        window.speechSynthesis.addEventListener('voiceschanged', speakAnnouncement, { once: true });
        // Also try after a short delay as backup
        setTimeout(speakAnnouncement, 100);
      } else {
        speakAnnouncement();
      }
      
    } catch (error) {
      console.log('Text-to-speech error:', error);
      // Silent fail - game continues without voice
    }
  }

  private speakBossDefeat(friendName: string) {
    try {
      // Check if speech synthesis is supported
      if (!window.speechSynthesis) {
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Create victory announcement in Portuguese
      const victoryAnnouncements = [
        `Parabéns Helena! Você venceu o Boss ${friendName}!`,
        `Vitória! ${friendName} foi derrotado!`,
        `Muito bem Helena! Boss ${friendName} derrotado!`,
        `Incrível! Helena venceu ${friendName}!`
      ];
      
      // Pick a random victory announcement
      const announcement = victoryAnnouncements[Math.floor(Math.random() * victoryAnnouncements.length)];
      
      // Function to speak victory with proper voice loading
      const speakVictory = () => {
        const utterance = new SpeechSynthesisUtterance(announcement);
        
        // Configure speech for celebration
        utterance.lang = 'pt-BR';
        utterance.rate = 1.0; // Normal speed for celebration
        utterance.pitch = 1.4; // Higher pitch for excitement
        utterance.volume = 0.9; // Louder for celebration
        
        // Try to find a suitable voice
        const voices = window.speechSynthesis.getVoices();
        const portugueseVoice = voices.find(voice => 
          voice.lang.includes('pt') || voice.lang.includes('PT')
        ) || voices.find(voice => 
          voice.name.toLowerCase().includes('brasil') || 
          voice.name.toLowerCase().includes('brazil')
        );
        
        if (portugueseVoice) {
          utterance.voice = portugueseVoice;
          console.log('Using Portuguese voice for victory:', portugueseVoice.name);
        }
        
        // Add error handling
        utterance.onerror = (event) => {
          console.log('Speech synthesis error:', event.error);
        };
        
        utterance.onend = () => {
          console.log('Boss defeat speech completed');
        };
        
        // Speak the victory announcement
        window.speechSynthesis.speak(utterance);
      };
      
      // Handle voice loading delay
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        // Voices not loaded yet, wait for voiceschanged event
        window.speechSynthesis.addEventListener('voiceschanged', speakVictory, { once: true });
        // Also try after a short delay as backup
        setTimeout(speakVictory, 100);
      } else {
        speakVictory();
      }
      
    } catch (error) {
      console.log('Text-to-speech error:', error);
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
    
    // Add Lele emoji in cockpit
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('👧', px, py - 15);
    
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
    
    // Add emoji on top of enemy
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    let emoji = '';
    switch (enemy.type) {
      case 'slime': emoji = '🟢'; break;
      case 'bubble': emoji = '🫧'; break;
      case 'crystal': emoji = '💎'; break;
    }
    
    this.ctx.fillText(emoji, enemy.x, enemy.y - enemy.size/2);
    
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
    // Draw boss body first
    this.ctx.fillStyle = boss.color;
    this.ctx.beginPath();
    this.ctx.arc(boss.x, boss.y, boss.size, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Add menacing border
    this.ctx.strokeStyle = '#ff0000';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(boss.x, boss.y, boss.size + 10, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // Health bar
    if (boss.maxHealth > 1) {
      this.ctx.fillStyle = 'red';
      this.ctx.fillRect(boss.x - boss.size, boss.y - boss.size - 15, boss.size * 2 * (boss.health / boss.maxHealth), 5);
      this.ctx.strokeStyle = 'white';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(boss.x - boss.size, boss.y - boss.size - 15, boss.size * 2, 5);
    }
    
    // Add boss-specific emoji
    this.ctx.font = '32px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    let emoji = '';
    switch (boss.type) {
      case 'megaSlime': emoji = '👾'; break;
      case 'megaBubble': emoji = '🌀'; break;
      case 'megaCrystal': emoji = '💎'; break;
      case 'megaFire': emoji = '🔥'; break;
      case 'megaIce': emoji = '❄️'; break;
      case 'megaThunder': emoji = '⚡'; break;
      case 'megaShadow': emoji = '👤'; break;
      case 'megaGold': emoji = '👑'; break;
      case 'megaVoid': emoji = '🕳️'; break;
      case 'megaFinal': emoji = '💀'; break;
    }
    
    this.ctx.fillText(emoji, boss.x, boss.y);
    
    // Boss eyes (menacing)
    const blink = Math.sin((Date.now() - boss.blinkTime) * 0.01) > 0.9 ? 1 : 4;
    this.ctx.fillStyle = 'red';
    this.ctx.beginPath();
    this.ctx.arc(boss.x - 10, boss.y - 10, blink, 0, Math.PI * 2);
    this.ctx.arc(boss.x + 10, boss.y - 10, blink, 0, Math.PI * 2);
    this.ctx.fill();
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
    // Solid background gradient
    this.ctx.globalAlpha = 0.7;
    this.ctx.fillStyle = '#1e3c72';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw stable buildings
    this.backgroundElements.buildings.forEach(building => {
      const drawY = building.y + this.backgroundY;
      
      // Only draw if visible on screen
      if (drawY > -building.height && drawY < this.canvas.height + 100) {
        this.ctx.fillStyle = building.color;
        this.ctx.globalAlpha = 0.4;
        
        // Main building body
        this.ctx.fillRect(
          building.x, 
          this.canvas.height - building.height + drawY, 
          building.width, 
          building.height
        );
        
        // Windows if building has them
        if (building.hasWindows && building.windows) {
          this.ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
          
          building.windows.forEach(window => {
            this.ctx.fillRect(
              building.x + window.col * 15 + 5,
              this.canvas.height - building.height + drawY + window.row * 20 + 5,
              8,
              12
            );
          });
        }
      }
      
      // Reset position for continuous scrolling
      if (drawY > this.canvas.height) {
        building.y -= this.canvas.height * 2;
      }
    });
    
    // Draw stable clouds
    this.backgroundElements.clouds.forEach(cloud => {
      const drawY = cloud.y + this.backgroundY * 0.3; // Slower parallax for clouds
      
      // Only draw if visible on screen
      if (drawY > -cloud.size && drawY < this.canvas.height + cloud.size) {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${cloud.opacity})`;
        this.ctx.globalAlpha = cloud.opacity;
        this.ctx.beginPath();
        this.ctx.arc(cloud.x, drawY, cloud.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      // Reset position for continuous scrolling
      if (drawY > this.canvas.height + cloud.size) {
        cloud.y -= this.canvas.height + cloud.size * 2;
      }
    });
    
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
      
      // Draw pickups with emojis
      this.pickups.forEach(pickup => {
        const pulseEffect = 0.8 + Math.sin((Date.now() - pickup.pulseTime) * 0.01) * 0.2;
        this.ctx.save();
        this.ctx.globalAlpha = pulseEffect;
        
        // Draw background shape first
        this.ctx.fillStyle = pickup.color;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        
        if (pickup.type === 'weapon') {
          // Star shape for weapon
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
          // Cross shape for health
          const size = pickup.size;
          this.ctx.fillRect(pickup.x - size/4, pickup.y - size, size/2, size*2);
          this.ctx.fillRect(pickup.x - size, pickup.y - size/4, size*2, size/2);
        } else if (pickup.type === 'shield') {
          // Circle for shield
          this.ctx.beginPath();
          this.ctx.arc(pickup.x, pickup.y, pickup.size, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.stroke();
        } else if (pickup.type === 'helper') {
          // Triangle for helper
          this.ctx.beginPath();
          this.ctx.moveTo(pickup.x, pickup.y - 10);
          this.ctx.lineTo(pickup.x - 10, pickup.y + 10);
          this.ctx.lineTo(pickup.x + 10, pickup.y + 10);
          this.ctx.closePath();
          this.ctx.fill();
        } else if (pickup.type === 'mine') {
          // Circle with fuse for mine
          this.ctx.beginPath();
          this.ctx.arc(pickup.x, pickup.y, 10, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.fillRect(pickup.x - 2, pickup.y - 15, 4, 5);
        } else if (pickup.type === 'wing') {
          // Wing shape
          this.ctx.beginPath();
          this.ctx.moveTo(pickup.x - 10, pickup.y);
          this.ctx.lineTo(pickup.x, pickup.y - 10);
          this.ctx.lineTo(pickup.x + 10, pickup.y);
          this.ctx.fill();
        }
        
        // Draw emoji on top
        this.ctx.globalAlpha = 1;
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        let emoji = '';
        switch (pickup.type) {
          case 'weapon': emoji = '🔫'; break;
          case 'health': emoji = '❤️'; break;
          case 'shield': emoji = '🛡️'; break;
          case 'helper': emoji = '🤖'; break;
          case 'mine': emoji = '💣'; break;
          case 'wing': emoji = '✈️'; break;
        }
        
        this.ctx.fillText(emoji, pickup.x, pickup.y);
        
        this.ctx.restore();
      });
      
      // Draw helpers with emojis
      this.helpers.forEach(helper => {
        this.ctx.fillStyle = '#00ff00';
        this.ctx.beginPath();
        this.ctx.moveTo(helper.x, helper.y - 10);
        this.ctx.lineTo(helper.x - 8, helper.y + 10);
        this.ctx.lineTo(helper.x + 8, helper.y + 10);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Add helper emoji
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🤖', helper.x, helper.y);
      });
      
      // Draw explosions with emojis
      this.explosions = this.explosions.filter(explosion => {
        const age = Date.now() - explosion.time;
        if (age < 500) {
          this.ctx.save();
          this.ctx.globalAlpha = 1 - (age / 500);
          
          // Draw explosion circle
          this.ctx.fillStyle = '#ffff00';
          this.ctx.beginPath();
          this.ctx.arc(explosion.x, explosion.y, age / 10, 0, Math.PI * 2);
          this.ctx.fill();
          
          // Add explosion emoji in center
          this.ctx.globalAlpha = 1 - (age / 300); // Fade faster
          this.ctx.font = '24px Arial';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          
          const explosionEmojis = ['💥', '✨', '⭐', '🌟'];
          const emoji = explosionEmojis[Math.floor(explosion.x + explosion.y) % explosionEmojis.length];
          this.ctx.fillText(emoji, explosion.x, explosion.y);
          
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
    if (this.gameState === 'paused' || this.gameState === 'waveTransition' || this.gameState === 'bossAnnouncement' || this.gameState === 'bossDefeated') {
      // Don't update game during transitions
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
          // Chance for double pickup spawn
          if (Math.random() < 0.3) {
            setTimeout(() => this.spawnPickup(), 500);
          }
          this.lastPickupSpawn = Date.now();
        }
        
        this.updatePlayer();
        this.autoShoot(); // Automatic shooting for easy gameplay
        this.updateBullets();
        this.updateEnemies();
        this.updateBoss();
        this.updateObstacles();
        this.updatePickups();
        this.updateEnemyBullets();
        this.checkCollisions();
        
        // Update shield timer
        if (this.shieldActive && Date.now() > this.shieldTimer) {
          this.shieldActive = false;
        }
        
        // Auto-upgrade weapon over time
        this.weaponUpgradeTimer += 16; // Approximate frame time
        if (this.weaponUpgradeTimer > this.weaponUpgradeDuration && this.weaponLevel < 6) {
          this.weaponLevel++;
          this.weaponUpgradeTimer = 0;
          console.log('Weapon auto-upgraded to level', this.weaponLevel);
        }
        
        // Check game over
        if (this.health <= 0) {
          this.gameState = 'gameOver';
          this.callbacks.onStateChange(this.gameState);
          // Don't call onGameComplete here - let the game over modal handle restart
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