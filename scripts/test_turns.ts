import { runEcommerceAgentPipeline } from '../src/lib/ecommerce-agent';

async function testTurns() {
  console.log('--- TEST TURN 1 ---');
  const res1 = await runEcommerceAgentPipeline('Menga qo\'lqop kerak', [], { turn_count: 1 });
  console.log('Turn 1 Status:', res1.status);
  console.log('Turn 1 Message:', res1.message);
  console.log('Turn 1 Chips:', JSON.stringify(res1.dynamic_chips));
  console.log('Turn 1 isElectronic:', res1.is_electronic);

  console.log('\n--- TEST TURN 2 ---');
  const history1 = [
    { role: 'user', content: 'Menga qo\'lqop kerak' },
    { role: 'assistant', content: res1.message }
  ];
  const res2 = await runEcommerceAgentPipeline('📍 Toshkent shahri', history1, { turn_count: 2 });
  console.log('Turn 2 Status:', res2.status);
  console.log('Turn 2 Message:', res2.message);
  console.log('Turn 2 Chips:', JSON.stringify(res2.dynamic_chips));
  console.log('Turn 2 Extracted:', JSON.stringify(res2.extracted_data));
  console.log('Turn 2 isElectronic:', res2.is_electronic);

  console.log('\n--- TEST TURN 3 (READY TO SEARCH) ---');
  const history2 = [
    ...history1,
    { role: 'user', content: '📍 Toshkent shahri' },
    { role: 'assistant', content: res2.message }
  ];
  const res3 = await runEcommerceAgentPipeline('🧤 Qalin Charm', history2, { turn_count: 3 });
  console.log('Turn 3 Status:', res3.status);
  console.log('Turn 3 Message:', res3.message);
  console.log('Turn 3 Products count:', res3.products ? res3.products.length : 0);
  if (res3.products && res3.products.length > 0) {
    console.log('First Product:', res3.products[0].title, '| Price:', res3.products[0].price);
  }
}

testTurns().catch(err => {
  console.error('Test error:', err);
});
