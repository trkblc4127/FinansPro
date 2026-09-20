/* =========================================================
   FINANSPRO PRO v2
   ========================================================= */

"use strict";


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEYS = {
    incomes: "finanspro_incomes_pro_v2",
    expenses: "finanspro_expenses_pro_v2",
    debts: "finanspro_debts_pro_v2",
    payments: "finanspro_payments_pro_v2"
};


let incomes = loadData(STORAGE_KEYS.incomes);
let expenses = loadData(STORAGE_KEYS.expenses);
let debts = loadData(STORAGE_KEYS.debts);
let payments = loadData(STORAGE_KEYS.payments);

let currentPage = "dashboard";


/* =========================================================
   CATEGORIES
========================================================= */

const incomeCategories = [
    "Maaş",
    "Ek Gelir",
    "Prim",
    "Freelance",
    "Yatırım",
    "Kira Geliri",
    "Satış",
    "Diğer"
];

const expenseCategories = [
    "Market",
    "Fatura",
    "Kira",
    "Ulaşım",
    "Yemek",
    "Sağlık",
    "Eğitim",
    "Alışveriş",
    "Eğlence",
    "Diğer"
];


/* =========================================================
   PAGE INFORMATION
========================================================= */

const pageInfo = {

    dashboard: {
        title: "Ana Sayfa",
        description: "Finansal durumunuzun genel özeti"
    },

    income: {
        title: "Gelirler",
        description: "Gelirlerinizi yönetin ve takip edin"
    },

    expense: {
        title: "Giderler",
        description: "Giderlerinizi yönetin ve analiz edin"
    },

    debt: {
        title: "Borçlar",
        description: "Borçlarınızı ve taksitlerinizi takip edin"
    },

    payment: {
        title: "Ödemeler",
        description: "Yaptığınız borç ödemelerini yönetin"
    },

    reports: {
        title: "Raporlar",
        description: "Finansal durumunuzu analiz edin"
    }

};


/* =========================================================
   BASIC HELPERS
========================================================= */

function loadData(key) {

    try {

        const data = localStorage.getItem(key);

        return data ? JSON.parse(data) : [];

    } catch (error) {

        console.error(error);

        return [];
    }
}


function saveData(key, data) {

    localStorage.setItem(
        key,
        JSON.stringify(data)
    );
}


function money(value) {

    const number = Number(value) || 0;

    return new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
        minimumFractionDigits: 2
    }).format(number);
}


function number(value) {

    return Number(value) || 0;
}


