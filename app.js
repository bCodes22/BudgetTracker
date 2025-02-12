//Initialize variables
let transactions = [];
let balance = 0;

//exchanges rates
const exchangeRates = {
    USD: { USD: 1, EUR: 0.85, GBP: 0.75, BDT: 116.67 },
    EUR: { USD: 1.18, EUR: 1, GBP: 0.88, BDT: 126.52 },
    GBP: { USD: 1.33, EUR: 1.14, GBP: 1, BDT: 152.59 },
    BDT: { USD: 0.0084, EUR: 0.0079, GBP: 0.0066, BDT: 1 }
};

//sets initial balance
document.getElementById("set-balance-button").addEventListener("click", () => {
    const initialBalance = parseFloat(document.getElementById("initial-balance").value);
    balance = parseFloat(initialBalance) || 0;
    document.getElementById("balance-display").textContent = `$${balance.toFixed(2)}`;
});

//adds the transactions
document.getElementById("transaction-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const amount = parseFloat(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const currency = document.getElementById("currency").value;
    const description = document.getElementById("description").value;
    const transactionDate = document.getElementById("transaction-date").value;

    if (!amount || !category || !currency || !description || !transactionDate) return;

    const transaction = { amount, category, currency, description, date: transactionDate, type: 'expense' };
    transactions.push(transaction);

    const convertedAmount = convertCurrency(amount, currency, 'USD');
    balance -= convertedAmount;

    document.getElementById("balance-display").textContent = `$${balance.toFixed(2)}`;

    updateTransactionHistory();
    document.getElementById("transaction-form").reset();
});

//adds balance
document.getElementById("add-balance-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const amount = parseFloat(document.getElementById("balance-amount").value);
    const method = document.getElementById("balance-method").value;
    const description = document.getElementById("balance-description").value;
    const currency = document.getElementById("balance-currency").value;
    const balanceDate = document.getElementById("balance-date").value;

    if (!amount || !method || !description || !currency || !balanceDate) return;

    //adds balance to transactions
    const balanceTransaction = {
        amount: `+${amount}`, // Show as positive in history
        category: method,
        currency: currency,
        description: description,
        date: balanceDate,
        type: 'balance'
    };
    transactions.push(balanceTransaction);

    const convertedAmount = convertCurrency(amount, currency, 'USD');
    balance += convertedAmount;

    document.getElementById("balance-display").textContent = `$${balance.toFixed(2)}`;

    updateTransactionHistory();
    document.getElementById("add-balance-form").reset();
});

//updates transaction history
function updateTransactionHistory() {
    const tbody = document.querySelector("#transaction-table tbody");
    tbody.innerHTML = "";
    transactions.forEach((transaction, index) => {
        const tableRow = document.createElement("tr");
        tableRow.innerHTML = `
            <td>${transaction.category}</td>
            <td>${transaction.description}</td>
            <td>${transaction.currency}</td>
            <td>${transaction.amount}</td>
            <td>${transaction.date}</td>
            <td>
                <button onclick="editTransaction(${index})">Edit</button>
                <button onclick="deleteTransaction(${index})">Delete</button>
            </td>
        `;
        tbody.appendChild(tableRow);
    });
}

//edits transactions
function editTransaction(index) {
    const transaction = transactions[index];
    if (!transaction) return;

    //pre-fill the form fields with the transaction data section
    document.getElementById("amount").value = Math.abs(transaction.amount);
    document.getElementById("category").value = transaction.category;
    document.getElementById("currency").value = transaction.currency;
    document.getElementById("description").value = transaction.description;
    document.getElementById("transaction-date").value = transaction.date;

    // Modify the form submission behavior
    const submitButton = document.querySelector("#transaction-form button[type='submit']");
    submitButton.textContent = "Update Transaction";
    submitButton.removeEventListener("click", addTransaction);
    submitButton.addEventListener("click", function() {
        updateTransaction(index);
    });
}

