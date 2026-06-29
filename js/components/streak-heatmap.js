/**
 * Streak Heatmap Component
 * Calendar heatmap visualization for savings streak
 */

export function renderStreakHeatmap(savings, containerId = 'streakHeatmap') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!savings || savings.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 2rem;">
                <div class="empty-state-icon">
                    <i data-lucide="flame"></i>
                </div>
                <h3 class="empty-state-title">No streak data</h3>
                <p class="empty-state-text">Start saving to build your streak!</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    // Group savings by date
    const savingsByDate = {};
    savings.forEach(saving => {
        const date = saving.date.split('T')[0];
        savingsByDate[date] = (savingsByDate[date] || 0) + saving.amount;
    });

    // Get date range (last 365 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 364);

    // Generate heatmap data
    const weeks = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        const weekStart = new Date(currentDate);
        const weekData = [];
        
        for (let i = 0; i < 7; i++) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const amount = savingsByDate[dateStr] || 0;
            weekData.push({
                date: dateStr,
                amount: amount,
                hasSaving: amount > 0
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        weeks.push(weekData);
    }

    // Calculate intensity levels
    const amounts = Object.values(savingsByDate);
    const maxAmount = Math.max(...amounts, 1);
    
    const getIntensity = (amount) => {
        if (amount === 0) return 0;
        if (amount < maxAmount * 0.25) return 1;
        if (amount < maxAmount * 0.5) return 2;
        if (amount < maxAmount * 0.75) return 3;
        return 4;
    };

    // Render heatmap
    const heatmapHTML = `
        <div class="streak-heatmap-container">
            <div class="streak-heatmap">
                ${weeks.map(week => `
                    <div class="streak-week">
                        ${weekData.map(day => `
                            <div class="streak-day intensity-${getIntensity(day.amount)}"
                                 title="${day.date}: ${day.amount > 0 ? '₹' + day.amount.toLocaleString() : 'No saving'}"
                                 data-date="${day.date}"></div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
            <div class="streak-legend">
                <span>Less</span>
                <div class="legend-item intensity-0"></div>
                <div class="legend-item intensity-1"></div>
                <div class="legend-item intensity-2"></div>
                <div class="legend-item intensity-3"></div>
                <div class="legend-item intensity-4"></div>
                <span>More</span>
            </div>
        </div>
        <style>
            .streak-heatmap-container {
                padding: 1rem 0;
            }
            .streak-heatmap {
                display: flex;
                gap: 3px;
                overflow-x: auto;
                padding-bottom: 8px;
            }
            .streak-week {
                display: flex;
                flex-direction: column;
                gap: 3px;
            }
            .streak-day {
                width: 12px;
                height: 12px;
                border-radius: 2px;
                background: var(--border-color);
                cursor: pointer;
                transition: transform 0.1s;
            }
            .streak-day:hover {
                transform: scale(1.3);
            }
            .streak-day.intensity-0 {
                background: var(--border-color);
            }
            .streak-day.intensity-1 {
                background: rgba(37, 99, 235, 0.2);
            }
            .streak-day.intensity-2 {
                background: rgba(37, 99, 235, 0.4);
            }
            .streak-day.intensity-3 {
                background: rgba(37, 99, 235, 0.6);
            }
            .streak-day.intensity-4 {
                background: rgba(37, 99, 235, 0.9);
            }
            .streak-legend {
                display: flex;
                align-items: center;
                gap: 4px;
                margin-top: 8px;
                font-size: 0.75rem;
                color: var(--text-secondary);
                font-weight: 600;
            }
            .legend-item {
                width: 12px;
                height: 12px;
                border-radius: 2px;
            }
            .legend-item.intensity-0 { background: var(--border-color); }
            .legend-item.intensity-1 { background: rgba(37, 99, 235, 0.2); }
            .legend-item.intensity-2 { background: rgba(37, 99, 235, 0.4); }
            .legend-item.intensity-3 { background: rgba(37, 99, 235, 0.6); }
            .legend-item.intensity-4 { background: rgba(37, 99, 235, 0.9); }
        </style>
    `;

    container.innerHTML = heatmapHTML;
}

export function calculateCurrentStreak(savings) {
    if (!savings || savings.length === 0) return 0;

    const savingsByDate = new Set(savings.map(s => s.date.split('T')[0]));
    let streak = 0;
    let currentDate = new Date();
    
    while (true) {
        const dateStr = currentDate.toISOString().split('T')[0];
        if (savingsByDate.has(dateStr)) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }
    
    return streak;
}

export function calculateLongestStreak(savings) {
    if (!savings || savings.length === 0) return 0;

    const savingsByDate = new Set(savings.map(s => s.date.split('T')[0]));
    const sortedDates = Array.from(savingsByDate).sort();
    
    let longestStreak = 0;
    let currentStreak = 0;
    let prevDate = null;

    for (const dateStr of sortedDates) {
        const currentDate = new Date(dateStr);
        
        if (prevDate) {
            const diffDays = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                currentStreak++;
            } else {
                longestStreak = Math.max(longestStreak, currentStreak);
                currentStreak = 1;
            }
        } else {
            currentStreak = 1;
        }
        
        prevDate = currentDate;
    }
    
    longestStreak = Math.max(longestStreak, currentStreak);
    return longestStreak;
}
