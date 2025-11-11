import * as XLSX from 'xlsx';

export function useExcelExport() {
  const exportToExcel = (data: any[], filename: string, sheetName: string = 'Dados') => {
    try {
      // Criar workbook
      const wb = XLSX.utils.book_new();
      
      // Converter dados para worksheet
      const ws = XLSX.utils.json_to_sheet(data);
      
      // Ajustar largura das colunas automaticamente
      const cols = Object.keys(data[0] || {}).map(key => {
        const maxLength = Math.max(
          key.length,
          ...data.map(row => String(row[key] || '').length)
        );
        return { wch: Math.min(maxLength + 2, 50) }; // Max 50 caracteres
      });
      ws['!cols'] = cols;
      
      // Adicionar worksheet ao workbook
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      
      // Gerar arquivo e fazer download
      XLSX.writeFile(wb, `${filename}.xlsx`);
      
      return true;
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error);
      return false;
    }
  };
  
  const exportMultipleSheets = (sheets: { name: string; data: any[] }[], filename: string) => {
    try {
      const wb = XLSX.utils.book_new();
      
      sheets.forEach(({ name, data }) => {
        const ws = XLSX.utils.json_to_sheet(data);
        
        // Ajustar largura das colunas
        if (data.length > 0) {
          const cols = Object.keys(data[0]).map(key => {
            const maxLength = Math.max(
              key.length,
              ...data.map(row => String(row[key] || '').length)
            );
            return { wch: Math.min(maxLength + 2, 50) };
          });
          ws['!cols'] = cols;
        }
        
        XLSX.utils.book_append_sheet(wb, ws, name.substring(0, 31)); // Excel limita nomes a 31 chars
      });
      
      XLSX.writeFile(wb, `${filename}.xlsx`);
      return true;
    } catch (error) {
      console.error('Erro ao exportar múltiplas planilhas:', error);
      return false;
    }
  };
  
  return { exportToExcel, exportMultipleSheets };
}
