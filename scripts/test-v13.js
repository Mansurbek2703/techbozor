const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8');
    env.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const k = parts[0].trim();
        const v = parts.slice(1).join('=').trim();
        if (k && !process.env[k]) process.env[k] = v;
      }
    });
  }
} catch (e) {}

async function runTest() {
  console.log("==================================================");
  console.log("🧪 V13.0 KOGNITIV XOTIRA VA DINAMIK KONTEKST TESTI");
  console.log("==================================================");

  const { runEcommerceAgentPipeline } = require('../src/lib/ecommerce-agent.ts');

  // TEST 1: Qarama-qarshi Toifa Testi (Turn 1: Noutbuk)
  console.log("\n--- TEST 1: 'Men kuchli noutbuk olmoqchiman' (Turn 1) ---");
  const res1 = await runEcommerceAgentPipeline("Men kuchli noutbuk olmoqchiman", [], {
    turn_count: 1,
    region: "Toshkent"
  });

  console.log("Status:", res1.status);
  console.log("Type:", res1.type);
  console.log("UI Mode:", res1.ui_mode);
  console.log("Category Key:", res1.category_key);
  console.log("AI Reply:", res1.ai_reply);
  console.log("Smart Chips:", JSON.stringify(res1.smartChips, null, 2));

  const text1 = JSON.stringify(res1).toLowerCase();
  const hasKond1 = text1.includes('kondits') || text1.includes('inverter') || text1.includes('xona maydon');
  if (hasKond1) {
    console.error("❌ XATOLIK: Turn 1 da konditsioner/inverter haqida gapirildi!");
    process.exit(1);
  } else {
    console.log("✅ QARAMA-QARSHI TOIFA TESTI MUVAFFAQIShIYATLI: Konditsioner aralashmadi!");
  }

  // TEST 2: Davomiylik Testi (Turn 2: "O'yinlar uchun")
  console.log("\n--- TEST 2: Davomiylik Testi: 'O\'yinlar uchun' (Turn 2) ---");
  const history = [
    { role: 'user', content: "Men kuchli noutbuk olmoqchiman" },
    { role: 'model', content: res1.ai_reply }
  ];

  const res2 = await runEcommerceAgentPipeline("O'yinlar uchun", history, {
    turn_count: 2,
    region: "Toshkent"
  });

  console.log("Status:", res2.status);
  console.log("Type:", res2.type);
  console.log("Category Key:", res2.category_key);
  console.log("AI Reply:", res2.ai_reply);
  console.log("Smart Chips:", JSON.stringify(res2.smartChips, null, 2));

  const text2 = JSON.stringify(res2).toLowerCase();
  const hasKond2 = text2.includes('kondits') || text2.includes('xona maydon');
  if (hasKond2) {
    console.error("❌ XATOLIK: Turn 2 da konditsioner haqida gapirildi!");
    process.exit(1);
  }

  const isLaptopGaming = text2.includes('rtx') || text2.includes('videokarta') || text2.includes('fps') || text2.includes('gaming') || text2.includes('o\'yin') || text2.includes('grafik');
  if (!isLaptopGaming) {
    console.error("❌ XATOLIK: Turn 2 da noutbuk o'yin konteksti unutilgan!");
    process.exit(1);
  }
  console.log("✅ DAVOMIYLIK TESTI MUVAFFAQIShIYATLI: Noutbuk konteksti 100% saqlandi!");

  // TEST 3: Telefon Testi
  console.log("\n--- TEST 3: 'men telefon olmoqchiman' (Turn 1) ---");
  const res3 = await runEcommerceAgentPipeline("men telefon olmoqchiman", [], {
    turn_count: 1,
    region: "Toshkent"
  });
  console.log("Category Key:", res3.category_key);
  console.log("AI Reply:", res3.ai_reply);
  console.log("Smart Chips:", JSON.stringify(res3.smartChips, null, 2));

  const text3 = JSON.stringify(res3).toLowerCase();
  if (text3.includes('kondits') || text3.includes('inverter') || text3.includes('xona')) {
    console.error("❌ XATOLIK: Telefonda konditsioner/inverter aralashdi!");
    process.exit(1);
  }
  console.log("✅ TELEFON TESTI MUVAFFAQIShIYATLI: Telefon konteksti to'g'ri!");

  console.log("\n🎉 BARCHA V13.0 TESTLARI 100% MUVAFFAQIShIYATLI O'TDI!");
}

runTest().catch(err => {
  console.error("Test xatosi:", err);
  process.exit(1);
});