function today() {

    const d = new Date();

    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${d.getFullYear()}-${month}-${day}`;
}


function formatDate(date) {

    if (!date) return "-";

    const d = new Date(date + "T00:00:00");

    if (Number.isNaN(d.getTime())) return date;

    return d.toLocaleDateString("tr-TR");
}


function monthKey(date) {

    if (!date) return "";

    return date.substring(0, 7);
}


function currentMonth() {

    return monthKey(today());
}


function uid(prefix = "id") {

    return `${prefix}_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)}`;
}


function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function showToast(message, type = "success") {

    const container =
        document.getElementById("toastContainer");

    const toast =
        document.createElement("div");

    toast.className = `toast ${type}`;

    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {

        toast.remove();

    }, 3000);
}


/* =========================================================
   NAVIGATION
========================================================= */

function showPage(page) {

    currentPage = page;

    document.querySelectorAll(".page")
        .forEach(element => {
            element.classList.remove("active");
        });

    const pageElement =
        document.getElementById(`${page}Page`);

    if (pageElement) {
        pageElement.classList.add("active");
    }


    document.querySelectorAll(".menu-btn")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === page
            );

        });


    const info = pageInfo[page];

    if (info) {

        document.getElementById("pageTitle")
            .textContent = info.title;

        document.getElementById("pageDescription")
            .textContent = info.description;
    }


    renderAll();
}


document.querySelectorAll(".menu-btn")
    .forEach(button => {

        button.addEventListener("click", () => {

            showPage(button.dataset.page);

        });

    });


document.querySelectorAll("[data-page-link]")
    .forEach(button => {

        button.addEventListener("click", () => {

            showPage(button.dataset.pageLink);

        });

    });


/* =========================================================
   MODALS
========================================================= */

function openModal(id) {

    document
        .getElementById(id)
        .classList.add("open");
}


function closeModal(id) {

    document
        .getElementById(id)
        .classList.remove("open");
}


document.querySelectorAll("[data-close]")
    .forEach(button => {

        button.addEventListener("click", () => {

            closeModal(button.dataset.close);

        });

    });


document.querySelectorAll(".modal-overlay")
    .forEach(overlay => {

        overlay.addEventListener("click", event => {

            if (event.target === overlay) {

                overlay.classList.remove("open");

            }

        });

    });


document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

        document
            .querySelectorAll(".modal-overlay.open")
            .forEach(modal => {

                modal.classList.remove("open");

            });

    }

});


/* =========================================================
   TRANSACTION MODAL
========================================================= */

function openTransactionModal(type, id = null) {

    const form =
        document.getElementById("transactionForm");

    form.reset();

    document.getElementById("transactionId").value =
        id || "";

    document.getElementById("transactionType").value =
        type;


    const isIncome = type === "income";

    document.getElementById("transactionModalType")
        .textContent = isIncome ? "GELİR" : "GİDER";

    document.getElementById("transactionModalTitle")
        .textContent =
        id
            ? (isIncome ? "Geliri Düzenle" : "Gideri Düzenle")
            : (isIncome ? "Gelir Ekle" : "Gider Ekle");


    const select =
        document.getElementById("transactionCategory");

    const categories =
        isIncome
            ? incomeCategories
            : expenseCategories;

    select.innerHTML = categories
        .map(category =>
            `<option value="${escapeHtml(category)}">
                ${escapeHtml(category)}
            </option>`
        )
        .join("");


    if (id) {

        const source =
            isIncome ? incomes : expenses;

        const item =
            source.find(x => x.id === id);

        if (item) {

            document.getElementById("transactionDate").value =
                item.date || today();

            document.getElementById("transactionAmount").value =
                item.amount || "";

            document.getElementById("transactionCategory").value =
                item.category || categories[0];

            document.getElementById("transactionName").value =
                item.name || "";

            document.getElementById("transactionNote").value =
                item.note || "";
        }

    } else {

        document.getElementById("transactionDate").value =
            today();

        document.getElementById("transactionCategory").value =
            categories[0];

    }


    openModal("transactionModal");
}


document.getElementById("transactionForm")
    .addEventListener("submit", event => {

        event.preventDefault();

        const id =
            document.getElementById("transactionId").value;

        const type =
            document.getElementById("transactionType").value;

        const item = {

            id: id || uid(type),

            date:
                document.getElementById("transactionDate").value,

            amount:
                number(
                    document.getElementById("transactionAmount").value
                ),

            category:
                document.getElementById("transactionCategory").value,

            name:
                document.getElementById("transactionName").value.trim(),

            note:
                document.getElementById("transactionNote").value.trim(),

            updatedAt:
                new Date().toISOString()

        };


        if (!item.amount || item.amount <= 0) {

            showToast(
                "Lütfen geçerli bir tutar girin.",
                "error"
            );

            return;
        }


        const source =
            type === "income"
                ? incomes
                : expenses;

        const index =
            source.findIndex(x => x.id === id);


        if (index >= 0) {

            source[index] = {
                ...source[index],
                ...item
            };

        } else {

            source.unshift(item);

        }


        if (type === "income") {

            saveData(STORAGE_KEYS.incomes, incomes);

        } else {

            saveData(STORAGE_KEYS.expenses, expenses);

        }


        closeModal("transactionModal");

        renderAll();

        showToast(
            id
                ? "Kayıt güncellendi."
                : "Kayıt başarıyla eklendi."
        );

    });


/* =========================================================
   INCOME
========================================================= */

function renderIncomeCategories() {

    const select =
        document.getElementById("incomeCategoryFilter");

    select.innerHTML =
        `<option value="">Tüm kategoriler</option>` +
        incomeCategories
            .map(x =>
                `<option value="${escapeHtml(x)}">
                    ${escapeHtml(x)}
                </option>`
            )
            .join("");
}


function renderIncomePage() {

    renderIncomeCategories();


    const search =
        document.getElementById("incomeSearch")
            .value
            .toLowerCase()
            .trim();

    const category =
        document.getElementById("incomeCategoryFilter")
            .value;

    const sort =
        document.getElementById("incomeSort").value;


    let list = [...incomes];


    if (search) {

        list = list.filter(item => {

            return (
                String(item.name || "")
                    .toLowerCase()
                    .includes(search) ||

                String(item.category || "")
                    .toLowerCase()
                    .includes(search) ||

                String(item.note || "")
                    .toLowerCase()
                    .includes(search)
            );

        });

    }


    if (category) {

        list = list.filter(
            item => item.category === category
        );

    }


    sortList(list, sort);


    const total =
        list.reduce(
            (sum, item) => sum + number(item.amount),
            0
        );


    document.getElementById("incomeTotal")
        .textContent = money(total);

    document.getElementById("incomeCount")
        .textContent = list.length;

    document.getElementById("incomeAverage")
        .textContent =
        money(list.length ? total / list.length : 0);


    const tbody =
        document.getElementById("incomeTableBody");


    if (!list.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        Henüz gelir kaydı bulunmuyor.
                    </div>
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML = list.map(item => `

        <tr>

            <td>${formatDate(item.date)}</td>

            <td>
                <strong>${escapeHtml(item.name || "Gelir")}</strong>
            </td>

            <td>
                <span class="category-badge">
                    ${escapeHtml(item.category)}
                </span>
            </td>

            <td>
                ${escapeHtml(item.note || "-")}
            </td>

            <td>
                <strong class="amount-income">
                    +${money(item.amount)}
                </strong>
            </td>

            <td>

                <div class="action-buttons">

                    <button
                        class="small-btn"
                        onclick="editIncome('${item.id}')"
                        title="Düzenle"
                    >
                        ✎
                    </button>

                    <button
                        class="small-btn delete"
                        onclick="deleteIncome('${item.id}')"
                        title="Sil"
                    >
                        ×
                    </button>

                </div>

            </td>

        </tr>

    `).join("");
}


function sortList(list, sort) {

    list.sort((a, b) => {

        if (sort === "date-asc") {
            return String(a.date).localeCompare(String(b.date));
        }

        if (sort === "date-desc") {
            return String(b.date).localeCompare(String(a.date));
        }

        if (sort === "amount-asc") {
            return number(a.amount) - number(b.amount);
        }

        if (sort === "amount-desc") {
            return number(b.amount) - number(a.amount);
        }

        if (sort === "remaining-desc") {
            return debtRemaining(b) - debtRemaining(a);
        }

        if (sort === "name-asc") {
            return String(a.name)
                .localeCompare(String(b.name), "tr");
        }

        return 0;

    });

}


function editIncome(id) {

    openTransactionModal("income", id);

}


function deleteIncome(id) {

    if (!confirm("Bu gelir kaydını silmek istediğinizden emin misiniz?")) {
        return;
    }

    incomes =
        incomes.filter(item => item.id !== id);

    saveData(
        STORAGE_KEYS.incomes,
        incomes
    );

    renderAll();

    showToast("Gelir kaydı silindi.");

}


/* =========================================================
   EXPENSE
========================================================= */

function renderExpenseCategories() {

    const select =
        document.getElementById("expenseCategoryFilter");

    select.innerHTML =
        `<option value="">Tüm kategoriler</option>` +
        expenseCategories
            .map(x =>
                `<option value="${escapeHtml(x)}">
                    ${escapeHtml(x)}
                </option>`
            )
            .join("");
}


function renderExpensePage() {

    renderExpenseCategories();


    const search =
        document.getElementById("expenseSearch")
            .value
            .toLowerCase()
            .trim();

    const category =
        document.getElementById("expenseCategoryFilter")
            .value;

    const sort =
        document.getElementById("expenseSort").value;


    let list = [...expenses];


    if (search) {

        list = list.filter(item => {

            return (
                String(item.name || "")
                    .toLowerCase()
                    .includes(search) ||

                String(item.category || "")
                    .toLowerCase()
                    .includes(search) ||

                String(item.note || "")
                    .toLowerCase()
                    .includes(search)
            );

        });

    }


    if (category) {

        list =
            list.filter(
                item => item.category === category
            );

    }


    sortList(list, sort);


    const total =
        list.reduce(
            (sum, item) => sum + number(item.amount),
            0
        );


    document.getElementById("expenseTotal")
        .textContent = money(total);

    document.getElementById("expenseCount")
        .textContent = list.length;

    document.getElementById("expenseAverage")
        .textContent =
        money(list.length ? total / list.length : 0);


    const tbody =
        document.getElementById("expenseTableBody");


    if (!list.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        Henüz gider kaydı bulunmuyor.
                    </div>
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML = list.map(item => `

        <tr>

            <td>${formatDate(item.date)}</td>

            <td>
                <strong>${escapeHtml(item.name || "Gider")}</strong>
            </td>

            <td>
                <span class="category-badge">
                    ${escapeHtml(item.category)}
                </span>
            </td>

            <td>
                ${escapeHtml(item.note || "-")}
            </td>

            <td>
                <strong class="amount-expense">
                    -${money(item.amount)}
                </strong>
            </td>

            <td>

                <div class="action-buttons">

                    <button
                        class="small-btn"
                        onclick="editExpense('${item.id}')"
                    >
                        ✎
                    </button>

                    <button
                        class="small-btn delete"
                        onclick="deleteExpense('${item.id}')"
                    >
                        ×
                    </button>

                </div>

            </td>

        </tr>

    `).join("");
}


function editExpense(id) {

    openTransactionModal("expense", id);

}


function deleteExpense(id) {

    if (!confirm("Bu gider kaydını silmek istediğinizden emin misiniz?")) {
        return;
    }

    expenses =
        expenses.filter(item => item.id !== id);

    saveData(
        STORAGE_KEYS.expenses,
        expenses
    );

    renderAll();

    showToast("Gider kaydı silindi.");

}


/* =========================================================
   DEBT FUNCTIONS
========================================================= */

function debtPayments(debtId) {

    return payments.filter(
        payment => payment.debtId === debtId
    );

}


function debtPaid(debt) {

    return debtPayments(debt.id)
        .reduce(
            (sum, payment) =>
                sum + number(payment.amount),
            0
        );

}


function debtRemaining(debt) {

    return Math.max(
        0,
        number(debt.totalAmount) - debtPaid(debt)
    );

}


function debtInstallmentPaid(debt) {

    const installment =
        number(debt.installmentAmount);

    if (!installment) {
        return debtPaid(debt);
    }

    return Math.floor(
        debtPaid(debt) / installment
    );

}


function debtRemainingInstallments(debt) {

    const count =
        number(debt.installmentCount);

    if (!count) {
        return 0;
    }

    return Math.max(
        0,
        count - debtInstallmentPaid(debt)
    );

}


function debtProgress(debt) {

    const total =
        number(debt.totalAmount);

    if (!total) return 0;

    return Math.min(
        100,
        Math.round(
            debtPaid(debt) / total * 100
        )
    );

}


function debtCompleted(debt) {

    return debtRemaining(debt) <= 0;

}


function addMonths(dateString, months) {

    if (!dateString) return null;

    const date =
        new Date(dateString + "T00:00:00");

    date.setMonth(
        date.getMonth() + months
    );

    const month =
        String(date.getMonth() + 1).padStart(2, "0");

    const day =
        String(date.getDate()).padStart(2, "0");

    return `${date.getFullYear()}-${month}-${day}`;
}


function debtNextPaymentDate(debt) {

    const first =
        debt.firstPaymentDate;

    if (!first) return null;

    const paidInstallments =
        debtInstallmentPaid(debt);

    return addMonths(
        first,
        paidInstallments
    );

}


function renderDebtPage() {

    const search =
        document.getElementById("debtSearch")
            .value
            .toLowerCase()
            .trim();

    const status =
        document.getElementById("debtStatusFilter")
            .value;

    const sort =
        document.getElementById("debtSort").value;


    let list = [...debts];


    if (search) {

        list = list.filter(item => {

            return (
                String(item.name || "")
                    .toLowerCase()
                    .includes(search) ||

                String(item.institution || "")
                    .toLowerCase()
                    .includes(search)
            );

        });

    }


    if (status === "active") {

        list =
            list.filter(
                debt => !debtCompleted(debt)
            );

    }

    if (status === "completed") {

        list =
            list.filter(
                debt => debtCompleted(debt)
            );

    }


    sortList(list, sort);


    const total =
        debts.reduce(
            (sum, debt) =>
                sum + number(debt.totalAmount),
            0
        );

    const paid =
        debts.reduce(
            (sum, debt) =>
                sum + debtPaid(debt),
            0
        );

    const remaining =
        debts.reduce(
            (sum, debt) =>
                sum + debtRemaining(debt),
            0
        );


    document.getElementById("debtTotal")
        .textContent = money(total);

    document.getElementById("debtPaid")
        .textContent = money(paid);

    document.getElementById("debtRemaining")
        .textContent = money(remaining);

    document.getElementById("debtCount")
        .textContent = debts.length;


    const grid =
        document.getElementById("debtGrid");


    if (!list.length) {

        grid.innerHTML = `
            <div class="panel">
                <div class="empty-state">
                    Henüz borç kaydı bulunmuyor.
                </div>
            </div>
        `;

        return;
    }


    grid.innerHTML = list.map(debt => {

        const paidAmount =
            debtPaid(debt);

        const remaining =
            debtRemaining(debt);

        const progress =
            debtProgress(debt);

        const completed =
            debtCompleted(debt);

        const nextDate =
            debtNextPaymentDate(debt);


        return `

        <div class="debt-card">

            <div class="debt-card-top">

                <div class="debt-title">

                    <strong>
                        ${escapeHtml(debt.name)}
                    </strong>

                    <small>
                        ${escapeHtml(debt.institution || "Kurum belirtilmedi")}
                    </small>

                </div>

                <span class="status-badge ${
                    completed
                        ? "status-completed"
                        : "status-active"
                }">
                    ${completed ? "Tamamlandı" : "Aktif"}
                </span>

            </div>


            <div class="debt-amounts">

                <div>
                    <span>Toplam Borç</span>
                    <strong>${money(debt.totalAmount)}</strong>
                </div>

                <div>
                    <span>Kalan Borç</span>
                    <strong>${money(remaining)}</strong>
                </div>

            </div>


            <div class="progress">

                <div
                    class="progress-bar"
                    style="width:${progress}%"
                ></div>

            </div>


            <div class="progress-info">

                <span>
                    %${progress} ödendi
                </span>

                <span>
                    ${money(paidAmount)}
                </span>

            </div>


            <div class="debt-meta">

                <div>
                    <span>Taksit</span>
                    <strong>
                        ${
                            debt.installmentAmount
                                ? money(debt.installmentAmount)
                                : "-"
                        }
                    </strong>
                </div>

                <div>
                    <span>Kalan Taksit</span>
                    <strong>
                        ${
                            debt.installmentCount
                                ? debtRemainingInstallments(debt)
                                : "-"
                        }
                    </strong>
                </div>

                <div>
                    <span>İlk Ödeme</span>
                    <strong>
                        ${formatDate(debt.firstPaymentDate)}
                    </strong>
                </div>

                <div>
                    <span>Sonraki Ödeme</span>
                    <strong>
                        ${formatDate(nextDate)}
                    </strong>
                </div>

            </div>


            <div class="debt-actions">

                <button
                    class="small-btn"
                    onclick="openDebtModal('${debt.id}')"
                    title="Düzenle"
                >
                    ✎
                </button>

                <button
                    class="small-btn"
                    onclick="openPaymentModal(null, '${debt.id}')"
                    title="Ödeme ekle"
                >
                    ✓
                </button>

                <button
                    class="small-btn delete"
                    onclick="deleteDebt('${debt.id}')"
                    title="Sil"
                >
                    ×
                </button>

            </div>

        </div>

        `;

    }).join("");
}


/* =========================================================
   DEBT MODAL
========================================================= */

function openDebtModal(id = null) {

    const form =
        document.getElementById("debtForm");

    form.reset();

    document.getElementById("debtId").value =
        id || "";

    document.getElementById("debtModalTitle")
        .textContent =
        id
            ? "Borcu Düzenle"
            : "Borç Ekle";


    if (id) {

        const debt =
            debts.find(x => x.id === id);

        if (debt) {

            document.getElementById("debtName").value =
                debt.name || "";

            document.getElementById("debtInstitution").value =
                debt.institution || "";

            document.getElementById("debtTotalAmount").value =
                debt.totalAmount || "";

            document.getElementById("debtInstallmentAmount").value =
                debt.installmentAmount || "";

            document.getElementById("debtInstallmentCount").value =
                debt.installmentCount || "";

            document.getElementById("debtStartDate").value =
                debt.startDate || "";

            document.getElementById("debtFirstPaymentDate").value =
                debt.firstPaymentDate || "";

            document.getElementById("debtInterestRate").value =
                debt.interestRate || "";

            document.getElementById("debtNote").value =
                debt.note || "";

        }

    } else {

        document.getElementById("debtStartDate").value =
            today();

    }


    openModal("debtModal");
}


document.getElementById("debtForm")
    .addEventListener("submit", event => {

        event.preventDefault();

        const id =
            document.getElementById("debtId").value;


        const debt = {

            id: id || uid("debt"),

            name:
                document.getElementById("debtName").value.trim(),

            institution:
                document.getElementById("debtInstitution").value.trim(),

            totalAmount:
                number(
                    document.getElementById("debtTotalAmount").value
                ),

            installmentAmount:
                number(
                    document.getElementById("debtInstallmentAmount").value
                ),

            installmentCount:
                parseInt(
                    document.getElementById("debtInstallmentCount").value
                ) || 0,

            startDate:
                document.getElementById("debtStartDate").value,

            firstPaymentDate:
                document.getElementById("debtFirstPaymentDate").value,

            interestRate:
                number(
                    document.getElementById("debtInterestRate").value
                ),

            note:
                document.getElementById("debtNote").value.trim()

        };


        if (!debt.name) {

            showToast(
                "Borç adı girin.",
                "error"
            );

            return;
        }


        if (debt.totalAmount <= 0) {

            showToast(
                "Geçerli bir borç tutarı girin.",
                "error"
            );

            return;
        }


        const index =
            debts.findIndex(x => x.id === id);


        if (index >= 0) {

            debts[index] = {
                ...debts[index],
                ...debt
            };

        } else {

            debts.unshift(debt);

        }


        saveData(
            STORAGE_KEYS.debts,
            debts
        );


        closeModal("debtModal");

        renderAll();

        showToast(
            id
                ? "Borç güncellendi."
                : "Borç başarıyla eklendi."
        );

    });


function deleteDebt(id) {

    const debt =
        debts.find(x => x.id === id);

    if (!debt) return;


    if (!confirm(
        `"${debt.name}" borcunu ve bu borca bağlı ödemeleri silmek istediğinizden emin misiniz?`
    )) {
        return;
    }


    debts =
        debts.filter(x => x.id !== id);

    payments =
        payments.filter(x => x.debtId !== id);


    saveData(
        STORAGE_KEYS.debts,
        debts
    );

    saveData(
        STORAGE_KEYS.payments,
        payments
    );


    renderAll();

    showToast("Borç silindi.");

}


/* =========================================================
   PAYMENT
========================================================= */

function populatePaymentDebtSelect() {

    const select =
        document.getElementById("paymentDebt");

    const activeDebts =
        debts.filter(
            debt => !debtCompleted(debt)
        );


    select.innerHTML = `
        <option value="">
            Borç seçin
        </option>
    `;


    activeDebts.forEach(debt => {

        const option =
            document.createElement("option");

        option.value = debt.id;

        option.textContent =
            `${debt.name} — ${money(debtRemaining(debt))}`;

        select.appendChild(option);

    });

}


function openPaymentModal(id = null, debtId = null) {

    const form =
        document.getElementById("paymentForm");

    form.reset();

    document.getElementById("paymentId").value =
        id || "";


    populatePaymentDebtSelect();


    if (id) {

        const payment =
            payments.find(x => x.id === id);

        if (payment) {

            document.getElementById("paymentDebt").value =
                payment.debtId;

            document.getElementById("paymentDate").value =
                payment.date;

            document.getElementById("paymentAmount").value =
                payment.amount;

            document.getElementById("paymentNote").value =
                payment.note || "";

        }

    } else {

        document.getElementById("paymentDate").value =
            today();

        if (debtId) {

            document.getElementById("paymentDebt").value =
                debtId;

        }

    }


    openModal("paymentModal");
}


document.getElementById("paymentForm")
    .addEventListener("submit", event => {

        event.preventDefault();

        const id =
            document.getElementById("paymentId").value;

        const debtId =
            document.getElementById("paymentDebt").value;

        const amount =
            number(
                document.getElementById("paymentAmount").value
            );


        if (!debtId) {

            showToast(
                "Lütfen bir borç seçin.",
                "error"
            );

            return;
        }


        if (amount <= 0) {

            showToast(
                "Geçerli bir ödeme tutarı girin.",
                "error"
            );

            return;
        }


        const debt =
            debts.find(x => x.id === debtId);

        if (!debt) {

            showToast(
                "Borç bulunamadı.",
                "error"
            );

            return;
        }


        const payment = {

            id: id || uid("payment"),

            debtId,

            date:
                document.getElementById("paymentDate").value,

            amount,

            note:
                document.getElementById("paymentNote").value.trim()

        };


        if (id) {

            const index =
                payments.findIndex(x => x.id === id);

            if (index >= 0) {
                payments[index] = payment;
            }

        } else {

            payments.unshift(payment);

        }


        saveData(
            STORAGE_KEYS.payments,
            payments
        );


        closeModal("paymentModal");

        renderAll();

        showToast(
            id
                ? "Ödeme güncellendi."
                : "Ödeme başarıyla eklendi."
        );

    });


function renderPaymentPage() {

    const search =
        document.getElementById("paymentSearch")
            .value
            .toLowerCase()
            .trim();

    const sort =
        document.getElementById("paymentSort").value;


    let list =
        payments.map(payment => {

            const debt =
                debts.find(
                    x => x.id === payment.debtId
                );

            return {
                ...payment,
                debtName:
                    debt
                        ? debt.name
                        : "Silinmiş borç"
            };

        });


    if (search) {

        list = list.filter(item => {

            return (
                String(item.debtName)
                    .toLowerCase()
                    .includes(search) ||

                String(item.note || "")
                    .toLowerCase()
                    .includes(search)
            );

        });

    }


    sortList(list, sort);


    const total =
        payments.reduce(
            (sum, item) =>
                sum + number(item.amount),
            0
        );


    const monthTotal =
        payments
            .filter(
                item =>
                    monthKey(item.date) === currentMonth()
            )
            .reduce(
                (sum, item) =>
                    sum + number(item.amount),
                0
            );


    document.getElementById("paymentTotal")
        .textContent = money(total);

    document.getElementById("paymentMonthTotal")
        .textContent = money(monthTotal);

    document.getElementById("paymentCount")
        .textContent = payments.length;


    const tbody =
        document.getElementById("paymentTableBody");


    if (!list.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-state">
                        Henüz ödeme kaydı bulunmuyor.
                    </div>
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML = list.map(item => `

        <tr>

            <td>${formatDate(item.date)}</td>

            <td>
                <strong>
                    ${escapeHtml(item.debtName)}
                </strong>
            </td>

            <td>
                ${escapeHtml(item.note || "-")}
            </td>

            <td>
                <strong class="amount-payment">
                    ${money(item.amount)}
                </strong>
            </td>

            <td>

                <div class="action-buttons">

                    <button
                        class="small-btn"
                        onclick="editPayment('${item.id}')"
                    >
                        ✎
                    </button>

                    <button
                        class="small-btn delete"
                        onclick="deletePayment('${item.id}')"
                    >
                        ×
                    </button>

                </div>

            </td>

        </tr>

    `).join("");

}


function editPayment(id) {

    openPaymentModal(id);

}


function deletePayment(id) {

    if (!confirm("Bu ödeme kaydını silmek istediğinizden emin misiniz?")) {
        return;
    }


    payments =
        payments.filter(
            payment => payment.id !== id
        );


    saveData(
        STORAGE_KEYS.payments,
        payments
    );


    renderAll();

    showToast("Ödeme silindi.");

}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

    const totalIncome =
        incomes.reduce(
            (sum, item) =>
                sum + number(item.amount),
            0
        );


    const totalExpense =
        expenses.reduce(
            (sum, item) =>
                sum + number(item.amount),
            0
        );


    const totalPayment =
        payments.reduce(
            (sum, item) =>
                sum + number(item.amount),
            0
        );


    const remainingDebt =
        debts.reduce(
            (sum, debt) =>
                sum + debtRemaining(debt),
            0
        );


    const balance =
        totalIncome -
        totalExpense -
        totalPayment;


    document.getElementById("balanceKpi")
        .textContent = money(balance);

    document.getElementById("incomeKpi")
        .textContent = money(totalIncome);

    document.getElementById("expenseKpi")
        .textContent = money(totalExpense);

    document.getElementById("debtKpi")
        .textContent = money(remainingDebt);


    document.getElementById("incomeKpiInfo")
        .textContent =
        `${incomes.length} işlem`;

    document.getElementById("expenseKpiInfo")
        .textContent =
        `${expenses.length} işlem`;

    const activeDebtCount =
        debts.filter(
            debt => !debtCompleted(debt)
        ).length;

    document.getElementById("debtKpiInfo")
        .textContent =
        `${activeDebtCount} aktif borç`;


    const month =
        currentMonth();


    const monthIncome =
        incomes
            .filter(
                item => monthKey(item.date) === month
            )
            .reduce(
                (sum, item) =>
                    sum + number(item.amount),
                0
            );


    const monthExpense =
        expenses
            .filter(
                item => monthKey(item.date) === month
            )
            .reduce(
                (sum, item) =>
                    sum + number(item.amount),
                0
            );


    const monthPayment =
        payments
            .filter(
                item => monthKey(item.date) === month
            )
            .reduce(
                (sum, item) =>
                    sum + number(item.amount),
                0
            );


    const monthNet =
        monthIncome -
        monthExpense -
        monthPayment;


    document.getElementById("monthIncome")
        .textContent = money(monthIncome);

    document.getElementById("monthExpense")
        .textContent = money(monthExpense);

    document.getElementById("monthPayment")
        .textContent = money(monthPayment);

    document.getElementById("monthNet")
        .textContent = money(monthNet);


    renderUpcomingPayments();

    renderRecentTransactions();

}


function renderUpcomingPayments() {

    const container =
        document.getElementById("upcomingPayments");


    const todayDate =
        new Date(today() + "T00:00:00");


    const list = [];


    debts.forEach(debt => {

        if (debtCompleted(debt)) return;

        const next =
            debtNextPaymentDate(debt);

        if (!next) return;


        list.push({

            debt,

            date: next,

            amount:
                number(debt.installmentAmount) ||
                debtRemaining(debt)

        });

    });


    list.sort(
        (a, b) =>
            String(a.date).localeCompare(
                String(b.date)
            )
    );


    const visible =
        list.slice(0, 5);


    if (!visible.length) {

        container.innerHTML = `
            <div class="empty-state">
                Yaklaşan ödeme bulunmuyor.
            </div>
        `;

        return;
    }


    container.innerHTML =
        visible.map(item => {

            const date =
                new Date(item.date + "T00:00:00");

            const isOverdue =
                date < todayDate;


            return `

                <div class="upcoming-item">

                    <div class="upcoming-date">
                        ${date.getDate()}
                    </div>

                    <div class="upcoming-info">

                        <strong>
                            ${escapeHtml(item.debt.name)}
                        </strong>

                        <small class="${
                            isOverdue
                                ? "overdue"
                                : ""
                        }">

                            ${
                                isOverdue
                                    ? "Gecikmiş"
                                    : formatDate(item.date)
                            }

                        </small>

                    </div>

                    <div class="upcoming-amount">
                        ${money(item.amount)}
                    </div>

                </div>

            `;

        }).join("");

}


function renderRecentTransactions() {

    const container =
        document.getElementById("recentTransactions");


    const list = [

        ...incomes.map(item => ({
            ...item,
            transactionType: "income"
        })),

        ...expenses.map(item => ({
            ...item,
            transactionType: "expense"
        })),

        ...payments.map(item => ({
            ...item,
            transactionType: "payment"
        }))

    ];


    list.sort(
        (a, b) =>
            String(b.date).localeCompare(
                String(a.date)
            )
    );


    const visible =
        list.slice(0, 6);


    if (!visible.length) {

        container.innerHTML = `
            <div class="empty-state">
                Henüz işlem bulunmuyor.
            </div>
        `;

        return;

    }


    container.innerHTML =
        visible.map(item => {

            let title =
                item.name ||
                "Ödeme";

            let typeText =
                "Gelir";

            let className =
                "amount-income";

            let sign =
                "+";

            if (item.transactionType === "expense") {

                typeText = "Gider";
                className = "amount-expense";
                sign = "-";

            }

            if (item.transactionType === "payment") {

                const debt =
                    debts.find(
                        d => d.id === item.debtId
                    );

                title =
                    debt
                        ? debt.name
                        : "Ödeme";

                typeText = "Ödeme";
                className = "amount-payment";
                sign = "-";

            }


            return `

                <div class="recent-item">

                    <div class="recent-icon ${
                        item.transactionType === "income"
                            ? "amount-income"
                            : item.transactionType === "expense"
                                ? "amount-expense"
                                : "amount-payment"
                    }">

                        ${
                            item.transactionType === "income"
                                ? "↗"
                                : item.transactionType === "expense"
                                    ? "↘"
                                    : "✓"
                        }

                    </div>

                    <div class="recent-info">

                        <strong>
                            ${escapeHtml(title)}
                        </strong>

                        <small>
                            ${typeText} • ${formatDate(item.date)}
                        </small>

                    </div>

                    <div class="recent-amount ${className}">
                        ${sign}${money(item.amount)}
                    </div>

                </div>

            `;

        }).join("");

}


/* =========================================================
   REPORTS
========================================================= */

function getLastMonths(count = 6) {

    const result = [];

    const current =
        new Date(
            today() + "T00:00:00"
        );

    for (let i = count - 1; i >= 0; i--) {

        const date =
            new Date(current);

        date.setMonth(
            date.getMonth() - i
        );

        const key =
            `${date.getFullYear()}-${String(
                date.getMonth() + 1
            ).padStart(2, "0")}`;

        result.push(key);

    }

    return result;
}


function monthName(key) {

    const date =
        new Date(key + "-01T00:00:00");

    return date.toLocaleDateString(
        "tr-TR",
        {
            month: "short"
        }
    );

}


function renderReports() {

    const totalIncome =
        incomes.reduce(
            (sum, item) =>
                sum + number(item.amount),
            0
        );

    const totalExpense =
        expenses.reduce(
            (sum, item) =>
                sum + number(item.amount),
            0
        );

    const totalPayment =
        payments.reduce(
            (sum, item) =>
                sum + number(item.amount),
            0
        );

    const totalDebt =
        debts.reduce(
            (sum, debt) =>
                sum + debtRemaining(debt),
            0
        );


    document.getElementById("reportIncome")
        .textContent = money(totalIncome);

    document.getElementById("reportExpense")
        .textContent = money(totalExpense);

    document.getElementById("reportPayment")
        .textContent = money(totalPayment);

    document.getElementById("reportDebt")
        .textContent = money(totalDebt);


    const months =
        getLastMonths(6);


    const data =
        months.map(month => {

            const income =
                incomes
                    .filter(
                        item => monthKey(item.date) === month
                    )
                    .reduce(
                        (sum, item) =>
                            sum + number(item.amount),
                        0
                    );


            const expense =
                expenses
                    .filter(
                        item => monthKey(item.date) === month
                    )
                    .reduce(
                        (sum, item) =>
                            sum + number(item.amount),
                        0
                    );


            const payment =
                payments
                    .filter(
                        item => monthKey(item.date) === month
                    )
                    .reduce(
                        (sum, item) =>
                            sum + number(item.amount),
                        0
                    );


            return {
                month,
                income,
                expense,
                payment,
                net:
                    income -
                    expense -
                    payment
            };

        });


    renderChart(data);


    document.getElementById("monthlyReportBody")
        .innerHTML = data.map(item => `

            <tr>

                <td>
                    <strong>
                        ${monthName(item.month)}
                    </strong>
                </td>

                <td class="amount-income">
                    ${money(item.income)}
                </td>

                <td class="amount-expense">
                    ${money(item.expense)}
                </td>

                <td class="amount-payment">
                    ${money(item.payment)}
                </td>

                <td>
                    <strong>
                        ${money(item.net)}
                    </strong>
                </td>

            </tr>

        `).join("");

}


function renderChart(data) {

    const chart =
        document.getElementById("monthlyChart");


    const max =
        Math.max(
            1,
            ...data.flatMap(item => [
                item.income,
                item.expense
            ])
        );


    chart.innerHTML =
        data.map(item => {

            const incomeHeight =
                Math.max(
                    3,
                    (item.income / max) * 190
                );

            const expenseHeight =
                Math.max(
                    3,
                    (item.expense / max) * 190
                );


            return `

                <div class="chart-column">

                    <div
                        class="chart-bar chart-income"
                        style="height:${incomeHeight}px"
                        title="Gelir: ${money(item.income)}"
                    ></div>

                    <div
                        class="chart-bar chart-expense"
                        style="height:${expenseHeight}px"
                        title="Gider: ${money(item.expense)}"
                    ></div>

                    <span class="chart-label">
                        ${monthName(item.month)}
                    </span>

                </div>

            `;

        }).join("") +

        `

            <div class="chart-legend">

                <div class="legend-item">
                    <span class="legend-dot legend-income"></span>
                    Gelir
                </div>

                <div class="legend-item">
                    <span class="legend-dot legend-expense"></span>
                    Gider
                </div>

            </div>

        `;

}


/* =========================================================
   BACKUP MODAL
========================================================= */

function openBackupModal() {

    openModal("backupModal");

}


document.getElementById("backupSideBtn")
    .addEventListener(
        "click",
        openBackupModal
    );


document.getElementById("backupTopBtn")
    .addEventListener(
        "click",
        openBackupModal
    );


/* =========================================================
   JSON EXPORT
========================================================= */

function exportJSON() {

    const data = {

        application: "FinansPro PRO v2",

        exportDate:
            new Date().toISOString(),

        incomes,

        expenses,

        debts,

        payments

    };


    const blob =
        new Blob(
            [
                JSON.stringify(
                    data,
                    null,
                    2
                )
            ],
            {
                type: "application/json"
            }
        );


    downloadBlob(
        blob,
        `FinansPro_Yedek_${today()}.json`
    );


    showToast(
        "JSON yedeği indirildi."
    );

}


/* =========================================================
   EXCEL EXPORT
========================================================= */

function exportExcel() {

    let csv = "\uFEFF";


    csv +=
        "GELİRLER\n";

    csv +=
        "Tarih;Gelir;Kategori;Açıklama;Tutar;Not\n";


    incomes.forEach(item => {

        csv += [
            formatDate(item.date),
            csvSafe(item.name),
            csvSafe(item.category),
            csvSafe(item.name),
            number(item.amount)
                .toFixed(2)
                .replace(".", ","),
            csvSafe(item.note)
        ].join(";") + "\n";

    });


    csv += "\n";

    csv +=
        "GİDERLER\n";

    csv +=
        "Tarih;Gider;Kategori;Açıklama;Tutar;Not\n";


    expenses.forEach(item => {

        csv += [
            formatDate(item.date),
            csvSafe(item.name),
            csvSafe(item.category),
            csvSafe(item.name),
            number(item.amount)
                .toFixed(2)
                .replace(".", ","),
            csvSafe(item.note)
        ].join(";") + "\n";

    });


    csv += "\n";

    csv +=
        "BORÇLAR\n";

    csv +=
        "Borç;Kurum;Toplam;Ödenen;Kalan;Taksit;Taksit Sayısı;Başlangıç;İlk Ödeme;Durum\n";


    debts.forEach(debt => {

        csv += [

            csvSafe(debt.name),

            csvSafe(debt.institution),

            number(debt.totalAmount)
                .toFixed(2)
                .replace(".", ","),

            debtPaid(debt)
                .toFixed(2)
                .replace(".", ","),

            debtRemaining(debt)
                .toFixed(2)
                .replace(".", ","),

            number(debt.installmentAmount)
                .toFixed(2)
                .replace(".", ","),

            debt.installmentCount || "",

            formatDate(debt.startDate),

            formatDate(debt.firstPaymentDate),

            debtCompleted(debt)
                ? "Tamamlandı"
                : "Aktif"

        ].join(";") + "\n";

    });


    csv += "\n";

    csv +=
        "ÖDEMELER\n";

    csv +=
        "Tarih;Borç;Tutar;Not\n";


    payments.forEach(payment => {

        const debt =
            debts.find(
                d => d.id === payment.debtId
            );


        csv += [

            formatDate(payment.date),

            csvSafe(
                debt
                    ? debt.name
                    : "Silinmiş borç"
            ),

            number(payment.amount)
                .toFixed(2)
                .replace(".", ","),

            csvSafe(payment.note)

        ].join(";") + "\n";

    });


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "application/vnd.ms-excel;charset=utf-8;"
            }
        );


    downloadBlob(
        blob,
        `FinansPro_Rapor_${today()}.xls`
    );


    showToast(
        "Excel dosyası indirildi."
    );

}


function csvSafe(value) {

    return `"${String(value ?? "")
        .replace(/"/g, '""')
        .replace(/\n/g, " ")}"`;

}


