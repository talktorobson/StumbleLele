// Simple test to verify Supabase connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vbtfaypcrupztcnbdlmf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZidGZheXBjcnVwenRjbmJkbG1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTc1MDYxODEsImV4cCI6MjAxMzA4MjE4MX0.jEsaeD-QzxQBq82kqPvY0scQi7TE_7HvHgpM-XgTt5E';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test basic connection
async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    
    if (error) {
      console.error('Connection error:', error);
    } else {
      console.log('✅ Successfully connected to Supabase!');
      console.log('Data:', data);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

// Test Realtime connection
async function testRealtime() {
  console.log('Testing Realtime connection...');
  
  const channel = supabase
    .channel('test-channel')
    .on('broadcast', { event: 'test' }, (payload) => {
      console.log('Received broadcast:', payload);
    })
    .subscribe((status) => {
      console.log('Realtime status:', status);
      
      if (status === 'SUBSCRIBED') {
        console.log('✅ Successfully subscribed to Realtime!');
        
        // Send a test message
        setTimeout(() => {
          channel.send({
            type: 'broadcast',
            event: 'test',
            payload: { message: 'Hello from test!' }
          });
        }, 1000);
      }
    });
}

// Run tests
testConnection();
testRealtime();