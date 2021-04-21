let db; // Declaring DB

const request = indexedDB.open('budget', 1); // Opening indexedDB DB

// Whenever a new version of the DB is created, this function occurs
request.onupgradeneeded = (event) => {
    const db = event.target.result;
    db.createObjectStore('transactions', { autoIncrement: true });
};
// Catching error if DB isn't created
request.onerror = (event) => {
    console.log("Oh no!" + event.target.errorCode);
};

// If DB is successfully created
request.onsuccess = (event) => {
    db = event.target.result;

    document.querySelector("#add-btn").onclick = function() {
        addTransaction();
    };

    // // Check if app is offline
    // if (navigator.offline) {
    //     addTransaction();
    // } 
};

// Adding data to DB
function addTransaction() {

    let nameEl = JSON.stringify(document.querySelector("#t-name").value);
    let amountEl = JSON.stringify(document.querySelector("#t-amount").value);

    let transactionObject = [ { name: nameEl, value: amountEl, date: new Date().toISOString() } ]

    const transaction = db.transaction(['transactions'], 'readwrite'); // Create transaction
    const table = transaction.objectStore('transactions'); // Access table
    table.add(transactionObject); // Add data to table
};

function checkDatabase() {
    const transaction = db.transaction(["transactions"], "readwrite");
    const table = transaction.objectStore("transactions");
    // get all records from store and set to a variable
    const getAll = table.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
        fetch("/api/transaction/bulk", {
            method: "POST",
            body: JSON.stringify(getAll.result),
            headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(() => {
            const transaction = db.transaction(["transactions"], "readwrite");
            const table = transaction.objectStore("transactions");
            // clear all items in your store
            table.clear();
        });
        }
    };
};

// Listening for app to come back online
window.addEventListener('online', checkDatabase);