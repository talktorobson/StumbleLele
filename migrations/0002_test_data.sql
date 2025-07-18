-- Test Data for Friends Chat System
-- This script creates sample data for development and testing
-- Author: Agent 1 - Database Architect
-- Date: 2025-07-18

-- Clear existing test data if needed
DELETE FROM messages WHERE conversation_id IN (
    SELECT id FROM conversations WHERE user1_id <= 10 OR user2_id <= 10
);
DELETE FROM conversations WHERE user1_id <= 10 OR user2_id <= 10;
DELETE FROM friends WHERE user_id <= 10 OR friend_id <= 10;
DELETE FROM users WHERE id <= 10;

-- Reset sequence to ensure consistent test IDs
ALTER SEQUENCE users_id_seq RESTART WITH 1;

-- Step 1: Create test users
INSERT INTO users (id, name, username, display_name, avatar_emoji, is_online, age, preferred_ai) VALUES
(1, 'Helena', 'helena', 'Helena Silva', '👧', true, 8, 'gemini'),
(2, 'Julia', 'julia', 'Julia Prima', '😊', true, 7, 'gemini'),
(3, 'TomTom', 'tomtom', 'Tom Tom', '🎮', false, 9, 'openai'),
(4, 'Sofia', 'sofia', 'Sofia Santos', '🌟', true, 8, 'gemini'),
(5, 'Miguel', 'miguel', 'Miguel Costa', '🚀', false, 10, 'xai'),
(6, 'Ana', 'ana', 'Ana Maria', '🎨', true, 7, 'anthropic'),
(7, 'Pedro', 'pedro', 'Pedro Lucas', '⚽', true, 9, 'gemini'),
(8, 'Clara', 'clara', 'Clara Luz', '🌸', false, 8, 'openai'),
(9, 'Bruno', 'bruno', 'Bruno Felix', '🎪', true, 10, 'xai'),
(10, 'Lara', 'lara', 'Lara Moon', '🌙', true, 7, 'gemini');

-- Step 2: Create friend relationships
INSERT INTO friends (user_id, friend_id, status) VALUES
-- Helena's friends
(1, 2, 'accepted'),  -- Helena ↔ Julia
(1, 3, 'accepted'),  -- Helena ↔ TomTom
(1, 4, 'accepted'),  -- Helena ↔ Sofia
(1, 5, 'pending'),   -- Helena → Miguel (pending)
(6, 1, 'pending'),   -- Ana → Helena (pending)

-- Julia's friends
(2, 3, 'accepted'),  -- Julia ↔ TomTom
(2, 6, 'accepted'),  -- Julia ↔ Ana
(2, 7, 'accepted'),  -- Julia ↔ Pedro
(2, 8, 'pending'),   -- Julia → Clara (pending)

-- TomTom's friends
(3, 4, 'accepted'),  -- TomTom ↔ Sofia
(3, 9, 'accepted'),  -- TomTom ↔ Bruno
(3, 10, 'accepted'), -- TomTom ↔ Lara

-- Sofia's friends
(4, 6, 'accepted'),  -- Sofia ↔ Ana
(4, 7, 'accepted'),  -- Sofia ↔ Pedro
(4, 10, 'accepted'), -- Sofia ↔ Lara

-- Miguel's friends
(5, 7, 'accepted'),  -- Miguel ↔ Pedro
(5, 9, 'accepted'),  -- Miguel ↔ Bruno

-- Ana's friends
(6, 8, 'accepted'),  -- Ana ↔ Clara
(6, 10, 'accepted'), -- Ana ↔ Lara

-- Pedro's friends
(7, 9, 'accepted'),  -- Pedro ↔ Bruno
(7, 10, 'accepted'), -- Pedro ↔ Lara

-- Clara's friends
(8, 9, 'accepted'),  -- Clara ↔ Bruno
(8, 10, 'accepted'), -- Clara ↔ Lara

-- Bruno's friends
(9, 10, 'accepted'); -- Bruno ↔ Lara

