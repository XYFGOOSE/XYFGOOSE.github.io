document
  .querySelector(".menu-btn")
  .addEventListener("click", () =>
    document.querySelector(".main-menu").classList.toggle("show")
  );

  document.addEventListener("DOMContentLoaded", () => {
    // Event listeners for "Learn More" buttons
    document.querySelectorAll('.learn-more-btn').forEach(button => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const targetId = event.currentTarget.getAttribute('data-target');
        const popup = document.getElementById(targetId);
        if (popup) {
          popup.classList.add('active');
        }
      });
    });
  
    // Close popup when clicking outside or pressing ESC
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.learn-more-popup') && !event.target.closest('.learn-more-btn')) {
        document.querySelectorAll('.learn-more-popup').forEach(popup => {
          popup.classList.remove('active');
        });
      }
    });
  
    // Optional: Close popup on ESC key press
    document.addEventListener('keydown', (event) => {
      if (event.key === "Escape") {
        document.querySelectorAll('.learn-more-popup').forEach(popup => {
          popup.classList.remove('active');
        });
      }
    });
  });
  