/* =========================================================
   WORD EXPORT
========================================================= */

function exportWord() {

    const totalIncome =
        incomes.reduce(
            (sum, item) =>
                sum + number(item.amount),
            0
        );

    const totalExpense =
        expenses.reduce(
            (sum, item) =>
                sum + number(item.amount),
            0
        );

    const totalPayment =
        payments.reduce(
            (sum, item) =>
                sum + number(item.amount),
            0
        );

    const totalDebt =
        debts.reduce(
            (sum, debt) =>
                sum + debtRemaining(debt),
            0
        );


    const html = `

<!DOCTYPE html>

<html lang="tr">

<head>

<meta charset="UTF-8">

<title>FinansPro Raporu</title>

<style>

body {
    font-family: Arial, sans-serif;
    color: #18252f;
    padding: 35px;
}

h1 {
    color: #07998c;
}

h2 {
    margin-top: 30px;
    color: #07998c;
}

.summary {
    display: flex;
    gap: 15px;
    margin: 20px 0;
}

.card {
    border: 1px solid #ddd;
    padding: 15px;
    min-width: 160px;
}

.card strong {
    display: block;
    margin-top: 7px;
    font-size: 20px;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 12px;
}

th,
td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

th {
    background: #e9fbf8;
}

</style>

</head>

<body>

<h1>FinansPro PRO v2</h1>

<p>
Finansal Durum Raporu<br>
Oluşturulma tarihi: ${formatDate(today())}
</p>


<div class="summary">

    <div class="card">
        Toplam Gelir
        <strong>${money(totalIncome)}</strong>
    </div>

    <div class="card">
        Toplam Gider
        <strong>${money(totalExpense)}</strong>
    </div>

    <div class="card">
        Toplam Ödeme
        <strong>${money(totalPayment)}</strong>
    </div>

    <div class="card">
        Kalan Borç
        <strong>${money(totalDebt)}</strong>
    </div>

</div>


<h2>Gelirler</h2>

<table>

<tr>
<th>Tarih</th>
<th>Gelir</th>
<th>Kategori</th>
<th>Tutar</th>
</tr>

${incomes.map(item => `

<tr>

<td>${formatDate(item.date)}</td>

<td>${escapeHtml(item.name || "Gelir")}</td>

<td>${escapeHtml(item.category)}</td>

<td>${money(item.amount)}</td>

</tr>

`).join("")}

</table>


<h2>Giderler</h2>

<table>

<tr>
<th>Tarih</th>
<th>Gider</th>
<th>Kategori</th>
<th>Tutar</th>
</tr>

${expenses.map(item => `

<tr>

<td>${formatDate(item.date)}</td>

<td>${escapeHtml(item.name || "Gider")}</td>

<td>${escapeHtml(item.category)}</td>

<td>${money(item.amount)}</td>

</tr>

`).join("")}

</table>


<h2>Borçlar</h2>

<table>

<tr>
<th>Borç</th>
<th>Kurum</th>
<th>Toplam</th>
<th>Ödenen</th>
<th>Kalan</th>
<th>Durum</th>
</tr>

${debts.map(debt => `

<tr>

<td>${escapeHtml(debt.name)}</td>

<td>${escapeHtml(debt.institution || "-")}</td>

<td>${money(debt.totalAmount)}</td>

<td>${money(debtPaid(debt))}</td>

<td>${money(debtRemaining(debt))}</td>

<td>
${
    debtCompleted(debt)
        ? "Tamamlandı"
        : "Aktif"
}
</td>

</tr>

`).join("")}

</table>


<h2>Ödemeler</h2>

<table>

<tr>
<th>Tarih</th>
<th>Borç</th>
<th>Tutar</th>
<th>Not</th>
</tr>

${payments.map(payment => {

    const debt =
        debts.find(
            d => d.id === payment.debtId
        );

    return `

<tr>

<td>${formatDate(payment.date)}</td>

<td>
${
    escapeHtml(
        debt
            ? debt.name
            : "Silinmiş borç"
    )
}
</td>

<td>${money(payment.amount)}</td>

<td>${escapeHtml(payment.note || "-")}</td>

</tr>

`;

}).join("")}

</table>


</body>

</html>

`;


    const blob =
        new Blob(
            [html],
            {
                type: "application/msword"
            }
        );


    downloadBlob(
        blob,
        `FinansPro_Rapor_${today()}.doc`
    );


    showToast(
        "Word raporu indirildi."
    );

}


