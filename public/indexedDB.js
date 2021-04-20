let db; // Declaring DB

const request = indexedDB.open('budget', 1); // Opening indexedDB DB

// Creating Table and Columns
request.onupgradeneeded = function (event) {
    const db = event.target.result;
    const table = db.createObjectStore('transactions', { autoIncrement: true });

    table.createIndex('transactionName', 'transactionName');
    table.createIndex('transactionAmount', 'transactionAmount');

};

request.onsuccess = function (event) {
    db = event.target.result;
};

// Catching the error
request.onerror = function(event) {
    console.log("Oh no!" + event.target.errorCode);
};

// Adding data to DB
function saveTransaction(record) {
    const transaction = db.transaction(['transactions'], 'readwrite'); // Create transaction
    const table = transaction.objectStore('transactions'); // Access table
    table.add(record); // Add data to table
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