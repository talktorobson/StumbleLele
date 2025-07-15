export interface LevelRequirement {
  level: number;
  minScore: number;
  gamesPlayed: number;
  accuracy: number;
  streakRequired: number;
}

export interface GameProgression {
  gameType: string;
  currentLevel: number;
  totalScore: number;
  gamesPlayed: number;
  averageScore: number;
  bestScore: number;
  accuracy: number;
  bestStreak: number;
  unlockedFeatures: string[];
  nextLevelRequirements: LevelRequirement;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (progression: GameProgression) => boolean;
  reward: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

export class ProgressionService {
  private static readonly LEVEL_REQUIREMENTS: Record<string, LevelRequirement[]> = {
    memory: [
      { level: 1, minScore: 100, gamesPlayed: 3, accuracy: 60, streakRequired: 2 },
      { level: 2, minScore: 150, gamesPlayed: 8, accuracy: 70, streakRequired: 3 },
      { level: 3, minScore: 200, gamesPlayed: 15, accuracy: 80, streakRequired: 4 },
      { level: 4, minScore: 250, gamesPlayed: 25, accuracy: 85, streakRequired: 5 },
      { level: 5, minScore: 300, gamesPlayed: 40, accuracy: 90, streakRequired: 6 },
    ],
    words: [
      { level: 1, minScore: 120, gamesPlayed: 3, accuracy: 65, streakRequired: 2 },
      { level: 2, minScore: 180, gamesPlayed: 8, accuracy: 75, streakRequired: 3 },
      { level: 3, minScore: 240, gamesPlayed: 15, accuracy: 80, streakRequired: 4 },
      { level: 4, minScore: 300, gamesPlayed: 25, accuracy: 85, streakRequired: 5 },
      { level: 5, minScore: 360, gamesPlayed: 40, accuracy: 90, streakRequired: 6 },
    ],
    math: [
      { level: 1, minScore: 150, gamesPlayed: 3, accuracy: 70, streakRequired: 3 },
      { level: 2, minScore: 220, gamesPlayed: 8, accuracy: 75, streakRequired: 4 },
      { level: 3, minScore: 300, gamesPlayed: 15, accuracy: 80, streakRequired: 5 },
      { level: 4, minScore: 380, gamesPlayed: 25, accuracy: 85, streakRequired: 6 },
      { level: 5, minScore: 460, gamesPlayed: 40, accuracy: 90, streakRequired: 7 },
    ],
    emotions: [
      { level: 1, minScore: 130, gamesPlayed: 3, accuracy: 65, streakRequired: 2 },
      { level: 2, minScore: 200, gamesPlayed: 8, accuracy: 75, streakRequired: 3 },
      { level: 3, minScore: 270, gamesPlayed: 15, accuracy: 80, streakRequired: 4 },
      { level: 4, minScore: 340, gamesPlayed: 25, accuracy: 85, streakRequired: 5 },
      { level: 5, minScore: 410, gamesPlayed: 40, accuracy: 90, streakRequired: 6 },
    ],
  };

