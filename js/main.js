// --- 1. SETUP LENIS (SMOOTH SCROLL) ---
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// --- 2. CURSOR + NAVIGATION ENHANCEMENTS ---
const body = document.body;
const cursorDot = document.querySelector('.cursor-dot');
const cursorCircle = document.querySelector('.cursor-circle');
const hoverTargets = new WeakSet();
const pointerQuery = window.matchMedia('(pointer: fine)');
const desktopBreakpoint = 1024;
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;

const updateCursorMode = () => {
    if (pointerQuery.matches && window.innerWidth > 900) {
        body.classList.add('has-custom-cursor');
    } else {
        body.classList.remove('has-custom-cursor');
    }
};

updateCursorMode();
if (pointerQuery.addEventListener) {
    pointerQuery.addEventListener('change', updateCursorMode);
} else if (pointerQuery.addListener) {
    pointerQuery.addListener(updateCursorMode);
}
window.addEventListener('resize', updateCursorMode);

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (cursorDot) {
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
    }
});

function animateCursor() {
    if (!cursorCircle) {
        return;
    }
    const dist = 0.15;
    cursorX += (mouseX - cursorX) * dist;
    cursorY += (mouseY - cursorY) * dist;

    cursorCircle.style.left = cursorX + 'px';
    cursorCircle.style.top = cursorY + 'px';
    requestAnimationFrame(animateCursor);
}
animateCursor();

function attachHoverListeners() {
    if (!cursorCircle) return;
    document.querySelectorAll('[data-hover]').forEach(el => {
        if (hoverTargets.has(el)) return;
        el.addEventListener('mouseenter', () => cursorCircle.classList.add('hovered'));
        el.addEventListener('mouseleave', () => cursorCircle.classList.remove('hovered'));
        hoverTargets.add(el);
    });
}

function enhanceNavigation() {
    const nav = document.querySelector('nav');
    if (!nav) return;
    const navLinks = nav.querySelector('.nav-links');
    if (!navLinks) return;

    let menuToggle = nav.querySelector('.menu-toggle');
    if (!menuToggle) {
        menuToggle = document.createElement('button');
        menuToggle.className = 'menu-toggle';
        menuToggle.type = 'button';
        menuToggle.setAttribute('aria-label', 'Toggle navigation menu');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('data-hover', '');
        menuToggle.innerHTML = '<span></span><span></span><span></span>';
        const cta = nav.querySelector('.btn-cta');
        if (cta && cta.parentElement === nav) {
            nav.insertBefore(menuToggle, cta.nextSibling);
        } else {
            nav.appendChild(menuToggle);
        }
    }

    const dropdownParents = Array.from(nav.querySelectorAll('.nav-item.has-dropdown'));
    const shouldUseClickDropdown = () => window.innerWidth <= desktopBreakpoint || !pointerQuery.matches;

    dropdownParents.forEach(item => {
        const dropdown = item.querySelector('.dropdown');
        if (!dropdown || item.querySelector('.dropdown-toggle')) return;

        let labelText = 'Menu';
        const labelNode = Array.from(item.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length);
        if (labelNode) {
            labelText = labelNode.textContent.trim();
        }

        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'dropdown-toggle';
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.setAttribute('data-hover', '');
        toggleBtn.innerHTML = `<span>${labelText}</span><span class=\"caret\" aria-hidden=\"true\"></span>`;
        item.insertBefore(toggleBtn, dropdown);

        Array.from(item.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                node.parentNode.removeChild(node);
            }
        });

        toggleBtn.addEventListener('click', () => {
            if (!shouldUseClickDropdown()) return;
            const isOpen = item.classList.toggle('dropdown-open');
            toggleBtn.setAttribute('aria-expanded', isOpen);
            dropdownParents.forEach(other => {
                if (other !== item) {
                    other.classList.remove('dropdown-open');
                    const otherBtn = other.querySelector('.dropdown-toggle');
                    if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                }
            });
        });
    });

    const closeDropdowns = () => {
        dropdownParents.forEach(item => {
            item.classList.remove('dropdown-open');
            const btn = item.querySelector('.dropdown-toggle');
            if (btn) btn.setAttribute('aria-expanded', 'false');
        });
    };

    const closeMobileMenu = () => {
        nav.classList.remove('nav-open');
        document.body.classList.remove('nav-menu-open');
        if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    };

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('nav-open');
            document.body.classList.toggle('nav-menu-open', isOpen);
            menuToggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    window.addEventListener('resize', () => {
        if (window.innerWidth > desktopBreakpoint) {
            closeMobileMenu();
            closeDropdowns();
        }
    });

    navLinks.querySelectorAll('a').forEach(link => {
        if (link.dataset.menuBound) return;
        link.dataset.menuBound = 'true';
        link.addEventListener('click', () => {
            if (window.innerWidth <= desktopBreakpoint) {
                closeDropdowns();
                closeMobileMenu();
            }
        });
    });

    document.addEventListener('click', (event) => {
        if (!nav.contains(event.target) && shouldUseClickDropdown()) {
            closeDropdowns();
            closeMobileMenu();
        }
    });
}