//updates transaction after editung
function updateTransaction(index) {
    const amount = parseFloat(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const currency = document.getElementById("currency").value;
    const description = document.getElementById("description").value;
    const transactionDate = document.getElementById("transaction-date").value;

    if (!amount || !category || !currency || !description || !transactionDate) return;

    //reverses the effect of the old transaction (if it was an "Add Balance" transaction)
    const oldTransaction = transactions[index];
    const oldConvertedAmount = convertCurrency(oldTransaction.amount, oldTransaction.currency, 'USD');
    if (oldTransaction.type === 'balance') {
        balance -= oldConvertedAmount;
    } else {
        balance += oldConvertedAmount;
    }

    //updates the transactions
    const updatedTransaction = { amount, category, currency, description, date: transactionDate, type: oldTransaction.type };
    transactions[index] = updatedTransaction;

    //applies the updated transaction's effect on the balance
    const updatedConvertedAmount = convertCurrency(amount, currency, 'USD');
    if (updatedTransaction.type === 'balance') {
        balance += updatedConvertedAmount;
    } else {
        balance -= updatedConvertedAmount;
    }

    document.getElementById("balance-display").textContent = `$${balance.toFixed(2)}`;

    updateTransactionHistory();
    document.getElementById("transaction-form").reset();
    const submitButton = document.querySelector("#transaction-form button[type='submit']");
    submitButton.textContent = "Add Transaction";
    submitButton.removeEventListener("click", updateTransaction);
    submitButton.addEventListener("click", addTransaction);
}

//will delete transactions
function deleteTransaction(index) {
    const transaction = transactions[index];
    if (!transaction) return;

    const convertedAmount = convertCurrency(transaction.amount, transaction.currency, 'USD');
    if (transaction.type === 'balance') {
        balance -= convertedAmount;
    } else {
        balance += convertedAmount;
    }

    transactions.splice(index, 1);
    updateTransactionHistory();

    document.getElementById("balance-display").textContent = `$${balance.toFixed(2)}`;
}

//search transactions for the app
function searchTransactions() {
    const searchTerm = document.getElementById("search-bar").value.toLowerCase();
    const filteredTransactions = transactions.filter(transaction =>
        transaction.category.toLowerCase().includes(searchTerm) ||
        transaction.description.toLowerCase().includes(searchTerm) ||
        transaction.date.includes(searchTerm)
    );

    const tbody = document.querySelector("#transaction-table tbody");
    tbody.innerHTML = "";
    filteredTransactions.forEach((transaction, index) => {
        const tableRow = document.createElement("tr");
        tableRow.innerHTML = `
            <td>${transaction.category}</td>
            <td>${transaction.description}</td>
            <td>${transaction.currency}</td>
            <td>${transaction.amount}</td>
            <td>${transaction.date}</td>
            <td>
                <button onclick="editTransaction(${index})">Edit</button>
                <button onclick="deleteTransaction(${index})">Delete</button>
            </td>
        `;
        tbody.appendChild(tableRow);
    });
}

//converts the currency using the functions here
document.getElementById("convert-currency").addEventListener("click", () => {
    const amount = parseFloat(document.getElementById("conversion-amount").value);
    const fromCurrency = document.getElementById("from-currency").value;
    const toCurrency = document.getElementById("to-currency").value;

    if (isNaN(amount) || amount <= 0) {
        document.getElementById("converted-amount").textContent = "Invalid input. Please enter a valid amount.";
        return;
    }

    if (!exchangeRates[fromCurrency] || !exchangeRates[fromCurrency][toCurrency]) {
        document.getElementById("converted-amount").textContent = "Conversion rate not available.";
        return;
    }

    const rate = exchangeRates[fromCurrency][toCurrency];
    const convertedAmount = amount * rate;

    document.getElementById("converted-amount").textContent = `${convertedAmount.toFixed(4)} ${toCurrency}`;
});

// Currency conversion helper
function convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;
    return amount * exchangeRates[fromCurrency][toCurrency];
}