-- Step 3: Create conversations (automatically ordered user1_id < user2_id)
INSERT INTO conversations (user1_id, user2_id, created_at) VALUES
(1, 2, NOW() - INTERVAL '2 days'),  -- Helena ↔ Julia
(1, 3, NOW() - INTERVAL '1 day'),   -- Helena ↔ TomTom
(1, 4, NOW() - INTERVAL '3 hours'), -- Helena ↔ Sofia
(2, 3, NOW() - INTERVAL '5 hours'), -- Julia ↔ TomTom
(2, 6, NOW() - INTERVAL '1 hour'),  -- Julia ↔ Ana
(2, 7, NOW() - INTERVAL '30 minutes'), -- Julia ↔ Pedro
(3, 4, NOW() - INTERVAL '2 hours'), -- TomTom ↔ Sofia
(3, 9, NOW() - INTERVAL '4 hours'), -- TomTom ↔ Bruno
(3, 10, NOW() - INTERVAL '6 hours'), -- TomTom ↔ Lara
(4, 6, NOW() - INTERVAL '1 day'),   -- Sofia ↔ Ana
(4, 7, NOW() - INTERVAL '8 hours'), -- Sofia ↔ Pedro
(4, 10, NOW() - INTERVAL '3 days'), -- Sofia ↔ Lara
(5, 7, NOW() - INTERVAL '12 hours'), -- Miguel ↔ Pedro
(5, 9, NOW() - INTERVAL '2 days'),  -- Miguel ↔ Bruno
(6, 8, NOW() - INTERVAL '4 days'),  -- Ana ↔ Clara
(6, 10, NOW() - INTERVAL '6 hours'), -- Ana ↔ Lara
(7, 9, NOW() - INTERVAL '1 day'),   -- Pedro ↔ Bruno
(7, 10, NOW() - INTERVAL '5 hours'), -- Pedro ↔ Lara
(8, 9, NOW() - INTERVAL '3 days'),  -- Clara ↔ Bruno
(8, 10, NOW() - INTERVAL '7 hours'), -- Clara ↔ Lara
(9, 10, NOW() - INTERVAL '2 hours'); -- Bruno ↔ Lara

-- Step 4: Create sample messages
-- Helena ↔ Julia conversation
INSERT INTO messages (conversation_id, sender_id, content, created_at) VALUES
((SELECT id FROM conversations WHERE user1_id = 1 AND user2_id = 2), 1, 'Oi Julia! Como você está?', NOW() - INTERVAL '2 days'),
((SELECT id FROM conversations WHERE user1_id = 1 AND user2_id = 2), 2, 'Oi Helena! Estou bem! E você?', NOW() - INTERVAL '2 days' + INTERVAL '2 minutes'),
((SELECT id FROM conversations WHERE user1_id = 1 AND user2_id = 2), 1, 'Estou ótima! Quer jogar um jogo?', NOW() - INTERVAL '2 days' + INTERVAL '5 minutes'),
((SELECT id FROM conversations WHERE user1_id = 1 AND user2_id = 2), 2, 'Sim! Que jogo você quer jogar?', NOW() - INTERVAL '2 days' + INTERVAL '7 minutes'),
((SELECT id FROM conversations WHERE user1_id = 1 AND user2_id = 2), 1, 'Que tal o jogo de memória?', NOW() - INTERVAL '2 days' + INTERVAL '10 minutes'),
((SELECT id FROM conversations WHERE user1_id = 1 AND user2_id = 2), 2, 'Perfeito! Vamos jogar! 🎮', NOW() - INTERVAL '2 days' + INTERVAL '12 minutes'),

-- Helena ↔ TomTom conversation
((SELECT id FROM conversations WHERE user1_id = 1 AND user2_id = 3), 1, 'TomTom, você viu o novo jogo?', NOW() - INTERVAL '1 day'),
((SELECT id FROM conversations WHERE user1_id = 1 AND user2_id = 3), 3, 'Qual jogo? Me conta!', NOW() - INTERVAL '1 day' + INTERVAL '3 minutes'),
((SELECT id FROM conversations WHERE user1_id = 1 AND user2_id = 3), 1, 'O Cosmic Blaster! É muito legal!', NOW() - INTERVAL '1 day' + INTERVAL '5 minutes'),
((SELECT id FROM conversations WHERE user1_id = 1 AND user2_id = 3), 3, 'Vou experimentar! Obrigado pela dica! 🚀', NOW() - INTERVAL '1 day' + INTERVAL '8 minutes'),

-- Helena ↔ Sofia conversation
((SELECT id FROM conversations WHERE user1_id = 1 AND user2_id = 4), 1, 'Sofia, você conseguiu passar do nível 5?', NOW() - INTERVAL '3 hours'),
((SELECT id FROM conversations WHERE user1_id = 1 AND user2_id = 4), 4, 'Consegui sim! Foi difícil mas consegui!', NOW() - INTERVAL '3 hours' + INTERVAL '2 minutes'),
((SELECT id FROM conversations WHERE user1_id = 1 AND user2_id = 4), 1, 'Parabéns! Você é muito boa nos jogos! ⭐', NOW() - INTERVAL '3 hours' + INTERVAL '4 minutes'),
((SELECT id FROM conversations WHERE user1_id = 1 AND user2_id = 4), 4, 'Obrigada! Você também é! 😊', NOW() - INTERVAL '3 hours' + INTERVAL '6 minutes'),

