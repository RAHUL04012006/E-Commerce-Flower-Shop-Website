document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const flowerItems = document.querySelectorAll('.flower-item');
    const bouquetArea = document.getElementById('bouquet-area');
    const totalPriceElement = document.getElementById('total-price');
    const checkoutBtn = document.getElementById('checkout-btn');
    const resetBtn = document.getElementById('reset-btn');
    const saveBtn = document.getElementById('save-btn');
    const canvasMessage = document.querySelector('.canvas-message');
    const congratsMessage = document.getElementById('congratulations-message');
    const sparkleContainer = document.getElementById('sparkle-container');
    
    // Variables
    let bouquetTotal = 0;
    let draggedItem = null;
    let draggedItemClone = null;
    let roses = [];
    let roseCounter = {};
    let congratsShown = false;
    
    // Initialize rose counter
    flowerItems.forEach(item => {
        const color = item.getAttribute('data-color');
        roseCounter[color] = parseInt(item.querySelector('.quantity span').textContent);
    });
    
    // Drag and Drop functionality
    flowerItems.forEach(item => {
        item.addEventListener('dragstart', dragStart);
        item.addEventListener('dragend', dragEnd);
    });
    
    bouquetArea.addEventListener('dragover', dragOver);
    bouquetArea.addEventListener('dragenter', dragEnter);
    bouquetArea.addEventListener('dragleave', dragLeave);
    bouquetArea.addEventListener('drop', drop);
    
    // Drag Functions
    function dragStart() {
        draggedItem = this;
        setTimeout(() => {
            this.style.opacity = '0.5';
        }, 0);
    }
    
    function dragEnd() {
        this.style.opacity = '1';
        draggedItem = null;
    }
    
    function dragOver(e) {
        e.preventDefault();
    }
    
    function dragEnter(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    }
    
    function dragLeave() {
        this.classList.remove('drag-over');
    }
    
    function drop(e) {
        this.classList.remove('drag-over');
        
        if (draggedItem) {
            const color = draggedItem.getAttribute('data-color');
            const price = parseFloat(draggedItem.getAttribute('data-price'));
            
            // Check if rose is available
            if (roseCounter[color] > 0) {
                // Create a clone of the rose for the bouquet
                createRoseInBouquet(color);
                
                // Update quantity
                roseCounter[color]--;
                const quantityElement = draggedItem.querySelector('.quantity span');
                quantityElement.textContent = roseCounter[color];
                
                // Update total price
                bouquetTotal += price;
                updateTotalPrice();
                
                // Hide canvas message if it's the first rose
                if (roses.length === 1) {
                    canvasMessage.style.display = 'none';
                }
                
                // Check if we should show congratulations message
                checkForCongratulations();
            }
        }
    }
    
    function createRoseInBouquet(color) {
        const rect = bouquetArea.getBoundingClientRect();
        const centerX = rect.width / 2;
        const baseY = rect.height - 170; // Moved base position higher up
        
        const rose = document.createElement('div');
        
        // Calculate bouquet cluster arrangement
        const total = roses.length;
        const maxInCircle = 7; // Maximum number of flowers in each row
        const layer = Math.floor(total / maxInCircle);
        const indexInLayer = total % maxInCircle;
        const spread = 70 + layer * 10; // Degrees total spread, wider for more layers
        const startAngle = -spread / 2;
        const angle = startAngle + (indexInLayer * (spread / Math.max(maxInCircle - 1, 1)));
        const radius = 45 + layer * 22; // Distance from base, more for outer layers
        const rad = angle * (Math.PI / 180);
        const x = centerX + Math.sin(rad) * radius - 45; // 45 = half rose width
        const y = baseY - Math.cos(rad) * radius - 40 + (layer * 15); // Position flowers higher
        
        // Add random rotation for natural look
        const randomRotation = (Math.random() * 20) - 10; // Random angle between -10 and 10 degrees

        // Determine if this is a first or second row flower based on layer
        // Use appropriate image (regular vs no-leaf version)
        const flowerImageUrl = layer === 0 ? `/static/images/${color}.png` : `/static/images/${color}2.png`;
        
        // Set z-index based on layer and position
        // We want flowers to be behind the base (z-index 2) but we still want 
        // first row flowers to overlap second row flowers
        const zIndex = 1; // Set all flowers to z-index 1 (below base at z-index 2)
        
        rose.className = 'dragged-rose';
        rose.style.left = `${x}px`;
        rose.style.top = `${y}px`;
        rose.style.transform = `rotate(${angle + randomRotation}deg)`;
        rose.style.zIndex = zIndex;
        rose.style.backgroundImage = `url('${flowerImageUrl}')`;
        rose.style.backgroundSize = 'contain';
        rose.style.backgroundRepeat = 'no-repeat';
        rose.style.backgroundPosition = 'center';

        bouquetArea.appendChild(rose);
        
        // Add removal event listener
        rose.addEventListener('click', () => removeRose(rose));
        
        roses.push({
            element: rose,
            color: color,
            price: parseFloat(draggedItem.getAttribute('data-price'))
        });
    }
    
    function removeRose(roseElement) {
        // Find the rose in the array
        const index = roses.findIndex(rose => rose.element === roseElement);
        
        if (index !== -1) {
            const removedRose = roses[index];
            
            // Update quantity
            roseCounter[removedRose.color]++;
            const flowerItem = Array.from(flowerItems).find(
                item => item.getAttribute('data-color') === removedRose.color
            );
            const quantityElement = flowerItem.querySelector('.quantity span');
            quantityElement.textContent = roseCounter[removedRose.color];
            
            // Update total price
            bouquetTotal -= removedRose.price;
            updateTotalPrice();
            
            // Remove from DOM with animation
            roseElement.style.transform = 'scale(0)';
            roseElement.style.opacity = '0';
            
            setTimeout(() => {
                roseElement.remove();
                // Remove from array
                roses.splice(index, 1);
                
                // Show canvas message if no roses left
                if (roses.length === 0) {
                    canvasMessage.style.display = 'flex';
                }
                
                // Check if we should hide congratulations message
                if (roses.length < 5 && congratsShown) {
                    hideCongratsMessage();
                }
            }, 300);
        }
    }
    
    function updateTotalPrice() {
        // Display the total price directly in rupees (no conversion needed)
        totalPriceElement.textContent = `₹${Math.round(bouquetTotal)}`;
        
        // Animate the total price
        totalPriceElement.classList.add('price-updated');
        setTimeout(() => {
            totalPriceElement.classList.remove('price-updated');
        }, 500);
    }
    
    // Reset button functionality
    resetBtn.addEventListener('click', resetBouquet);
    
    function resetBouquet() {
        // Remove all roses from bouquet
        roses.forEach(rose => {
            rose.element.remove();
            
            // Update quantity
            roseCounter[rose.color]++;
        });
        
        // Reset arrays and total
        roses = [];
        bouquetTotal = 0;
        updateTotalPrice();
        
        // Reset counter displays
        flowerItems.forEach(item => {
            const color = item.getAttribute('data-color');
            const quantityElement = item.querySelector('.quantity span');
            quantityElement.textContent = roseCounter[color];
        });
        
        // Show canvas message
        canvasMessage.style.display = 'flex';
        
        // Hide congratulations message
        hideCongratsMessage();
        
        // Clear any sparkles
        sparkleContainer.innerHTML = '';
    }
    
    // Checkout button functionality with Razorpay integration
    checkoutBtn.addEventListener('click', () => {
        if (roses.length > 0) {
            // Convert to Indian Rupees
            const inrAmount = Math.round(bouquetTotal * 80); // Approximate conversion rate
            
            // Integrate Razorpay
            const options = {
                key: "rzp_test_YourTestKeyHere", // Replace with your actual Razorpay key in production
                amount: inrAmount * 100, // Razorpay expects amount in paise (1 INR = 100 paise)
                currency: "INR",
                name: "Dreamy Blooms",
                description: "Payment for Your Beautiful Flower Bouquet",
                image: "https://i.imgur.com/3g7nmJC.png", // Your logo URL
                handler: function (response) {
                    alert(`Thank you for your payment! Payment ID: ${response.razorpay_payment_id}`);
                    // You can add further logic like clearing the cart or redirecting to order confirmation
                },
                prefill: {
                    name: "Rahul",
                    email: "kwalitytimekumar2006@gmail.com",
                    contact: "+91 9876543210"
                },
                notes: {
                    address: "No-5 Thangavel Nagar, Kolathur, Chennai-600099"
                },
                theme: {
                    color: "#9d7bb2"
                }
            };
            
            // Initialize Razorpay
            try {
                const rzp = new Razorpay(options);
                rzp.open();
            } catch (error) {
                console.error("Razorpay error:", error);
                alert(`Thank you for your order! Your beautiful bouquet costs ₹${inrAmount}. We'll contact you soon to complete your payment. ✨`);
            }
        } else {
            alert('Please add at least one rose to your bouquet before checking out.');
        }
    });
    
    // Save bouquet functionality
    saveBtn.addEventListener('click', () => {
        if (roses.length > 0) {
            saveBouquet();
        } else {
            alert('Please add at least one rose to your bouquet before saving.');
        }
    });
    
    function saveBouquet() {
        // Create a canvas element to render our bouquet
        const canvas = document.createElement('canvas');
        const bouquetRect = bouquetArea.getBoundingClientRect();
        canvas.width = bouquetRect.width;
        canvas.height = bouquetRect.height;
        const ctx = canvas.getContext('2d');
        
        // Fill canvas with white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw pretty border
        ctx.strokeStyle = '#f5e1e7';
        ctx.lineWidth = 10;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        
        // Draw bouquet title at the top
        ctx.font = '24px "Playfair Display", serif';
        ctx.fillStyle = '#9d7bb2';
        ctx.textAlign = 'center';
        ctx.fillText('My Dreamy Bouquet', canvas.width / 2, 50);
        
        // Draw price
        ctx.font = '18px "Poppins", sans-serif';
        ctx.fillStyle = '#9d7bb2';
        ctx.fillText(`Total: ₹${(bouquetTotal * 80).toFixed(0)}`, canvas.width / 2, canvas.height - 50);
        
        // Here we'd ideally draw the actual roses but we'll simulate it
        const imgData = canvas.toDataURL('image/png');
        
        // Create temporary link to download the image
        const link = document.createElement('a');
        link.download = 'my_dreamy_bouquet.png';
        link.href = imgData;
        link.click();
        
        // Success message
        setTimeout(() => {
            alert('Your beautiful bouquet has been saved! ❤️');
        }, 500);
    }
    
    // Check if we should show congratulations
    function checkForCongratulations() {
        if (roses.length >= 5 && !congratsShown) {
            showCongratsMessage();
            createSparkleEffect();
        }
    }
    
    function showCongratsMessage() {
        congratsMessage.classList.add('show');
        congratsShown = true;
        
        // Hide message after 5 seconds
        setTimeout(() => {
            if (roses.length >= 5) {
                congratsMessage.classList.remove('show');
            }
        }, 5000);
    }
    
    function hideCongratsMessage() {
        congratsMessage.classList.remove('show');
        congratsShown = false;
    }
    
    // Create sparkle effects
    function createSparkleEffect() {
        // Create multiple sparkles
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                createSparkle();
            }, i * 300); // stagger the creation
        }
    }
    
    function createSparkle() {
        const sparkle = document.createElement('div');
        sparkle.classList.add('sparkle');
        
        // Random position
        const randomX = Math.random() * bouquetArea.offsetWidth;
        const randomY = Math.random() * (bouquetArea.offsetHeight * 0.7); // Keep sparkles in top 70%
        
        sparkle.style.left = `${randomX}px`;
        sparkle.style.top = `${randomY}px`;
        
        // Random delay
        const randomDelay = Math.random() * 2;
        sparkle.style.animationDelay = `${randomDelay}s`;
        
        // Random size
        const randomSize = 10 + Math.random() * 10;
        sparkle.style.width = `${randomSize}px`;
        sparkle.style.height = `${randomSize}px`;
        
        // Add to container
        sparkleContainer.appendChild(sparkle);
        
        // Remove after animation
        setTimeout(() => {
            if (sparkle.parentNode === sparkleContainer) {
                sparkleContainer.removeChild(sparkle);
            }
        }, 2000 + randomDelay * 1000);
    }
});
