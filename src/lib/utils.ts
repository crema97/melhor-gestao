/**
 * Função para formatar data corretamente considerando fuso horário
 * @param dataString - String da data no formato 'YYYY-MM-DD'
 * @returns String formatada da data no formato brasileiro
 */
export function formatarData(dataString: string): string {
  if (!dataString) return ''
  
  // Criar data considerando o fuso horário local
  const [ano, mes, dia] = dataString.split('-').map(Number)
  const data = new Date(ano, mes - 1, dia) // mes - 1 porque JavaScript usa 0-11 para meses
  return data.toLocaleDateString('pt-BR')
}

/**
 * Função para formatar data e hora corretamente considerando fuso horário
 * @param dataString - String da data no formato 'YYYY-MM-DD' ou 'YYYY-MM-DDTHH:mm:ss'
 * @returns String formatada da data e hora no formato brasileiro
 */
export function formatarDataHora(dataString: string): string {
  if (!dataString) return ''
  
  // Se já tem hora, usar como está
  if (dataString.includes('T')) {
    const data = new Date(dataString)
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }
  
  // Se só tem data, adicionar hora 00:00
  const [ano, mes, dia] = dataString.split('-').map(Number)
  const data = new Date(ano, mes - 1, dia)
  return data.toLocaleDateString('pt-BR')
} 