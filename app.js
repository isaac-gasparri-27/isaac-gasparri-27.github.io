// Functions for Home Page

document.addEventListener('DOMContentLoaded', () => {
let currentSlide = 0;
const slidesContainer = document.querySelector('.slides');
const dots = document.querySelectorAll('.dot');
const totalSlides = document.querySelectorAll('.slide').length;
let slideTimeout;

    // Function to update the slide position and active dot
    function updateSlide() {
        slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
        dots.forEach(dot => dot.classList.remove('active'));
        dots[currentSlide].classList.add('active');
    }

    // Function to go to the next slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides; // Loops back after last slide
        updateSlide();
        resetTimeout();
    }

    // Function to go to a specific slide
    function goToSlide(index) {
        currentSlide = index;
        updateSlide();
        resetTimeout();
    }

    // Function to reset the slide change timeout
    function resetTimeout() {
        clearTimeout(slideTimeout);
        slideTimeout = setTimeout(nextSlide, 5000); // Change slide every 5 seconds
    }

    // Add click event listeners to dots for manual slide navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
    });

    // Initialize the first slide and start the timeout
    updateSlide();
    slideTimeout = setTimeout(nextSlide, 5000); // Change slide every 5 seconds
});

// Functions for Contact Page

// Form submission event listener
document.getElementById("contactForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent default form submission

    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let message = document.getElementById("message").value.trim();

    // Validate Email Format
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (name === "" || email === "" || message === "") {
        alert("❌ Please fill in all fields.");
    } else if (!emailPattern.test(email)) {
        alert("❌ Invalid email address.");
    } else {
        // Store a flag in sessionStorage before reload
        sessionStorage.setItem("messageSent", "true");

        // Reload the page
        window.location.reload();
    }
});

// Check if the message was sent before reload
window.onload = function() {
    if (sessionStorage.getItem("messageSent") === "true") {
        sessionStorage.removeItem("messageSent"); // Clear the flag
        
        // Show success alert, then clear the form after user closes it
        setTimeout(() => {
            alert("✅ Your message has been sent!");
            document.getElementById("contactForm").reset(); // Clears the form
        }, 500);
    }
};