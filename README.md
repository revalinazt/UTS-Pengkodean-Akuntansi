# Soal 2: Trigger Persediaan dan Jurnal

## Asumsi skema

File [schema.sql](schema.sql) dijalankan setelah skema Soal 1 dalam database yang sama. Tabel `products` menyimpan saldo berjalan dan akun persediaan. Setiap transaksi persediaan menunjuk akun lawan (`offset_account_id`): misalnya utang/kas untuk pembelian, HPP untuk penjualan, serta akun selisih untuk penyesuaian. Untuk penjualan dan penyesuaian keluar, `unit_cost` adalah biaya per unit yang akan dikeluarkan dari persediaan.

## Cara kerja

Trigger `BEFORE INSERT` menjalankan fungsi `trg_update_stock_and_journal()`:

- `PURCHASE`: menambah stok; membuat jurnal debit persediaan dan kredit akun lawan.
- `SALE`: mengurangi stok; membuat jurnal debit akun lawan (umumnya HPP) dan kredit persediaan.
- `ADJUSTMENT` dengan arah `IN`: menambah stok; debit persediaan dan kredit akun lawan.
- `ADJUSTMENT` dengan arah `OUT`: mengurangi stok; debit akun lawan dan kredit persediaan.

Jumlah jurnal adalah `quantity * unit_cost`, dibulatkan ke dua desimal. Header jurnal langsung dibuat berstatus `POSTED`, dengan metadata pembuat dan waktu posting. Fungsi mengisi `journal_id` pada transaksi sebelum baris disimpan. Karena semuanya berlangsung di transaksi database yang sama, kegagalan membuat jurnal atau menyimpan pergerakan akan membatalkan perubahan stok juga.

Constraint tabel menolak kuantitas dan biaya nol/negatif, arah penyesuaian yang tidak sesuai, serta saldo produk negatif. Akun persediaan dan akun lawan juga tidak boleh sama.

## Race condition dan locking

Pola baca stok lalu menghitung saldo di aplikasi tidak aman: dua transaksi `SALE` dapat sama-sama membaca saldo lama yang cukup, lalu keduanya mengurangi stok sehingga hasil akhirnya negatif. Trigger ini memakai satu `UPDATE` bersyarat (`stock_on_hand + delta >= 0`) sebagai operasi atomik. PostgreSQL mengunci baris produk saat melakukan `UPDATE`; transaksi yang bersamaan pada produk sama akan menunggu, lalu kondisi saldo dievaluasi kembali terhadap versi baris terbaru. Jika saldo tidak cukup, tidak ada baris yang diperbarui dan transaksi ditolak.

Jangan mengganti pola ini dengan `SELECT` biasa yang diikuti `UPDATE` terpisah. Alternatif yang juga valid adalah `SELECT ... FOR UPDATE`, lalu validasi dan update dalam transaksi yang sama. Untuk satu produk per transaksi, penguncian dilakukan pada satu baris. Jika proses kelak memutakhirkan banyak produk sekaligus, kunci baris dalam urutan `product_id` yang konsisten untuk mengurangi risiko deadlock. Pada isolasi `SERIALIZABLE`, aplikasi tetap perlu siap mengulang transaksi yang gagal karena serialization failure.

## Menjalankan

Eksekusi `Soal_1_Database/schema.sql` lebih dahulu, kemudian `Soal_2_Inventory/schema.sql`. Buat akun persediaan dan akun lawan di `chart_of_accounts` sebelum membuat produk atau transaksi. Pengujian runtime belum dilakukan di lingkungan ini karena klien PostgreSQL tidak tersedia.