const { Pool } = require('pg');
require('dotenv').config();

async function testConnection() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in environment variables');
    return;
  }
  
  console.log('🔍 Testing connection string:', connectionString.replace(/:[^:@]*@/, ':****@'));
  
  const pool = new Pool({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    console.log('🔄 Attempting to connect...');
    const client = await pool.connect();
    console.log('✅ Successfully connected to database!');
    
    // Test a simple query
    const result = await client.query('SELECT NOW()');
    console.log('🕐 Server time:', result.rows[0].now);
    
    // Test if tables exist
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📋 Existing tables:', tables.rows.map(r => r.table_name));
    
    client.release();
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('🔍 Error details:', {
      code: error.code,
      severity: error.severity,
      detail: error.detail,
      hint: error.hint
    });
  } finally {
    await pool.end();
  }
}

testConnection();