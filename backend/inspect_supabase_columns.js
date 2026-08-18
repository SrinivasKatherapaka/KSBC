import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectSchema() {
  // Query 1 row of loans with select * to see what keys exist in Supabase loans table
  const { data: sampleLoan, error: loanErr } = await supabase.from('loans').select('*').limit(1);
  console.log('Sample loan columns from Supabase:', sampleLoan ? Object.keys(sampleLoan[0]) : loanErr);

  // Query 1 row of customers with select *
  const { data: sampleCust, error: custErr } = await supabase.from('customers').select('*').limit(1);
  console.log('Sample customer columns from Supabase:', sampleCust ? Object.keys(sampleCust[0]) : custErr);

  // Query 1 row of users with select *
  const { data: sampleUser, error: userErr } = await supabase.from('users').select('*').limit(1);
  console.log('Sample user columns from Supabase:', sampleUser ? Object.keys(sampleUser[0]) : userErr);
}

inspectSchema();
