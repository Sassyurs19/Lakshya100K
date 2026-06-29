/**
 * Loading Screen Component
 * Reusable loading screen with skeleton support
 */

export function renderLoadingScreen() {
    return `
    <!-- Loading Screen -->
    <div id="loadingScreen" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: var(--bg-primary); display: flex; align-items: center; justify-content: center; z-index: 9999;">
        <div style="text-align: center;">
            <div class="loading-spinner" style="width: 40px; height: 40px; border: 3px solid var(--border-color); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
            <p style="color: var(--text-secondary); font-weight: 600;">Loading...</p>
        </div>
    </div>
    <style>
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
    `;
}

export function renderSkeletonCard() {
    return `
    <div class="card" style="padding: 1.5rem;">
        <div class="skeleton" style="height: 20px; width: 60%; margin-bottom: 1rem; border-radius: 4px;"></div>
        <div class="skeleton" style="height: 40px; width: 40%; margin-bottom: 1rem; border-radius: 4px;"></div>
        <div class="skeleton" style="height: 16px; width: 80%; border-radius: 4px;"></div>
    </div>
    <style>
        .skeleton {
            background: linear-gradient(90deg, var(--border-color) 25%, var(--bg-secondary) 50%, var(--border-color) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
    </style>
    `;
}

export function renderSkeletonGrid(count = 3) {
    return Array(count).fill(renderSkeletonCard()).join('');
}

export function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
}

export function showLoadingError(message = 'Unable to connect. Please check your connection.') {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <p style="color: var(--danger); font-weight: 700; margin-bottom: 1rem;">${message}</p>
                <button onclick="window.location.reload()" class="btn btn-primary">Retry</button>
            </div>
        `;
    }
}
