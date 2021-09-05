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


// Convert Amount to negative value if coming from Square Cash
let importAmount = config.amount;
let importTagNames = config.tag_names;
let invertedSuccessTag = 'Amount Inverted';

if (!importTagNames.includes(invertedSuccessTag) && importTagNames.includes('Zap (Square)')) {
    let update = await transactions.updateRecordAsync(thisTransaction, {
        '**USD': -importAmount,
        'Tags': [ ...thisTransaction.getCellValue('Tags'), { name: invertedSuccessTag }]
    });
}


// Match Account (not needed if account name coming from Zapier is an exact match to the linked record's name)
// let importAccountRaw = config.account_raw.toLowerCase();
// let accounts = base.getTable('Accounts');
// let accountsFiltered = await accounts.getView('Has Keywords').selectRecordsAsync();

// for (let accountRecord of accountsFiltered.records) {
//     let keywords = accountRecord.getCellValue('Keywords').toLowerCase();

//     if (importAccountRaw.includes(keywords)) {
//         let update = await transactions.updateRecordAsync(thisTransaction, {
//             'Account': [{ id: accountRecord.id }],
//             'Tags': [ ...thisTransaction.getCellValue('Tags'), { name: 'Account Matched' }]
//         });
//     }
// }


// Filter and array?
// let filteredRecords = merchantsFiltered.records.filter(match => {
//     return match.getCellValue('Keywords')
// })