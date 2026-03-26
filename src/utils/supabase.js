import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jahqxslvgjssamovmpla.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphaHF4c2x2Z2pzc2Ftb3ZtcGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MzEwNzEsImV4cCI6MjA5MDEwNzA3MX0.pCPkPS87zFUFqwRGmVSf5f7S86GQELXY1mz-G9h242E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
