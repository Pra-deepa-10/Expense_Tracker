const form = document.getElementById('form');
const desc = document.getElementById('desc');
const amount = document.getElementById('amount');
const category = document.getElementById('category');
const list = document.getElementById('list');
const balance = document.getElementById('balance');
const toggleBtn = document.getElementById('toggleMode'); //for darkmode
const search = document.getElementById('search'); //to search by letters
const filterCategory = document.getElementById('filterCategory'); //tosearch filter category
const incomeTotal = document.getElementById('incomeTotal'); //for summary
const expenseTotal = document.getElementById('expenseTotal'); //for summary

let transactions = JSON.parse(localStorage.getItem('transactions')) || []; //used to retrieve data from the browser’s local storage.
//JSON is used to store data in browser as text. 
//localStorage is a built-in 'browser object' to store data in browser.
//setItem/getItem is used to store and retrieve data from browser.

let chart; // for chart instance

// ADD TRANSACTION
form.addEventListener('submit', function(e) {
  e.preventDefault();

  const transaction = {
    desc: desc.value,
    amount: Number(amount.value),
    category: category.value,
    id: Date.now()
  };

  transactions.push(transaction);

  updateLocalStorage(); //update
  init(); //initialize
  form.reset(); //will clear data from display
});

// SHOW DATA
function addToUI(transaction) {
  const li = document.createElement('li'); //creates list 

  const sign = transaction.amount < 0 ? '-' : '+'; //assigning -sign if amount<0
  li.style.color = transaction.amount < 0 ? 'red' : 'green';

  li.innerHTML = `
    ${transaction.desc} (${transaction.category}) ${sign}₹${Math.abs(transaction.amount)} 
    <button onclick="removeItem(${transaction.id})">X</button> 
    
  `; //Math.abs()- returns absolute value of a number(non-negative) eg: -5 = 5,

  list.appendChild(li); //Adds a single node to the end of a parent element
}

// DELETE (FIXED)
function removeItem(id) {
  transactions = transactions.filter(t => t.id !== id); //filter() is an array method used to create a new array containing only the elements that pass a condition (test).
  //here id which is not equal selected is filtered and stored in transactions. 
  updateLocalStorage();
  init();
}

// BALANCE
function updateBalance() {
  let total = 0;
  transactions.forEach(t => total += t.amount); //forEach() used execute func once for each element
  balance.innerText = total;
}

// LOCAL STORAGE
function updateLocalStorage() { 
  localStorage.setItem('transactions', JSON.stringify(transactions)); //object method. stores all keys and values to transactions.
}

// CHART (FIXED)
function createChart() {
  const categories = {};

  transactions.forEach(t => {
    if (t.amount < 0) {
      categories[t.category] = (categories[t.category] || 0) + Math.abs(t.amount);
    }
  });

  const data = {
    labels: Object.keys(categories),
    datasets: [{
      data: Object.values(categories),
      backgroundColor: ['red', 'blue', 'green', 'orange','purple']
    }]
  };

  // destroy old chart before creating new
  if (chart) {
    chart.destroy();
  }

  chart = new Chart(document.getElementById('myChart'), {
    type: 'pie',
    data: data
  });
}

// DARK MODE
toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark1');
});

//update summary
function updateSummary() {
  let income = 0;
  let expense = 0;

  transactions.forEach(t => {
    if (t.amount > 0) {
      income += t.amount;
    } else {
      expense += t.amount;
    }
  });

  incomeTotal.innerText = "₹" + income;
  expenseTotal.innerText = "₹" + Math.abs(expense);
}

// INIT (RENDER EVERYTHING)
function init() {
  list.innerHTML = "";

  const query = search.value.toLowerCase();
  const selectedCategory = filterCategory.value;

  let filtered = transactions;

  // search filter
  filtered = filtered.filter(t =>
    t.desc.toLowerCase().includes(query)
  );

  // category filter
  if (selectedCategory !== "All") {
    filtered = filtered.filter(t =>
      t.category === selectedCategory
    );
  }

  filtered.forEach(t => addToUI(t));
  updateBalance();
  createChart();
  updateSummary();
}


search.addEventListener('input', init); //search
filterCategory.addEventListener('change', init); //filtercategory
