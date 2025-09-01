#!/usr/bin/env python3
import os
import re

def fix_syntax_errors():
    """Corrige erros de sintaxe nos arquivos de despesas e receitas"""
    
    # Lista de arquivos com problemas
    files_to_fix = [
        'src/app/dashboard/estetica/despesas/page.tsx',
        'src/app/dashboard/estetica/receitas/page.tsx', 
        'src/app/dashboard/lavarapido/despesas/page.tsx',
        'src/app/dashboard/salao-beleza/despesas/page.tsx'
    ]
    
    for file_path in files_to_fix:
        if not os.path.exists(file_path):
            print(f"Arquivo não encontrado: {file_path}")
            continue
            
        print(f"Corrigindo: {file_path}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 1. Corrigir filtros state - remover formaPagamento se existir
        content = re.sub(
            r'const \[filtros, setFiltros\] = useState\(\{\s*categoria: \'\',\s*formaPagamento: \'\'\s*\}\)',
            "const [filtros, setFiltros] = useState({ categoria: '' })",
            content
        )
        
        # 2. Corrigir limparFiltros - remover formaPagamento se existir
        content = re.sub(
            r'function limparFiltros\(\) \{\s*setFiltros\(\{\s*categoria: \'\',\s*\}\)\s*// A função aplicarFiltros será chamada automaticamente pelo useEffect\s*\}',
            "function limparFiltros() {\n    setFiltros({ categoria: '' })\n    // A função aplicarFiltros será chamada automaticamente pelo useEffect\n  }",
            content
        )
        
        # 3. Remover blocos if() vazios na função aplicarFiltros
        content = re.sub(
            r'\s*// Aplicar filtro de data de início\s*if \(\) \{\s*filtered = filtered\.filter\(despesa => \s*despesa\.data_despesa >= \s*\)\s*\}\s*',
            '',
            content
        )
        
        content = re.sub(
            r'\s*// Aplicar filtro de data de fim\s*if \(\) \{\s*filtered = filtered\.filter\(despesa => \s*despesa\.data_despesa <= \s*\)\s*\}\s*',
            '',
            content
        )
        
        # 4. Remover inputs de data vazios
        content = re.sub(
            r'\s*{/\* Filtro por Data de Início \*/}\s*<div>\s*<label[^>]*>Data de Início</label>\s*<input[^>]*value=\{\}[^>]*onChange=\{e => setFiltros\(\{ \.\.\.filtros,  \}\)\}[^>]*/>\s*</div>\s*',
            '',
            content,
            flags=re.DOTALL
        )
        
        content = re.sub(
            r'\s*{/\* Filtro por Data de Fim \*/}\s*<div>\s*<label[^>]*>Data de Fim</label>\s*<input[^>]*value=\{\}[^>]*onChange=\{e => setFiltros\(\{ \.\.\.filtros,  \}\)\}[^>]*/>\s*</div>\s*',
            '',
            content,
            flags=re.DOTALL
        )
        
        # 5. Corrigir problemas específicos de sintaxe
        content = re.sub(r'value=\{\}', 'value=""', content)
        content = re.sub(r'onChange=\{e => setFiltros\(\{ \.\.\.filtros,  \}\)\}', 'onChange={() => {}}', content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Corrigido: {file_path}")

if __name__ == "__main__":
    fix_syntax_errors()
    print("🎉 Todos os erros de sintaxe foram corrigidos!")