enhanceNavigation();
attachHoverListeners();
setupLeadCaptureModal();

function setupLeadCaptureModal() {
    const ensureModal = () => {
        let existing = document.getElementById('lead-modal');
        if (existing) return existing;
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
            <div class="lead-modal" id="lead-modal" aria-hidden="true">
                <div class="lead-modal__overlay" data-lead-close></div>
                <div class="lead-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="lead-modal-title">
                    <button class="lead-modal__close" type="button" data-lead-close aria-label="Close form">&times;</button>
                    <h3 id="lead-modal-title">Ready to get started?</h3>
                    <p>Share a few details and we will reach out with a tailored walkthrough.</p>
                    <form class="lead-modal__form">
                        <label for="lead-name">Full Name
                            <input id="lead-name" name="name" type="text" placeholder="Your Name" required>
                        </label>
                        <label for="lead-mobile">Mobile Number
                            <input id="lead-mobile" name="mobile" type="tel" placeholder="+91 90000 00000" required>
                        </label>
                        <label for="lead-email">Email ID
                            <input id="lead-email" name="email" type="email" placeholder="you@company.com" required>
                        </label>
                        <button type="submit">Submit</button>
                    </form>
                </div>
            </div>
        `;
        const modal = wrapper.firstElementChild;
        document.body.appendChild(modal);
        return modal;
    };

    const modal = ensureModal();
    const form = modal.querySelector('form');
    const closeElements = modal.querySelectorAll('[data-lead-close]');
    let lastFocusedElement = null;
    const focusableSelectors = 'a[href], button:not([disabled]), textarea, input, select';

    const openModal = () => {
        if (modal.classList.contains('is-visible')) return;
        lastFocusedElement = document.activeElement;
        modal.classList.add('is-visible');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        const firstInput = modal.querySelector('input');
        if (firstInput) firstInput.focus();
    };

    const closeModal = () => {
        modal.classList.remove('is-visible');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        if (lastFocusedElement) {
            lastFocusedElement.focus();
            lastFocusedElement = null;
        }
    };

    const trapFocus = (event) => {
        if (event.key !== 'Tab' || !modal.classList.contains('is-visible')) return;
        const focusable = Array.from(modal.querySelectorAll(focusableSelectors)).filter(el => el.offsetParent !== null);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    };

    closeElements.forEach(el => {
        el.addEventListener('click', (event) => {
            event.preventDefault();
            closeModal();
        });
    });

    modal.addEventListener('keydown', trapFocus);
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('is-visible')) {
            closeModal();
        }
    });

    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            form.reset();
            closeModal();
        });
    }

    const getStartedButtons = Array.from(document.querySelectorAll('.btn-cta')).filter(btn => {
        return (btn.textContent || '').toLowerCase().includes('get started');
    });

    getStartedButtons.forEach(btn => {
        if (btn.dataset.leadModalBound === 'true') return;
        btn.dataset.leadModalBound = 'true';
        btn.addEventListener('click', (event) => {
            event.preventDefault();
            openModal();
        });
    });
}

// --- 3. THREE.JS BACKGROUND ---
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const renderer = new THREE.WebGLRenderer({ alpha: true });
const container = document.getElementById('canvas-container');

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const fragmentShader = `
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p);
        vec2 u = f*f*(3.0-2.0*f);
        return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), u.x),
                   mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), u.x), u.y);
    }
    float fbm(vec2 p) {
        float v = 0.0; float a = 0.5;
        for(int i=0; i<5; i++) { v += a*noise(p); p = p*2.0; a *= 0.5; }
        return v;
    }

    void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        uv.x *= u_resolution.x / u_resolution.y;

        vec2 p = uv * 3.0;
        float t = u_time * 0.1;

        float n = fbm(p + vec2(t, t*0.5));
        float n2 = fbm(p + n + vec2(t*0.2, -t*0.3));

        vec3 col1 = vec3(0.01, 0.01, 0.02);
        vec3 col2 = vec3(0.0, 0.2, 0.3);
        vec3 col3 = vec3(0.0, 0.95, 0.92);

        float mixVal = smoothstep(0.2, 0.8, n2);
        vec3 color = mix(col1, col2, mixVal);

        float lines = step(0.95, fract(n2 * 10.0 + u_time * 0.2));
        color += lines * col3 * 0.2;

        vec2 m = u_mouse / u_resolution.xy;
        m.x *= u_resolution.x / u_resolution.y;
        float d = length(uv - m);
        color += vec3(0.0, 0.5, 1.0) * smoothstep(0.3, 0.0, d) * 0.2;

        float vig = 1.0 - length(uv - vec2(0.5 * (u_resolution.x/u_resolution.y), 0.5));
        color *= smoothstep(0.0, 1.0, vig);

        gl_FragColor = vec4(color, 1.0);
    }
