import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://jahqxslvgjssamovmpla.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphaHF4c2x2Z2pzc2Ftb3ZtcGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MzEwNzEsImV4cCI6MjA5MDEwNzA3MX0.pCPkPS87zFUFqwRGmVSf5f7S86GQELXY1mz-G9h242E'
);

async function listProjects() {
    const { data, error } = await supabase
        .from('projects')
        .select('id, title, category');
    
    if (error) {
        console.error(error);
        return;
    }
    console.log(JSON.stringify(data, null, 2));
}

listProjects();
