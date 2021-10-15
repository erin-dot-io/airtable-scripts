// INPUT VARIABLES
// merchant_raw = Field values / *Name
// id = Airtable record ID

let config = input.config();
let importId = config.id;
let importMerchantRaw = config.merchant_raw.toLowerCase();

let transactions = base.getTable('Transactions');
let transactionsFiltered = await transactions.getView('Check: Merchant Match').selectRecordsAsync({
    fields: ['Merchant', 'Tags']
});

// Get this transaction from the transactions table
// Needed in order to update this transaction's fields
let thisTransaction = transactionsFiltered.getRecord(importId);

// Get list of merchants from merchant table
let merchants = await base.getTable('Merchants').selectRecordsAsync({
    fields: ['Name', 'Keywords']
});

// Set a global variable to track whether the record has had a merchant assigned to it.
var merchantMatch = '';

// Iterate over each merchant to find and apply a match if one exists.
for (let merchantRecord of merchants.records) {
    let merchantName = merchantRecord.getCellValue('Name').toLowerCase();
    let keywords = merchantRecord.getCellValue('Keywords');

    // First check for a direct match
    if (importMerchantRaw.includes(merchantName)) {
        var merchantMatch = merchantRecord.id;

        console.log(`Merchant direct match: ${merchantMatch}`);
    // Otherwise, check the Keywords field for a match
    } else if (keywords) {
        let keywordsArray = keywords.toLowerCase().split(', ');

        for (let keyword of keywordsArray) {
            // Check if there is a keyword match
            if (importMerchantRaw.includes(keyword)) {
                var merchantMatch = merchantRecord.id;

                console.log(`Merchant keyword match: ${merchantMatch}`);
            }
        }
    }
}

// Check if a merchant had been assigned
// If not, tag transaction as so
if (merchantMatch != '') {
    console.log(`Merchant assigned? YES: ${merchantMatch}`)

    if (thisTransaction.getCellValue('Tags')) {
        let update = await transactions.updateRecordAsync(thisTransaction, {
            'Merchant': [{ id: merchantMatch }],
            'Tags': [ ...thisTransaction.getCellValue('Tags'), { name: 'Merchant Matched' }]
        });
    } else {
        let update = await transactions.updateRecordAsync(thisTransaction, {
            'Merchant': [{ id: merchantMatch }],
            'Tags': [{ name: 'Merchant Matched' }]
        });
    }
} else {
    console.log(`Merchant assigned? NO: ${merchantMatch}`)

    if (thisTransaction.getCellValue('Tags')) {
        let update = await transactions.updateRecordAsync(thisTransaction, {
            'Tags': [ ...thisTransaction.getCellValue('Tags'), { name: 'No Merchant Match' }]
        });
    } else {
        let update = await transactions.updateRecordAsync(thisTransaction, {
            'Tags': [{ name: 'No Merchant Match' }]
        });
    }
}