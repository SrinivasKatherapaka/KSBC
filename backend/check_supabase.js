import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSupabase() {
  console.log('--- 1. Testing Supabase Customers Count ---');
  const { data: custs, error: custErr } = await supabase.from('customers').select('id, first_name, last_name').limit(5);
  console.log('Customers query error:', custErr);
  console.log(`Sample customers from Supabase (${custs?.length}):`, custs);

  console.log('\n--- 2. Testing Supabase Users Count ---');
  const { data: users, error: userErr } = await supabase.from('users').select('id, email, role').limit(5);
  console.log('Users query error:', userErr);
  console.log('Users:', users);

  console.log('\n--- 3. Testing Supabase Loans Count & Latest ---');
  const { data: loans, error: loanErr } = await supabase.from('loans').select('id, customer_id, principal_amount, status, created_at').order('created_at', { ascending: false }).limit(5);
  console.log('Loans query error:', loanErr);
  console.log('Latest loans in Supabase:', loans);

  console.log('\n--- 4. Testing Supabase Insert for Fresh Loan ---');
  // Test inserting a customer first if needed
  const testCustId = custs && custs.length > 0 ? custs[0].id : 'b1111111-1111-4111-b111-111111111111';
  const testUserId = users && users.length > 0 ? users[0].id : 'a1111111-1111-4111-a111-111111111111';

  const testPayload = {
    customer_id: testCustId,
    applicant_name: 'Test Live Supabase Entity',
    applicant_category: 'corporate',
    principal_amount: 1500000,
    interest_rate: 6.5,
    term_months: 36,
    purpose: 'Test Live Sync',
    status: 'underwriting',
    risk_score: 25,
    created_by: testUserId
  };

  const { data: insertData, error: insertErr } = await supabase.from('loans').insert(testPayload).select();
  console.log('Insert Error:', insertErr);
  console.log('Inserted row:', insertData);
}

checkSupabase();
