document.getElementById('scrnBTN').addEventListener('click', async () => {
    try {
        const response = await fetch('http://localhost:3000/screenshot', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'image/png'
            },
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'screenshot.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Screenshot failed:', error);
        alert('Screenshot failed. Make sure the backend server is running.');
    }
});
