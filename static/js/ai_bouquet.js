document.addEventListener('DOMContentLoaded', () => {
    const flowerItems = document.querySelectorAll('.flower-item');
    const generateBtn = document.getElementById('generate-btn');
    const promptText = document.getElementById('prompt-text');
    const loading = document.getElementById('loading');
    const resultImage = document.getElementById('result-image');
    const saveAiBtn = document.getElementById('save-ai-btn');
    const buyNowContainer = document.getElementById('buy-now-container');
    const buyNowBtn = document.getElementById('buy-now-btn');
    
    // Initialize loading state
    loading.style.display = 'none';
    resultImage.style.display = 'none';
    saveAiBtn.style.display = 'none';
    buyNowContainer.style.display = 'none';
    
    const selectedFlowers = new Map();
    
    // Initialize flower counter
    flowerItems.forEach(item => {
        const color = item.getAttribute('data-color');
        selectedFlowers.set(color, 0);
        
        const increaseBtn = item.querySelector('.increase');
        const decreaseBtn = item.querySelector('.decrease');
        const quantitySpan = item.querySelector('.quantity');
        
        increaseBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default button behavior
            e.stopPropagation(); // Stop event bubbling
            
            const currentValue = selectedFlowers.get(color);
            if (currentValue < 10) { // Maximum 10 flowers per type
                const newValue = currentValue + 1;
                selectedFlowers.set(color, newValue);
                quantitySpan.textContent = newValue;
                
                // Add visual feedback
                increaseBtn.classList.add('clicked');
                setTimeout(() => increaseBtn.classList.remove('clicked'), 200);
                
                updatePrompt();
            }
        });
        
        decreaseBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default button behavior
            e.stopPropagation(); // Stop event bubbling
            
            const currentValue = selectedFlowers.get(color);
            if (currentValue > 0) {
                const newValue = currentValue - 1;
                selectedFlowers.set(color, newValue);
                quantitySpan.textContent = newValue;
                
                // Add visual feedback
                decreaseBtn.classList.add('clicked');
                setTimeout(() => decreaseBtn.classList.remove('clicked'), 200);
                
                updatePrompt();
            }
        });
    });
    
    function updatePrompt() {
        const flowerDisplayNames = {
            'red': 'red rose',
            'pink': 'pink rose',
            'white': 'white rose',
            'yellow': 'yellow rose',
            'sunflower': 'sunflower',
            'tulip': 'tulip',
            'lily': 'lily',
            'orchid': 'orchid',
            'daisy': 'daisy',
            'carnation': 'carnation'
        };

        // Get selected flowers with their quantities
        const selected = Array.from(selectedFlowers.entries())
            .filter(([_, count]) => count > 0);

        if (selected.length === 0) {
            promptText.textContent = '';
            generateBtn.disabled = true;
            return;
        }

        // Create a detailed description based on the selection
        let description = '';
        
        if (selected.length === 1) {
            // Single flower type
            const [color, count] = selected[0];
            const name = flowerDisplayNames[color] || color;
            description = `A bouquet of exactly ${count} ${name}${count > 1 ? 's' : ''} only`;
        } else {
            // Multiple flower types
            const flowerList = selected.map(([color, count]) => {
                const name = flowerDisplayNames[color] || color;
                return `${count} ${name}${count > 1 ? 's' : ''}`;
            });
            
            const lastItem = flowerList.pop();
            description = `A bouquet with exactly ${flowerList.length > 0 
                ? `${flowerList.join(', ')} and ${lastItem}` 
                : lastItem}`;
        }
        
        // Generate a random wrapper color
        const wrapperColors = [
            'white', 'ivory', 'cream', 'beige', 'light pink', 'blush pink', 'dusty rose',
            'baby blue', 'powder blue', 'mint green', 'sage green', 'lavender', 'lilac',
            'butter yellow', 'peach', 'coral', 'light gray', 'silver', 'gold', 'champagne'
        ];
        const randomColor = wrapperColors[Math.floor(Math.random() * wrapperColors.length)];
        
        // Add styling and quality instructions with random wrapper color
        promptText.textContent = `${description}, no other flowers, arranged professionally, 
            wrapped in ${randomColor} floral paper with matching ribbon, minimal filler, 
            photorealistic, high detail, 8k resolution, soft lighting, white background, 
            product photography`;
            
        generateBtn.disabled = false;
    }
    
    async function generateImage(retryCount = 0) {
        const maxRetries = 5;
        const retryDelay = 3000; // 3 seconds
        
        try {
            const response = await fetch('/generate_bouquet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: promptText.textContent,
                    flowers: Object.fromEntries(selectedFlowers)
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Set onload handler before setting src to ensure it catches the load event
                resultImage.onload = () => {
                    resultImage.style.display = 'block';
                    saveAiBtn.style.display = 'block';
                    buyNowContainer.style.display = 'block';
                    loading.style.display = 'none';
                    loading.innerHTML = '<i class="fas fa-spinner fa-spin"></i><p>Creating your magical bouquet...</p>';
                    
                    // Scroll to the buy now section
                    buyNowContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                };
                
                resultImage.onerror = () => {
                    alert('Failed to load the generated image. Please try again.');
                    loading.style.display = 'none';
                };
                
                // Add timestamp to prevent browser caching
                resultImage.src = `${data.image_url}?t=${Date.now()}`;
                return true;
            } else if (data.retry && retryCount < maxRetries) {
                loading.innerHTML = '<i class="fas fa-spinner fa-spin"></i><p>The AI is warming up...<br>Please wait a moment...</p>';
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                return await generateImage(retryCount + 1);
            } else {
                alert(data.error || 'Failed to generate bouquet. Please try again.');
                return false;
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
            return false;
        }
    }

    generateBtn.addEventListener('click', async () => {
        loading.style.display = 'block';
        resultImage.style.display = 'none';
        saveAiBtn.style.display = 'none';
        generateBtn.disabled = true;
        
        const success = await generateImage();
        
        if (!success) {
            loading.style.display = 'none';
        }
        generateBtn.disabled = false;
    });
    
    saveAiBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'ai_generated_bouquet.png';
        link.href = resultImage.src;
        link.click();
    });
    
    // Handle Buy Now button click
    buyNowBtn.addEventListener('click', () => {
        // Get the generated image URL
        const imageUrl = resultImage.src.split('?')[0]; // Remove any timestamp
        
        // Here you would typically redirect to a checkout page or show a modal
        // For now, we'll show an alert
        alert('Thank you for your purchase! Your custom bouquet will be prepared and delivered soon.');
        
        // In a real implementation, you might do something like:
        // window.location.href = `/checkout?image=${encodeURIComponent(imageUrl)}&price=2999`;
    });
});
