document.addEventListener('DOMContentLoaded', () => {
    initSmoothScrolling();
    initIntersectionObserver();
    // initWordCycle(); // Replaced by CSS Animation
    initSolidSphere();
    initContactInteractions();
    initNeuralGrid();
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

/* --- Solid Particle Sphere (Replaces Tag Cloud) --- */
function initSolidSphere() {
    const container = document.getElementById('sphere-container');
    if (!container) return;
    
    // Clear previous if any
    container.innerHTML = '';

    const radius = 150;
    const particleCount = 40; // Number of solid nodes
    const particles = [];

    // Create Particle Elements
    for (let i = 0; i < particleCount; i++) {
        const el = document.createElement('div');
        el.className = 'sphere-particle';
        // Varying sizes
        const size = Math.random() * 8 + 4; // 4px to 12px
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.backgroundColor = '#ffffff';
        el.style.borderRadius = '50%';
        el.style.position = 'absolute';
        el.style.boxShadow = `0 0 ${size}px rgba(255, 255, 255, 0.5)`;
        
        container.appendChild(el);
        particles.push({ el, x: 0, y: 0, z: 0, phi: 0, theta: 0 });
    }

    // Distribute points on a sphere
    const phi = Math.PI * (3 - Math.sqrt(5));

    particles.forEach((item, i) => {
        const y = 1 - (i / (particleCount - 1)) * 2;
        const radiusAtY = Math.sqrt(1 - y * y);
        const theta = phi * i;

        item.x = Math.cos(theta) * radiusAtY;
        item.y = y;
        item.z = Math.sin(theta) * radiusAtY;
    });

    let mouseX = 0;
    let mouseY = 0;

    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        mouseX = (e.clientX - rect.left - rect.width / 2) * 0.001;
        mouseY = (e.clientY - rect.top - rect.height / 2) * 0.001;
    });
    
    let autoRotateX = 0.002;
    let autoRotateY = 0.002;

    function animate() {
        const rotationX = mouseX || autoRotateX;
        const rotationY = mouseY || autoRotateY;

        particles.forEach(item => {
            const cy = -rotationX;
            const cx = rotationY;

            const x1 = item.x * Math.cos(cy) + item.z * Math.sin(cy);
            const z1 = -item.x * Math.sin(cy) + item.z * Math.cos(cy);
            
            const y1 = item.y * Math.cos(cx) - z1 * Math.sin(cx);
            const z2 = item.y * Math.sin(cx) + z1 * Math.cos(cx);

            item.x = x1;
            item.y = y1;
            item.z = z2;

            const alpha = (item.z + 1) / 2;
            const transform = `translate(-50%, -50%) translate3d(${item.x * radius}px, ${item.y * radius}px, ${item.z * radius}px)`;
            
            item.el.style.transform = transform;
            item.el.style.opacity = 0.2 + (0.8 * alpha);
            item.el.style.zIndex = Math.floor(item.z * 100);
        });

        requestAnimationFrame(animate);
    }
    animate();
}

/* --- Advanced Neural Grid Background --- */
function initNeuralGrid() {
    const canvas = document.getElementById('bg-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let nodes = [];
    
    const config = {
        nodeCount: 80,
        connectDistance: 150,
        mouseDistance: 250,
        nodeSize: 2
    };

    const mouse = { x: null, y: null };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('resize', resize);
    
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    class Node {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.baseX = this.x;
            this.baseY = this.y;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            // Mouse Interaction (Warp Grid)
            if (mouse.x != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < config.mouseDistance) {
                    const force = (config.mouseDistance - distance) / config.mouseDistance;
                    const directionX = (dx / distance) * force * 5; // Stronger push
                    const directionY = (dy / distance) * force * 5;
                    
                    this.x -= directionX;
                    this.y -= directionY;
                }
            }
        }

        draw() {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, config.nodeSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function init() {
        nodes = [];
        resize();
        for (let i = 0; i < config.nodeCount; i++) {
            nodes.push(new Node());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        for (let i = 0; i < nodes.length; i++) {
            nodes[i].update();
            nodes[i].draw();
            
            for (let j = i; j < nodes.length; j++) {
                let dx = nodes[i].x - nodes[j].x;
                let dy = nodes[i].y - nodes[j].y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < config.connectDistance) {
                    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance/config.connectDistance})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }

    init();
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
        form.addEventListener('submit', () => {
            // NOTE: We do NOT preventDefault() here so the form actually submits to the target iframe.
            const btn = form.querySelector('button');
            const originalBtnText = btn.innerText;
            
            btn.disabled = true;
            btn.innerText = "Sending...";

            const iframe = document.getElementById('hidden_iframe');
            let isComplete = false;

            const handleSuccess = () => {
                if (isComplete) return;
                isComplete = true;
                
                btn.innerText = "Sent!";
                messageContainer.innerHTML = "Message Received!";
                messageContainer.classList.add('success');
                
                form.reset();
                
                setTimeout(() => {
                    btn.disabled = false;
                    btn.innerText = originalBtnText;
                    messageContainer.innerHTML = "";
                    messageContainer.classList.remove('success');
                }, 3000);
            };

            // Detect submission complete via iframe load (best effort)
            const onLoad = () => {
                handleSuccess();
                iframe.removeEventListener('load', onLoad);
            };
            iframe.addEventListener('load', onLoad);

            // Fallback ensuring UI resets if load event is blocked by cross-origin policies
            setTimeout(handleSuccess, 2000);
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
