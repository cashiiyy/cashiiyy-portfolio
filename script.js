document.addEventListener('DOMContentLoaded', () => {
    initSmoothScrolling();
    initIntersectionObserver();
    initWordCycle();
    initTagCloud();
    initContactInteractions();
});

/* --- Smooth Scrolling --- */
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

/* --- Intersection Observer --- */
function initIntersectionObserver() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
        section.classList.add('fade-in-section');
        observer.observe(section);
    });
}

/* --- Hero Text Cycling --- */
function initWordCycle() {
    const words = ["AI MANIAC", "CINEPHILE", "MARVELOUS", "DIRECTOR", "ELECTRONICS ENTHUSIAST"];
    const element = document.querySelector('.dynamic-role');
    if (!element) return;

    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function type() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            element.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50; // Faster deleting
        } else {
            element.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100; // Normal typing
        }

        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            typeSpeed = 2000; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 500; // Pause before new word
        }

        setTimeout(type, typeSpeed);
    }

    // Initialize with first word already potentially there
    charIndex = element.textContent.length;
    isDeleting = true; // Start by deleting default text then cycle
    setTimeout(type, 1000);
}

/* --- 3D Tag Cloud Sphere --- */
function initTagCloud() {
    const container = document.getElementById('sphere-container');
    if (!container) return;

    const tags = [
        'Python', 'Machine Learning', 'NLP', 'TensorFlow', 'Vidya', 
        'Guidance', 'Future', 'AI', 'Education', 'Data', 
        'Neural Networks', 'Algorithms', 'Logic', 'Career', 'Choices'
    ];

    const radius = 150; // Radius of the sphere
    const cloudItems = [];

    // Create Tag Elements
    tags.forEach(text => {
        const el = document.createElement('div');
        el.className = 'tag-cloud-item';
        el.textContent = text;
        container.appendChild(el);
        cloudItems.push({ el, x: 0, y: 0, z: 0, phi: 0, theta: 0 });
    });

    // Distribute points on a sphere (Fibonacci Sphere)
    const count = tags.length;
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden Angle

    cloudItems.forEach((item, i) => {
        const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
        const radiusAtY = Math.sqrt(1 - y * y);
        const theta = phi * i;

        item.x = Math.cos(theta) * radiusAtY;
        item.y = y;
        item.z = Math.sin(theta) * radiusAtY;
    });

    let mouseX = 0;
    let mouseY = 0;

    // Mouse Interaction
    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        mouseX = (e.clientX - rect.left - rect.width / 2) * 0.001;
        mouseY = (e.clientY - rect.top - rect.height / 2) * 0.001;
    });
    
    // Auto rotation fallback
    let autoRotateX = 0.002;
    let autoRotateY = 0.002;

    function animate() {
        // Use mouse or auto rotation
        const rotationX = mouseX || autoRotateX;
        const rotationY = mouseY || autoRotateY;

        cloudItems.forEach(item => {
            // Rotate around Y axis
            const cy = -rotationX; // Mouse X affects Y rotation
            const cx = rotationY;  // Mouse Y affects X rotation

            // Rotation Logic
            const x1 = item.x * Math.cos(cy) + item.z * Math.sin(cy);
            const z1 = -item.x * Math.sin(cy) + item.z * Math.cos(cy);
            
            const y1 = item.y * Math.cos(cx) - z1 * Math.sin(cx);
            const z2 = item.y * Math.sin(cx) + z1 * Math.cos(cx);

            item.x = x1;
            item.y = y1;
            item.z = z2;

            // Project to 2D
            const scale = radius / (radius - item.z * radius); // Simple perspective
            const alpha = (item.z + 1) / 2; // Opacity based on depth
            
            // Apply styles
            // We scale item.x/y by radius to get pixels
            // Z-index based on Z position
            const transform = `translate(-50%, -50%) translate3d(${item.x * radius}px, ${item.y * radius}px, ${item.z * radius}px) scale(${1 + (item.z * 0.5)})`;
            
            item.el.style.transform = transform;
            item.el.style.opacity = 0.5 + (0.5 * alpha);
            item.el.style.zIndex = Math.floor(item.z * 100);
            item.el.style.filter = `blur(${(1-alpha) * 2}px)`;
        });

        requestAnimationFrame(animate);
    }

    animate();
}

/* --- Contact Interaction --- */
function initContactInteractions() {
    // 1. Copy Email
    const emailWrapper = document.querySelector('.email-copy-wrapper');
    const emailText = document.getElementById('email-text');
    const tooltip = document.querySelector('.copy-tooltip');

    if (emailWrapper && emailText && tooltip) {
        emailWrapper.addEventListener('click', () => {
            navigator.clipboard.writeText(emailText.innerText).then(() => {
                const originalText = tooltip.innerText;
                tooltip.innerText = "Copied!";
                setTimeout(() => {
                    tooltip.innerText = originalText;
                }, 2000);
            });
        });
    }

    // 2. Form Submission Simulation
    const form = document.getElementById('contact-form');
    const messageContainer = document.querySelector('.form-message');

    if (form && messageContainer) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalBtnText = btn.innerText;
            
            btn.disabled = true;
            btn.innerText = "Sending...";
            
            // Simulate network request
            setTimeout(() => {
                btn.innerText = "Sent!";
                messageContainer.innerHTML = "Message Received! (This is a demo)";
                messageContainer.classList.add('success');
                
                form.reset();
                
                setTimeout(() => {
                    btn.disabled = false;
                    btn.innerText = originalBtnText;
                    messageContainer.innerHTML = "";
                    messageContainer.classList.remove('success');
                }, 3000);
            }, 1500);
        });
    }
}

// Add fade-in CSS class dynamically for sections
const styleSheet = document.createElement("style");
styleSheet.innerText = `
    .fade-in-section {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }
    .fade-in-section.visible {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(styleSheet);
