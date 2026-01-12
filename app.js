// Data Mock
const tables = [
    { id: 1, status: 'available', type: 'regular', rate: 50000 },
    { id: 2, status: 'available', type: 'regular', rate: 50000 },
    { id: 3, status: 'occupied', type: 'regular', rate: 50000 },
    { id: 4, status: 'available', type: 'regular', rate: 50000 },
    { id: 5, status: 'occupied', type: 'regular', rate: 50000 },
    { id: 6, status: 'available', type: 'regular', rate: 50000 },
    { id: 7, status: 'available', type: 'vip', rate: 70000 },
    { id: 8, status: 'occupied', type: 'vip', rate: 70000 },
    { id: 9, status: 'available', type: 'vip', rate: 70000 },
];

const menuItems = [
    // Drinks
    { id: 1, name: 'Signature Iced Coffee', price: 35000, category: 'Drinks', desc: 'Premium arabica with fresh milk and palm sugar', img: 'iced_coffee.png', stock: 15 },
    { id: 2, name: 'Blue Lagoon Mocktail', price: 32000, category: 'Drinks', desc: 'Refreshing soda with blue curacao and lemon', img: 'blue_lagoon.png', stock: 10 },
    { id: 3, name: 'Matcha Latte Premium', price: 38000, category: 'Drinks', desc: 'Pure matcha from Kyoto with oat milk', img: 'matcha_latte.png', stock: 8 },
    { id: 4, name: 'Caramel Macchiato', price: 40000, category: 'Drinks', desc: 'Espresso with vanilla syrup and caramel drizzle', img: 'caramel_macchiato.png', stock: 12 },
    { id: 5, name: 'Fresh Strawberry Mojito', price: 35000, category: 'Drinks', desc: 'Mint, lime, soda, and fresh strawberry', img: 'strawberry_mojito.png', stock: 10 },
    { id: 6, name: 'Earl Grey Milk Tea', price: 30000, category: 'Drinks', desc: 'Classic tea blend with creamy milk', img: 'milk_tea.png', stock: 20 },

    // Snacks & Food
    { id: 7, name: 'Truffle French Fries', price: 45000, category: 'Snacks', desc: 'Crispy fries with truffle oil and parmesan', img: 'truffle_fries.png', stock: 15 },
    { id: 8, name: 'Crispy Calamari Rings', price: 48000, category: 'Snacks', desc: 'Served with tartar sauce and lemon', img: 'calamari.png', stock: 10 },
    { id: 9, name: 'Spicy Buffalo Wings', price: 55000, category: 'Snacks', desc: '6pcs wings tossed in signature hot sauce', img: 'buffalo_wings.png', stock: 12 },
    { id: 10, name: 'Beef Nacho Supreme', price: 60000, category: 'Snacks', desc: 'Tortilla chips, ground beef, cheese, salsa, guacamole', img: 'nachos.png', stock: 8 },
    { id: 11, name: 'Club Sandwich', price: 50000, category: 'Snacks', desc: 'Triple decker with chicken, egg, lettuce, tomato', img: 'club_sandwich.png', stock: 10 },
    { id: 12, name: 'Onion Rings Tower', price: 35000, category: 'Snacks', desc: 'Golden fried onion rings with BBQ sauce', img: 'onion_rings.png', stock: 15 },
];

// State
let selectedTable = null;
let selectedDuration = 60;
let cart = [];
let wantsBilliard = false;
let currentTableType = 'regular'; // 'regular' or 'vip'
let totalRevenue = 0;
let transactionHistory = [];
let upgradingTableId = null;
let selectedUpgradeVipId = null;
let activeSessions = {}; // { [tableId]: { remaining, total, interval, type } }

// Initialize
function init() {
    renderTables();
    renderMenu();
    setupSoundEffects();
}

function setupSoundEffects() {
    // Add audio elements dynamically if they don't exist
    if (!document.getElementById('click-sound')) {
        const click = document.createElement('audio');
        click.id = 'click-sound';
        click.src = 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3';
        document.body.appendChild(click);
    }
}

function playClick() {
    const snd = document.getElementById('click-sound');
    if (snd) {
        snd.currentTime = 0;
        snd.play();
    }
}

