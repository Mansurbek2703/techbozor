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

async function runV14Test() {
  console.log("==================================================");
  console.log("🧪 V14.0 ZERO-HARDCODE & OPEN-WORLD COMMERCE TESTI");
  console.log("==================================================");

  // 1. UI TESTI: page.tsx ichida statik chiplar yo'qligini tekshirish
  console.log("\n--- TEST 0: UI ZERO-HARDCODE TEKSHIRUVI ---");
  const pageContent = fs.readFileSync(path.resolve(process.cwd(), 'src/app/page.tsx'), 'utf8');
  const forbiddenPatterns = [
    'Kuchli noutbuk',
    'Zamonaviy telefon',
    'Zamonaviy smartfon',
    'Chinni likopchalar',
    '12 lik Inverter konditsioner',
    'getLiveGuidedChips'
  ];

  let hasForbiddenUi = false;
  forbiddenPatterns.forEach(pattern => {
    if (pageContent.includes(pattern)) {
      console.error(`❌ XATOLIK: page.tsx ichida taqiqlangan statik matn topildi: "${pattern}"`);
      hasForbiddenUi = true;
    }
  });

  if (hasForbiddenUi) {
    process.exit(1);
  }
  console.log("✅ UI TESTI MUVAFFAQIShIYATLI: page.tsx da 0 ta statik chip qoldi!");

  const { runEcommerceAgentPipeline } = require('../src/lib/ecommerce-agent.ts');

  // TEST 1: "Menga qishki kurtka kerak" (Turn 1)
  console.log("\n--- TEST 1: 'Menga qishki kurtka kerak' (Turn 1) ---");
  const res1 = await runEcommerceAgentPipeline("Menga qishki kurtka kerak", [], {
    turn_count: 1,
    region: "Toshkent"
  });

  console.log("Type:", res1.type);
  console.log("Category Key:", res1.category_key);
  console.log("AI Reply:", res1.ai_reply);
  console.log("Smart Chips:", JSON.stringify(res1.smartChips, null, 2));

  const text1 = JSON.stringify(res1).toLowerCase();
  if (text1.includes('noutbuk') || text1.includes('kondits') || text1.includes('telefon') || text1.includes('chinni')) {
    console.error("❌ XATOLIK: Kurtka so'ralganda texnika/idish chiplari yoki so'zlari aralashdi!");
    process.exit(1);
  }
  console.log("✅ 1-BOSQICH MUVAFFAQIShIYATLI: Kurtkaga mos toza savol va chiplar!");

  // TEST 2: "Erkaklar kurtkasi" (Turn 2)
  console.log("\n--- TEST 2: 'Erkaklar kurtkasi' (Turn 2) ---");
  const history1 = [
    { role: 'user', content: "Menga qishki kurtka kerak" },
    { role: 'model', content: res1.ai_reply }
  ];

  const res2 = await runEcommerceAgentPipeline("Erkaklar kurtkasi", history1, {
    turn_count: 2,
    region: "Toshkent"
  });

  console.log("Type:", res2.type);
  console.log("Category Key:", res2.category_key);
  console.log("AI Reply:", res2.ai_reply);
  console.log("Smart Chips:", JSON.stringify(res2.smartChips, null, 2));

  const text2 = JSON.stringify(res2).toLowerCase();
  if (text2.includes('noutbuk') || text2.includes('kondits') || text2.includes('chinni')) {
    console.error("❌ XATOLIK: Erkaklar kurtkasida texnika aralashdi!");
    process.exit(1);
  }

  const hasJacketSpecs = text2.includes('charm') || text2.includes('sintepon') || text2.includes('material') || text2.includes('kurtka') || text2.includes('termo') || text2.includes('o\'lcham');
  if (!hasJacketSpecs) {
    console.error("❌ XATOLIK: Erkaklar kurtkasi material/uslub konteksti yo'q!");
    process.exit(1);
  }
  console.log("✅ 2-BOSQICH MUVAFFAQIShIYATLI: Erkaklar kurtkasi materiali/uslubi bo'yicha davom etdi!");

  // TEST 3: "Klassik paypoqlar"
  console.log("\n--- TEST 3: 'Klassik paypoqlar' ---");
  const res3 = await runEcommerceAgentPipeline("Klassik paypoqlar", [], {
    turn_count: 1,
    region: "Toshkent"
  });
  console.log("Category Key:", res3.category_key);
  console.log("AI Reply:", res3.ai_reply);
  console.log("Smart Chips:", JSON.stringify(res3.smartChips, null, 2));

  const text3 = JSON.stringify(res3).toLowerCase();
  if (text3.includes('noutbuk') || text3.includes('kondits') || text3.includes('telefon') || text3.includes('chinni')) {
    console.error("❌ XATOLIK: Paypoqda texnika/idish aralashdi!");
    process.exit(1);
  }
  console.log("✅ PAYPOQ TESTI MUVAFFAQIShIYATLI: Faqat paypoqqa oid chiplar!");

  console.log("\n🎉 BARCHA V14.0 TESTLARI 100% MUVAFFAQIShIYATLI O'TDI!");
}

runV14Test().catch(err => {
  console.error("Test xatosi:", err);
  process.exit(1);
});
