// Test Supabase Connection
import { supabase } from './lib/supabase';

// Test if Supabase is properly configured
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log('Supabase connection test:', { data, error });
    return !error;
  } catch (err) {
    console.error('Supabase connection failed:', err);
    return false;
  }
}

export default testSupabaseConnection;