function switchTab(tab) {
    playClick();
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    if (tab === 'booking') {
        document.querySelector('.nav-btn[onclick="switchTab(\'booking\')"]').classList.add('active');
    } else if (tab === 'cafe') {
        document.querySelector('.nav-btn[onclick="switchTab(\'cafe\')"]').classList.add('active');
    } else if (tab === 'admin') {
        document.querySelector('.nav-btn[onclick="switchTab(\'admin\')"]').classList.add('active');
    }

    const sections = ['booking-section', 'cafe-section', 'welcome-section', 'admin-section'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden-section');
            el.classList.remove('active-section');
        }
    });

    let targetId = '';
    if (tab === 'booking') targetId = 'booking-section';
    else if (tab === 'cafe') targetId = 'cafe-section';
    else if (tab === 'admin') targetId = 'admin-section';
    else targetId = 'welcome-section';

    const targetEl = document.getElementById(targetId);
    if (targetEl) {
        targetEl.classList.remove('hidden-section');
        targetEl.classList.add('active-section');
    }
}

// Booking Logic
function switchTableType(type) {
    playClick();
    currentTableType = type;
    document.querySelectorAll('.type-tab').forEach(btn => {
        btn.classList.toggle('active', btn.innerText.toLowerCase().includes(type));
    });
    renderTables();
}

function renderTables() {
    const grid = document.getElementById('table-grid');
    const filteredTables = tables.filter(t => t.type === currentTableType);

    grid.innerHTML = `
        <div class="floor-plan-container">
            ${currentTableType === 'regular' ? `
                <div class="floor-decor entrance">Entrance</div>
                <div class="floor-decor bar-counter">Mini Bar</div>
            ` : `
                <div class="floor-decor vip-area-label">EXCLUSIVE VIP AREA</div>
            `}
            ${filteredTables.map((table, index) => {
        const displayId = table.type === 'vip' ? `VIP 0${index + 1}` : table.id;
        return `
                    <div class="table-btn ${table.status} ${table.type} table-pos-${table.id}" 
                         onclick="selectTable(${table.id})"
                         id="table-${table.id}">
                        <div class="table-label">${displayId}</div>
                        ${table.type === 'vip' ? '<span class="vip-badge-mini">ROOM</span>' : ''}
                    </div>
                `;
    }).join('')}
        </div>
    `;
}

function updateDurationLabels(rate) {
    const fiveMin = Math.round((rate / 60) * 5);
    const sixtyMin = rate;
    const ninetyMin = Math.round((rate / 60) * 90);
    const oneTwentyMin = rate * 2;

    document.getElementById('duration-5').innerText = `5 Mins (Rp ${fiveMin.toLocaleString()})`;
    document.getElementById('duration-60').innerText = `1 Hr (Rp ${sixtyMin.toLocaleString()})`;
    document.getElementById('duration-90').innerText = `1.5 Hrs (Rp ${ninetyMin.toLocaleString()})`;
    document.getElementById('duration-120').innerText = `2 Hrs (Rp ${oneTwentyMin.toLocaleString()})`;
}

function selectTable(id) {
    playClick();
    const table = tables.find(t => t.id === id);
    if (table.status === 'occupied') return;

    if (selectedTable) {
        document.getElementById(`table-${selectedTable}`).classList.remove('selected');
    }
    selectedTable = id;
    document.getElementById(`table-${id}`).classList.add('selected');

    updateDurationLabels(table.rate);

    const cafeSelector = document.getElementById('cafe-table-id');
    if (cafeSelector) {
        cafeSelector.value = id;
    }
}

function syncTableSelection(val) {
    if (!val) {
        selectedTable = null;
        document.querySelectorAll('.table-btn').forEach(btn => btn.classList.remove('selected'));
        return;
    }

    const id = parseInt(val);
    const table = tables.find(t => t.id === id);

    if (table.status === 'occupied') return;

    if (selectedTable) {
        const prevBtn = document.getElementById(`table-${selectedTable}`);
        if (prevBtn) prevBtn.classList.remove('selected');
    }

    selectedTable = id;
    const currBtn = document.getElementById(`table-${id}`);
    if (currBtn) currBtn.classList.add('selected');

    updateDurationLabels(table.rate);
}

function selectDuration(minutes) {
    playClick();
    selectedDuration = minutes;
    wantsBilliard = true;
    document.querySelectorAll('.duration-btn').forEach(btn => btn.classList.remove('selected'));
    event.target.classList.add('selected');
}

