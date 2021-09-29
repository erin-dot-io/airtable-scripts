// INPUT VARIABLES
// merchant_raw = Field values / *Name
// id = Airtable record ID
// tag_names = Field values / tags
// amount = Field values = Field values / **USD

let config = input.config();
let importId = config.id;

let transactions = base.getTable('Transactions');
let transactionsFiltered = await transactions.getView('Uncategorized').selectRecordsAsync();
let thisTransaction = transactionsFiltered.getRecord(importId);


// Match Merchant
let importMerchantRaw = config.merchant_raw.toLowerCase();
let merchants = await base.getTable('Merchants').selectRecordsAsync();

// Iterate over each Merchant
for (let merchantRecord of merchants.records) {
    let merchantName = merchantRecord.getCellValue('Name').toLowerCase();

    // First check for a direct match
    if (importMerchantRaw.includes(merchantName)) {
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
                console.log(keyword);
                if (importMerchantRaw.includes(keyword)) {
                    let update = await transactions.updateRecordAsync(thisTransaction, {
                        'Merchant': [{ id: merchantRecord.id }],
                        // TODO: Throws error if there are no other tags...
                        // 'Tags': [ ...thisTransaction.getCellValue('Tags'), { name: 'Merchant Matched' }]
                        'Tags': [{ name: 'Merchant Matched' }]
                    });
                }
            }

        }
    }
}
