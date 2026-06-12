# Product Requirements Document — Project Fable

## Product Overview

Project Fable adalah aplikasi people management untuk organisasi, kepanitiaan, komunitas, dan tim mahasiswa. Aplikasi ini membantu pengelola Human Capital, HR, People Management, kepala divisi, dan project lead untuk mengelola staff, divisi, tugas, kehadiran, availability, dan evaluasi sederhana dalam satu sistem yang terstruktur.

Project Fable tidak ditujukan sebagai HRIS enterprise penuh pada tahap awal. Fokus utama MVP adalah membantu organisasi kecil sampai menengah mengelola orang dan pekerjaan secara rapi, cepat, dan mudah digunakan.

## Product Vision

Menjadi aplikasi people management yang ringan, rapi, dan praktis untuk organisasi non-enterprise, dengan workflow yang mudah dipahami oleh pengurus organisasi, staff human capital, dan kepala divisi.

## Target Users

Primary users:

- Staff Human Capital / People Management
- HR organisasi atau kepanitiaan
- Kepala divisi / kepala departemen
- Project manager organisasi
- Admin organisasi

Secondary users:

- Staff organisasi
- Ketua organisasi
- Evaluator internal
- Tim operasional kegiatan

## User Problems

- Data staff tersebar di spreadsheet, chat, dan dokumen terpisah.
- Sulit melihat siapa berada di divisi apa.
- Sulit mengetahui status staff aktif, tidak aktif, probation, atau resigned.
- Sulit melihat beban kerja setiap staff.
- Task assignment sering hanya melalui chat dan tidak terdokumentasi.
- Kehadiran dan availability tidak terkelola dengan baik.
- Evaluasi staff sering subjektif karena tidak ada catatan historis.
- Dashboard people management tidak tersedia.

## Product Goals

- Mengelola data staff secara terpusat.
- Mengelola divisi/departemen organisasi.
- Menghubungkan staff dengan divisi dan role.
- Mengelola task assignment untuk staff dan divisi.
- Mencatat kehadiran staff.
- Mencatat availability staff.
- Menyediakan performance notes sederhana.
- Menyediakan dashboard ringkas untuk pengambilan keputusan.
- Menjadi project portfolio yang realistis, capable, dan mudah dikembangkan.

## MVP Scope

### Staff Management

User dapat:

- Melihat daftar staff.
- Menambahkan staff baru.
- Mengubah data staff.
- Menghapus atau menonaktifkan staff.
- Melihat detail staff.
- Filter staff berdasarkan divisi, status, dan role.

### Department Management

User dapat:

- Membuat divisi/departemen.
- Mengubah informasi divisi.
- Melihat daftar staff dalam divisi.
- Melihat jumlah staff aktif per divisi.

### Role and Status Management

Status awal:

- active
- inactive
- probation
- resigned

### Task Management

User dapat:

- Membuat task.
- Menugaskan task ke staff.
- Menugaskan task ke divisi.
- Mengatur deadline.
- Mengatur priority.
- Mengubah status task.

Status task awal:

- todo
- in_progress
- done
- blocked
- cancelled

Priority awal:

- low
- medium
- high
- urgent

### Attendance Management

User dapat:

- Membuat catatan kehadiran.
- Mencatat staff hadir, izin, sakit, atau absen.
- Melihat riwayat kehadiran staff.
- Melihat rekap sederhana kehadiran.

### Availability Management

User dapat:

- Mencatat availability staff.
- Melihat staff yang available pada hari tertentu.
- Membantu memilih staff untuk event atau task tertentu.

### Dashboard

Dashboard awal menampilkan:

- Total staff.
- Staff aktif.
- Jumlah divisi.
- Task todo.
- Task in progress.
- Task overdue.
- Attendance summary.
- Staff workload sederhana.

## Out of Scope for MVP

- Payroll.
- Kontrak kerja legal.
- Benefit management.
- Tax management.
- Multi-company enterprise architecture.
- Complex role-based access control.
- Full AI performance analysis.
- Chat internal.
- Mobile app native.
- Real-time collaboration.

## User Stories Summary

- Sebagai Human Capital staff, saya ingin menambah data staff agar anggota organisasi dapat dikelola dalam satu tempat.
- Sebagai Human Capital staff, saya ingin filter staff berdasarkan divisi agar dapat melihat anggota tiap divisi dengan cepat.
- Sebagai division lead, saya ingin menugaskan task kepada staff agar tanggung jawab jelas.
- Sebagai project lead, saya ingin melihat overdue tasks agar bisa follow-up cepat.
- Sebagai Human Capital staff, saya ingin mencatat kehadiran agar partisipasi staff bisa dipantau.
- Sebagai event coordinator, saya ingin melihat availability staff agar pembagian tugas lebih adil.
- Sebagai organization lead, saya ingin melihat dashboard agar memahami kondisi organisasi secara cepat.

## Success Metrics

MVP dianggap berhasil jika:

- Staff CRUD berjalan lancar.
- Department CRUD berjalan lancar.
- Task assignment berjalan lancar.
- Attendance dapat dicatat dan dilihat.
- Dashboard menampilkan data yang benar.
- Aplikasi dapat dijalankan lokal tanpa error besar.
- Dokumentasi cukup jelas untuk developer lain.
- Perubahan kode dapat diuji dan direview dengan Git.

## Future Enhancements

- Authentication.
- Role-based access control.
- Import/export CSV.
- Advanced reporting.
- AI-generated performance summary.
- Staff recommendation for tasks.
- Overload detection.
- Notification and reminders.
- Public deployment.
- Mobile-friendly polish.
