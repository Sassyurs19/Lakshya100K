/**
 * Empty State Component
 * Reusable empty state with better messaging and icons
 */

export function renderEmptyState(options = {}) {
    const {
        icon = 'receipt',
        title = 'No data found',
        message = 'Start by adding your first item',
        actionText = 'Add Now',
        actionHref = '#',
        showAction = true
    } = options;

    return `
    <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem;">
        <div class="empty-state-icon" style="width: 80px; height: 80px; margin: 0 auto 1.5rem; background: var(--bg-secondary); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px dashed var(--border-color);">
            <i data-lucide="${icon}" style="width: 32px; height: 32px; color: var(--text-tertiary);"></i>
        </div>
        <h3 class="empty-state-title" style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">${title}</h3>
        <p class="empty-state-text" style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 1.5rem;">${message}</p>
        ${showAction ? `<a href="${actionHref}" class="btn btn-primary">${actionText}</a>` : ''}
    </div>
    `;
}

export function renderEmptyStateSavings() {
    return renderEmptyState({
        icon: 'piggy-bank',
        title: 'No savings recorded yet',
        message: 'Start your savings journey today by adding your first saving!',
        actionText: 'Add Your First Saving',
        actionHref: 'add-saving.html'
    });
}

export function renderEmptyStateAchievements() {
    return renderEmptyState({
        icon: 'trophy',
        title: 'No achievements yet',
        message: 'Start saving to unlock your first achievement badge!',
        actionText: 'Start Saving',
        actionHref: 'add-saving.html'
    });
}

export function renderEmptyStateGallery() {
    return renderEmptyState({
        icon: 'image',
        title: 'No images yet',
        message: 'Add images to your savings to visualize your progress!',
        actionText: 'Add Saving with Image',
        actionHref: 'add-saving.html'
    });
}

export function renderEmptyStateAnalytics() {
    return renderEmptyState({
        icon: 'bar-chart-2',
        title: 'No analytics data',
        message: 'Add some savings to see your spending insights and patterns!',
        actionText: 'Add Your First Saving',
        actionHref: 'add-saving.html'
    });
}
