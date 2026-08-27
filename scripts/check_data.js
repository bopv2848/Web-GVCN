import { createClient } from '@supabase/supabase-js';

const url = 'https://invvygrwbhkwcwvoeabk.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImludnZ5Z3J3Ymhrd2N3dm9lYWJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzgxMDY1NCwiZXhwIjoyMTAzMzg2NjU0fQ.zRzPBfOvXq3hvsv1ehADPS7RBrVzMTTHUjAA98YnxVU';

const supabaseAdmin = createClient(url, serviceRoleKey);

async function checkData() {
  const { data: schools } = await supabaseAdmin.from('schools').select('*');
  const { data: classes } = await supabaseAdmin.from('classes').select('*');
  const { data: students } = await supabaseAdmin.from('students').select('*');

  console.log(`📊 Hiện có: ${schools?.length || 0} trường, ${classes?.length || 0} lớp, ${students?.length || 0} học sinh.`);
}

checkData();