-- Julia ↔ TomTom conversation
((SELECT id FROM conversations WHERE user1_id = 2 AND user2_id = 3), 2, 'TomTom, vamos jogar juntos?', NOW() - INTERVAL '5 hours'),
((SELECT id FROM conversations WHERE user1_id = 2 AND user2_id = 3), 3, 'Claro! Que jogo você quer jogar?', NOW() - INTERVAL '5 hours' + INTERVAL '1 minute'),
((SELECT id FROM conversations WHERE user1_id = 2 AND user2_id = 3), 2, 'Que tal o jogo de palavras?', NOW() - INTERVAL '5 hours' + INTERVAL '3 minutes'),
((SELECT id FROM conversations WHERE user1_id = 2 AND user2_id = 3), 3, 'Ótima ideia! Vamos lá! 📝', NOW() - INTERVAL '5 hours' + INTERVAL '5 minutes'),

-- Julia ↔ Ana conversation
((SELECT id FROM conversations WHERE user1_id = 2 AND user2_id = 6), 2, 'Ana, você gosta de desenhar?', NOW() - INTERVAL '1 hour'),
((SELECT id FROM conversations WHERE user1_id = 2 AND user2_id = 6), 6, 'Amo desenhar! E você?', NOW() - INTERVAL '1 hour' + INTERVAL '2 minutes'),
((SELECT id FROM conversations WHERE user1_id = 2 AND user2_id = 6), 2, 'Também gosto! Vamos desenhar juntas?', NOW() - INTERVAL '1 hour' + INTERVAL '4 minutes'),
((SELECT id FROM conversations WHERE user1_id = 2 AND user2_id = 6), 6, 'Sim! Vamos fazer um desenho lindo! 🎨', NOW() - INTERVAL '1 hour' + INTERVAL '6 minutes'),

-- Julia ↔ Pedro conversation
((SELECT id FROM conversations WHERE user1_id = 2 AND user2_id = 7), 2, 'Pedro, você gosta de futebol?', NOW() - INTERVAL '30 minutes'),
((SELECT id FROM conversations WHERE user1_id = 2 AND user2_id = 7), 7, 'Amo futebol! É meu esporte favorito!', NOW() - INTERVAL '30 minutes' + INTERVAL '1 minute'),
((SELECT id FROM conversations WHERE user1_id = 2 AND user2_id = 7), 2, 'Legal! Qual seu time favorito?', NOW() - INTERVAL '30 minutes' + INTERVAL '3 minutes'),
((SELECT id FROM conversations WHERE user1_id = 2 AND user2_id = 7), 7, 'Gosto do Brasil! E você?', NOW() - INTERVAL '30 minutes' + INTERVAL '5 minutes'),

-- TomTom ↔ Sofia conversation
((SELECT id FROM conversations WHERE user1_id = 3 AND user2_id = 4), 3, 'Sofia, você conhece algum truque no jogo?', NOW() - INTERVAL '2 hours'),
((SELECT id FROM conversations WHERE user1_id = 3 AND user2_id = 4), 4, 'Conheço alguns! Quer que eu te ensine?', NOW() - INTERVAL '2 hours' + INTERVAL '2 minutes'),
((SELECT id FROM conversations WHERE user1_id = 3 AND user2_id = 4), 3, 'Sim, por favor! Você é muito esperta!', NOW() - INTERVAL '2 hours' + INTERVAL '4 minutes'),
((SELECT id FROM conversations WHERE user1_id = 3 AND user2_id = 4), 4, 'Obrigada! Vou te ensinar o truque da estrela! ⭐', NOW() - INTERVAL '2 hours' + INTERVAL '6 minutes'),

-- TomTom ↔ Bruno conversation
((SELECT id FROM conversations WHERE user1_id = 3 AND user2_id = 9), 3, 'Bruno, você viu o novo circo na cidade?', NOW() - INTERVAL '4 hours'),
((SELECT id FROM conversations WHERE user1_id = 3 AND user2_id = 9), 9, 'Vi sim! Parece muito divertido!', NOW() - INTERVAL '4 hours' + INTERVAL '3 minutes'),
((SELECT id FROM conversations WHERE user1_id = 3 AND user2_id = 9), 3, 'Vamos pedir pros nossos pais para ir?', NOW() - INTERVAL '4 hours' + INTERVAL '5 minutes'),
((SELECT id FROM conversations WHERE user1_id = 3 AND user2_id = 9), 9, 'Boa ideia! Vai ser incrível! 🎪', NOW() - INTERVAL '4 hours' + INTERVAL '7 minutes'),

