// Seed script for initial achievements
// Run this once to populate the achievements table

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const INITIAL_ACHIEVEMENTS = [
  // Social Achievements
  {
    name: "Primeira Amizade",
    description: "Adicione seu primeiro amigo!",
    icon: "👫",
    category: "social",
    criteria: "friends_added:1",
    xpReward: 25,
    rarity: "common"
  },
  {
    name: "Popular",
    description: "Tenha 5 amigos na sua lista",
    icon: "🌟",
    category: "social",
    criteria: "friends_added:5",
    xpReward: 50,
    rarity: "rare"
  },
  {
    name: "Super Popular",
    description: "Tenha 10 amigos na sua lista",
    icon: "💫",
    category: "social",
    criteria: "friends_added:10",
    xpReward: 100,
    rarity: "epic"
  },

  // Chat Achievements
  {
    name: "Conversador",
    description: "Envie 10 mensagens para a Lele",
    icon: "💬",
    category: "chat",
    criteria: "messages_sent:10",
    xpReward: 25,
    rarity: "common"
  },
  {
    name: "Tagarela",
    description: "Envie 50 mensagens para a Lele",
    icon: "🗣️",
    category: "chat",
    criteria: "messages_sent:50",
    xpReward: 50,
    rarity: "rare"
  },
  {
    name: "Melhor Amiga da Lele",
    description: "Envie 100 mensagens para a Lele",
    icon: "💝",
    category: "chat",
    criteria: "messages_sent:100",
    xpReward: 100,
    rarity: "epic"
  },

  // Game Achievements
  {
    name: "Primeira Vitória",
    description: "Ganhe seu primeiro jogo!",
    icon: "🏆",
    category: "games",
    criteria: "games_won:1",
    xpReward: 30,
    rarity: "common"
  },
  {
    name: "Campeã",
    description: "Ganhe 5 jogos",
    icon: "🥇",
    category: "games",
    criteria: "games_won:5",
    xpReward: 60,
    rarity: "rare"
  },
  {
    name: "Invencível",
    description: "Ganhe 10 jogos",
    icon: "👑",
    category: "games",
    criteria: "games_won:10",
    xpReward: 120,
    rarity: "epic"
  },
  {
    name: "Piloto Espacial",
    description: "Complete uma partida de Cosmic Blaster",
    icon: "🚀",
    category: "games",
    criteria: "cosmic_blaster_completed:1",
    xpReward: 40,
    rarity: "common"
  },

  // Progression Achievements
  {
    name: "Iniciante",
    description: "Alcance o nível 2",
    icon: "🌱",
    category: "progression",
    criteria: "level_reached:2",
    xpReward: 20,
    rarity: "common"
  },
  {
    name: "Aprendiz",
    description: "Alcance o nível 5",
    icon: "📚",
    category: "progression",
    criteria: "level_reached:5",
    xpReward: 50,
    rarity: "rare"
  },
  {
    name: "Expert",
    description: "Alcance o nível 10",
    icon: "🎓",
    category: "progression",
    criteria: "level_reached:10",
    xpReward: 100,
    rarity: "epic"
  },
  {
    name: "Mestre",
    description: "Alcance o nível 20",
    icon: "🔮",
    category: "progression",
    criteria: "level_reached:20",
    xpReward: 200,
    rarity: "legendary"
  },
  {
    name: "Sequência de 7 Dias",
    description: "Faça login por 7 dias seguidos",
    icon: "🔥",
    category: "progression",
    criteria: "login_streak:7",
    xpReward: 100,
    rarity: "epic"
  },
  {
    name: "Dedicação Total",
    description: "Faça login por 30 dias seguidos",
    icon: "💎",
    category: "progression",
    criteria: "login_streak:30",
    xpReward: 300,
    rarity: "legendary"
  }
];

async function seedAchievements() {
  console.log('Seeding achievements...');

  try {
    // Check if achievements already exist
    const { data: existing } = await supabase
      .from('achievements')
      .select('id')
      .limit(1);

    if (existing && existing.length > 0) {
      console.log('Achievements already seeded. Skipping...');
      return;
    }

    // Insert achievements
    const { data, error } = await supabase
      .from('achievements')
      .insert(INITIAL_ACHIEVEMENTS)
      .select();

    if (error) {
      console.error('Error seeding achievements:', error);
      throw error;
    }

    console.log(`Successfully seeded ${data?.length} achievements!`);
    console.log('Achievement IDs:', data?.map(a => ({ id: a.id, name: a.name })));
  } catch (error) {
    console.error('Failed to seed achievements:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedAchievements()
    .then(() => {
      console.log('Seeding complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seedAchievements, INITIAL_ACHIEVEMENTS };
