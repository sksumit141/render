document.getElementById('scrnBTN').addEventListener('click', async () => {
    try {
        // Direct download of the static image
        const a = document.createElement('a');
        a.href = 'pinterest-infographic.png';  // Path to your static image
        a.download = 'pinterest-marketing-infographic.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (error) {
        console.error('Download failed:', error);
        alert('Failed to download the image.');
    }
});