function startSession(tableId, duration) {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    const totalSeconds = duration * 60;
    activeSessions[tableId] = {
        remaining: totalSeconds,
        total: totalSeconds,
        type: table.type,
        orderStatus: 'preparing', // preparing, cooking, serving, served
        interval: setInterval(() => tick(tableId), 1000)
    };

    // Simulate order status progression
    setTimeout(() => updateOrderStatus(tableId, 'cooking'), 15000);
    setTimeout(() => updateOrderStatus(tableId, 'serving'), 45000);
    setTimeout(() => updateOrderStatus(tableId, 'served'), 90000);

    renderActiveSessions();
}

function updateOrderStatus(tableId, status) {
    if (activeSessions[tableId]) {
        activeSessions[tableId].orderStatus = status;
        renderActiveSessions();
    }
}

function tick(tableId) {
    const session = activeSessions[tableId];
    if (!session) return;

    session.remaining--;

    if (session.remaining <= 0) {
        clearInterval(session.interval);
        timeUp(tableId);
    } else {
        updateSessionUI(tableId);
    }
}

function updateSessionUI(tableId) {
    const session = activeSessions[tableId];
    const countdownEl = document.getElementById(`timer-${tableId}`);
    const progressEl = document.getElementById(`progress-${tableId}`);
    const warningEl = document.getElementById(`warning-${tableId}`);

    if (countdownEl && progressEl) {
        const hours = Math.floor(session.remaining / 3600);
        const minutes = Math.floor((session.remaining % 3600) / 60);
        const seconds = session.remaining % 60;
        countdownEl.innerText = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        const percent = (session.remaining / session.total) * 100;
        progressEl.style.width = `${percent}%`;

        if (session.remaining <= 300 && warningEl) {
            warningEl.classList.remove('hidden');
        }
    }
}

function renderActiveSessions() {
    const container = document.getElementById('active-sessions-list');
    container.innerHTML = Object.keys(activeSessions).map(tableId => {
        const session = activeSessions[tableId];
        const table = tables.find(t => t.id === parseInt(tableId));
        return `
            <div id="session-card-${tableId}" class="glass-panel session-card ${session.type === 'vip' ? 'vip-session' : ''}">
                <div class="session-header">
                    <h3>Table ${tableId} ${session.type === 'vip' ? '<span class="vip-badge">VIP</span>' : ''}</h3>
                    <span class="status-badge">Playing</span>
                </div>
                
                <div class="timer-display">
                    <span id="timer-${tableId}">--:--:--</span>
                </div>
                
                <div class="progress-bar">
                    <div class="progress-fill" id="progress-${tableId}" style="width: 100%"></div>
                </div>

                <!-- Feature 7: Order Tracker -->
                <div class="order-tracker">
                    <p class="tracker-title">☕ Cafe Order Status</p>
                    <div class="status-steps">
                        <div class="step ${['preparing', 'cooking', 'serving', 'served'].includes(session.orderStatus) ? 'active' : ''}">
                            <div class="step-icon">📋</div>
                            <span>Preparing</span>
                        </div>
                        <div class="step ${['cooking', 'serving', 'served'].includes(session.orderStatus) ? 'active' : ''}">
                            <div class="step-icon">🍳</div>
                            <span>Cooking</span>
                        </div>
                        <div class="step ${['serving', 'served'].includes(session.orderStatus) ? 'active' : ''}">
                            <div class="step-icon">🚚</div>
                            <span>Serving</span>
                        </div>
                        <div class="step ${session.orderStatus === 'served' ? 'active' : ''}">
                            <div class="step-icon">✅</div>
                            <span>Served</span>
                        </div>
                    </div>
                </div>

                <button class="add-more-btn" onclick="switchTab('cafe')">
                    ➕ Order More Food/Drinks
                </button>

                ${session.type === 'regular' ? `
                    <button class="upgrade-btn" onclick="openUpgradeModal(${tableId})">
                        ✨ Upgrade to VIP Room
                    </button>
                ` : ''}

                <p class="time-warning hidden" id="warning-${tableId}">⚠️ Time ending soon!</p>
            </div>
        `;
    }).join('');

    Object.keys(activeSessions).forEach(tableId => updateSessionUI(tableId));
}

