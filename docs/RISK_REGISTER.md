# Risk Register — Project Fable

## Purpose

Dokumen ini mencatat risiko yang dapat mengganggu pengembangan Project Fable. Risk register membantu menjaga project tetap realistis, fokus, dan tidak melebar terlalu jauh.

## Risk Levels

Impact:

- Low
- Medium
- High

Probability:

- Low
- Medium
- High

Status:

- Open
- Mitigated
- Accepted
- Closed

## Risks

### R-001 Scope Creep

Project dapat melebar menjadi HRIS enterprise terlalu cepat.

Impact: High  
Probability: High  
Status: Open

Mitigation:

- Ikuti ROADMAP.md.
- Fokus MVP.
- Tunda payroll, legal contracts, complex RBAC, dan enterprise features.
- Gunakan BACKLOG.md untuk menampung ide future.

### R-002 Over-Engineering

Arsitektur terlalu kompleks sebelum fitur inti stabil.

Impact: High  
Probability: Medium  
Status: Open

Mitigation:

- Gunakan Next.js monolith.
- Gunakan SQLite untuk MVP.
- Hindari microservices.
- Hindari multi-tenant architecture di awal.

### R-003 AI Agent Membaca Terlalu Banyak File

AI coding agent dapat menghabiskan banyak token karena membaca seluruh repository.

Impact: Medium  
Probability: High  
Status: Open

Mitigation:

- Gunakan AGENTS.md.
- Gunakan CLAUDE.md.
- Gunakan RTK AI.
- Gunakan Graphify setelah struktur kode tersedia.
- Minta agent memilih 5–7 file kandidat sebelum membaca file.

### R-004 AI Agent Membuat Perubahan Terlalu Besar

Agent dapat mengubah banyak file sekaligus dan sulit direview.

Impact: High  
Probability: Medium  
Status: Open

Mitigation:

- Minta rencana sebelum coding.
- Batasi scope task.
- Gunakan rtk git diff.
- Commit per milestone kecil.

### R-005 Tidak Ada Testing

Aplikasi terlihat berjalan tetapi banyak bug tersembunyi.

Impact: High  
Probability: Medium  
Status: Open

Mitigation:

- Ikuti TEST_PLAN.md.
- Jalankan build/lint.
- Tambahkan manual test checklist.
- Tambahkan automated tests bertahap.

### R-006 Data Model Salah dari Awal

Relasi staff, department, task, attendance, dan availability tidak cocok dengan kebutuhan nyata.

Impact: High  
Probability: Medium  
Status: Open

Mitigation:

- Review DATA_MODEL.md sebelum coding.
- Mulai dari model sederhana.
- Hindari relasi kompleks di awal.
- Refactor setelah MVP terbukti.

### R-007 UI Tidak Nyaman Digunakan

Aplikasi technically works tetapi tidak nyaman untuk workflow people management.

Impact: Medium  
Probability: Medium  
Status: Open

Mitigation:

- Ikuti UI_UX.md.
- Prioritaskan dashboard, staff list, task list.
- Gunakan empty states dan validation.
- Lakukan manual testing.

### R-008 Project Tidak Selesai

Project terlalu besar sehingga tidak selesai menjadi portfolio usable.

Impact: High  
Probability: Medium  
Status: Open

Mitigation:

- Milestone kecil.
- Commit rutin.
- Fokus MVP.
- Jangan menambah AI features sebelum CRUD utama selesai.

### R-009 Dependency Issues

Dependency JavaScript/Node dapat bermasalah, terutama karena versi Node terlalu baru.

Impact: Medium  
Probability: Medium  
Status: Open

Mitigation:

- Gunakan Node LTS jika ada error.
- Dokumentasikan versi Node.
- Jangan update dependency tanpa alasan.
- Commit lockfile.

### R-010 WSL and Windows Path Issues

Project dijalankan dari Windows tetapi beberapa command perlu WSL.

Impact: Medium  
Probability: Medium  
Status: Open

Mitigation:

- Dokumentasikan command WSL.
- Gunakan path `/mnt/c/Users/user/Documents/'project fable'`.
- Tambahkan instruksi di AGENTS.md.
- Test command dari PowerShell sebelum meminta agent menjalankannya.

## Highest Priority Risks

1. Scope creep.
2. Over-engineering.
3. AI agent membuat perubahan terlalu besar.
4. Tidak ada testing.
5. Project tidak selesai.
