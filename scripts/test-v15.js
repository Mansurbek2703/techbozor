const { runEcommerceAgentPipeline } = require('../src/lib/ecommerce-agent');

async function runTests() {
  console.log('====================================');
  console.log('🧪 TESTING V15.0 OPEN-WORLD STRUCTURED OUTPUTS');
  console.log('====================================\n');

  // TEST 1: User says "Menga qo'lqop kerak"
  console.log('--- TEST 1: "Menga qo\'lqop kerak" ---');
  const res1 = await runEcommerceAgentPipeline("Menga qo'lqop kerak", [], { turn_count: 1 });
  console.log('Status:', res1.status);
  console.log('UI Mode:', res1.ui_mode);
  console.log('Category:', res1.category);
  console.log('Is Electronic:', res1.is_electronic);
  console.log('Message / AI Reply:', res1.ai_reply);
  console.log('Dynamic Chips:', res1.dynamic_chips);
  console.log('Extracted Data:', res1.extracted_data);

  if (res1.status !== 'NEED_CLARIFICATION') {
    throw new Error('Test 1 failed: status should be NEED_CLARIFICATION');
  }
  if (res1.is_electronic === true) {
    throw new Error('Test 1 failed: gloves must NOT be electronic');
  }
  if (!res1.dynamic_chips || res1.dynamic_chips.length === 0) {
    throw new Error('Test 1 failed: dynamic_chips should not be empty');
  }
  console.log('✅ TEST 1 PASSED!\n');

  // TEST 2: Turn 2: User clicks "📍 Xorazm"
  console.log('--- TEST 2: Turn 2 - "📍 Xorazm" ---');
  const history1 = [
    { role: 'user', content: "Menga qo'lqop kerak" },
    { role: 'model', content: res1.ai_reply }
  ];
  const res2 = await runEcommerceAgentPipeline("📍 Xorazm", history1, { turn_count: 2 });
  console.log('Status:', res2.status);
  console.log('Location:', res2.extracted_data?.location);
  console.log('Is Electronic:', res2.is_electronic);
  console.log('Message / AI Reply:', res2.ai_reply);
  console.log('Dynamic Chips:', res2.dynamic_chips);

  if (res2.is_electronic === true) {
    throw new Error('Test 2 failed: gloves must NOT be electronic');
  }
  console.log('✅ TEST 2 PASSED!\n');

  // TEST 3: Electronics test
  console.log('--- TEST 3: "12 lik konditsioner Toshkent" ---');
  const res3 = await runEcommerceAgentPipeline("12 lik konditsioner Toshkent", [], { turn_count: 1 });
  console.log('Status:', res3.status);
  console.log('Category:', res3.category);
  console.log('Is Electronic:', res3.is_electronic);
  console.log('Message / AI Reply:', res3.ai_reply);
  console.log('Dynamic Chips:', res3.dynamic_chips);

  if (res3.is_electronic !== true) {
    throw new Error('Test 3 failed: air conditioner MUST be electronic (is_electronic: true)');
  }
  console.log('✅ TEST 3 PASSED!\n');

  console.log('🎉 ALL V15.0 TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
