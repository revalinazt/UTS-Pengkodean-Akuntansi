const accountOptions = [
    { id: "", label: "Pilih akun" },
    { id: "1101", label: "1101 · Bank Operasional" },
    { id: "1102", label: "1102 · Kas Kecil" },
    { id: "5101", label: "5101 · Beban Pokok Penjualan" },
    { id: "6101", label: "6101 · Beban Operasional" },
    { id: "6102", label: "6102 · Beban Perlengkapan" },
    { id: "6103", label: "6103 · Beban Transportasi" },
    { id: "2190", label: "2190 · Utang Lain-lain" }
];

const storageKey = "arunika-cash-vouchers-v1";
const rowsElement = document.querySelector("#journalRows");
const historyElement = document.querySelector("#voucherHistory");
const formControls = [
    document.querySelector("#transactionDate"),
    document.querySelector("#payee"),
    document.querySelector("#description"),
    document.querySelector("#addLine")
];
let lines = [];
let currentVoucher = null;
let toastTimer;

const formatRupiah = (value) => new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
}).format(value || 0);

function readVouchers() {
    try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
}

function makeVoucherNumber() {
    const year = new Date().getFullYear();
    const sequence = readVouchers().filter((voucher) => voucher.number.startsWith(`KK-${year}-`)).length + 1;
    return `KK-${year}-${String(sequence).padStart(4, "0")}`;
}

function makeLine(data = {}) {
    return {
        accountId: data.accountId || "",
        memo: data.memo || "",
        debit: data.debit ?? "",
        credit: data.credit ?? ""
    };
}

function newVoucher() {
    currentVoucher = {
        id: null,
        number: makeVoucherNumber(),
        status: "DRAFT",
        date: new Date().toISOString().slice(0, 10),
        payee: "",
        description: "",
        lines: [],
        createdAt: null,
        createdBy: "Operator Demo",
        postedAt: null,
        postedBy: null
    };
    lines = [makeLine(), makeLine()];
    fillForm();
    renderHistory();
    renderAll();
}

function fillForm() {
    document.querySelector("#voucherNumber").textContent = currentVoucher.number;
    document.querySelector("#voucherNoInput").value = currentVoucher.number;
    document.querySelector("#transactionDate").value = currentVoucher.date;
    document.querySelector("#payee").value = currentVoucher.payee;
    document.querySelector("#description").value = currentVoucher.description;
}

function captureForm() {
    currentVoucher.date = document.querySelector("#transactionDate").value;
    currentVoucher.payee = document.querySelector("#payee").value.trim();
    currentVoucher.description = document.querySelector("#description").value.trim();
    currentVoucher.lines = lines.map((line) => ({ ...line }));
}

function renderRows() {
    rowsElement.replaceChildren();
    lines.forEach((line, index) => {
        const row = document.createElement("tr");
        const accountCell = document.createElement("td");
        const account = document.createElement("select");
        account.setAttribute("aria-label", `Akun baris ${index + 1}`);
        accountOptions.forEach((option) => {
            const element = document.createElement("option");
            element.value = option.id;
            element.textContent = option.label;
            account.append(element);
        });
        account.value = line.accountId;
        account.addEventListener("change", () => {
            line.accountId = account.value;
            updateSummary();
        });
        accountCell.append(account);

        const memoCell = document.createElement("td");
        const memo = document.createElement("input");
        memo.type = "text";
        memo.maxLength = 120;
        memo.placeholder = "Keterangan";
        memo.value = line.memo;
        memo.setAttribute("aria-label", `Keterangan baris ${index + 1}`);
        memo.addEventListener("input", () => { line.memo = memo.value; });
        memoCell.append(memo);

        const debitCell = document.createElement("td");
        const debit = makeAmountInput("Debit", index, line.debit);
        debit.addEventListener("input", () => {
            line.debit = debit.value;
            if (Number(debit.value) > 0) {
                line.credit = "";
                credit.value = "";
            }
            updateSummary();
        });
        debitCell.append(debit);

        const creditCell = document.createElement("td");
        const credit = makeAmountInput("Kredit", index, line.credit);
        credit.addEventListener("input", () => {
            line.credit = credit.value;
            if (Number(credit.value) > 0) {
                line.debit = "";
                debit.value = "";
            }
            updateSummary();
        });
        creditCell.append(credit);

        const removeCell = document.createElement("td");
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "remove-line";
        remove.textContent = "×";
        remove.setAttribute("aria-label", `Hapus baris ${index + 1}`);
        remove.disabled = currentVoucher.status === "POSTED";
        remove.addEventListener("click", () => {
            lines.splice(index, 1);
            renderAll();
        });
        removeCell.append(remove);

        row.append(accountCell, memoCell, debitCell, creditCell, removeCell);
        rowsElement.append(row);
    });
    updateSummary();
}

function makeAmountInput(side, index, value) {
    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.step = "0.01";
    input.inputMode = "decimal";
    input.placeholder = "0";
    input.value = value;
    input.className = "amount-input";
    input.setAttribute("aria-label", `${side} baris ${index + 1}`);
    return input;
}

function lineIsValid(line) {
    const debit = Number(line.debit) || 0;
    const credit = Number(line.credit) || 0;
    return Boolean(line.accountId) && ((debit > 0 && credit === 0) || (credit > 0 && debit === 0));
}

