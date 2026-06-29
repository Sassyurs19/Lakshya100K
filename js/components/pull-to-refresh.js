/**
 * Pull-to-Refresh Component
 * Mobile pull-to-refresh functionality
 */

export function setupPullToRefresh(onRefresh) {
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    let threshold = 80;
    let maxPull = 150;
    
    const container = document.querySelector('.page-container') || document.body;
    const indicator = document.createElement('div');
    indicator.className = 'pull-to-refresh-indicator';
    indicator.innerHTML = '<i data-lucide="refresh-cw"></i>';
    indicator.style.cssText = `
        position: fixed;
        top: -60px;
        left: 50%;
        transform: translateX(-50%);
        width: 40px;
        height: 40px;
        background: var(--primary);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        transition: top 0.3s ease;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    document.body.appendChild(indicator);
    lucide.createIcons();

    container.addEventListener('touchstart', (e) => {
        if (window.scrollY === 0) {
            startY = e.touches[0].clientY;
            isDragging = true;
        }
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
        if (!isDragging || window.scrollY > 0) return;
        
        currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        
        if (diff > 0) {
            const pullDistance = Math.min(diff * 0.5, maxPull);
            const progress = Math.min(pullDistance / threshold, 1);
            
            indicator.style.top = `${-60 + pullDistance}px`;
            indicator.style.transform = `translateX(-50%) rotate(${progress * 360}deg)`;
            
            e.preventDefault();
        }
    }, { passive: false });

    container.addEventListener('touchend', async () => {
        if (!isDragging) return;
        isDragging = false;
        
        const pullDistance = currentY - startY;
        
        if (pullDistance > threshold) {
            indicator.style.top = '20px';
            indicator.querySelector('i').style.animation = 'spin 1s linear infinite';
            
            try {
                await onRefresh();
            } catch (error) {
                console.error('Refresh failed:', error);
            }
            
            setTimeout(() => {
                indicator.style.top = '-60px';
                indicator.querySelector('i').style.animation = '';
                indicator.style.transform = 'translateX(-50%)';
            }, 500);
        } else {
            indicator.style.top = '-60px';
            indicator.style.transform = 'translateX(-50%)';
        }
        
        startY = 0;
        currentY = 0;
    });

    // Add spinner animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

export function removePullToRefresh() {
    const indicator = document.querySelector('.pull-to-refresh-indicator');
    if (indicator) indicator.remove();
}
