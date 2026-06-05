const fs = require('fs');
const html = fs.readFileSync('public/crm.html', 'utf8');
const re = /<script>([\s\S]*?)<\/script>/g;
let m, combined = '';
while ((m = re.exec(html)) !== null) combined += m[1] + '\n';
try {
  new Function(combined);
  console.log('✅ JS syntax OK');
} catch (e) {
  console.error('❌ JS ERROR:', e.message);
  const lines = combined.split('\n');
  const match = e.message.match(/line (\d+)/i);
  if (match) {
    const ln = parseInt(match[1]);
    for (let i = Math.max(0, ln-3); i < Math.min(lines.length, ln+3); i++) {
      console.log(`${i+1}: ${lines[i]}`);
    }
  }
}
