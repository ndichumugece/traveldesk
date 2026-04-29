/**
 * Utility to download data as a CSV file.
 * Handles escaping and basic header generation.
 */
export const downloadCSV = (data: any[], filename: string) => {
    if (!data || !data.length) return;

    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    const csvRows = [];
    
    // Add headers row
    csvRows.push(headers.join(','));
    
    // Add data rows
    for (const row of data) {
        const values = headers.map(header => {
            const val = row[header];
            const escaped = String(val).replace(/"/g, '""'); // Escape double quotes
            return `"${escaped}"`; // Wrap in quotes to handle commas
        });
        csvRows.push(values.join(','));
    }
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
