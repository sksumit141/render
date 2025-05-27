document.getElementById('scrnBTN').addEventListener('click', async () => {
    try {
        const imagePath = './images/screenshot.png';
        
        // Check if file exists
        const response = await fetch(imagePath);
        if (!response.ok) {
            throw new Error('Image not found');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'screenshot.png';
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    } catch (error) {
        console.error('Download failed:', error);
        alert('Failed to download the image. Please ensure the image exists in the images folder.');
    }
});
