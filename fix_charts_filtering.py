#!/usr/bin/env python3
import os
import re

def fix_charts_filtering():
    """Corrige os gráficos para usar filteredReceitas em vez de receitas"""
    
    # Lista de arquivos de receitas
    files_to_fix = [
        'src/app/dashboard/barbearia/receitas/page.tsx',
        'src/app/dashboard/estetica/receitas/page.tsx',
        'src/app/dashboard/lavarapido/receitas/page.tsx',
        'src/app/dashboard/salao-beleza/receitas/page.tsx'
    ]
    
    for file_path in files_to_fix:
        if not os.path.exists(file_path):
            print(f"Arquivo não encontrado: {file_path}")
            continue
            
        print(f"Corrigindo gráficos em: {file_path}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 1. Corrigir loadChartData para usar filteredReceitas
        content = re.sub(
            r'if \(receitas\.length === 0\)',
            'if (filteredReceitas.length === 0)',
            content
        )
        
        content = re.sub(
            r'const monthReceitas = receitas\.filter\(r => r\.data_receita\.startsWith\(monthKey\)\)',
            'const monthReceitas = filteredReceitas.filter(r => r.data_receita.startsWith(monthKey))',
            content
        )
        
        content = re.sub(
            r'const dayReceitas = receitas\.filter\(r => r\.data_receita === dateKey\)',
            'const dayReceitas = filteredReceitas.filter(r => r.data_receita === dateKey)',
            content
        )
        
        # 2. Corrigir useEffect para usar filteredReceitas
        content = re.sub(
            r'useEffect\(\(\) => \{\s*if \(receitas\.length > 0\) \{\s*loadChartData\(\)\s*\}\s*\}, \[receitas\]\)',
            'useEffect(() => {\n    if (filteredReceitas.length > 0) {\n      loadChartData()\n    }\n  }, [filteredReceitas])',
            content,
            flags=re.DOTALL
        )
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Corrigido: {file_path}")

if __name__ == "__main__":
    fix_charts_filtering()
    print("🎉 Todos os gráficos foram corrigidos para usar filtros!")
