import os

def fix_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replacements
    replacements = [
        ('bg-transparent', 'bg-salon'),
        ('text-white', 'text-[var(--text-primary)]'),
        ('text-slate-500', 'text-[var(--text-muted)]'),
        ('text-slate-200', 'text-[var(--text-primary)]'),
        ('text-slate-300', 'text-[var(--text-primary)]'),
        ('text-slate-400', 'text-[var(--text-muted)]'),
        ('text-slate-600', 'text-[var(--text-primary)]'),
        ('bg-white/[0.02]', 'bg-[var(--bg-surface)]'),
        ('bg-white/[0.03]', 'bg-[var(--bg-surface)]'),
        ('bg-white/[0.04]', 'bg-[var(--bg-surface)]'),
        ('bg-white/[0.05]', 'bg-[var(--bg-secondary)]'),
        ('bg-white/[0.06]', 'bg-[var(--bg-secondary)]'),
        ('border-white/[0.05]', 'border-2 border-[var(--text-primary)] shadow-[4px_4px_0px_var(--text-primary)]'),
        ('border-white/[0.06]', 'border-2 border-[var(--text-primary)] shadow-[4px_4px_0px_var(--text-primary)]'),
        ('border-white/[0.1]', 'border-[var(--text-primary)]'),
        ('shadow-lg', 'shadow-[4px_4px_0px_var(--text-primary)]'),
        ('shadow-xl', 'shadow-[6px_6px_0px_var(--text-primary)]'),
        ('shadow-2xl', 'shadow-[6px_6px_0px_var(--text-primary)]'),
        ('rounded-3xl', 'rounded-[var(--radius-sm)]'),
        ('rounded-2xl', 'rounded-[var(--radius-sm)]'),
        ('rounded-xl', 'rounded-[var(--radius-sm)]'),
        ('text-cyan-400 bg-cyan-400/8 border border-cyan-400/20 px-3 py-1 rounded-full self-start flex items-center gap-1.5', 'section-label'),
        ('<Zap className="w-3 h-3 fill-current" /> Training Mode', '<Zap className="w-3 h-3 fill-current mr-1.5" /> Training Mode'),
        ('bg-gradient-to-b from-[#18181b] to-[#111113]', 'bg-[var(--bg-elevated)] border-2 border-[var(--text-primary)]'),
        ('bg-gradient-to-tr from-[#3b82f6]/20 to-[#60a5fa]/20 border border-[#3b82f6]/30', 'bg-[var(--primary)] text-white border-2 border-[var(--text-primary)]'),
        ('bg-blue-600 text-[var(--text-primary)] shadow-[4px_4px_0px_var(--text-primary)] shadow-blue-900/30', 'btn-primary text-white'),
        ('bg-emerald-600 text-[var(--text-primary)] shadow-[4px_4px_0px_var(--text-primary)] shadow-emerald-900/30', 'btn-primary text-white'),
        ('bg-white/5 text-[var(--text-muted)] hover:bg-white/10 hover:text-[var(--text-primary)]', 'btn-secondary text-[var(--text-primary)]')
    ]

    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Fixed {path}")

fix_file('src/app/puzzles/page.tsx')
fix_file('src/app/learn/page.tsx')
fix_file('src/app/play/history/page.tsx')
