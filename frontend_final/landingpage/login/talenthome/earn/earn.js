document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard loaded successfully.');

    const cards = document.querySelectorAll('.card');
    const bgTexture = document.getElementById('bg-texture');

    document.querySelector('.profile-section')?.addEventListener('click', () => {
        window.location.href = '../thome.html';
    });

    // Add interactivity to cards
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const nameEl = card.querySelector('.label') || card.querySelector('h2');
            const cardName = nameEl ? nameEl.innerText.replace('\n', ' ') : 'card';
            console.log(`Clicked on ${cardName}`);

            // Small click animation effect
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.style.transform = '';
            }, 150);
        });
    });

    // Generate some SVG wavy lines to simulate a topographic map
    const generateTopographicSVG = () => {
        let svgContent = `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">`;
        svgContent += `<defs>
            <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="rgba(0,0,0,0.1)"/>
                <stop offset="50%" stop-color="rgba(0,0,0,0.25)"/>
                <stop offset="100%" stop-color="rgba(0,0,0,0.1)"/>
            </linearGradient>
        </defs>`;

        const lines = 40;
        const points = 10;

        for (let i = 0; i < lines; i++) {
            const yOffset = (i / lines) * 120;
            // Create a wavy path
            let d = `M -10 ${yOffset}% `;

            for (let j = 1; j <= points; j++) {
                const x = (j / points) * 110;
                // Randomize control points for a natural wave
                const cp1x = x - (110 / points) * 0.5;
                const cp2x = x - (110 / points) * 0.5;
                const cp1y = yOffset + (Math.random() * 15 - 7.5);
                const cp2y = yOffset + (Math.random() * 15 - 7.5);
                const y = yOffset + (Math.random() * 10 - 5);
                d += `C ${cp1x}% ${cp1y}%, ${cp2x}% ${cp2y}%, ${x}% ${y}% `;
            }

            svgContent += `<path d="${d}" fill="none" stroke="url(#line-grad)" stroke-width="1.5" />`;
        }

        svgContent += `</svg>`;
        return svgContent;
    };

    // Insert the generated SVG and blend it with the CSS grid background
    const wrapper = document.createElement('div');
    wrapper.innerHTML = generateTopographicSVG();
    wrapper.style.position = 'absolute';
    wrapper.style.top = '0';
    wrapper.style.left = '0';
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.zIndex = '-1';
    wrapper.style.opacity = '0.5';
    bgTexture.appendChild(wrapper);
});