/* =========================================================
   PDF EXPORT
========================================================= */

function exportPDF() {

    const totalIncome =
        incomes.reduce(
            (sum, item) =>
                sum + number(item.amount),
            0
        );

    const totalExpense =
        expenses.reduce(
            (sum, item) =>
                sum + number(item.amount),
            0
        );

    const totalPayment =
        payments.reduce(
            (sum, item) =>
                sum + number(item.amount),
            0
        );

    const totalDebt =
        debts.reduce(
            (sum, debt) =>
                sum + debtRemaining(debt),
            0
        );


    const reportWindow =
        window.open(
            "",
            "_blank"
        );


    if (!reportWindow) {

        showToast(
            "PDF penceresi açılamadı. Tarayıcı açılır pencereyi engelliyor olabilir.",
            "error"
        );

        return;

    }


    reportWindow.document.write(`

<!DOCTYPE html>

<html lang="tr">

<head>

<meta charset="UTF-8">

<title>FinansPro PDF Raporu</title>

<style>

* {
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    color: #18252f;
    padding: 35px;
}

.header {
    border-bottom: 3px solid #10b8a6;
    padding-bottom: 15px;
    margin-bottom: 20px;
}

h1 {
    margin: 0;
    color: #07998c;
}

.subtitle {
    color: #777;
    margin-top: 5px;
}

.summary {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin: 20px 0;
}

.card {
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 14px;
}

.card span {
    color: #777;
    font-size: 11px;
}

.card strong {
    display: block;
    margin-top: 6px;
    font-size: 18px;
}

h2 {
    color: #07998c;
    border-bottom: 1px solid #ddd;
    padding-bottom: 6px;
    margin-top: 25px;
}

table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10px;
}

th,
td {
    border: 1px solid #ddd;
    padding: 7px;
    text-align: left;
}

th {
    background: #e9fbf8;
}

.footer {
    margin-top: 30px;
    color: #888;
    font-size: 9px;
}

@media print {

    body {
        padding: 10px;
    }

    .no-print {
        display: none;
    }

}

</style>

</head>

<body>


<div class="header">

    <h1>FinansPro PRO v2</h1>

    <div class="subtitle">
        Finansal Durum Raporu —
        ${formatDate(today())}
    </div>

</div>


<div class="summary">

    <div class="card">
        <span>Toplam Gelir</span>
        <strong>${money(totalIncome)}</strong>
    </div>

    <div class="card">
        <span>Toplam Gider</span>
        <strong>${money(totalExpense)}</strong>
    </div>

    <div class="card">
        <span>Toplam Ödeme</span>
        <strong>${money(totalPayment)}</strong>
    </div>

    <div class="card">
        <span>Kalan Borç</span>
        <strong>${money(totalDebt)}</strong>
    </div>

</div>


<h2>Gelirler</h2>

<table>

<tr>
<th>Tarih</th>
<th>Gelir</th>
<th>Kategori</th>
<th>Tutar</th>
</tr>

${incomes.map(item => `

<tr>

<td>${formatDate(item.date)}</td>

<td>${escapeHtml(item.name || "Gelir")}</td>

<td>${escapeHtml(item.category)}</td>

<td>${money(item.amount)}</td>

</tr>

`).join("")}

</table>


<h2>Giderler</h2>

<table>

<tr>
<th>Tarih</th>
<th>Gider</th>
<th>Kategori</th>
<th>Tutar</th>
</tr>

${expenses.map(item => `

<tr>

<td>${formatDate(item.date)}</td>

<td>${escapeHtml(item.name || "Gider")}</td>

<td>${escapeHtml(item.category)}</td>

<td>${money(item.amount)}</td>

</tr>

`).join("")}

</table>


<h2>Borçlar</h2>

<table>

<tr>
<th>Borç</th>
<th>Kurum</th>
<th>Toplam</th>
<th>Ödenen</th>
<th>Kalan</th>
<th>Durum</th>
</tr>

${debts.map(debt => `

<tr>

<td>${escapeHtml(debt.name)}</td>

<td>${escapeHtml(debt.institution || "-")}</td>

<td>${money(debt.totalAmount)}</td>

<td>${money(debtPaid(debt))}</td>

<td>${money(debtRemaining(debt))}</td>

<td>
${
    debtCompleted(debt)
        ? "Tamamlandı"
        : "Aktif"
}
</td>

</tr>

`).join("")}

</table>


<h2>Ödemeler</h2>

<table>

<tr>
<th>Tarih</th>
<th>Borç</th>
<th>Tutar</th>
<th>Not</th>
</tr>

${payments.map(payment => {

    const debt =
        debts.find(
            d => d.id === payment.debtId
        );

    return `

<tr>

<td>${formatDate(payment.date)}</td>

<td>
${
    escapeHtml(
        debt
            ? debt.name
            : "Silinmiş borç"
    )
}
</td>

<td>${money(payment.amount)}</td>

<td>${escapeHtml(payment.note || "-")}</td>

</tr>

`;

}).join("")}

</table>


<div class="footer">
    FinansPro PRO v2 tarafından oluşturulmuştur.
</div>


<script>

window.onload = function() {
    setTimeout(function() {
        window.print();
    }, 400);
};

<\/script>

</body>

</html>

`);


    reportWindow.document.close();

    showToast(
        "PDF raporu hazırlandı. Açılan pencereden PDF olarak kaydedebilirsiniz."
    );

}


