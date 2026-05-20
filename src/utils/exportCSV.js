/**
 * Exporta un array de objetos como archivo CSV.
 * @param {Array<Object>} data - Array de objetos a exportar
 * @param {string} filename - Nombre del archivo sin extensión
 * @param {Array<{ key: string, label: string }>} columns - Columnas a incluir
 */
export function exportToCSV(data, filename, columns) {
  if (!data || data.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const header = columns.map(c => `"${c.label}"`).join(',');

  const rows = data.map(row =>
    columns.map(c => {
      const value = row[c.key];
      if (value === null || value === undefined) return '""';
      const str = String(value).replace(/"/g, '""');
      return `"${str}"`;
    }).join(',')
  );

  const csv = [header, ...rows].join('\n');
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}
