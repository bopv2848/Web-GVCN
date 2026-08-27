import { createClient } from '@supabase/supabase-js';

const url = 'https://invvygrwbhkwcwvoeabk.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImludnZ5Z3J3Ymhrd2N3dm9lYWJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzgxMDY1NCwiZXhwIjoyMTAzMzg2NjU0fQ.zRzPBfOvXq3hvsv1ehADPS7RBrVzMTTHUjAA98YnxVU';

const supabaseAdmin = createClient(url, serviceRoleKey);

async function checkUpsert() {
  const { data, error } = await supabaseAdmin.from('schools').upsert({
    id: '11111111-1111-1111-1111-111111111111',
    name: 'THPT THANH XUÂN',
    code: 'THPT-TX',
    address: 'Hà Nội'
  }).select();

  console.log('School Upsert result:', { data, error });
}

checkUpsert();
