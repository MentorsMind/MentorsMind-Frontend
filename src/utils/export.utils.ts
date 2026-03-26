export const exportToCSV = (
  filename: string,
  headers: string[],
  data: any[][],
  includeTimestamp = true
): void => {
  const timestamp = includeTimestamp ? `_${new Date().toISOString().split('T')[0]}` : '';
  const rows = [headers, ...data];
  const csvContent = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'XLM' ? 'USD' : currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

