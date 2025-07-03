const fs = require('fs');

// Função para substituir texto em um arquivo
function replaceInFile(filePath, oldText, newText) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(oldText)) {
      content = content.replace(oldText, newText);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    } else {
      console.log(`⚠️  Not found in: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

// Lista de arquivos para atualizar
const files = [
  'src/app/dashboard/salao-beleza/receitas/page.tsx',
  'src/app/dashboard/lavarapido/receitas/page.tsx',
  'src/app/dashboard/estetica/receitas/page.tsx',
  'src/app/dashboard/estacionamento/receitas/page.tsx',
  'src/app/dashboard/salao-beleza/despesas/page.tsx',
  'src/app/dashboard/lavarapido/despesas/page.tsx',
  'src/app/dashboard/estetica/despesas/page.tsx',
  'src/app/dashboard/estacionamento/despesas/page.tsx'
];

// Substituições para fazer
const replacements = [
  // Grid layout - minmax(400px, 1fr) -> minmax(300px, 1fr)
  {
    old: "gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'",
    new: "gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'"
  },
  // Gap - 24px -> 20px
  {
    old: "gap: '24px'",
    new: "gap: '20px'"
  }
];

console.log('🔧 Starting grid layout adjustments...\n');

let totalUpdated = 0;

files.forEach(filePath => {
  console.log(`\n📁 Processing: ${filePath}`);
  let fileUpdated = false;
  
  replacements.forEach(replacement => {
    if (replaceInFile(filePath, replacement.old, replacement.new)) {
      fileUpdated = true;
    }
  });
  
  if (fileUpdated) {
    totalUpdated++;
  }
});

console.log(`\n✅ Completed! Updated ${totalUpdated} files.`); 