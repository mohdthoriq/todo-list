  // Global Variables
        let todos = JSON.parse(localStorage.getItem('todos')) || [];
        let editingId = null;
        let currentFilter = { priority: '', status: '' };

        // Initialize app when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            initializeApp();
            checkDeadlineNotifications();
            // Check for notifications every 5 minutes
            setInterval(checkDeadlineNotifications, 5 * 60 * 1000);
        });

        // App Initialization
        function initializeApp() {
            // Set default deadline to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(23, 59);
            document.getElementById('task-deadline').value = formatDateTimeLocal(tomorrow);

            // Event listeners
            setupEventListeners();
            
            // Load and display todos
            loadTodos();
            updateStats();
            loadAnalytics();
        }

        // Event Listeners Setup
        function setupEventListeners() {
            // Navigation
            document.addEventListener('click', function(e) {
                if (e.target.matches('[data-page]')) {
                    e.preventDefault();
                    navigateTo(e.target.dataset.page);
                }
            });

            // Forms
            document.getElementById('add-task-form').addEventListener('submit', addTask);
            document.getElementById('edit-task-form').addEventListener('submit', updateTask);

            // Filters
            document.getElementById('filter-priority').addEventListener('change', filterTasks);
            document.getElementById('filter-status').addEventListener('change', filterTasks);

            // Theme toggle
            document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

            // Mobile menu
            document.getElementById('hamburger').addEventListener('click', toggleSidebar);
            document.getElementById('sidebar-overlay').addEventListener('click', closeSidebar);

            // Modal
            document.getElementById('edit-modal').addEventListener('click', function(e) {
                if (e.target === this) {
                    closeEditModal();
                }
            });
        }

        // Navigation Functions
        function navigateTo(pageId) {
            // Hide all pages
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });

            // Show target page
            document.getElementById(pageId + '-page').classList.add('active');

            // Update nav links
            document.querySelectorAll('.nav-link, .sidebar-menu a').forEach(link => {
                link.classList.remove('active');
            });
            document.querySelectorAll(`[data-page="${pageId}"]`).forEach(link => {
                link.classList.add('active');
            });

            // Load page specific data
            if (pageId === 'analytics') {
                loadAnalytics();
            }

            // Close mobile menu
            closeSidebar();
        }

        function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('open');
            document.getElementById('sidebar-overlay').classList.toggle('active');
            document.getElementById('hamburger').classList.toggle('active');
        }

        function closeSidebar() {
            document.getElementById('sidebar').classList.remove('open');
            document.getElementById('sidebar-overlay').classList.remove('active');
            document.getElementById('hamburger').classList.remove('active');
        }

        // Theme Functions
        function toggleTheme() {
            const currentTheme = document.body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            const icon = document.querySelector('#theme-toggle i');
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            
            // Reload charts with new theme
            if (document.getElementById('analytics-page').classList.contains('active')) {
                loadAnalytics();
            }
        }

        // Load saved theme
        function loadTheme() {
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.body.setAttribute('data-theme', savedTheme);
            const icon = document.querySelector('#theme-toggle i');
            icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }

        // Todo Functions
        function addTask(e) {
            e.preventDefault();
            
            const title = document.getElementById('task-title').value.trim();
            const description = document.getElementById('task-description').value.trim();
            const priority = document.getElementById('task-priority').value;
            const difficulty = parseInt(document.getElementById('task-difficulty').value);
            const deadline = document.getElementById('task-deadline').value;

            if (!title || !deadline) {
                showNotification('Judul dan deadline harus diisi!', 'error');
                return;
            }

            const newTodo = {
                id: Date.now().toString(),
                title,
                description,
                priority,
                difficulty,
                deadline: new Date(deadline),
                completed: false,
                createdAt: new Date(),
                completedAt: null
            };

            todos.push(newTodo);
            saveTodos();
            loadTodos();
            updateStats();
            
            // Reset form
            document.getElementById('add-task-form').reset();
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(23, 59);
            document.getElementById('task-deadline').value = formatDateTimeLocal(tomorrow);
            
            showNotification('Tugas berhasil ditambahkan!', 'success');
            
            // Navigate back to dashboard
            navigateTo('dashboard');
        }

        function updateTask(e) {
            e.preventDefault();
            
            const id = document.getElementById('edit-task-id').value;
            const title = document.getElementById('edit-task-title').value.trim();
            const description = document.getElementById('edit-task-description').value.trim();
            const priority = document.getElementById('edit-task-priority').value;
            const difficulty = parseInt(document.getElementById('edit-task-difficulty').value);
            const deadline = document.getElementById('edit-task-deadline').value;

            if (!title || !deadline) {
                showNotification('Judul dan deadline harus diisi!', 'error');
                return;
            }

            const todoIndex = todos.findIndex(todo => todo.id === id);
            if (todoIndex !== -1) {
                todos[todoIndex] = {
                    ...todos[todoIndex],
                    title,
                    description,
                    priority,
                    difficulty,
                    deadline: new Date(deadline)
                };
                
                saveTodos();
                loadTodos();
                updateStats();
                closeEditModal();
                showNotification('Tugas berhasil diperbarui!', 'success');
            }
        }

        function toggleComplete(id) {
            const todoIndex = todos.findIndex(todo => todo.id === id);
            if (todoIndex !== -1) {
                todos[todoIndex].completed = !todos[todoIndex].completed;
                todos[todoIndex].completedAt = todos[todoIndex].completed ? new Date() : null;
                
                saveTodos();
                loadTodos();
                updateStats();
                
                const action = todos[todoIndex].completed ? 'diselesaikan' : 'dibuka kembali';
                showNotification(`Tugas ${action}!`, 'success');
            }
        }

        function editTask(id) {
            const todo = todos.find(t => t.id === id);
            if (!todo) return;

            document.getElementById('edit-task-id').value = todo.id;
            document.getElementById('edit-task-title').value = todo.title;
            document.getElementById('edit-task-description').value = todo.description || '';
            document.getElementById('edit-task-priority').value = todo.priority;
            document.getElementById('edit-task-difficulty').value = todo.difficulty;
            document.getElementById('edit-task-deadline').value = formatDateTimeLocal(new Date(todo.deadline));

            document.getElementById('edit-modal').style.display = 'flex';
        }

        function deleteTask(id) {
            if (confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
                todos = todos.filter(todo => todo.id !== id);
                saveTodos();
                loadTodos();
                updateStats();
                showNotification('Tugas berhasil dihapus!', 'success');
            }
        }

        function deleteAllTasks() {
            if (confirm('Apakah Anda yakin ingin menghapus SEMUA tugas? Tindakan ini tidak dapat dibatalkan!')) {
                todos = [];
                saveTodos();
                loadTodos();
                updateStats();
                showNotification('Semua tugas berhasil dihapus!', 'success');
            }
        }

        function closeEditModal() {
            document.getElementById('edit-modal').style.display = 'none';
        }

        function resetForm() {
            document.getElementById('add-task-form').reset();
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(23, 59);
            document.getElementById('task-deadline').value = formatDateTimeLocal(tomorrow);
        }

        // Filter Functions
        function filterTasks() {
            currentFilter.priority = document.getElementById('filter-priority').value;
            currentFilter.status = document.getElementById('filter-status').value;
            loadTodos();
        }

        function applyFilters(todoList) {
            return todoList.filter(todo => {
                const priorityMatch = !currentFilter.priority || todo.priority === currentFilter.priority;
                const statusMatch = !currentFilter.status || 
                    (currentFilter.status === 'completed' && todo.completed) ||
                    (currentFilter.status === 'pending' && !todo.completed);
                
                return priorityMatch && statusMatch;
            });
        }

        // Display Functions
        function loadTodos() {
            const todoList = document.getElementById('todo-list');
            const filteredTodos = applyFilters(todos);
            
            // Show/hide delete all button
            const deleteAllBtn = document.getElementById('delete-all-btn');
            deleteAllBtn.style.display = todos.length > 0 ? 'inline-flex' : 'none';
            
            if (filteredTodos.length === 0) {
                const emptyMessage = todos.length === 0 ? 
                    `<div class="empty-state">
                        <i class="fas fa-clipboard-list"></i>
                        <h3>Belum Ada Tugas</h3>
                        <p>Mulai tambahkan tugas pertama Anda!</p>
                        <button class="btn btn-primary mt-2" onclick="navigateTo('add-task')">
                            <i class="fas fa-plus"></i>
                            Tambah Tugas Pertama
                        </button>
                    </div>` :
                    `<div class="empty-state">
                        <i class="fas fa-filter"></i>
                        <h3>Tidak Ada Tugas yang Sesuai</h3>
                        <p>Coba ubah filter atau tambah tugas baru</p>
                    </div>`;
                
                todoList.innerHTML = emptyMessage;
                return;
            }

            // Sort by priority and deadline
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            filteredTodos.sort((a, b) => {
                if (a.completed !== b.completed) {
                    return a.completed - b.completed; // Completed tasks go to bottom
                }
                if (a.priority !== b.priority) {
                    return priorityOrder[b.priority] - priorityOrder[a.priority]; // Higher priority first
                }
                return new Date(a.deadline) - new Date(b.deadline); // Earlier deadline first
            });

            todoList.innerHTML = filteredTodos.map(todo => {
                const isOverdue = new Date(todo.deadline) < new Date() && !todo.completed;
                const difficultyStars = '⭐'.repeat(todo.difficulty);
                const priorityClass = `priority-${todo.priority}`;
                
                return `
                    <div class="todo-item ${todo.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}">
                        <div class="todo-header">
                            <div>
                                <h3 class="todo-title">${todo.title}</h3>
                                <p class="todo-description">${todo.description || 'Tidak ada deskripsi'}</p>
                                <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem;">
                                    <span class="priority-badge ${priorityClass}">
                                        ${todo.priority === 'high' ? 'Tinggi' : todo.priority === 'medium' ? 'Sedang' : 'Rendah'}
                                    </span>
                                    <span style="background: var(--bg-secondary); padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;">
                                        ${difficultyStars} (${todo.difficulty}/5)
                                    </span>
                                </div>
                            </div>
                            <div class="todo-actions">
                                <button class="btn ${todo.completed ? 'btn-warning' : 'btn-success'}" 
                                        onclick="toggleComplete('${todo.id}')"
                                        title="${todo.completed ? 'Tandai belum selesai' : 'Tandai selesai'}">
                                    <i class="fas ${todo.completed ? 'fa-undo' : 'fa-check'}"></i>
                                </button>
                                <button class="btn btn-primary" onclick="editTask('${todo.id}')" title="Edit tugas">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-danger" onclick="deleteTask('${todo.id}')" title="Hapus tugas">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="todo-meta">
                            <div class="todo-deadline ${isOverdue ? 'overdue' : ''}">
                                <i class="fas ${isOverdue ? 'fa-exclamation-triangle' : 'fa-calendar-alt'}"></i>
                                <span>
                                    ${isOverdue ? 'Terlambat: ' : 'Deadline: '}
                                    ${formatDateTime(new Date(todo.deadline))}
                                </span>
                            </div>
                            ${todo.completed && todo.completedAt ? `
                                <div style="color: var(--success-color); font-size: 0.9rem;">
                                    <i class="fas fa-check-circle"></i>
                                    Selesai: ${formatDateTime(new Date(todo.completedAt))}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        }

        function updateStats() {
            const total = todos.length;
            const completed = todos.filter(t => t.completed).length;
            const pending = total - completed;
            const overdue = todos.filter(t => new Date(t.deadline) < new Date() && !t.completed).length;

            document.getElementById('total-tasks').textContent = total;
            document.getElementById('completed-tasks').textContent = completed;
            document.getElementById('pending-tasks').textContent = pending;
            document.getElementById('overdue-tasks').textContent = overdue;
        }

        // Analytics Functions
        function loadAnalytics() {
            updateAnalyticsStats();
            loadHourlyChart();
            loadDailyChart();
            loadDifficultyChart();
            loadHardestTasksList();
        }

        function updateAnalyticsStats() {
            const completedTodos = todos.filter(t => t.completed);
            const total = todos.length;
            
            // Completion rate
            const completionRate = total > 0 ? Math.round((completedTodos.length / total) * 100) : 0;
            document.getElementById('completion-rate').textContent = completionRate + '%';
            
            // Average difficulty
            const avgDifficulty = completedTodos.length > 0 ? 
                (completedTodos.reduce((sum, t) => sum + t.difficulty, 0) / completedTodos.length).toFixed(1) : 0;
            document.getElementById('avg-difficulty').textContent = avgDifficulty;
            
            // Hardest completed task
            const hardestCompleted = completedTodos.length > 0 ? 
                Math.max(...completedTodos.map(t => t.difficulty)) : 0;
            document.getElementById('hardest-completed').textContent = hardestCompleted + '⭐';
            
            // Most productive day
            const dayCompletions = {};
            const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            
            completedTodos.forEach(todo => {
                if (todo.completedAt) {
                    const day = new Date(todo.completedAt).getDay();
                    dayCompletions[day] = (dayCompletions[day] || 0) + 1;
                }
            });
            
            const mostProductiveDay = Object.keys(dayCompletions).length > 0 ? 
                dayNames[Object.keys(dayCompletions).reduce((a, b) => dayCompletions[a] > dayCompletions[b] ? a : b)] : '-';
            document.getElementById('most-productive-day').textContent = mostProductiveDay;
        }

        function loadHourlyChart() {
            const ctx = document.getElementById('hourly-chart').getContext('2d');
            
            // Destroy existing chart if it exists
            if (window.hourlyChart) {
                window.hourlyChart.destroy();
            }
            
            const hourlyData = new Array(24).fill(0);
            const completedTodos = todos.filter(t => t.completed && t.completedAt);
            
            completedTodos.forEach(todo => {
                const hour = new Date(todo.completedAt).getHours();
                hourlyData[hour]++;
            });
            
            const labels = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0') + ':00');
            
            window.hourlyChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Tugas Diselesaikan',
                        data: hourlyData,
                        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color') + '80',
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color'),
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1,
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                            },
                            grid: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                            }
                        },
                        x: {
                            ticks: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                            },
                            grid: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                            }
                        }
                    }
                }
            });
        }

        function loadDailyChart() {
            const ctx = document.getElementById('daily-chart').getContext('2d');
            
            // Destroy existing chart if it exists
            if (window.dailyChart) {
                window.dailyChart.destroy();
            }
            
            const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            const dailyData = new Array(7).fill(0);
            const completedTodos = todos.filter(t => t.completed && t.completedAt);
            
            completedTodos.forEach(todo => {
                const day = new Date(todo.completedAt).getDay();
                dailyData[day]++;
            });
            
            window.dailyChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: dayNames,
                    datasets: [{
                        data: dailyData,
                        backgroundColor: [
                            '#ef4444', '#f97316', '#eab308', '#22c55e', 
                            '#06b6d4', '#3b82f6', '#8b5cf6'
                        ],
                        borderWidth: 2,
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-primary')
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                                padding: 15
                            }
                        }
                    }
                }
            });
        }

        function loadDifficultyChart() {
            const ctx = document.getElementById('difficulty-chart').getContext('2d');
            
            // Destroy existing chart if it exists
            if (window.difficultyChart) {
                window.difficultyChart.destroy();
            }
            
            const difficultyData = [0, 0, 0, 0, 0]; // Index 0-4 for difficulty 1-5
            const completedTodos = todos.filter(t => t.completed);
            
            completedTodos.forEach(todo => {
                difficultyData[todo.difficulty - 1]++;
            });
            
            window.difficultyChart = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: ['⭐ Sangat Mudah', '⭐⭐ Mudah', '⭐⭐⭐ Sedang', '⭐⭐⭐⭐ Sulit', '⭐⭐⭐⭐⭐ Sangat Sulit'],
                    datasets: [{
                        label: 'Tugas Diselesaikan',
                        data: difficultyData,
                        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color') + '20',
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color'),
                        borderWidth: 3,
                        pointBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color'),
                        pointBorderColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-primary'),
                        pointRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                            }
                        }
                    },
                    scales: {
                        r: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1,
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                            },
                            grid: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                            },
                            pointLabels: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                                font: {
                                    size: 12
                                }
                            }
                        }
                    }
                }
            });
        }

        function loadHardestTasksList() {
            const hardestTasksList = document.getElementById('hardest-tasks-list');
            const completedTodos = todos.filter(t => t.completed && t.completedAt);
            
            if (completedTodos.length === 0) {
                hardestTasksList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-mountain"></i>
                        <h3>Belum Ada Data</h3>
                        <p>Selesaikan beberapa tugas untuk melihat statistik kesulitan</p>
                    </div>
                `;
                return;
            }
            
            // Sort by difficulty (highest first) and limit to top 5
            const hardestTasks = completedTodos
                .sort((a, b) => b.difficulty - a.difficulty)
                .slice(0, 5);
            
            hardestTasksList.innerHTML = hardestTasks.map((task, index) => {
                const medal = ['🥇', '🥈', '🥉', '🏅', '🏅'][index];
                const difficultyStars = '⭐'.repeat(task.difficulty);
                const completionTime = new Date(task.completedAt) - new Date(task.createdAt);
                const daysToComplete = Math.ceil(completionTime / (1000 * 60 * 60 * 24));
                
                return `
                    <div class="todo-item" style="margin-bottom: 1rem;">
                        <div class="todo-header">
                            <div>
                                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                    <span style="font-size: 1.5rem;">${medal}</span>
                                    <h4 class="todo-title" style="margin: 0;">${task.title}</h4>
                                </div>
                                <p class="todo-description" style="margin-bottom: 0.5rem;">${task.description || 'Tidak ada deskripsi'}</p>
                                <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                                    <span style="background: var(--accent-color); color: var(--bg-primary); padding: 0.25rem 0.75rem; border-radius: 9999px; font-weight: 600;">
                                        ${difficultyStars} Kesulitan ${task.difficulty}/5
                                    </span>
                                    <span style="color: var(--text-secondary); font-size: 0.9rem;">
                                        <i class="fas fa-clock"></i>
                                        Diselesaikan dalam ${daysToComplete} hari
                                    </span>
                                    <span style="color: var(--success-color); font-size: 0.9rem;">
                                        <i class="fas fa-check-circle"></i>
                                        ${formatDateTime(new Date(task.completedAt))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Notification Functions
        function checkDeadlineNotifications() {
            const now = new Date();
            const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
            
            todos.forEach(todo => {
                if (todo.completed) return;
                
                const deadline = new Date(todo.deadline);
                const timeDiff = deadline.getTime() - now.getTime();
                
                // Check if we've already shown notification for this task
                const notifiedTasks = JSON.parse(localStorage.getItem('notifiedTasks') || '{}');
                
                // 1 hour warning
                if (timeDiff > 0 && timeDiff <= 60 * 60 * 1000 && !notifiedTasks[`${todo.id}_1hour`]) {
                    showNotification(`⚠️ Deadline dalam 1 jam: ${todo.title}`, 'warning');
                    notifiedTasks[`${todo.id}_1hour`] = true;
                    localStorage.setItem('notifiedTasks', JSON.stringify(notifiedTasks));
                }
                
                // 1 day warning
                else if (timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000 && !notifiedTasks[`${todo.id}_1day`]) {
                    showNotification(`📅 Deadline besok: ${todo.title}`, 'warning');
                    notifiedTasks[`${todo.id}_1day`] = true;
                    localStorage.setItem('notifiedTasks', JSON.stringify(notifiedTasks));
                }
                
                // Overdue warning
                else if (timeDiff < 0 && !notifiedTasks[`${todo.id}_overdue`]) {
                    showNotification(`🚨 Tugas terlambat: ${todo.title}`, 'error');
                    notifiedTasks[`${todo.id}_overdue`] = true;
                    localStorage.setItem('notifiedTasks', JSON.stringify(notifiedTasks));
                }
            });
        }

        function showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
                    <span style="flex: 1;">${message}</span>
                    <button onclick="this.parentElement.parentElement.remove()" 
                            style="background: none; border: none; color: inherit; cursor: pointer; font-size: 1.2rem;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;

            document.body.appendChild(notification);

            // Show notification
            setTimeout(() => notification.classList.add('show'), 100);

            // Auto hide after 5 seconds
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 400);
            }, 5000);
        }

        // Utility Functions
        function saveTodos() {
            localStorage.setItem('todos', JSON.stringify(todos));
        }

        function formatDateTime(date) {
            const options = {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            return date.toLocaleDateString('id-ID', options);
        }

        function formatDateTimeLocal(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        }

        // Load theme on startup
        loadTheme();

        // Export/Import Functions (Bonus feature)
        function exportTodos() {
            const dataStr = JSON.stringify(todos, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `todos-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showNotification('Data berhasil diekspor!', 'success');
        }

        function importTodos() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        try {
                            const importedTodos = JSON.parse(e.target.result);
                            if (Array.isArray(importedTodos)) {
                                todos = importedTodos.map(todo => ({
                                    ...todo,
                                    deadline: new Date(todo.deadline),
                                    createdAt: new Date(todo.createdAt),
                                    completedAt: todo.completedAt ? new Date(todo.completedAt) : null
                                }));
                                saveTodos();
                                loadTodos();
                                updateStats();
                                loadAnalytics();
                                showNotification('Data berhasil diimpor!', 'success');
                            } else {
                                throw new Error('Format file tidak valid');
                            }
                        } catch (error) {
                            showNotification('Gagal mengimpor data: ' + error.message, 'error');
                        }
                    };
                    reader.readAsText(file);
                }
            };
            input.click();
        }

        // Add keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + N for new task
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                navigateTo('add-task');
            }
            
            // Escape to close modal
            if (e.key === 'Escape') {
                closeEditModal();
                closeSidebar();
            }
        });

        // Add export/import buttons to dashboard
        document.addEventListener('DOMContentLoaded', function() {
            // Add export/import buttons to the card header
            setTimeout(() => {
                const cardHeader = document.querySelector('#dashboard-page .card-header');
                if (cardHeader && !cardHeader.querySelector('.export-import-buttons')) {
                    const buttonsDiv = document.createElement('div');
                    buttonsDiv.className = 'export-import-buttons';
                    buttonsDiv.style.cssText = 'display: flex; gap: 0.5rem; align-items: center; margin-left: auto;';
                    buttonsDiv.innerHTML = `
                        <button class="btn btn-secondary" onclick="exportTodos()" title="Ekspor data">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="btn btn-secondary" onclick="importTodos()" title="Impor data">
                            <i class="fas fa-upload"></i>
                        </button>
                    `;
                    
                    const titleDiv = cardHeader.children[0];
                    cardHeader.style.cssText = 'display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;';
                    cardHeader.appendChild(buttonsDiv);
                }
            }, 100);
        });