  private static readonly ACHIEVEMENTS: Achievement[] = [
    {
      id: 'first_game',
      title: 'Primeira Jogada',
      description: 'Completou seu primeiro jogo!',
      icon: '🎮',
      condition: (p) => p.gamesPlayed >= 1,
      reward: 'Desbloqueou a funcionalidade de estatísticas',
      unlocked: false,
    },
    {
      id: 'level_up',
      title: 'Subiu de Nível',
      description: 'Alcançou o nível 2 em qualquer jogo!',
      icon: '⭐',
      condition: (p) => p.currentLevel >= 2,
      reward: 'Desbloqueou novos desafios',
      unlocked: false,
    },
    {
      id: 'perfectionist',
      title: 'Perfeccionista',
      description: 'Conseguiu 100% de precisão em um jogo!',
      icon: '💯',
      condition: (p) => p.accuracy >= 100,
      reward: 'Desbloqueou modo expert',
      unlocked: false,
    },
    {
      id: 'high_scorer',
      title: 'Pontuação Alta',
      description: 'Conseguiu mais de 300 pontos em um jogo!',
      icon: '🏆',
      condition: (p) => p.bestScore >= 300,
      reward: 'Desbloqueou ranking global',
      unlocked: false,
    },
    {
      id: 'streak_master',
      title: 'Mestre da Sequência',
      description: 'Conseguiu uma sequência de 5 acertos!',
      icon: '🔥',
      condition: (p) => p.bestStreak >= 5,
      reward: 'Desbloqueou modo turbo',
      unlocked: false,
    },
    {
      id: 'all_games_level_2',
      title: 'Jogador Completo',
      description: 'Alcançou nível 2 em todos os jogos!',
      icon: '🌟',
      condition: (p) => p.currentLevel >= 2,
      reward: 'Desbloqueou jogos especiais',
      unlocked: false,
    },
    {
      id: 'experienced_player',
      title: 'Jogador Experiente',
      description: 'Jogou mais de 50 partidas!',
      icon: '🎯',
      condition: (p) => p.gamesPlayed >= 50,
      reward: 'Desbloqueou modo competitivo',
      unlocked: false,
    },
    {
      id: 'emotion_expert',
      title: 'Expert em Emoções',
      description: 'Dominou o jogo das emoções!',
      icon: '💝',
      condition: (p) => p.gameType === 'emotions' && p.currentLevel >= 4,
      reward: 'Desbloqueou coaching emocional',
      unlocked: false,
    },
    {
      id: 'math_genius',
      title: 'Gênio da Matemática',
      description: 'Dominou os jogos de matemática!',
      icon: '🧮',
      condition: (p) => p.gameType === 'math' && p.currentLevel >= 4,
      reward: 'Desbloqueou problemas avançados',
      unlocked: false,
    },
    {
      id: 'word_master',
      title: 'Mestre das Palavras',
      description: 'Dominou os jogos de palavras!',
      icon: '📚',
      condition: (p) => p.gameType === 'words' && p.currentLevel >= 4,
      reward: 'Desbloqueou dicionário interativo',
      unlocked: false,
    },
  ];

  static calculateProgression(gameType: string, gameHistory: any[]): GameProgression {
    const requirements = this.LEVEL_REQUIREMENTS[gameType] || this.LEVEL_REQUIREMENTS.memory;
    
    const gamesPlayed = gameHistory.length;
    const totalScore = gameHistory.reduce((sum, game) => sum + game.score, 0);
    const averageScore = gamesPlayed > 0 ? totalScore / gamesPlayed : 0;
    const bestScore = gameHistory.reduce((max, game) => Math.max(max, game.score), 0);
    const accuracy = this.calculateAccuracy(gameHistory);
    const bestStreak = this.calculateBestStreak(gameHistory);
    
    let currentLevel = 1;
    let unlockedFeatures: string[] = [];
    
    // Calculate current level
    for (const req of requirements) {
      if (this.meetsRequirements(req, {
        gamesPlayed,
        averageScore,
        accuracy,
        bestStreak,
        bestScore
      })) {
        currentLevel = req.level;
        unlockedFeatures = this.getUnlockedFeatures(gameType, currentLevel);
      } else {
        break;
      }
    }
    
    // Get next level requirements
    const nextLevelRequirements = requirements.find(req => req.level > currentLevel) || requirements[requirements.length - 1];
    
    return {
      gameType,
      currentLevel,
      totalScore,
      gamesPlayed,
      averageScore,
      bestScore,
      accuracy,
      bestStreak,
      unlockedFeatures,
      nextLevelRequirements,
    };
  }

  private static meetsRequirements(req: LevelRequirement, stats: any): boolean {
    return stats.gamesPlayed >= req.gamesPlayed &&
           stats.averageScore >= req.minScore &&
           stats.accuracy >= req.accuracy &&
           stats.bestStreak >= req.streakRequired;
  }

  private static calculateAccuracy(gameHistory: any[]): number {
    if (gameHistory.length === 0) return 0;
    
    const totalCorrect = gameHistory.reduce((sum, game) => {
      // Estimate correct answers based on score and level
      const estimatedCorrect = Math.floor(game.score / (10 + game.level * 5));
      return sum + estimatedCorrect;
    }, 0);
    
    const totalQuestions = gameHistory.length * 10; // Estimate 10 questions per game
    return Math.min(100, (totalCorrect / totalQuestions) * 100);
  }

