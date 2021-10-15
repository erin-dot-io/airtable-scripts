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

// Iterate over each merchant to find and apply a match if one exists.
for (let merchantRecord of merchants.records) {
    let merchantName = merchantRecord.getCellValue('Name').toLowerCase();

    // First check for a direct match
    if (importMerchantRaw.includes(merchantName)) {
        console.log(`Merchant direct match!`);
        let update = await transactions.updateRecordAsync(thisTransaction, {
            'Merchant': [{ id: merchantRecord.id }],
            // TODO: Throws error if there are no other tags...
            // 'Tags': [ ...thisTransaction.getCellValue('Tags'), { name: 'Merchant Matched' }]
            'Tags': [{ name: 'Merchant Matched' }]
        });
    // Otherwise, check the Keywords field for a match
    } else {
        let keywords = merchantRecord.getCellValue('Keywords');

        if (keywords) {
            let keywordsArray = keywords.toLowerCase().split(', ');

            for (let keyword of keywordsArray) {
                // Check if there is a keyword match
                if (importMerchantRaw.includes(keyword)) {
                    console.log(`Merchant keyword match!`);

                    if (thisTransaction.getCellValue('Tags')) {
                        let update = await transactions.updateRecordAsync(thisTransaction, {
                            'Merchant': [{ id: merchantRecord.id }],
                            'Tags': [ ...thisTransaction.getCellValue('Tags'), { name: 'Merchant Matched' }]
                        });
                    } else {
                        let update = await transactions.updateRecordAsync(thisTransaction, {
                            'Merchant': [{ id: merchantRecord.id }],
                            'Tags': [{ name: 'Merchant Matched' }]
                        });
                    }
                // If there's no match (direct or keyword), tag the transaction as so
                }
                else {
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
            }

        }
    }
}