`;

const vertexShader = `
    void main() { gl_Position = vec4(position, 1.0); }
`;

const geometry = new THREE.PlaneGeometry(2, 2);
const uniforms = {
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    u_mouse: { value: new THREE.Vector2(0, 0) }
};

const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms
});

const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

function renderWebGL(time) {
    uniforms.u_time.value = time * 0.001;
    uniforms.u_mouse.value.x += (mouseX - uniforms.u_mouse.value.x) * 0.05;
    uniforms.u_mouse.value.y += ((window.innerHeight - mouseY) - uniforms.u_mouse.value.y) * 0.05;

    renderer.render(scene, camera);
    requestAnimationFrame(renderWebGL);
}
renderWebGL(0);

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
});

// --- 4. GSAP ANIMATIONS ---
gsap.registerPlugin(ScrollTrigger);

document.querySelectorAll('.anim-text').forEach(el => {
    gsap.from(el, {
        scrollTrigger: { trigger: el, start: "top 80%" },
        y: 50, opacity: 0, duration: 1.5, ease: "power4.out"
    });
});

document.querySelectorAll('.anim-fade').forEach(el => {
    gsap.from(el, {
        scrollTrigger: { trigger: el, start: "top 85%" },
        y: 20, opacity: 0, duration: 1, ease: "power2.out"
    });
});

gsap.utils.toArray('.anim-up').forEach(el => {
    gsap.from(el, {
        scrollTrigger: { trigger: el, start: "top 90%" },
        y: 50, opacity: 0, duration: 1, ease: "back.out(1.7)"
    });
});

document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        gsap.to(card, {
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`,
            duration: 0.5,
            ease: "power2.out"
        });
    });

    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            transform: `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`,
            duration: 0.5
        });
    });
});

// --- 5. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    gsap.from("nav", { y: -50, opacity: 0, duration: 1, delay: 0.2 });
    gsap.from(".hero h1", { y: 100, opacity: 0, duration: 1.5, delay: 0.5, ease: "power4.out", clearProps: "all" });
    gsap.from(".hero-sub", { y: 50, opacity: 0, duration: 1.5, delay: 0.8, clearProps: "all" });
    gsap.from(".hero p", { y: 30, opacity: 0, duration: 1.5, delay: 1, clearProps: "all" });
});
