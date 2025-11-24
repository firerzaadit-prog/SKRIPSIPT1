// halamanpertama.js - Dashboard functionality
import { getCurrentUser, logoutUser } from './auth.js';
import { supabase } from './supabaseClient.js';

// Check if user is logged in and display info
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const result = await getCurrentUser();

        if (!result.success || !result.user) {
            alert('Anda belum login. Mengarahkan ke halaman login...');
            window.location.href = 'index.html';
            return;
        }

        // Get additional profile data from profiles table
        let profileData = null;
        try {
            // First try to get profile, create if doesn't exist
            let { data, error } = await supabase
                .from('profiles')
                .select('nama_lengkap, email, avatar_url')
                .eq('id', result.user.id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') { // No rows returned
                    // Profile doesn't exist, create it
                    console.log('Profile not found, creating new profile...');
                    const { data: newProfile, error: createError } = await supabase
                        .from('profiles')
                        .insert({
                            id: result.user.id,
                            nama_lengkap: result.user.user_metadata?.full_name || null,
                            email: result.user.email
                        })
                        .select('nama_lengkap, email, avatar_url')
                        .single();

                    if (createError) {
                        console.error('Error creating profile:', createError);
                    } else {
                        profileData = newProfile;
                        console.log('Profile created successfully');
                    }
                } else if (error.code === '42703') { // Column doesn't exist
                    console.warn('nama_lengkap column not found, trying without it');
                    // Try query without nama_lengkap
                    const { data: fallbackData, error: fallbackError } = await supabase
                        .from('profiles')
                        .select('email, avatar_url')
                        .eq('id', result.user.id)
                        .single();

                    if (fallbackError) {
                        if (fallbackError.code === 'PGRST116') {
                            // Create profile without nama_lengkap
                            const { data: newProfile, error: createError } = await supabase
                                .from('profiles')
                                .insert({
                                    id: result.user.id,
                                    email: result.user.email
                                })
                                .select('email, avatar_url')
                                .single();

                            if (!createError) {
                                profileData = newProfile;
                            }
                        }
                    } else {
                        profileData = fallbackData;
                    }
                } else {
                    console.error('Error fetching profile data:', error);
                }
            } else {
                profileData = data;
            }
        } catch (err) {
            console.error('Error in profile operations:', err);
        }

        // Use nama_lengkap from profiles table, fallback to user_metadata, then email
        const displayName = profileData?.nama_lengkap ||
                          result.user.user_metadata?.full_name ||
                          result.user.email?.split('@')[0] ||
                          'Nama Siswa';

        // Update profile name in header
        const profileName = document.querySelector('.profile-name');
        if (profileName) {
            profileName.textContent = displayName;
        }

        // Update profile avatar in header (use first letter of name or email)
        const profileAvatar = document.querySelector('.profile-avatar');
        if (profileAvatar) {
            const firstLetter = (displayName?.[0] || result.user.email?.[0] || 'U').toUpperCase();
            profileAvatar.src = `https://via.placeholder.com/40x40/4F46E5/FFFFFF?text=${firstLetter}`;
            profileAvatar.alt = `Profile ${firstLetter}`;
        }

        // Update profile info in the profile card
        const profileLargeAvatar = document.querySelector('.profile-large-avatar');
        const profileCardName = document.querySelector('.profile-card h4');
        const profileCardEmail = document.querySelector('.profile-card p');

        if (profileLargeAvatar) {
            const firstLetter = (displayName?.[0] || result.user.email?.[0] || 'U').toUpperCase();
            profileLargeAvatar.src = `https://via.placeholder.com/80x80/4F46E5/FFFFFF?text=${firstLetter}`;
        }

        if (profileCardName) {
            profileCardName.textContent = displayName;
        }

        if (profileCardEmail) {
            profileCardEmail.textContent = profileData?.email || result.user.email || 'email@siswa.sch.id';
        }

        console.log('User info displayed successfully:', { user: result.user, profile: profileData });

    } catch (error) {
        console.error('Error loading user info:', error);
        alert('Terjadi kesalahan saat memuat data pengguna.');
        window.location.href = 'index.html';
    }
});

// Handle logout functionality
document.addEventListener('click', async (e) => {
    // Check if clicked on profile dropdown icon or logout link
    if (e.target.closest('.profile-dropdown-icon') || e.target.classList.contains('profile-dropdown-icon') ||
        e.target.closest('.logout-link') || e.target.classList.contains('logout-link')) {
        if (confirm('Apakah Anda ingin logout?')) {
            try {
                const result = await logoutUser();
                if (result.success) {
                    alert('Logout berhasil!');
                    window.location.href = 'index.html';
                } else {
                    alert('Logout gagal: ' + result.error);
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
    }
});