function timeUp(tableId) {
    const table = tables.find(t => t.id === parseInt(tableId));
    table.status = 'available';
    renderTables();

    const countdownEl = document.getElementById(`timer-${tableId}`);
    const progressEl = document.getElementById(`progress-${tableId}`);
    const cardEl = document.getElementById(`session-card-${tableId}`);

    if (countdownEl) countdownEl.innerText = "TIME'S UP!";
    if (progressEl) progressEl.style.background = "#ef4444";
    if (cardEl) cardEl.classList.add('session-expired');

    document.getElementById('alarm-sound').play();

    // Store for modal
    window.lastEndedTable = tableId;
    showTimesUpModal(tableId);
}

function showTimesUpModal(tableId) {
    document.getElementById('ended-table-id').innerText = tableId;
    document.getElementById('times-up-modal').classList.remove('hidden');
}

function closeTimesUpModal() {
    document.getElementById('times-up-modal').classList.add('hidden');

    const alarm = document.getElementById('alarm-sound');
    alarm.pause();
    alarm.currentTime = 0;

    if (window.lastEndedTable) {
        delete activeSessions[window.lastEndedTable];
        renderActiveSessions();
        window.lastEndedTable = null;
    }

    if (Object.keys(activeSessions).length === 0) {
        switchTab('welcome');
    }
}

// Cafe Logic
let currentCategory = 'Drinks';

function switchCategory(category) {
    currentCategory = category;
    const buttons = document.querySelectorAll('.cat-btn');
    buttons.forEach(btn => btn.innerText === category ? btn.classList.add('active') : btn.classList.remove('active'));
    renderMenu();
}

function renderMenu() {
    const grid = document.getElementById('menu-grid');
    const filteredItems = menuItems.filter(item => item.category === currentCategory);
    grid.innerHTML = filteredItems.map(item => `
        <div class="menu-item ${item.stock === 0 ? 'out-of-stock' : ''}" onclick="${item.stock > 0 ? `addToCart(${item.id})` : ''}">
            <div class="item-img-container">
                <img src="${item.img}" class="item-img">
                ${item.stock === 0 ? '<div class="stock-overlay">OUT OF STOCK</div>' : ''}
            </div>
            <div class="item-content">
                <div class="item-header">
                    <span class="item-name">${item.name}</span>
                    <span class="item-price">Rp ${item.price.toLocaleString()}</span>
                </div>
                <p class="item-desc">${item.desc}</p>
                <div class="item-footer">
                    <span class="stock-label">Stock: ${item.stock}</span>
                    <!-- Feature 4: Note Input -->
                    <input type="text" placeholder="Add note..." 
                           class="note-input" id="note-${item.id}" 
                           onclick="event.stopPropagation()">
                </div>
            </div>
        </div>
    `).join('');
}

function addToCart(id) {
    playClick();
    const item = menuItems.find(i => i.id === id);
    if (item.stock <= 0) return alert("Sorry, this item is out of stock.");

    // Decrement stock immediately on add (or handle on successful payment)
    // We'll decrement on add for immediate feedback
    item.stock--;

    const noteEl = document.getElementById(`note-${id}`);
    const note = noteEl ? noteEl.value : "";
    cart.push({ ...item, note: note, originalIndex: menuItems.indexOf(item) });
    if (noteEl) noteEl.value = '';
    renderCart();
    renderMenu();
}

function removeFromCart(index) {
    playClick();
    const removedItem = cart[index];
    // Return stock
    menuItems[removedItem.originalIndex].stock++;
    cart.splice(index, 1);
    renderCart();
    renderMenu();
}

function clearCart() {
    playClick();
    if (cart.length === 0) return;
    if (confirm("Clear all items in your cart?")) {
        // Return all stock
        cart.forEach(item => {
            menuItems[item.originalIndex].stock++;
        });
        cart = [];
        renderCart();
        renderMenu();
    }
}

function renderCart() {
    const container = document.getElementById('cart-items');
    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart">Cart is empty</p>';
        document.getElementById('cart-total').innerText = 'Rp 0';
        return;
    }

    container.innerHTML = `
        <div class="cart-header-actions">
            <button class="clear-cart-btn" onclick="clearCart()">🗑️ Clear All</button>
        </div>
        ${cart.map((item, index) => `
            <div class="cart-item-wrapper">
                <div class="cart-item">
                    <span>${item.name}</span>
                    <div class="cart-item-right">
                        <span>Rp ${item.price.toLocaleString()}</span>
                        <button class="remove-item-btn" onclick="removeFromCart(${index})">&times;</button>
                    </div>
                </div>
                ${item.note ? `<span class="cart-note">Note: ${item.note}</span>` : ''}
            </div>
        `).join('')}
    `;
    document.getElementById('cart-total').innerText = `Rp ${cart.reduce((s, i) => s + i.price, 0).toLocaleString()}`;
}

