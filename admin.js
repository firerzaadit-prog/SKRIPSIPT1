// admin.js - Admin panel functionality
import { supabase } from './supabaseClient.js';

// Admin credentials (in production, use proper authentication)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// DOM Elements
const adminLoginSection = document.getElementById('adminLoginSection');
const adminDashboard = document.getElementById('adminDashboard');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');
const usersTableBody = document.getElementById('usersTableBody');

// Stats elements
const totalUsersEl = document.getElementById('totalUsers');
const activeUsersEl = document.getElementById('activeUsers');

// Check if admin is logged in on page load
document.addEventListener('DOMContentLoaded', () => {
    const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';

    if (isAdminLoggedIn) {
        showAdminDashboard();
    } else {
        showAdminLogin();
    }

    // Setup password toggle for admin login
    setupPasswordToggle();
});

// Admin login form handler
if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;

        // Simple authentication (in production, use proper auth)
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            localStorage.setItem('adminLoggedIn', 'true');
            showAdminDashboard();
        } else {
            alert('Username atau password admin salah!');
        }
    });
}

// Admin logout handler
if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
        localStorage.removeItem('adminLoggedIn');
        showAdminLogin();
    });
}

// Show admin login form
function showAdminLogin() {
    adminLoginSection.style.display = 'block';
    adminDashboard.classList.remove('show');
}

// Show admin dashboard
async function showAdminDashboard() {
    adminLoginSection.style.display = 'none';
    adminDashboard.classList.add('show');

    // Load admin data
    await loadAdminStats();
    await loadUsersData();
}

// Load admin statistics
async function loadAdminStats() {
    try {
        // Get total users
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, nama_lengkap, email, created_at');

        if (error) {
            console.error('Error loading admin stats:', error);
            return;
        }

        // Update stats
        const totalUsers = profiles.length;
        totalUsersEl.textContent = totalUsers;

        // For demo purposes, assume all users are active
        activeUsersEl.textContent = totalUsers;

    } catch (error) {
        console.error('Error in loadAdminStats:', error);
    }
}

// Load users data for management
async function loadUsersData() {
    try {
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, nama_lengkap, email, created_at')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading users data:', error);
            return;
        }

        // Clear existing table rows
        usersTableBody.innerHTML = '';

        // Populate table with user data
        profiles.forEach(profile => {
            const row = createUserTableRow(profile);
            usersTableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Error in loadUsersData:', error);
    }
}

// Create table row for user
function createUserTableRow(profile) {
    const row = document.createElement('tr');

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID');
    };

    row.innerHTML = `
        <td>${profile.nama_lengkap || 'N/A'}</td>
        <td>${profile.email || 'N/A'}</td>
        <td><span class="status-badge status-active">Aktif</span></td>
        <td>${formatDate(profile.created_at)}</td>
        <td>
            <button class="logout-btn" onclick="viewUserDetails('${profile.id}')">
                <i class="fas fa-eye"></i> Lihat
            </button>
        </td>
    `;

    return row;
}

// View user details (placeholder function)
function viewUserDetails(userId) {
    alert(`Fitur detail user untuk ID: ${userId} akan ditambahkan di versi mendatang.`);
}

// Setup password toggle for admin login
function setupPasswordToggle() {
    const toggleBtn = document.getElementById('toggleAdminPassword');
    const passwordInput = document.getElementById('adminPassword');

    if (toggleBtn && passwordInput) {
        toggleBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            toggleBtn.classList.toggle('fa-eye-slash');
        });
    }
}

// Export functions for global access
window.viewUserDetails = viewUserDetails;