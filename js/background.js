import * as THREE from 'three';
import { gsap } from 'gsap';

export class Background3D {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        
        this.init();
        this.createGeometry();
        this.animate();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        document.getElementById('background-container').appendChild(this.renderer.domElement);
        
        this.camera.position.z = 30;
        
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    }

    createGeometry() {
        // Create animated geometry
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 5000;
        const positions = new Float32Array(particlesCount * 3);
        const colors = new Float32Array(particlesCount * 3);

        for(let i = 0; i < particlesCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 50;
            colors[i] = Math.random();
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.8
        });

        this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(this.particles);

        // Animate particles
        gsap.to(this.particles.rotation, {
            y: Math.PI * 2,
            duration: 100,
            repeat: -1,
            ease: 'none'
        });
    }

    onMouseMove(event) {
        const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

        gsap.to(this.particles.rotation, {
            x: mouseY * 0.5,
            y: mouseX * 0.5,
            duration: 2,
            ease: 'power2.out'
        });
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.particles.rotation.y += 0.001;
        this.renderer.render(this.scene, this.camera);
    }
}
