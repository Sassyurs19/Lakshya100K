import { onAuthStateChange, logoutUser, getCurrentUser } from './auth.js?v=3';
import { getUserSavings, getUserSavingsPaginated, deleteSaving, getUserDocument } from './database.js?v=3';
import { showToast, debounce } from './utils.js?v=3';

let currentPage = 1, lastDoc = null, hasMore = true, allSavings = [];
const savingsPerPage = 20;

const $ = id => document.getElementById(id);

const authTimeout = setTimeout(() => {
    if ($('loadingScreen')) {
        $('loadingScreen').innerHTML = `<div style="text-align:center;padding:2rem;"><p style="color:var(--danger);font-weight:700;margin-bottom:1rem;">Unable to connect. Please check your connection.</p><button onclick="window.location.reload()" class="btn btn-primary">Retry</button></div>`;
    }
}, 5000);

onAuthStateChange(user => {
    clearTimeout(authTimeout);
    if ($('loadingScreen')) $('loadingScreen').style.display = 'none';
    if (!user) window.location.href = 'login.html';
    else {
        if ($('navbar')) $('navbar').style.display = 'block';
        if ($('main-content')) $('main-content').style.display = 'block';
        loadUserInfo(user);
        loadSavings(user, true);
        setupEventListeners();
    }
});

async function loadUserInfo(user) {
    const userDoc = await getUserDocument(user.uid);
    if (userDoc.success) {
        const userData = userDoc.data;
        const username = userData.username || 'user';
        if ($('usernameDisplay')) $('usernameDisplay').textContent = `@${username}`;
        if ($('userAvatar')) $('userAvatar').textContent = (userData.fullName || userData.username || 'U').charAt(0).toUpperCase();
    }
}

