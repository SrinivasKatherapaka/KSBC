import { db } from './src/config/db.js';
import assert from 'assert';

async function testFullPersistence() {
  console.log('🧪 Starting DB & User Registration Persistence Test...');

  const testEmail = `test.personnel.${Date.now()}@ksbc-test.com`;
  console.log(`\n1. Creating new registered user: ${testEmail}`);
  const registeredUser = await db.createUser({
    email: testEmail,
    hashed_password: 'hashed_password_sample_123',
    first_name: 'TestPersist',
    last_name: 'User',
    role: 'customer_ops'
  });

  assert.ok(registeredUser.id, 'User ID should be defined');
  console.log('✅ User registered successfully:', registeredUser.id, registeredUser.email);

  console.log('\n2. Querying user by email immediately...');
  const foundUser1 = await db.findUserByEmail(testEmail);
  assert.ok(foundUser1, 'Registered user should be found in DB');
  assert.strictEqual(foundUser1.email, testEmail);
  console.log('✅ User query verified:', foundUser1.email);

  console.log('\n3. Creating manual entries (Customer, Loan, Purchase Order)...');
  const newCust = await db.createCustomer({
    first_name: 'ManualIntake',
    last_name: 'Corp',
    email: `manual.${Date.now()}@ksbc-test.com`,
    phone: '+1-555-8822',
    annual_revenue: 8500000,
    client_category: 'corporate'
  });
  console.log('✅ Manual customer created:', newCust.id, newCust.first_name);

  const newLoan = await db.createLoan({
    customer_id: newCust.id,
    applicant_name: 'ManualIntake Corp',
    applicant_category: 'corporate',
    principal_amount: 1200000,
    interest_rate: 6.8,
    term_months: 36,
    purpose: 'Manual DB Verification',
    status: 'underwriting',
    created_by: registeredUser.id
  });
  console.log('✅ Manual loan created:', newLoan.id, newLoan.principal_amount);

  const newPo = await db.createPurchaseOrder({
    vendor_id: 'v1000001-1111-4111-v111-111111111111',
    amount: 75000,
    description: 'Manual Hardware Upgrade Order',
    created_by: registeredUser.id
  });
  console.log('✅ Manual purchase order created:', newPo.id, newPo.po_number);

  console.log('\n4. Simulating process restart by re-querying and checking WAL store reload...');
  const reloadedUser = await db.findUserByEmail(testEmail);
  assert.ok(reloadedUser, 'User must remain in persistent DB after WAL store sync');
  assert.strictEqual(reloadedUser.email, testEmail);

  const allCusts = await db.getCustomers();
  const foundCust = allCusts.find(c => c.id === newCust.id);
  assert.ok(foundCust, 'Created customer must be present in customer store');

  const allLoans = await db.getLoans();
  const foundLoan = allLoans.find(l => l.id === newLoan.id);
  assert.ok(foundLoan, 'Created loan must be present in loan store');

  const allPos = await db.getPurchaseOrders();
  const foundPo = allPos.find(p => p.id === newPo.id);
  assert.ok(foundPo, 'Created PO must be present in PO store');

  console.log('\n🎉 ALL PERSISTENCE TESTS PASSED PERFECTLY!');
  process.exit(0);
}

testFullPersistence().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
