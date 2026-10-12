
-- SOAL 2.1
-- Function untuk memperbarui stok secara otomatis

CREATE OR REPLACE FUNCTION trg_update_stock_and_journal()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- PURCHASE: stok bertambah
    IF NEW.trx_type = 'PURCHASE' THEN

        UPDATE inventory_items
        SET stock_qty = stock_qty + NEW.qty
        WHERE item_id = NEW.item_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Barang tidak ditemukan';
        END IF;

    -- SALE: stok berkurang, tidak boleh negatif
    ELSIF NEW.trx_type = 'SALE' THEN

        UPDATE inventory_items
        SET stock_qty = stock_qty - NEW.qty
        WHERE item_id = NEW.item_id
          AND stock_qty >= NEW.qty;

        IF NOT FOUND THEN
            RAISE EXCEPTION
                'Stok tidak mencukupi atau barang tidak ditemukan';
        END IF;

    -- ADJUSTMENT belum memiliki arah penyesuaian
    ELSIF NEW.trx_type = 'ADJUSTMENT' THEN

        RAISE EXCEPTION
            'ADJUSTMENT memerlukan aturan arah penyesuaian';

    END IF;

    RETURN NEW;
END;
$$;


-- Trigger dijalankan setiap ada transaksi baru

CREATE TRIGGER trg_inventory_insert
BEFORE INSERT ON inventory_transactions
FOR EACH ROW
EXECUTE FUNCTION trg_update_stock_and_journal();
