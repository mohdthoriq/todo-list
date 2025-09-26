# Task Management Application

A complete task management system with advanced features including task creation, editing, deletion, real-time dashboard, analytics, smart notifications, responsive design, and persistent storage.

---

## 🎯 Fitur Utama

### 1. ✅ Manajemen Tugas Lengkap
- Tambah tugas dengan judul, deskripsi, prioritas, rating kesulitan (1-5 ⭐), dan deadline.
- Edit tugas menggunakan modal yang user-friendly.
- Hapus tugas satu per satu atau semua sekaligus.
- Tandai tugas selesai atau belum dengan toggle completion.
- Filter tugas berdasarkan prioritas dan status.

### 2. 📊 Dashboard dengan Statistik Real-time
- Total tugas, selesai, tertunda, dan terlambat.
- Tampilan kartu tugas dengan indikator prioritas dan kesulitan.
- Sorting otomatis: prioritas tinggi dan deadline terdekat di atas.
- Visual indicator untuk tugas yang terlambat.

### 3. 📈 Analytics Komprehensif
- Grafik jam: Menampilkan kapan pengguna paling produktif menyelesaikan tugas.
- Grafik hari: Distribusi penyelesaian tugas per hari dalam seminggu.
- Grafik kesulitan: Radar chart distribusi tingkat kesulitan tugas.
- Tugas tersulit: Top 5 tugas dengan rating kesulitan tertinggi yang sudah diselesaikan.
- Statistik detail: Completion rate, rata-rata kesulitan, hari paling produktif.

### 4. 🔔 Sistem Notifikasi Pintar
- Peringatan muncul 24 jam sebelum deadline.
- Peringatan mendesak 1 jam sebelum deadline.
- Alert tugas terlambat (overdue).
- Notifikasi tidak muncul berulang untuk tugas yang sama.
- Notifikasi auto-dismiss setelah 5 detik, dengan opsi manual close.

### 5. 🎨 Tema Dark & Light yang Elegan
- Light Theme: Putih bersih dengan aksen biru profesional.
- Dark Theme: Coklat kemerah-merahan dengan aksen kuning emas.
- Toggle mudah dengan ikon matahari/bulan.
- Semua chart menyesuaikan warna tema secara otomatis.

### 6. 📱 Responsive Design Perfect
- Desktop (>768px): Navbar horizontal dengan menu lengkap.
- Mobile (<768px): Hamburger menu dengan sidebar animasi smooth.
- Grid responsive untuk statistik dan tugas.
- Touch-friendly button sizing.
- Optimal untuk semua perangkat.

### 7. 💾 Persistent Data dengan LocalStorage
- Data tersimpan otomatis setiap perubahan.
- Tema preference tersimpan di localStorage.
- Tracking status notifikasi.
- Import/Export data dalam format JSON untuk backup dan restore.

### 8. 🚀 Fitur Bonus
- Keyboard shortcuts:
  - Ctrl+N untuk tugas baru.
  - Escape untuk close modal.
- Visual feedback dengan smooth animations dan hover effects.
- Priority sorting: tugas penting muncul di atas.
- Completion tracking: waktu penyelesaian dan durasi pengerjaan.
- Empty states: pesan motivasional ketika belum ada data.

---

## 🎯 Cara Penggunaan

### Menambah Tugas
1. Klik tombol **"Tambah Tugas"** di navbar atau tombol di dashboard.
2. Isi form lengkap dengan judul, deskripsi, prioritas, rating kesulitan (1-5 ⭐), dan deadline menggunakan date-time picker.
3. Tugas akan otomatis tersimpan dan langsung muncul di dashboard.

### Dashboard
- Gunakan filter untuk memilih tugas berdasarkan prioritas (Tinggi/Sedang/Rendah) dan status (selesai/belum).
- Klik tombol **✓** untuk menandai tugas selesai atau belum.
- Edit tugas menggunakan tombol pensil, hapus dengan tombol trash.
- Jika ada tugas, tombol **"Hapus Semua"** akan muncul dan dapat digunakan untuk menghapus semua tugas sekaligus.

### Analytics
- Lihat grafik jam untuk mengetahui jam paling produktif dalam menyelesaikan tugas (bar chart).
- Lihat grafik hari untuk distribusi penyelesaian tugas per hari dalam seminggu (doughnut chart).
- Periksa radar chart distribusi tingkat kesulitan tugas.
- Temukan Hall of Fame dengan 5 tugas tersulit yang sudah diselesaikan.
- Cek statistik completion rate, rata-rata kesulitan, dan hari paling produktif.

### Notifikasi
- Sistem otomatis melakukan pengecekan setiap 5 menit.
- Notifikasi muncul 24 jam dan 1 jam sebelum deadline tugas.
- Tugas yang sudah lewat deadline akan mendapatkan peringatan overdue.
- Notifikasi muncul sekali untuk setiap tugas dan menghilang otomatis setelah 5 detik, tapi bisa ditutup secara manual.

---

Terima kasih telah menggunakan aplikasi ini! Selamat mengelola tugas dengan lebih mudah dan produktif.
