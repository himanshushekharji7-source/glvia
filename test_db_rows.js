const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lrahbavlcjlnkjjqvuwx.supabase.co';
const supabaseKey = 'sb_publishable_S92IEuNGJeiRvM2QqpIkeg_4azhE5aW';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const { data, error } = await supabase.from('admin_users').select('email, role, firebase_uid, approval_status');
  if (error) console.error(error);
  else console.log("Current admin_users in DB:", data);
}

checkData();