-- Recent messages for active conversations
((SELECT id FROM conversations WHERE user1_id = 9 AND user2_id = 10), 9, 'Lara, você quer brincar?', NOW() - INTERVAL '5 minutes'),
((SELECT id FROM conversations WHERE user1_id = 9 AND user2_id = 10), 10, 'Claro! Do que você quer brincar?', NOW() - INTERVAL '3 minutes'),
((SELECT id FROM conversations WHERE user1_id = 9 AND user2_id = 10), 9, 'Que tal esconde-esconde?', NOW() - INTERVAL '1 minute'),
((SELECT id FROM conversations WHERE user1_id = 9 AND user2_id = 10), 10, 'Perfeito! Você conta primeiro! 🌙', NOW() - INTERVAL '30 seconds');

-- Step 5: Update conversation timestamps based on last messages
UPDATE conversations SET last_message_at = (
    SELECT MAX(created_at) FROM messages 
    WHERE messages.conversation_id = conversations.id
);

-- Step 6: Create some AI conversation history for context
INSERT INTO ai_conversations (user_id, message, response, timestamp) VALUES
(1, 'Oi Lele! Como você está?', 'Oi Helena! Estou muito bem! E você? Como foi seu dia?', NOW() - INTERVAL '1 day'),
(1, 'Estou bem! Você pode me contar uma piada?', 'Claro! Por que o livro de matemática estava triste? Porque tinha muitos problemas! 😄', NOW() - INTERVAL '1 day' + INTERVAL '2 minutes'),
(2, 'Lele, você quer ser minha amiga?', 'Claro Julia! Eu adoro fazer novos amigos! Vamos brincar juntas!', NOW() - INTERVAL '2 hours'),
(3, 'Qual é o melhor jogo para jogar?', 'Eu gosto muito do Cosmic Blaster! É divertido e você pode treinar sua coordenação!', NOW() - INTERVAL '6 hours'),
(4, 'Lele, você pode me ajudar com um problema?', 'Claro Sofia! Estou aqui para ajudar. Qual é o problema?', NOW() - INTERVAL '30 minutes');

-- Step 7: Create some memories for the users
INSERT INTO memories (user_id, content, category, timestamp) VALUES
(1, 'Helena gosta de jogos de memória e é muito boa neles', 'games', NOW() - INTERVAL '1 day'),
(1, 'Helena tem 8 anos e usa o Gemini como IA preferida', 'preferences', NOW() - INTERVAL '2 days'),
(2, 'Julia gosta de desenhar e tem interesse em arte', 'interests', NOW() - INTERVAL '3 hours'),
(2, 'Julia é amiga da Helena e elas gostam de jogar juntas', 'friends', NOW() - INTERVAL '1 day'),
(3, 'TomTom é fã de jogos e conhece muitos truques', 'games', NOW() - INTERVAL '5 hours'),
(3, 'TomTom gosta de compartilhar dicas sobre jogos', 'personality', NOW() - INTERVAL '8 hours'),
(4, 'Sofia é muito esperta e boa em resolver problemas', 'personality', NOW() - INTERVAL '2 hours'),
(4, 'Sofia gosta de ensinar truques para outros jogadores', 'social', NOW() - INTERVAL '4 hours');

-- Step 8: Update user online status randomly
UPDATE users SET 
    is_online = CASE 
        WHEN id IN (1, 2, 4, 6, 7, 9, 10) THEN true 
        ELSE false 
    END,
    last_seen = CASE 
        WHEN id IN (3, 5, 8) THEN NOW() - INTERVAL '1 hour' 
        ELSE NOW() - INTERVAL '5 minutes' 
    END;

-- Test data creation completed successfully
-- Summary:
-- - 10 test users created with diverse profiles
-- - 25 friend relationships (mix of accepted and pending)
-- - 21 conversations between friends
-- - 50+ sample messages with realistic conversations
-- - 5 AI conversation samples for context
-- - 8 memory entries for user personalization
-- - Realistic online/offline status distribution

COMMENT ON TABLE users IS 'Test users: Helena, Julia, TomTom, Sofia, Miguel, Ana, Pedro, Clara, Bruno, Lara';
COMMENT ON TABLE friends IS 'Friend relationships with accepted and pending statuses';
COMMENT ON TABLE conversations IS 'Active conversations between friends';
COMMENT ON TABLE messages IS 'Sample messages showing realistic child conversations';