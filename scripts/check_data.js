import { createClient } from '@supabase/supabase-js';

const url = 'https://huatporucovamymegjnw.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1YXRwb3J1Y292YW15bWVnam53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTA5MTY4OCwiZXhwIjoyMTA0NjY3Njg4fQ.9ZoG20OJTKaN_98BRlCm3VgO4jYD0MSS_J4CVF4_9-A';

const supabaseAdmin = createClient(url, serviceRoleKey);

async function checkData() {
  const { data: schools } = await supabaseAdmin.from('schools').select('*');
  const { data: classes } = await supabaseAdmin.from('classes').select('*');
  const { data: students } = await supabaseAdmin.from('students').select('*');

  console.log(`📊 Hiện có: ${schools?.length || 0} trường, ${classes?.length || 0} lớp, ${students?.length || 0} học sinh.`);
}

checkData();
