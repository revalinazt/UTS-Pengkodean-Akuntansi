# Soal 3: Prototipe Voucher Kas Keluar

## Menjalankan prototipe

Buka [index.html](index.html) langsung di browser. Prototipe tidak memerlukan server atau paket tambahan. Draft dan status posting disimpan di `localStorage` browser yang sedang digunakan; data ini hanya untuk simulasi dan tidak dibagikan ke pengguna/perangkat lain. Pilihan akun merupakan data contoh.

Antarmuka menyediakan nomor voucher, tanggal, penerima, keterangan, baris akun debit/kredit dinamis, perhitungan total otomatis, indikator selisih, penyimpanan draft, daftar voucher terakhir, dan konfirmasi posting. Posting hanya dapat dilakukan jika semua baris valid, terdapat minimal dua baris, data transaksi terisi, total lebih dari nol, serta total debit sama dengan kredit. Voucher berstatus `POSTED` menjadi read-only pada prototipe.

## Spesifikasi backend

Prototipe browser bukan pengganti otorisasi dan kontrol database. Implementasi produksi disarankan menyediakan:

- `POST /api/cash-disbursement-vouchers` untuk membuat atau menyimpan draft, dan `GET /api/cash-disbursement-vouchers/{id}` untuk mengambilnya.
- `POST /api/cash-disbursement-vouchers/{id}/post` untuk posting. Identitas pelaku berasal dari sesi/token terautentikasi, bukan nilai `created_by` atau `posted_by` yang dipercaya dari browser.
- Dalam satu transaksi database: kunci header dengan `SELECT ... FOR UPDATE`; pastikan status masih `DRAFT`; validasi baris akun aktif, jumlah baris, nominal positif, dan `SUM(debit) = SUM(credit)`; catat waktu/pelaku posting; ubah status menjadi `POSTED`; lalu commit. Konflik status sebaiknya dikembalikan sebagai HTTP `409`.
- Setiap jalur penambahan/perubahan/penghapusan baris juga harus mengunci header yang sama dan menolak perubahan jika status bukan `DRAFT`. Alternatifnya, tegakkan aturan tersebut dengan trigger/permission database agar jalur akses lain tidak dapat melewatinya.
- Setelah `POSTED`, API dan database menolak `UPDATE`/`DELETE` terhadap header maupun baris. Koreksi dilakukan dengan voucher pembalik/penyesuaian baru, bukan mengedit catatan lama.
- Tulis audit event append-only untuk pembuatan, perubahan draft, posting, dan pembalikan: aktor terautentikasi, timestamp server, aksi, ID voucher, request/correlation ID, serta nilai sebelum/sesudah yang relevan. Batasi role aplikasi agar tidak dapat mengubah atau menghapus audit event.
- Gunakan validasi server dan constraint database sebagai sumber kebenaran; hitungan di browser hanya umpan balik. Semua baris, status, dan event audit harus tersimpan atomik.

## Dokumentasi penggunaan AI

AI digunakan untuk membantu menyusun struktur antarmuka HTML/CSS/JavaScript, perilaku hitung debit-kredit, validasi sebelum posting, dan draf spesifikasi penguncian serta audit backend berdasarkan ringkasan instruksi UTS yang diberikan. AI tidak menjalankan backend/database dan tidak memverifikasi kebijakan akun atau format penilaian dosen. Kode dan asumsi perlu ditinjau mahasiswa sebelum dikumpulkan; hasil uji yang benar-benar dijalankan dicatat terpisah dari dokumentasi ini.