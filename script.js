import { auth, db } from './firebase-config.js';

// DOM Elements
const mainContent = document.querySelector('.main-content');
const navLinks = document.querySelectorAll('.sidebar nav a');
const authText = document.querySelector('.auth-text');

// App State
let currentUser = null;
let userSchedule = {};
let userGroups = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Check auth state
    auth.onAuthStateChanged(user => {
        currentUser = user;
        if (user) {
            // User is signed in
            authText.textContent = 'Logout';
            loadUserData(user.uid);
            showSection('dashboard');
        } else {
            // No user is signed in
            authText.textContent = 'Login/SignUp';
            showSection('login');
        }
    });

    // Navigation click handler
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            // Handle logout
            if (targetId === 'login' && currentUser) {
                auth.signOut();
                return;
            }
            
            // Update active nav
            navLinks.forEach(navLink => navLink.parentElement.classList.remove('active'));
            this.parentElement.classList.add('active');
            
            // Show section
            showSection(targetId);
        });
    });

    // Initial load
    loadAllTemplates();
});

// Section templates
const sections = {
    dashboard: `
        <div class="dashboard-section">
            <h1>Welcome to TimeBuddy!</h1>
            <div class="stats-container">
                <div class="stat-card">
                    <h3>Upcoming</h3>
                    <p>You have 2 events scheduled today</p>
                </div>
                <div class="stat-card">
                    <h3>Groups</h3>
                    <p>3 groups need scheduling</p>
                </div>
                <div class="stat-card">
                    <h3>Lecturer</h3>
                    <p>1 pending consultation</p>
                </div>
            </div>
            <div class="activity-container">
                <div class="recent-activity">
                    <h3>Recent Activity</h3>
                    <ul>
                        <li>
                            <i class="fas fa-users"></i>
                            <span>Group Meeting scheduled for Friday, 2:00 PM</span>
                            <small>30 minutes ago</small>
                        </li>
                        <li>
                            <i class="fas fa-chalkboard-teacher"></i>
                            <span>DR. Chen confirmed your consultation request</span>
                            <small>2 hours ago</small>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    `,
    
    timetable: `
        <div class="timetable-section">
            <h1>My Timetable</h1>
            <div class="manual-entry">
                <div class="schedule-grid"></div>
                <button id="save-schedule">Save Schedule</button>
            </div>
            <div class="suggested-times">
                <h3>Available Time Blocks</h3>
                <div class="time-blocks"></div>
            </div>
        </div>
    `,
    
    groups: `
        <div class="groups-section">
            <div class="groups-header">
                <h1>My Groups</h1>
                <div class="group-actions">
                    <button class="create-group-btn">Create Group</button>
                    <div class="join-group">
                        <input type="text" placeholder="Join Group Code">
                        <button>Join</button>
                    </div>
                </div>
            </div>
            <div class="group-list"></div>
        </div>
    `,
    
    lecturer: `
        <div class="lecturer-section">
            <h1>Lecturer Consult</h1>
            <div class="lecturer-tabs">
                <button class="tab-btn active" data-tab="find">Find Lecturer</button>
                <button class="tab-btn" data-tab="request">Request Consultation</button>
                <button class="tab-btn" data-tab="my">My Consultation</button>
            </div>
            <div class="lecturer-content">
                <div class="tab-content active" data-tab="find">
                    <h3>Available Lecturers</h3>
                    <div class="lecturer-list"></div>
                </div>
                <div class="tab-content" data-tab="request">
                    <h3>Request Consultation</h3>
                    <form class="consult-form">
                        <div class="form-group">
                            <label>Select Lecturer</label>
                            <select>
                                <option>Prof. Lee</option>
                                <option>Dr. Chen</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Consultation Topic</label>
                            <input type="text" placeholder="e.g., Discuss assignment">
                        </div>
                        <button type="submit">Request</button>
                    </form>
                </div>
                <div class="tab-content" data-tab="my">
                    <h3>My Consultations</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>Lecturer</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        </div>
    `,
    
    login: `
        <div class="login-section">
            <div class="auth-container">
                <div class="auth-header">
                    <h1>Time</h1>
                </div>
                <form class="auth-form">
                    <div class="form-group">
                        <label>Email/Username</label>
                        <input type="text" placeholder="Enter your email">
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" placeholder="Enter your password">
                    </div>
                    <a href="#" class="forgot-password">Forgot Password?</a>
                    <button type="submit" class="auth-btn">Login</button>
                    <div class="auth-footer">
                        <p>Don't have an account? <a href="#" class="signup-link">Sign Up</a></p>
                    </div>
                </form>
            </div>
        </div>
    `
};

// Load all section templates
function loadAllTemplates() {
    // Will be populated when showing sections
}

// Show a specific section
function showSection(sectionId) {
    mainContent.innerHTML = sections[sectionId] || sections['dashboard'];
    
    // Initialize section-specific functionality
    switch(sectionId) {
        case 'timetable':
            initTimetable();
            break;
        case 'groups':
            initGroups();
            break;
        case 'lecturer':
            initLecturer();
            break;
        case 'login':
            initAuth();
            break;
    }
}