// Payment Logic
function placeOrder() {
    const isTableActive = activeSessions[selectedTable];

    let bookingCost = 0;
    if (selectedTable && wantsBilliard && !isTableActive) {
        const table = tables.find(t => t.id === selectedTable);
        bookingCost = selectedDuration === 5 ? (table.rate / 60) * 5 : (selectedDuration / 60) * table.rate;
    }

    const cafeCost = cart.reduce((s, i) => s + i.price, 0);

    if (bookingCost + cafeCost === 0) return alert("Please select a table or order something first.");
    if (!selectedTable) return alert("Please select a table number first.");

    renderBill(bookingCost, cafeCost, isTableActive);
    document.getElementById('payment-modal').classList.remove('hidden');
}

function renderBill(booking, cafe, isAddOn) {
    const billBilliard = document.getElementById('bill-billiard');
    const table = tables.find(t => t.id === selectedTable);

    if (booking > 0) {
        billBilliard.innerHTML = `
            <h4>Billiard Reservation</h4>
            <div class="bill-row ${table.type === 'vip' ? 'bill-row-vip' : ''}">
                <span>Table ${selectedTable} ${table.type === 'vip' ? '<span class="vip-badge">VIP ROOM</span>' : '(Regular)'}</span>
                <span>Rp ${booking.toLocaleString()}</span>
            </div>
            <div class="bill-row"><span>Duration: ${selectedDuration} mins</span></div>
        `;
    } else if (isAddOn) {
        billBilliard.innerHTML = `
            <div class="add-on-tag">ADD-ON ORDER (Table ${selectedTable})</div>
        `;
    } else billBilliard.innerHTML = '';

    const billCafe = document.getElementById('bill-cafe');
    if (cart.length > 0) {
        billCafe.innerHTML = `<h4>Cafe Order</h4>` + cart.map(item => `
            <div class="bill-row">
                <span>${item.name} ${item.note ? `<br><small style="color:var(--primary)">(${item.note})</small>` : ''}</span>
                <span>Rp ${item.price.toLocaleString()}</span>
            </div>
        `).join('');
    } else billCafe.innerHTML = '';

    document.getElementById('grand-total').innerText = `Rp ${(booking + cafe).toLocaleString()}`;
}

function closePaymentMode() { document.getElementById('payment-modal').classList.add('hidden'); }

function switchPayment(method) {
    const btns = document.querySelectorAll('.method-btn');
    const contents = document.querySelectorAll('.method-content');
    btns.forEach(b => b.classList.remove('active'));
    contents.forEach(c => c.classList.add('hidden'));
    if (method === 'transfer') { btns[0].classList.add('active'); document.getElementById('method-transfer').classList.remove('hidden'); }
    else { btns[1].classList.add('active'); document.getElementById('method-qris').classList.remove('hidden'); }
}

function copyToClipboard(text) { navigator.clipboard.writeText(text); alert('Account number copied!'); }

function playSuccessTone() {
    // Play relaxing acoustic chime
    const chime = document.getElementById('success-chime');
    if (chime) {
        chime.src = "https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3";
        chime.play();
    }
}

