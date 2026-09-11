import { createClient } from '@supabase/supabase-js';

const url = 'https://huatporucovamymegjnw.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1YXRwb3J1Y292YW15bWVnam53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTA5MTY4OCwiZXhwIjoyMTA0NjY3Njg4fQ.9ZoG20OJTKaN_98BRlCm3VgO4jYD0MSS_J4CVF4_9-A';

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
