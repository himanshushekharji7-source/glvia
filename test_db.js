const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lrahbavlcjlnkjjqvuwx.supabase.co';
const supabaseKey = 'sb_publishable_S92IEuNGJeiRvM2QqpIkeg_4azhE5aW';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log("Checking admin_users table...");
  const { data, error } = await supabase.from('admin_users').select('*').limit(1);
  
  if (error) {
    console.error("Error fetching admin_users:", error);
  } else {
    console.log("Success! Columns available:", data.length > 0 ? Object.keys(data[0]) : "Table is empty, cannot infer columns from empty response via data.");
    
    // Test if we can specifically select firebase_uid
    const { data: colsData, error: colsErr } = await supabase.from('admin_users').select('firebase_uid, approval_status').limit(1);
    if (colsErr) {
      console.error("Missing expected columns! Error:", colsErr.message);
    } else {
      console.log("Columns firebase_uid and approval_status EXIST!");
    }
  }
}

checkSchema();
