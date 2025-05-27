document.getElementById('scrnBTN').addEventListener('click', async () => {
    try {
        const response = await axios({
            method: 'post',
            url: 'https://render-vkhy.onrender.com/screenshot',
            responseType: 'blob',
            withCredentials: true,
            headers: {
                'Accept': 'image/png'
            }
        });

        const url = URL.createObjectURL(response.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `screenshot_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Screenshot failed:', error);
        alert('Screenshot failed: ' + (error.response?.data || error.message));
    }
});