function processPayment() {
    const tableId = selectedTable;
    playSuccessTone();
    const duration = selectedDuration;
    const isBilliard = wantsBilliard;
    const isTableActive = activeSessions[tableId];
    const table = tables.find(t => t.id === tableId);

    const bookingCost = (tableId && isBilliard && !isTableActive) ? (duration === 5 ? (table.rate / 60) * 5 : (duration / 60) * table.rate) : 0;
    const cafeCost = cart.reduce((s, i) => s + i.price, 0);

    showSuccessModal(tableId, bookingCost + cafeCost);

    // LOG TRANSACTION
    const totalAmount = bookingCost + cafeCost;
    if (totalAmount > 0) {
        totalRevenue += totalAmount;
        transactionHistory.push({
            id: Date.now(),
            date: new Date().toLocaleString('id-ID'),
            table: tableId || 'N/A',
            type: isBilliard ? (isTableActive ? 'Add-on' : 'Billiard + Cafe') : 'Cafe Only',
            amount: totalAmount
        });
    }

    if (tableId && isBilliard && !isTableActive) {
        table.status = 'occupied';
        renderTables();
        window.tempSession = { tableId, duration };
    } else if (isTableActive && cafeCost > 0) {
        // Reset order tracker for the add-on
        activeSessions[tableId].orderStatus = 'preparing';
        setTimeout(() => updateOrderStatus(tableId, 'cooking'), 15000);
        setTimeout(() => updateOrderStatus(tableId, 'serving'), 45000);
        setTimeout(() => updateOrderStatus(tableId, 'served'), 90000);
    }

    closePaymentMode();
    cart = [];
    renderCart();

    const isVip = table && table.type === 'vip';
    let msg = "";
    if (isTableActive) msg = "Add-on order successful! Your items are being prepared.";
    else if (!isBilliard) msg = "Your order is being prepared. Enjoy!";
    else msg = isVip ? "VIP Room is ready. Enjoy your premium experience!" : "Your table is ready. Enjoy your game!";

    document.getElementById('success-message').innerText = msg;
    document.getElementById('success-btn').innerText = (isTableActive || !isBilliard) ? "Awesome, Thanks!" : (isVip ? "Enter VIP Room" : "Start Playing Now");
}

function showSuccessModal(tableId, total) {
    document.getElementById('success-table').innerText = `Table ${tableId}`;
    document.getElementById('success-total').innerText = `Rp ${total.toLocaleString()}`;
    document.getElementById('success-modal').classList.remove('hidden');
}

function closeSuccessModal() {
    document.getElementById('success-modal').classList.add('hidden');
    if (window.tempSession) {
        startSession(window.tempSession.tableId, window.tempSession.duration);
        window.tempSession = null;
    } else if (window.isUpgradeSuccess) {
        window.isUpgradeSuccess = false;
        // Stay in current tab or go to booking to see the new VIP session
    } else {
        switchTab('welcome');
    }
    // RESET Selection for next order
    selectedTable = null;
    wantsBilliard = false;
    document.querySelectorAll('.table-btn').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById('duration-60').classList.add('selected');
}

// Admin Logic
let adminSubTab = 'inventory'; // 'inventory' or 'reports'

function switchAdminTab(tab) {
    adminSubTab = tab;
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    if (tab === 'inventory') {
        document.getElementById('inventory-view').classList.remove('hidden-section');
        document.getElementById('reports-view').classList.add('hidden-section');
        renderAdmin();
    } else {
        document.getElementById('inventory-view').classList.add('hidden-section');
        document.getElementById('reports-view').classList.remove('hidden-section');
        renderReports();
    }
}

function renderAdmin() {
    const list = document.getElementById('admin-stock-list');
    list.innerHTML = menuItems.map((item, idx) => `
        <div class="admin-item-row">
            <span>${item.name} (${item.category})</span>
            <div class="admin-stock-control">
                <button onclick="changeStock(${idx}, -1)">-</button>
                <input type="number" value="${item.stock}" onchange="updateStockValue(${idx}, this.value)">
                <button onclick="changeStock(${idx}, 1)">+</button>
            </div>
        </div>
    `).join('');
}

function renderReports() {
    document.getElementById('total-revenue-value').innerText = `Rp ${totalRevenue.toLocaleString()}`;
    const logBody = document.getElementById('transaction-log-body');

    if (transactionHistory.length === 0) {
        logBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">No transactions yet</td></tr>';
        return;
    }

    logBody.innerHTML = transactionHistory.slice().reverse().map(trx => `
        <tr>
            <td>${trx.date}</td>
            <td>Table ${trx.table} (${trx.type})</td>
            <td>Rp ${trx.amount.toLocaleString()}</td>
            <td class="trx-status">Paid</td>
        </tr>
    `).join('');
}

function changeStock(idx, delta) {
    menuItems[idx].stock = Math.max(0, menuItems[idx].stock + delta);
    renderAdmin();
    renderMenu();
}

function updateStockValue(idx, val) {
    menuItems[idx].stock = Math.max(0, parseInt(val));
    renderAdmin();
    renderMenu();
}