// Initialize timetable section
function initTimetable() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [];
    
    // Generate time slots from 8AM to 8PM
    for (let hour = 8; hour <= 20; hour++) {
        timeSlots.push(`${hour}:00 - ${hour + 1}:00`);
    }
    
    const grid = document.querySelector('.schedule-grid');
    grid.innerHTML = '';
    
    days.forEach(day => {
        const dayCol = document.createElement('div');
        dayCol.className = 'day-column';
        dayCol.innerHTML = `<div class="day-header">${day}</div>`;
        
        timeSlots.forEach(slot => {
            const slotEl = document.createElement('div');
            slotEl.className = 'time-slot';
            slotEl.textContent = slot;
            slotEl.dataset.day = day;
            slotEl.dataset.slot = slot;
            
            // Check if this slot is already selected
            if (userSchedule[day]?.includes(slot)) {
                slotEl.classList.add('selected');
            }
            
            slotEl.addEventListener('click', () => {
                slotEl.classList.toggle('selected');
            });
            
            dayCol.appendChild(slotEl);
        });
        
        grid.appendChild(dayCol);
    });
    
    // Save schedule button
    document.getElementById('save-schedule').addEventListener('click', saveSchedule);
}

// Save schedule to Firestore
async function saveSchedule() {
    if (!currentUser) return;
    
    const selectedSlots = document.querySelectorAll('.time-slot.selected');
    const newSchedule = {};
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    // Initialize empty days
    days.forEach(day => { newSchedule[day] = []; });
    
    // Collect selected slots
    selectedSlots.forEach(slot => {
        const day = slot.dataset.day;
        const time = slot.dataset.slot;
        newSchedule[day].push(time);
    });
    
    try {
        await db.collection('schedules').doc(currentUser.uid).set(newSchedule);
        userSchedule = newSchedule;
        alert('Schedule saved successfully!');
        updateSuggestedTimes();
    } catch (error) {
        alert('Error saving schedule: ' + error.message);
    }
}

// Initialize groups section
function initGroups() {
    document.querySelector('.create-group-btn').addEventListener('click', createGroup);
    document.querySelector('.join-group button').addEventListener('click', joinGroup);
    renderGroups();
}

// Create a new group
async function createGroup() {
    if (!currentUser) {
        alert('Please login to create a group');
        return;
    }
    
    const groupName = prompt('Enter group name:');
    if (!groupName) return;
    
    try {
        const groupRef = await db.collection('groups').add({
            name: groupName,
            creator: currentUser.uid,
            members: [currentUser.uid],
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        alert(`Group "${groupName}" created successfully!`);
        loadUserData(currentUser.uid);
    } catch (error) {
        alert('Error creating group: ' + error.message);
    }
}

// Initialize authentication
function initAuth() {
    const authForm = document.querySelector('.auth-form');
    const signupLink = document.querySelector('.signup-link');
    
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = authForm.querySelector('input[type="text"]').value;
        const password = authForm.querySelector('input[type="password"]').value;
        
        try {
            await auth.signInWithEmailAndPassword(email, password);
        } catch (error) {
            alert('Login error: ' + error.message);
        }
    });
    
    signupLink.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = prompt('Enter your email:');
        if (!email) return;
        
        const password = prompt('Enter a password (min 6 characters):');
        if (!password || password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }
        
        try {
            await auth.createUserWithEmailAndPassword(email, password);
            await db.collection('users').doc(auth.currentUser.uid).set({
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            alert('Signup error: ' + error.message);
        }
    });
}

// Load user data from Firestore
async function loadUserData(userId) {
    try {
        // Load schedule
        const scheduleDoc = await db.collection('schedules').doc(userId).get();
        if (scheduleDoc.exists) {
            userSchedule = scheduleDoc.data();
        }
        
        // Load groups
        const groupsQuery = await db.collection('groups')
            .where('members', 'array-contains', userId)
            .get();
        
        userGroups = groupsQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Update UI
        if (document.querySelector('.timetable-section')) {
            initTimetable();
        }
        if (document.querySelector('.groups-section')) {
            renderGroups();
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Render groups list
function renderGroups() {
    const groupList = document.querySelector('.group-list');
    if (!groupList) return;
    
    groupList.innerHTML = '';
    
    userGroups.forEach(group => {
        const groupCard = document.createElement('div');
        groupCard.className = 'group-card';
        groupCard.innerHTML = `
            <div class="group-info">
                <h3>${group.name}</h3>
                <p>${group.members?.length || 0} members</p>
                <p>Created ${formatDate(group.createdAt?.toDate())}</p>
            </div>
            <div class="group-actions">
                <button class="access-btn">Access Timetable</button>
                <button class="add-member-btn">Add Member</button>
            </div>
        `;
        groupList.appendChild(groupCard);
    });
}

// Helper function to format dates
function formatDate(date) {
    if (!date) return 'recently';
    return date.toLocaleDateString();
}