document.addEventListener('DOMContentLoaded', () => {
    // Animation for sections when they come into view
    const sections = document.querySelectorAll('.section');
    
    // Intersection Observer setup
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all sections
    sections.forEach(section => {
        observer.observe(section);
    });
    
    // Newsletter subscription form
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (email && isValidEmail(email)) {
                // Success message
                alert('Thank you for subscribing to our newsletter!');
                emailInput.value = '';
            } else {
                // Error message
                alert('Please enter a valid email address.');
            }
        });
    }
    
    // Helper function to validate email
    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    // Parallax effect for hero section
    const heroImage = document.querySelector('.hero-image');
    if (heroImage) {
        window.addEventListener('scroll', () => {
            const scrollPosition = window.scrollY;
            // Move the image slightly as user scrolls
            heroImage.style.transform = `translateY(${scrollPosition * 0.2}px)`;
        });
    }
    
    // Shop now button smooth scroll
    const shopNowBtn = document.querySelector('.hero-btn');
    if (shopNowBtn) {
        shopNowBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = document.getElementById('featured-section');
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // Add active class to current navigation link
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-item a');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentPage === linkPath || 
            (currentPage === '/' && linkPath === '/') || 
            (currentPage !== '/' && linkPath !== '/' && currentPage.includes(linkPath))) {
            link.parentElement.classList.add('active');
        }
    });
});
