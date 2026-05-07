// Simple test to check admin login
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dyggbijrfnbfzvkmvkwe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5Z2diaWpyZm5iZnp2a212a3dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MTE3NjUsImV4cCI6MjA5MTI4Nzc2NX0.XrJoYjHAaF9pH3nvlhMfw8Q2iJa5HDl92XcFVItJX3U';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'miercharis@gmail.com',
      password: 'your_password_here' // Replace with actual password
    });
    
    if (error) {
      console.error('Login failed:', error.message);
      return;
    }
    
    console.log('Login successful!');
    console.log('User:', data.user?.email);
    
    // Sign out
    await supabase.auth.signOut();
    console.log('Signed out');
    
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testAdminLogin();