/* =========================================================
   DOWNLOAD
========================================================= */

function downloadBlob(blob, filename) {

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    setTimeout(() => {

        URL.revokeObjectURL(url);

    }, 1000);

}


/* =========================================================
   BACKUP BUTTONS
========================================================= */

document.getElementById("exportJsonBtn")
    .addEventListener(
        "click",
        exportJSON
    );


document.getElementById("exportExcelBtn")
    .addEventListener(
        "click",
        exportExcel
    );


document.getElementById("exportWordBtn")
    .addEventListener(
        "click",
        exportWord
    );


document.getElementById("exportPdfBtn")
    .addEventListener(
        "click",
        exportPDF
    );


/* =========================================================
   QUICK ADD
========================================================= */

document.getElementById("quickAddBtn")
    .addEventListener("click", () => {

        openBackupModal();

    });


document.querySelectorAll("[data-action]")
    .forEach(button => {

        button.addEventListener("click", () => {

            const action =
                button.dataset.action;

            if (action === "income") {
                openTransactionModal("income");
            }

            if (action === "expense") {
                openTransactionModal("expense");
            }

            if (action === "debt") {
                openDebtModal();
            }

            if (action === "payment") {
                openPaymentModal();
            }

        });

    });


/* =========================================================
   SEARCH / FILTER
========================================================= */

