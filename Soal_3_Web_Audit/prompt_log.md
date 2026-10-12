# Log Prompt AI — UTS Pengkodean Akuntansi

## Soal 1 — Perancangan Database Akuntansi

**Tujuan:** Merancang struktur database akuntansi menggunakan PostgreSQL.

**Prompt:**

Saya sedang mengerjakan UTS Pengkodean dan Pemrograman Akuntansi. Bantu saya merancang tabel `chart_of_accounts`, `journal_headers`, dan `journal_lines` menggunakan PostgreSQL sesuai instruksi soal. Sertakan primary key, foreign key dengan aturan `ON DELETE RESTRICT`, serta constraint agar debit dan kredit tidak negatif dan tidak boleh sama-sama bernilai nol dalam satu baris jurnal. Jelaskan hubungan header dan line sebagai audit trail serta alasan struktur tabel memenuhi normalisasi hingga 3NF. Gunakan bahasa Indonesia yang jelas dan sesuai kebutuhan soal.

## Soal 2 — Trigger Persediaan

**Tujuan:** Membuat trigger untuk memperbarui stok secara otomatis dan mencegah stok negatif.

**Prompt:**

Saya sedang mengerjakan soal UTS tentang trigger persediaan PostgreSQL. Gunakan struktur tabel `inventory_items` dan `inventory_transactions` sesuai instruksi soal. Buat fungsi trigger `trg_update_stock_and_journal()` yang memperbarui `stock_qty` ketika transaksi `PURCHASE` atau `SALE` dimasukkan. Jika transaksi `SALE` menyebabkan stok menjadi negatif, batalkan transaksi menggunakan `RAISE EXCEPTION`. Jelaskan penggunaan `SELECT ... FOR UPDATE` atau isolation level `SERIALIZABLE` untuk menangani transaksi bersamaan. Jika aturan transaksi `ADJUSTMENT` belum ditentukan, jelaskan asumsi yang dibutuhkan dan jangan mengarang aturan bisnis.

## Soal 3 — Aplikasi Web Arunika

**Tujuan:** Membuat dan mengembangkan aplikasi web voucher kas keluar.

**Prompt untuk rancangan awal:**

Buat rancangan antarmuka aplikasi web akuntansi untuk pencatatan voucher kas keluar. Antarmuka memuat nomor voucher, tanggal transaksi, penerima pembayaran, keterangan, rincian jurnal debit dan kredit, total debit dan kredit, selisih, status keseimbangan, tombol simpan draft, posting voucher, dan riwayat voucher. Buat tampilan yang rapi, profesional, responsif, dan mudah digunakan. Validasi agar voucher hanya dapat diposting jika jurnal seimbang dan memiliki minimal dua baris. Jelaskan jika penyimpanan masih berupa simulasi frontend dan belum terhubung ke backend atau database.

**Prompt untuk pengembangan aplikasi Arunika:**

Bantu saya mengembangkan aplikasi web akuntansi bernama Arunika — Voucher Kas Keluar menggunakan HTML, CSS, dan JavaScript yang terpisah. Pertahankan fungsi formulir voucher, rincian jurnal, perhitungan debit dan kredit, validasi keseimbangan, penyimpanan draft, posting, dan riwayat voucher. Gunakan struktur file yang sederhana, tampilan profesional, dan responsif. Pastikan nama serta lokasi file HTML, CSS, dan JavaScript sesuai agar aplikasi berjalan dengan benar. Jangan menyatakan aplikasi terhubung ke database atau backend jika koneksi tersebut belum dibuat dan diuji.

## Catatan

- AI digunakan sebagai alat bantu dalam pengerjaan dan peninjauan solusi.
- Kode harus diperiksa dan diuji kembali sesuai instruksi UTS.
- Fitur simulasi frontend harus dibedakan dari fitur yang benar-benar terhubung ke backend atau database.
- Teks prompt di atas merupakan rangkuman dokumentasi, bukan salinan persis riwayat percakapan AI.