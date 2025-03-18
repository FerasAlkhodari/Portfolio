// Typewriter effect
document.addEventListener('DOMContentLoaded', function() {
    const typewriterTexts = ["Backend Developer.", "Software Engineer.", "Tech Enthusiast."];
    let typeIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingDelay = 100;
    const erasingDelay = 50;
    const newTextDelay = 2000;

    function typeWriter() {
        const dynamicText = document.querySelector(".dynamic-text");
        const currentText = typewriterTexts[typeIndex];
        
        if (!dynamicText) return;

        if (!isDeleting && charIndex < currentText.length) {
            dynamicText.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            setTimeout(typeWriter, typingDelay);
        } else if (isDeleting && charIndex > 0) {
            dynamicText.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            setTimeout(typeWriter, erasingDelay);
        } else {
            isDeleting = !isDeleting;
            if (!isDeleting) {
                typeIndex = (typeIndex + 1) % typewriterTexts.length;
            }
            setTimeout(typeWriter, isDeleting ? erasingDelay : newTextDelay);
        }
    }

    // بدء التأثير
    setTimeout(typeWriter, newTextDelay);

    // Mobile Menu Toggle
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Menu clicked');
            menuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
            console.log('Nav active:', navLinks.classList.contains('active'));
            body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (navLinks.classList.contains('active') && 
                !navLinks.contains(e.target) && 
                !menuBtn.contains(e.target)) {
                menuBtn.classList.remove('active');
                navLinks.classList.remove('active');
                body.style.overflow = '';
            }
        });

        // Close menu when clicking on navigation links
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuBtn.classList.remove('active');
                navLinks.classList.remove('active');
                body.style.overflow = '';
            });
        });
    }

    // وظيفة تبديل المظهر
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    
    // تعيين الوضع الفاتح كافتراضي إذا لم يكن هناك تفضيل محفوظ
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.classList.remove('light-mode');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    } else {
        // تعيين الوضع الفاتح كافتراضي
        document.documentElement.classList.add('light-mode');
        themeIcon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'light');
    }
    
    // تبديل المظهر عند النقر على الزر
    themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('light-mode');
        
        // تحديث الأيقونة
        if (document.documentElement.classList.contains('light-mode')) {
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'light');
        } else {
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'dark');
        }
    });
});

// Contact Form Handler
function sendEmail(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    const mailtoUrl = `mailto:ferasalkhodari51@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
    
    window.location.href = mailtoUrl;
    
    // إعادة ضبط النموذج بعد الإرسال
    document.getElementById('contact-form').reset();
}

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > lastScroll && currentScroll > 100) {
        navbar.style.transform = 'translateY(-100%)';
    } else {
        navbar.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;

    if (currentScroll > 0) {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = 'none';
    }
});

// Add scrolled class to navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