[
    "incomeSearch",
    "incomeCategoryFilter",
    "incomeSort",
    "expenseSearch",
    "expenseCategoryFilter",
    "expenseSort",
    "debtSearch",
    "debtStatusFilter",
    "debtSort",
    "paymentSearch",
    "paymentSort"
].forEach(id => {

    const element =
        document.getElementById(id);

    if (!element) return;

    element.addEventListener(
        "input",
        renderAll
    );

    element.addEventListener(
        "change",
        renderAll
    );

});


/* =========================================================
   RESET
========================================================= */

document.getElementById("resetDataBtn")
    .addEventListener("click", () => {

        const first =
            confirm(
                "TÜM FinansPro verilerini silmek istediğinize emin misiniz?"
            );

        if (!first) return;


        const second =
            confirm(
                "Bu işlem geri alınamaz. Gelir, gider, borç ve ödeme kayıtlarının TAMAMI silinecek. Devam edilsin mi?"
            );

        if (!second) return;


        incomes = [];
        expenses = [];
        debts = [];
        payments = [];


        Object.values(STORAGE_KEYS)
            .forEach(key =>
                localStorage.removeItem(key)
            );


        renderAll();

        showToast(
            "Tüm veriler temizlendi."
        );

    });


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

    renderDashboard();

    renderIncomePage();

    renderExpensePage();

    renderDebtPage();

    renderPaymentPage();

    renderReports();

}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderAll();

        showPage("dashboard");

    }
);


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.openTransactionModal =
    openTransactionModal;