async function loadSavings(user, reset = false) {
    console.log('[loadSavings] Loading savings for user:', user.uid, 'reset:', reset);
    if (reset) {
        currentPage = 1; lastDoc = null; hasMore = true; allSavings = [];
        if ($('savingsGrid')) $('savingsGrid').innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:2rem;"><p style="color:var(--text-secondary);font-weight:600;">Loading savings...</p></div>`;
    }
    const result = await getUserSavings(user.uid);
    console.log('[loadSavings] Result:', result);
    if (result.success && result.data.length > 0) {
        const savings = result.data;
        allSavings = savings;
        renderSavingsGrid(allSavings);
        if ($('loadMoreBtn')) $('loadMoreBtn').style.display = 'none';
    } else if (reset) {
        console.log('[loadSavings] No savings found');
        if ($('savingsGrid')) $('savingsGrid').innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><div class="empty-state-icon"><i data-lucide="receipt"></i></div><h3 class="empty-state-title">No savings recorded yet</h3><p class="empty-state-text">Start your savings journey today by adding your first saving!</p><a href="add-saving.html" class="btn btn-primary">Add Your First Saving</a></div>`;
        if ($('loadMoreBtn')) $('loadMoreBtn').style.display = 'none';
    }
    lucide.createIcons();
}

function renderSavingsGrid(savingsList) {
    $('savingsGrid').innerHTML = savingsList.map(s => `
        <div class="card saving-card" data-category="${s.category}" data-date="${s.date}" data-amount="${s.amount}" data-note="${s.note||''}" data-id="${s.id}">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:1rem;">
                <div>
                    <div style="font-size:1.5rem;font-weight:800;color:var(--text-primary);">₹${s.amount.toLocaleString()}</div>
                    <div style="color:var(--text-secondary);font-size:0.8rem;margin-top:4px;font-weight:600;">${new Date(s.date).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}${s.time?` at ${s.time}`:''}</div>
                </div>
                <div style="background:var(--primary-light);color:var(--primary);padding:4px 10px;border-radius:var(--radius-sm);font-size:0.8rem;font-weight:700;">${s.category}</div>
            </div>
            ${s.note?`<div style="color:var(--text-secondary);margin-bottom:1rem;line-height:1.5;font-size:0.875rem;">${s.note.length>80?s.note.substring(0,80)+'...':s.note}</div>`:''}
            <div style="display:flex;justify-content:space-between;align-items:center;">
                ${s.imageURL?`<img src="${s.imageURL}" class="saving-thumbnail" loading="lazy" onclick="openModal('${s.imageURL}')" style="width:44px;height:44px;object-fit:cover;border-radius:var(--radius-md);border:1px solid var(--border-color);cursor:pointer;">`:'<div style="flex:1;"></div>'}
                <div style="display:flex;gap:0.5rem;">
                    <button onclick="viewSaving('${s.id}')" class="btn btn-secondary btn-sm" title="View Details" style="height:32px;width:32px;padding:0;justify-content:center;"><i data-lucide="eye" style="width:16px;height:16px;"></i></button>
                    <button onclick="editSaving('${s.id}')" class="btn btn-secondary btn-sm" title="Edit" style="height:32px;width:32px;padding:0;justify-content:center;"><i data-lucide="edit" style="width:16px;height:16px;"></i></button>
                    <button onclick="deleteSavingHandler('${s.id}')" class="btn btn-danger btn-sm" title="Delete" style="height:32px;width:32px;padding:0;justify-content:center;"><i data-lucide="trash" style="width:16px;height:16px;"></i></button>
                </div>
            </div>
            <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border-color);color:var(--text-secondary);font-size:0.8rem;font-weight:600;">Running Total: <strong style="color:var(--text-primary);">₹${(s.runningTotal||0).toLocaleString()}</strong></div>
        </div>
    `).join('');
    lucide.createIcons();
}

window.deleteSavingHandler = async id => {
    if (confirm('Are you sure you want to delete this saving? This action cannot be undone.')) {
        const result = await deleteSaving(id);
        if (result.success) { showToast('Saving deleted successfully','success'); location.reload(); }
        else showToast(result.error,'error');
    }
};

window.loadMoreSavings = () => {
    const user = getCurrentUser();
    if (user) { currentPage++; loadSavings(user,false); }
};

const filterSavings = debounce(() => {
    const searchTerm = $('searchInput').value.toLowerCase();
    const category = $('categoryFilter').value;
    const time = $('timeFilter').value;
    const sort = $('sortFilter').value;
    let filtered = allSavings.filter(s => {
        const matchesSearch = s.amount.toString().includes(searchTerm) || s.category.toLowerCase().includes(searchTerm) || (s.note && s.note.toLowerCase().includes(searchTerm));
        const matchesCategory = category === 'all' || s.category === category;
        let matchesTime = true;
        if (time !== 'all') {
            const savingDate = new Date(s.date);
            const now = new Date();
            if (time === 'today') matchesTime = savingDate.toDateString() === now.toDateString();
            else if (time === 'week') matchesTime = savingDate >= new Date(now.setDate(now.getDate()-now.getDay()));
            else if (time === 'month') matchesTime = savingDate.getMonth() === now.getMonth() && savingDate.getFullYear() === now.getFullYear();
        }
        return matchesSearch && matchesCategory && matchesTime;
    });
    filtered.sort((a,b) => {
        if (sort === 'date-desc') return new Date(b.date)-new Date(a.date);
        if (sort === 'date-asc') return new Date(a.date)-new Date(b.date);
        if (sort === 'amount-desc') return b.amount-a.amount;
        if (sort === 'amount-asc') return a.amount-b.amount;
        return 0;
    });
    renderSavingsGrid(filtered);
},150);

function setupEventListeners() {
    if ($('searchInput')) $('searchInput').addEventListener('input',filterSavings);
    if ($('categoryFilter')) $('categoryFilter').addEventListener('change',filterSavings);
    if ($('timeFilter')) $('timeFilter').addEventListener('change',filterSavings);
    if ($('sortFilter')) $('sortFilter').addEventListener('change',filterSavings);
    
    if ($('logoutBtn')) $('logoutBtn').addEventListener('click',async e => { e.preventDefault(); await logoutUser(); });
    if ($('drawerLogoutBtn')) $('drawerLogoutBtn').addEventListener('click',async e => { e.preventDefault(); await logoutUser(); });
    
    const avatarBtn = $('avatarDropdownToggle'), profileDropdown = $('profileDropdown');
    if (avatarBtn && profileDropdown) {
        avatarBtn.addEventListener('click',e => { e.stopPropagation(); profileDropdown.classList.toggle('open'); });
        document.addEventListener('click',() => profileDropdown.classList.remove('open'));
    }
    
    const mobileMenuBtn = $('mobileMenuBtn'), mobileDrawer = $('mobileDrawer'), drawerOverlay = $('drawerOverlay'), closeDrawerBtn = $('closeDrawerBtn');
    if (mobileMenuBtn && mobileDrawer && drawerOverlay) {
        mobileMenuBtn.addEventListener('click',() => { mobileDrawer.classList.add('open'); drawerOverlay.classList.add('open'); });
        const closeDrawer = () => { mobileDrawer.classList.remove('open'); drawerOverlay.classList.remove('open'); };
        drawerOverlay.addEventListener('click',closeDrawer);
        if (closeDrawerBtn) closeDrawerBtn.addEventListener('click',closeDrawer);
    }
    
    const themeToggle = $('themeToggle');
    if (themeToggle) {
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') { document.documentElement.setAttribute('data-theme','dark'); themeToggle.innerHTML = '<i data-lucide="sun"></i>'; }
        themeToggle.addEventListener('click',() => {
            const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme',newTheme);
            localStorage.setItem('theme',newTheme);
            themeToggle.innerHTML = newTheme === 'dark' ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
            lucide.createIcons();
        });
    }
}

window.exportToCSV = () => {
    if (allSavings.length === 0) { showToast('No savings to export','error'); return; }
    const headers = ['Date','Time','Amount','Category','Note'];
    const csvContent = [headers.join(','),...allSavings.map(s => [s.date,s.time||'',s.amount,s.category,`"${s.note||''}"`].join(','))].join('\n');
    const blob = new Blob([csvContent],{type:'text/csv;charset=utf-8;'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `savings_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export successful!','success');
};