function addNewItem(e) {
    e.preventDefault();
    const name = document.getElementById('new-item-name').value;
    const price = parseInt(document.getElementById('new-item-price').value);
    const category = document.getElementById('new-item-category').value;
    const stock = parseInt(document.getElementById('new-item-stock').value);

    const newItem = {
        id: menuItems.length + 1,
        name,
        price,
        category,
        desc: "Custom added item",
        img: category === 'Drinks' ? 'iced_coffee.png' : 'truffle_fries.png',
        stock
    };

    menuItems.push(newItem);
    renderAdmin();
    renderMenu();
    alert("New item added to menu!");
    e.target.reset();
}

// Override switchTab to render admin if needed
const originalSwitchTab = switchTab;
switchTab = function (tab) {
    originalSwitchTab(tab);
    if (tab === 'admin') switchAdminTab(adminSubTab);
};

// Upgrade Logic
function openUpgradeModal(tableId) {
    playClick();
    upgradingTableId = tableId;
    const session = activeSessions[tableId];
    const minsRemaining = Math.ceil(session.remaining / 60);

    document.getElementById('upgrade-remaining').innerText = `${minsRemaining} mins`;
    document.getElementById('upgrade-modal').classList.remove('hidden');
    renderVipOptions();
}

function closeUpgradeModal() {
    document.getElementById('upgrade-modal').classList.add('hidden');
    upgradingTableId = null;
    selectedUpgradeVipId = null;
}

function renderVipOptions() {
    const list = document.getElementById('vip-room-list');
    const availableVip = tables.filter(t => t.type === 'vip' && t.status === 'available');

    if (availableVip.length === 0) {
        list.innerHTML = '<p style="grid-column: span 3; color: var(--danger);">No VIP Rooms currently available</p>';
        return;
    }

    list.innerHTML = availableVip.map(t => `
        <div class="vip-room-option" id="opt-vip-${t.id}" onclick="selectUpgradeVip(${t.id})">
            VIP 0${t.id - 6}
        </div>
    `).join('');
}

function selectUpgradeVip(vipId) {
    playClick();
    selectedUpgradeVipId = vipId;
    document.querySelectorAll('.vip-room-option').forEach(opt => opt.classList.remove('selected'));
    document.getElementById(`opt-vip-${vipId}`).classList.add('selected');

    const cost = calculateUpgradeCost(vipId);
    document.getElementById('upgrade-cost').innerText = `Rp ${cost.toLocaleString()}`;
    document.getElementById('confirm-upgrade-btn').disabled = false;
}

function calculateUpgradeCost(vipId) {
    const session = activeSessions[upgradingTableId];
    const oldTable = tables.find(t => t.id === upgradingTableId);
    const newTable = tables.find(t => t.id === vipId);
    const minsRemaining = session.remaining / 60;

    // Cost = (New Rate - Old Rate) * (Remaining Time / 60)
    const rateDiff = newTable.rate - oldTable.rate;
    return Math.max(0, Math.round((rateDiff / 60) * minsRemaining));
}

function handleUpgradePayment() {
    const cost = calculateUpgradeCost(selectedUpgradeVipId);
    const oldId = upgradingTableId;
    const newId = selectedUpgradeVipId;

    // Transfer logic
    const session = activeSessions[oldId];
    clearInterval(session.interval);

    // Update Tables
    tables.find(t => t.id === oldId).status = 'available';
    const newTable = tables.find(t => t.id === newId);
    newTable.status = 'occupied';

    // Log Revenue
    totalRevenue += cost;
    transactionHistory.push({
        id: Date.now(),
        date: new Date().toLocaleString('id-ID'),
        table: `${oldId} ➔ ${newId}`,
        type: 'Upgrade to VIP',
        amount: cost
    });

    // Create new session
    activeSessions[newId] = {
        remaining: session.remaining,
        total: session.total,
        type: 'vip',
        orderStatus: session.orderStatus,
        interval: setInterval(() => tick(newId), 1000)
    };

    delete activeSessions[oldId];

    closeUpgradeModal();
    renderTables();
    renderActiveSessions();

    window.isUpgradeSuccess = true;
    showSuccessModal(newId, cost);
    document.getElementById('success-message').innerText = `Successfully upgraded to VIP Room 0${newId - 6}!`;
    document.getElementById('success-btn').innerText = "Awesome!";
}

init();
