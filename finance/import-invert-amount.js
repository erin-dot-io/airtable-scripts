// INPUT VARIABLES
// merchant_raw = Field values / *Name
// id = Airtable record ID

let config = input.config();
let importId = config.id;
let importAmount = config.amount;

let transactions = base.getTable('Transactions');
let transactionsFiltered = await transactions.getView('Check: Invert Amount').selectRecordsAsync({
    fields: ['**USD', 'Tags']
});

// Get this transaction from the transactions table
// Needed in order to update this transaction's fields
let thisTransaction = transactionsFiltered.getRecord(importId);

if (thisTransaction.getCellValue('Tags')) {
    let update = await transactions.updateRecordAsync(thisTransaction, {
        '**USD': -importAmount,
        'Tags': [ ...thisTransaction.getCellValue('Tags'), { name: 'Amount Inverted' }]
    });
} else {
    let update = await transactions.updateRecordAsync(thisTransaction, {
        '**USD': -importAmount,
        'Tags': [{ name: 'Amount Inverted' }]
    });
}

console.log(`Amount inverted!`);