window.viewSaving = id => {
    const s = allSavings.find(x => x.id === id);
    if (!s) return;
    const modalHTML = `
        <div class="modal active" id="savingModal" style="display:flex;align-items:center;justify-content:center;z-index:10000;">
            <div class="modal-content" style="max-width:600px;padding:2rem;position:relative;">
                <button onclick="closeSavingModal()" style="position:absolute;top:1.25rem;right:1.25rem;background:none;border:none;cursor:pointer;color:var(--text-secondary);display:flex;align-items:center;"><i data-lucide="x" style="width:20px;height:20px;"></i></button>
                <h2 style="margin-bottom:1.5rem;font-size:1.5rem;letter-spacing:-0.02em;">Saving Details</h2>
                ${s.imageURL?`<div style="margin-bottom:1.5rem;text-align:center;"><img src="${s.imageURL}" style="width:100%;max-height:300px;object-fit:contain;border-radius:var(--radius-md);border:1px solid var(--border-color);"></div>`:''}
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;">
                    <div><div style="color:var(--text-secondary);font-size:0.8rem;font-weight:600;margin-bottom:4px;">Amount</div><div style="font-size:1.5rem;font-weight:800;color:var(--text-primary);">₹${s.amount.toLocaleString()}</div></div>
                    <div><div style="color:var(--text-secondary);font-size:0.8rem;font-weight:600;margin-bottom:4px;">Category</div><div style="font-size:1.5rem;font-weight:800;color:var(--text-primary);">${s.category}</div></div>
                </div>
                <div style="margin-bottom:1.5rem;"><div style="color:var(--text-secondary);font-size:0.8rem;font-weight:600;margin-bottom:4px;">Date & Time</div><div style="font-size:1.1rem;color:var(--text-primary);font-weight:600;">${new Date(s.date).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}${s.time?` at ${s.time}`:''}</div></div>
                ${s.note?`<div style="margin-bottom:1.5rem;"><div style="color:var(--text-secondary);font-size:0.8rem;font-weight:600;margin-bottom:4px;">Note</div><div style="font-size:0.95rem;line-height:1.6;color:var(--text-primary);">${s.note}</div></div>`:''}
                <div style="margin-bottom:1.75rem;padding:1rem;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:var(--radius-md);"><div style="color:var(--text-secondary);font-size:0.8rem;font-weight:600;margin-bottom:4px;">Running Total</div><div style="font-size:1.5rem;font-weight:800;color:var(--primary);">₹${(s.runningTotal||0).toLocaleString()}</div></div>
                <div style="display:flex;gap:1rem;">
                    <button onclick="editSaving('${s.id}');closeSavingModal();" class="btn btn-secondary" style="flex:1;height:42px;"><i data-lucide="edit" style="width:16px;height:16px;display:inline-block;margin-right:4px;"></i> Edit</button>
                    <button onclick="deleteSavingHandler('${s.id}')" class="btn btn-danger" style="flex:1;height:42px;"><i data-lucide="trash" style="width:16px;height:16px;display:inline-block;margin-right:4px;"></i> Delete</button>
                </div>
            </div>
        </div>
    `;
    const existingModal = $('savingModal');
    if (existingModal) existingModal.remove();
    document.body.insertAdjacentHTML('beforeend',modalHTML);
    lucide.createIcons();
};

window.closeSavingModal = () => { const m = $('savingModal'); if (m) m.remove(); };
window.editSaving = id => window.location.href = `edit-saving.html?id=${id}`;
window.openModal = src => { $('modalImage').src = src; $('imageModal').classList.add('active'); };
window.closeModal = () => $('imageModal').classList.remove('active');
document.addEventListener('keydown',e => { if (e.key === 'Escape') closeModal(); });