window.openDebtModal =
    openDebtModal;

window.openPaymentModal =
    openPaymentModal;

window.editIncome =
    editIncome;

window.editExpense =
    editExpense;

window.deleteIncome =
    deleteIncome;

window.deleteExpense =
    deleteExpense;

window.deleteDebt =
    deleteDebt;

window.editPayment =
    editPayment;

window.deletePayment =
    deletePayment;
/* =========================================================
   FINANSPRO iPHONE MOBİL KONTROLLER
   ========================================================= */

(function initMobileInterface() {

    if (window.__finansProMobileReady) {
        return;
    }

    window.__finansProMobileReady = true;

    function createMobileBackButton() {

        const topbar = document.querySelector(".topbar");

        if (!topbar) {
            return;
        }

        if (document.querySelector(".mobile-back-btn")) {
            return;
        }

        const heading = topbar.querySelector(".page-heading");

        if (!heading) {
            return;
        }

        const button = document.createElement("button");

        button.type = "button";
        button.className = "mobile-back-btn";
        button.innerHTML = "‹";
        button.setAttribute("aria-label", "Geri");

        button.addEventListener("click", function () {

            if (typeof currentPage !== "undefined" &&
                currentPage !== "dashboard") {

                showPage("dashboard");

            } else {

                history.back();

            }

        });

        heading.parentNode.insertBefore(button, heading);

    }


    function createMobileBottomNav() {

        if (document.querySelector(".mobile-bottom-nav")) {
            return;
        }

        const nav = document.createElement("nav");

        nav.className = "mobile-bottom-nav";

        nav.innerHTML = `
            <button type="button" data-mobile-page="dashboard">
                <span>⌂</span>
                Ana Sayfa
            </button>

            <button type="button" data-mobile-page="income">
                <span>↗</span>
                Gelir
            </button>

            <button type="button" data-mobile-page="expense">
                <span>↘</span>
                Gider
            </button>

            <button type="button" data-mobile-page="debt">
                <span>₺</span>
                Borç
            </button>

            <button type="button" data-mobile-page="payment">
                <span>✓</span>
                Ödeme
            </button>
        `;

        document.body.appendChild(nav);

        nav.querySelectorAll("[data-mobile-page]")
            .forEach(button => {

                button.addEventListener("click", function () {

                    const page =
                        this.dataset.mobilePage;

                    if (typeof showPage === "function") {
                        showPage(page);
                    }

                });

            });

    }


    function updateMobileBottomNav() {

        const nav =
            document.querySelector(".mobile-bottom-nav");

        if (!nav) {
            return;
        }

        nav.querySelectorAll("[data-mobile-page]")
            .forEach(button => {

                button.classList.toggle(
                    "active",
                    button.dataset.mobilePage === currentPage
                );

            });

    }


    const originalShowPage =
        window.showPage;

    if (typeof originalShowPage === "function") {

        window.showPage = function(page) {

            originalShowPage(page);

            updateMobileBottomNav();

        };

    }


    function start() {

        createMobileBackButton();

        createMobileBottomNav();

        updateMobileBottomNav();

    }


    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            start,
            { once: true }
        );

    } else {

        start();

    }

})();
