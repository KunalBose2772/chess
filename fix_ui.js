const fs = require('fs');

const fixFile = (path) => {
  let content = fs.readFileSync(path, 'utf-8');

  // Replace styles to match home page
  content = content.replace(/bg-transparent/g, 'bg-salon');
  content = content.replace(/text-white/g, 'text-[var(--text-primary)]');
  content = content.replace(/text-slate-500/g, 'text-[var(--text-muted)]');
  content = content.replace(/text-slate-200/g, 'text-[var(--text-primary)]');
  content = content.replace(/text-slate-300/g, 'text-[var(--text-primary)]');
  content = content.replace(/text-slate-400/g, 'text-[var(--text-muted)]');
  content = content.replace(/text-slate-600/g, 'text-[var(--text-primary)]');
  content = content.replace(/bg-white\/\[0\.02\]/g, 'bg-[var(--bg-surface)]');
  content = content.replace(/bg-white\/\[0\.03\]/g, 'bg-[var(--bg-surface)]');
  content = content.replace(/bg-white\/\[0\.04\]/g, 'bg-[var(--bg-surface)]');
  content = content.replace(/bg-white\/\[0\.05\]/g, 'bg-[var(--bg-secondary)]');
  content = content.replace(/bg-white\/\[0\.06\]/g, 'bg-[var(--bg-secondary)]');
  
  content = content.replace(/border-white\/\[0\.05\]/g, 'border-[var(--border-primary)] shadow-[4px_4px_0px_var(--text-primary)] border-2');
  content = content.replace(/border-white\/\[0\.06\]/g, 'border-[var(--border-primary)] shadow-[4px_4px_0px_var(--text-primary)] border-2');
  content = content.replace(/border-white\/\[0\.1\]/g, 'border-[var(--border-primary)]');
  
  content = content.replace(/shadow-lg/g, 'shadow-[4px_4px_0px_var(--text-primary)]');
  content = content.replace(/shadow-xl/g, 'shadow-[6px_6px_0px_var(--text-primary)]');
  content = content.replace(/shadow-2xl/g, 'shadow-[6px_6px_0px_var(--text-primary)]');
  content = content.replace(/rounded-3xl/g, 'rounded-[var(--radius-sm)]');
  content = content.replace(/rounded-2xl/g, 'rounded-[var(--radius-sm)]');
  content = content.replace(/rounded-xl/g, 'rounded-[var(--radius-sm)]');

  // Fix specific blocks for puzzles
  content = content.replace(/text-cyan-400 bg-cyan-400\/8 border border-cyan-400\/20 px-3 py-1 rounded-full self-start flex items-center gap-1\.5/g, 'section-label');
  content = content.replace(/<Zap className="w-3 h-3 fill-current" \/> Training Mode/g, '<Zap className="w-3 h-3 fill-current mr-1.5" /> Training Mode');

  // Fix dark mode gradients
  content = content.replace(/bg-gradient-to-b from-\[#18181b\] to-\[#111113\]/g, 'bg-[var(--bg-elevated)] border-2 border-[var(--text-primary)]');
  content = content.replace(/bg-gradient-to-tr from-\[#3b82f6\]\/20 to-\[#60a5fa\]\/20 border border-\[#3b82f6\]\/30/g, 'bg-[var(--primary)] text-white border-2 border-[var(--text-primary)]');
  
  // Fix button styles
  content = content.replace(/bg-blue-600 text-\[var\(--text-primary\)\] shadow-\[4px_4px_0px_var\(--text-primary\)\] shadow-blue-900\/30/g, 'btn-primary text-white');
  content = content.replace(/bg-emerald-600 text-\[var\(--text-primary\)\] shadow-\[4px_4px_0px_var\(--text-primary\)\] shadow-emerald-900\/30/g, 'btn-primary text-white');
  content = content.replace(/bg-white\/5 text-\[var\(--text-muted\)\] hover:bg-white\/10 hover:text-\[var\(--text-primary\)\]/g, 'btn-secondary text-[var(--text-primary)]');

  fs.writeFileSync(path, content);
  console.log('Fixed ' + path);
}

fixFile('src/app/puzzles/page.tsx');
if (fs.existsSync('src/app/learn/page.tsx')) fixFile('src/app/learn/page.tsx');
if (fs.existsSync('src/app/play/history/page.tsx')) fixFile('src/app/play/history/page.tsx');
