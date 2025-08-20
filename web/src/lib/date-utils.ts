/**
 * Utilitários para formatação de datas
 */

/**
 * Formata uma data para o padrão brasileiro (DD-MM-AAAA)
 * @param dateStr - String da data em formato ISO (YYYY-MM-DD) ou qualquer formato válido
 * @returns String formatada no padrão brasileiro (DD-MM-AAAA)
 */
export function formatDateToBrazilian(dateStr?: string): string {
  if (!dateStr) return ""
  
  try {
    // Se a data está no formato ISO (YYYY-MM-DD)
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split('-')
      return `${day}-${month}-${year}`
    }
    
    // Se for uma data completa ISO, extrair apenas a parte da data
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) {
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      return `${day}-${month}-${year}`
    }
    
    return dateStr
  } catch {
    return dateStr || ""
  }
}

/**
 * Formata uma data para o padrão brasileiro com barras (DD/MM/AAAA)
 * @param dateStr - String da data em formato ISO (YYYY-MM-DD) ou qualquer formato válido
 * @returns String formatada no padrão brasileiro com barras (DD/MM/AAAA)
 */
export function formatDateToBrazilianWithSlashes(dateStr?: string): string {
  if (!dateStr) return ""
  
  try {
    // Se a data está no formato ISO (YYYY-MM-DD)
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split('-')
      return `${day}/${month}/${year}`
    }
    
    // Se for uma data completa ISO, extrair apenas a parte da data
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) {
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    }
    
    return dateStr
  } catch {
    return dateStr || ""
  }
}