  private static calculateBestStreak(gameHistory: any[]): number {
    if (gameHistory.length === 0) return 0;
    
    // Estimate streak based on score consistency
    let bestStreak = 0;
    let currentStreak = 0;
    
    for (const game of gameHistory) {
      if (game.score >= 80) { // Consider score >= 80 as good performance
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return bestStreak;
  }

  private static getUnlockedFeatures(gameType: string, level: number): string[] {
    const features: string[] = [];
    
    if (level >= 2) {
      features.push('Advanced Mode', 'Statistics Dashboard');
    }
    
    if (level >= 3) {
      features.push('Custom Challenges', 'Progress Tracking');
    }
    
    if (level >= 4) {
      features.push('Expert Mode', 'Leaderboards');
    }
    
    if (level >= 5) {
      features.push('Master Mode', 'Creative Tools');
    }
    
    // Game-specific features
    switch (gameType) {
      case 'memory':
        if (level >= 3) features.push('Memory Palace Mode');
        if (level >= 5) features.push('Speed Memory');
        break;
      case 'words':
        if (level >= 3) features.push('Word Builder');
        if (level >= 5) features.push('Poetry Mode');
        break;
      case 'math':
        if (level >= 3) features.push('Formula Helper');
        if (level >= 5) features.push('Advanced Operations');
        break;
      case 'emotions':
        if (level >= 3) features.push('Emotion Diary');
        if (level >= 5) features.push('Empathy Training');
        break;
    }
    
    return features;
  }

  static checkAchievements(progression: GameProgression): Achievement[] {
    const unlockedAchievements: Achievement[] = [];
    
    for (const achievement of this.ACHIEVEMENTS) {
      if (!achievement.unlocked && achievement.condition(progression)) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();
        unlockedAchievements.push(achievement);
      }
    }
    
    return unlockedAchievements;
  }

  static getProgressToNextLevel(progression: GameProgression): {
    requirement: string;
    current: number;
    target: number;
    percentage: number;
  }[] {
    const req = progression.nextLevelRequirements;
    
    return [
      {
        requirement: 'Jogos Completados',
        current: progression.gamesPlayed,
        target: req.gamesPlayed,
        percentage: Math.min(100, (progression.gamesPlayed / req.gamesPlayed) * 100),
      },
      {
        requirement: 'Pontuação Média',
        current: Math.round(progression.averageScore),
        target: req.minScore,
        percentage: Math.min(100, (progression.averageScore / req.minScore) * 100),
      },
      {
        requirement: 'Precisão',
        current: Math.round(progression.accuracy),
        target: req.accuracy,
        percentage: Math.min(100, (progression.accuracy / req.accuracy) * 100),
      },
      {
        requirement: 'Melhor Sequência',
        current: progression.bestStreak,
        target: req.streakRequired,
        percentage: Math.min(100, (progression.bestStreak / req.streakRequired) * 100),
      },
    ];
  }

  static getMotivationalMessage(progression: GameProgression): string {
    const progress = this.getProgressToNextLevel(progression);
    const totalProgress = progress.reduce((sum, p) => sum + p.percentage, 0) / progress.length;
    
    if (totalProgress >= 90) {
      return `Você está quase lá! Só mais um pouquinho para o nível ${progression.nextLevelRequirements.level}! 🌟`;
    } else if (totalProgress >= 70) {
      return `Excelente progresso! Continue assim para subir de nível! 🚀`;
    } else if (totalProgress >= 50) {
      return `Você está indo muito bem! Metade do caminho já foi percorrido! 💪`;
    } else if (totalProgress >= 30) {
      return `Bom trabalho! Continue praticando para melhorar ainda mais! 🎯`;
    } else {
      return `Cada jogo é uma oportunidade de aprender algo novo! Vamos continuar! 🌱`;
    }
  }

  static getDifficultyRecommendation(progression: GameProgression): {
    suggested: number;
    reason: string;
  } {
    const accuracy = progression.accuracy;
    const currentLevel = progression.currentLevel;
    
    if (accuracy >= 90 && progression.gamesPlayed >= 5) {
      return {
        suggested: Math.min(5, currentLevel + 1),
        reason: 'Sua precisão é excelente! Hora de um novo desafio!',
      };
    } else if (accuracy >= 75 && progression.gamesPlayed >= 3) {
      return {
        suggested: currentLevel,
        reason: 'Continue praticando este nível para dominar completamente!',
      };
    } else if (accuracy < 60 && currentLevel > 1) {
      return {
        suggested: Math.max(1, currentLevel - 1),
        reason: 'Que tal praticar um nível mais fácil para construir confiança?',
      };
    } else {
      return {
        suggested: currentLevel,
        reason: 'Este nível é perfeito para você continuar aprendendo!',
      };
    }
  }
}