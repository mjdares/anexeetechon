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

// --- 2. CUSTOM CURSOR LOGIC ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorCircle = document.querySelector('.cursor-circle');
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
});

document.querySelectorAll('[data-hover]').forEach(el => {
    el.addEventListener('mouseenter', () => cursorCircle.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cursorCircle.classList.remove('hovered'));
});

function animateCursor() {
    let dist = 0.15;
    cursorX += (mouseX - cursorX) * dist;
    cursorY += (mouseY - cursorY) * dist;

    cursorCircle.style.left = cursorX + 'px';
    cursorCircle.style.top = cursorY + 'px';
    requestAnimationFrame(animateCursor);
}
animateCursor();

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
