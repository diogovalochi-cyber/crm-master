const fs = require('fs');
const html = fs.readFileSync('public/crm.html', 'utf8');
// Extract all <script> blocks
const scripts = [];
const re = /<script>([\s\S]*?)<\/script>/g;
let m;
while ((m = re.exec(html)) !== null) scripts.push(m[1]);
if (!scripts.length) { console.log('No script block found'); process.exit(1); }
const combined = scripts.join('\n');
try {
  new Function(combined);
  console.log('✅ JS syntax OK - no errors found');
} catch (e) {
  console.error('❌ JS SYNTAX ERROR:', e.message);
  // Find approx line
  const lines = combined.split('\n');
  const match = e.message.match(/line (\d+)/i);
  if (match) {
    const ln = parseInt(match[1]);
    console.log('--- Context around error ---');
    for (let i = Math.max(0, ln-3); i < Math.min(lines.length, ln+3); i++) {
      console.log(`${i+1}: ${lines[i]}`);
    }
  }
}