function updateSummary() {
    const debitTotal = lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
    const creditTotal = lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
    const difference = Math.round((debitTotal - creditTotal) * 100) / 100;
    const balanced = lines.length >= 2
        && lines.every(lineIsValid)
        && debitTotal > 0
        && difference === 0;
    const complete = Boolean(
        document.querySelector("#transactionDate").value
        && document.querySelector("#payee").value.trim()
        && document.querySelector("#description").value.trim()
    );

    document.querySelector("#tableDebit").textContent = formatRupiah(debitTotal);
    document.querySelector("#tableCredit").textContent = formatRupiah(creditTotal);
    document.querySelector("#summaryDebit").textContent = formatRupiah(debitTotal);
    document.querySelector("#summaryCredit").textContent = formatRupiah(creditTotal);
    document.querySelector("#balanceDifference").textContent = formatRupiah(Math.abs(difference));

    const status = document.querySelector("#balanceStatus");
    status.classList.toggle("is-balanced", balanced);
    status.querySelector(".balance-symbol").textContent = balanced ? "=" : "!";
    status.lastElementChild.textContent = balanced ? "Seimbang" : "Belum siap diposting";
    document.querySelector("#postVoucher").disabled = currentVoucher.status === "POSTED" || !balanced || !complete;

    const message = document.querySelector("#validationMessage");
    if (currentVoucher.status === "POSTED") {
        message.textContent = "Voucher posted terkunci.";
    } else if (balanced && complete) {
        message.textContent = "";
    } else if (difference !== 0 && (debitTotal > 0 || creditTotal > 0)) {
        message.textContent = "Total debit dan kredit harus sama sebelum posting.";
    } else if (lines.some((line) => !lineIsValid(line))) {
        message.textContent = "Lengkapi akun dan nominal pada setiap baris.";
    } else if (!complete) {
        message.textContent = "Lengkapi tanggal, penerima, dan keterangan transaksi.";
    } else {
        message.textContent = "Tambahkan minimal dua baris jurnal dengan total lebih dari nol.";
    }
}

function renderLockState() {
    const posted = currentVoucher.status === "POSTED";
    formControls.forEach((control) => { control.disabled = posted; });
    document.querySelector("#saveDraft").disabled = posted;
    document.querySelector("#postVoucher").disabled = posted || document.querySelector("#postVoucher").disabled;
    document.querySelectorAll("#journalRows input, #journalRows select, #journalRows button").forEach((control) => {
        control.disabled = posted;
    });

    const status = document.querySelector("#voucherStatus");
    status.textContent = currentVoucher.status;
    status.classList.toggle("status-posted", posted);
    status.classList.toggle("status-draft", !posted);
    document.querySelector("#draftTime").textContent = currentVoucher.createdAt
        ? new Date(currentVoucher.createdAt).toLocaleString("id-ID")
        : "Belum disimpan";
    const postedInfo = document.querySelector("#postedInfo");
    postedInfo.hidden = !posted;
    postedInfo.textContent = posted
        ? `Diposting oleh ${currentVoucher.postedBy} · ${new Date(currentVoucher.postedAt).toLocaleString("id-ID")}`
        : "";
}

function renderAll() {
    renderRows();
    renderLockState();
}

function persistVoucher(status) {
    captureForm();
    const now = new Date().toISOString();
    if (!currentVoucher.id) {
        currentVoucher.id = `${Date.now()}`;
        currentVoucher.createdAt = now;
    }
    currentVoucher.updatedAt = now;
    currentVoucher.status = status;
    if (status === "POSTED") {
        currentVoucher.postedAt = now;
        currentVoucher.postedBy = currentVoucher.createdBy;
    }
    const vouchers = readVouchers();
    const existingIndex = vouchers.findIndex((voucher) => voucher.id === currentVoucher.id);
    if (existingIndex >= 0) vouchers[existingIndex] = currentVoucher;
    else vouchers.unshift(currentVoucher);
    localStorage.setItem(storageKey, JSON.stringify(vouchers));
    renderHistory();
    renderLockState();
}

function renderHistory() {
    const vouchers = readVouchers().slice(0, 5);
    historyElement.replaceChildren();
    if (vouchers.length === 0) {
        const empty = document.createElement("div");
        empty.className = "history-empty";
        empty.textContent = "Belum ada voucher";
        historyElement.append(empty);
        return;
    }
    vouchers.forEach((voucher) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `history-item${currentVoucher.id === voucher.id ? " is-selected" : ""}`;
        const name = document.createElement("strong");
        name.textContent = voucher.payee || voucher.number;
        const detail = document.createElement("small");
        detail.textContent = `${voucher.number} · ${voucher.status}`;
        button.append(name, detail);
        button.addEventListener("click", () => loadVoucher(voucher.id));
        historyElement.append(button);
    });
}

function loadVoucher(id) {
    const voucher = readVouchers().find((item) => item.id === id);
    if (!voucher) return;
    currentVoucher = voucher;
    lines = voucher.lines.map(makeLine);
    fillForm();
    renderHistory();
    renderAll();
}

function showToast(message) {
    const toast = document.querySelector("#toast");
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

document.querySelector("#addLine").addEventListener("click", () => {
    lines.push(makeLine());
    renderAll();
    rowsElement.lastElementChild?.querySelector("select")?.focus();
});

document.querySelector("#saveDraft").addEventListener("click", () => {
    persistVoucher("DRAFT");
    renderAll();
    showToast("Draft voucher tersimpan di browser.");
});

document.querySelector("#postVoucher").addEventListener("click", () => {
    if (document.querySelector("#postVoucher").disabled) return;
    if (!window.confirm("Posting voucher ini? Voucher yang sudah posted akan terkunci.")) return;
    persistVoucher("POSTED");
    renderAll();
    showToast("Voucher berhasil diposting dan dikunci.");
});

document.querySelector("#newVoucher").addEventListener("click", newVoucher);
formControls.slice(0, 3).forEach((control) => control.addEventListener("input", updateSummary));
document.querySelector("#activePeriod").textContent = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric"
}).format(new Date());

newVoucher();