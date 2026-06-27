const fs = require('fs');
const path = require('path');

const filesToMigrate = [
  'frontend/src/pages/Auth.jsx',
  'frontend/src/pages/DevoteeDashboard.jsx',
  'frontend/src/pages/AdminDashboard.jsx',
];

const classMap = {
  'bg-\\[#0F172A\\]': 'bg-slate-50 dark:bg-[#0F172A]',
  'bg-\\[#090D1A\\]': 'bg-slate-50 dark:bg-[#090D1A]',
  'bg-\\[#1A1A2E\\]': 'bg-slate-50 dark:bg-[#1A1A2E]',
  'bg-slate-900': 'bg-white dark:bg-slate-900',
  'bg-slate-950': 'bg-white dark:bg-slate-950',
  'bg-slate-800': 'bg-white dark:bg-slate-800',
  'bg-slate-850': 'bg-white dark:bg-slate-850',
  'text-slate-100': 'text-slate-900 dark:text-slate-100',
  'text-slate-200': 'text-slate-800 dark:text-slate-200',
  'text-slate-300': 'text-slate-700 dark:text-slate-300',
  'text-slate-400': 'text-slate-600 dark:text-slate-400',
  'text-white': 'text-slate-900 dark:text-white',
  'border-slate-800': 'border-slate-200 dark:border-slate-800',
  'border-slate-900': 'border-slate-200 dark:border-slate-900',
  'border-white\\/10': 'border-slate-200 dark:border-white/10',
  'bg-white\\/5': 'bg-slate-100 dark:bg-white/5',
  'bg-white\\/10': 'bg-slate-200 dark:bg-white/10',
};

filesToMigrate.forEach(relPath => {
  const filePath = path.join(__dirname, relPath);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  // We need to carefully replace classes only inside className="..." or className={`...`}
  // A simple global regex replace for these exact utility classes will usually suffice in Tailwind JSX.
  
  for (const [darkClassRegex, replacement] of Object.entries(classMap)) {
    // Only replace if it's not already prefixed with dark:
    // and bounded by quotes, backticks, or spaces.
    const regex = new RegExp(`(?<!dark:)\\b${darkClassRegex}\\b`, 'g');
    content = content.replace(regex, replacement);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Migrated: ${relPath}`);
  } else {
    console.log(`No changes needed for: ${relPath}`);
  }
});

console.log('Migration complete!');
