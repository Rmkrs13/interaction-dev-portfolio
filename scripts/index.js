document.addEventListener('DOMContentLoaded', function() {
    const footerImage = document.querySelector('.footer-image');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 0) {
            footerImage.style.opacity = '1'; // Show footer image when scrolling
        } else {
            footerImage.style.opacity = '0'; // Hide footer image when at the top
        }
    });
});