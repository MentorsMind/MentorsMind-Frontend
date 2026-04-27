// CSV export utilities for admin analytics

export const exportAnalyticsCSV = async (
  endpoint: string,
  period: string,
  filename: string
): Promise<void> => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL || ''}${endpoint}?format=csv&period=${period}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (response.status === 503) {
      throw new Error('Analytics data is being prepared. Please try again in a few minutes.');
    }

    if (!response.ok) {
      throw new Error('Failed to export CSV');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    // Get filename from Content-Disposition header
    const contentDisposition = response.headers.get('content-disposition');
    let downloadFilename = filename;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        downloadFilename = filenameMatch[1];
      }
    }

    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    throw error;
  }
};