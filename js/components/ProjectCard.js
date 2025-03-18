export class ProjectCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['title', 'description', 'image', 'tags', 'link'];
    }

    connectedCallback() {
        this.render();
        this.setupInteractions();
    }

    render() {
        const template = `
            <style>
                :host {
                    display: block;
                    position: relative;
                    border-radius: 15px;
                    overflow: hidden;
                    background: var(--card-bg, rgba(30, 41, 59, 0.8));
                    backdrop-filter: blur(10px);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }

                :host(:hover) {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
                }

                .card-content {
                    padding: 1.5rem;
                }

                .image-container {
                    width: 100%;
                    height: 200px;
                    overflow: hidden;
                }

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                }

                :host(:hover) img {
                    transform: scale(1.1);
                }

                .tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    margin-top: 1rem;
                }

                .tag {
                    padding: 0.25rem 0.75rem;
                    border-radius: 15px;
                    background: var(--primary-color, #4f46e5);
                    color: white;
                    font-size: 0.875rem;
                }

                .hover-effect {
                    position: absolute;
                    width: 100px;
                    height: 100px;
                    background: radial-gradient(circle at center, 
                        rgba(79, 70, 229, 0.3) 0%,
                        transparent 70%);
                    border-radius: 50%;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
            </style>

            <div class="hover-effect"></div>
            <div class="image-container">
                <img src="${this.getAttribute('image')}" alt="${this.getAttribute('title')}">
            </div>
            <div class="card-content">
                <h3>${this.getAttribute('title')}</h3>
                <p>${this.getAttribute('description')}</p>
                <div class="tags">
                    ${this.getAttribute('tags').split(',').map(tag => 
                        `<span class="tag">${tag.trim()}</span>`
                    ).join('')}
                </div>
            </div>
        `;

        this.shadowRoot.innerHTML = template;
    }

    setupInteractions() {
        const hoverEffect = this.shadowRoot.querySelector('.hover-effect');
        
        this.addEventListener('mousemove', (e) => {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            hoverEffect.style.opacity = '1';
            hoverEffect.style.transform = `translate(${x - 50}px, ${y - 50}px)`;
        });

        this.addEventListener('mouseleave', () => {
            hoverEffect.style.opacity = '0';
        });
    }
}

customElements.define('project-card', ProjectCard);
