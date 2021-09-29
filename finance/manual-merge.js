// INPUT VARIABLES
// id = Airtable record ID
// merchant_name = Field values / Merchant / Name
// amount = Field values / **USD
// import_name = Field values / *Name
// import_tags = Field values / Tags / Name

let config = input.config();
let importId = config.id;
let importMerchant = config.merchant_name;
let importAmount = config.amount;
let importName = config.import_name;
let importTags = config.import_tags;

let transactions = base.getTable('Transactions');
let transactionsFiltered = await transactions.getView('Manual Add Check').selectRecordsAsync({
    fields: ['Merchant', 'Transaction Date', '**USD', 'Attachments', 'Personal Note', 'Tags']
});

// Check to make sure the record is still visibile in the 'Manual Add Check' view.
// The record can appear in the view (triggering the automation) and then immediately dissapear if
// the transaction quickly has a merchant added, and then is marked as approved in quick succession.
if (transactionsFiltered.records.length > 0) {
    console.log("Record is still visibile in 'Manual Add Check' view")

    let thisTransaction = transactionsFiltered.getRecord(importId);

    let manualAdds = await base.getTable('Transactions').getView('Manual Add').selectRecordsAsync({
        fields: ['Merchant', 'Date Created', '**USD', 'Attachments', 'Personal Note']
    });

    for (let manualAdd of manualAdds.records) {
        let manualAddMerchant = manualAdd.getCellValue('Merchant');
        let manualAddAmount = manualAdd.getCellValue('**USD');
        let manualAddDate = manualAdd.getCellValue('Date Created');
        let manualAddNote = manualAdd.getCellValue('Personal Note');
        let manualAddAttachments = manualAdd.getCellValue('Attachments');

        if (importMerchant.includes(manualAddMerchant[0].name) && (importAmount == manualAddAmount)) {
            console.log('Match!');

            if (thisTransaction.getCellValue('Tags')) {
                let update = await transactions.updateRecordAsync(thisTransaction, {
                    'Transaction Date': manualAddDate,
                    'Personal Note': manualAddNote,
                    'Attachments': manualAddAttachments,
                    'Tags': [ ...thisTransaction.getCellValue('Tags'), { name: 'Manual Merged' }]
                });
            } else {
                let update = await transactions.updateRecordAsync(thisTransaction, {
                    'Transaction Date': manualAddDate,
                    'Personal Note': manualAddNote,
                    'Attachments': manualAddAttachments,
                    'Tags': [{ name: 'Manual Merged' }]
                });
            }

            await transactions.deleteRecordAsync(manualAdd);
        } else {
            console.log('No match!');

            if (thisTransaction.getCellValue('Tags')) {
                let update = await transactions.updateRecordAsync(thisTransaction, {
                    'Tags': [ ...thisTransaction.getCellValue('Tags'), { name: 'No Manual Merge' }]
                });
            } else {
                let update = await transactions.updateRecordAsync(thisTransaction, {
                    'Tags': [{ name: 'No Manual Merge' }]
                });
            }
        }
    }

    if (manualAdds.records.length == 0) {
        console.log('No manually added records to match!');

        if (thisTransaction.getCellValue('Tags')) {
            let update = await transactions.updateRecordAsync(thisTransaction, {
                'Tags': [ ...thisTransaction.getCellValue('Tags'), { name: 'No Manual Merge' }]
            });
        } else {
            let update = await transactions.updateRecordAsync(thisTransaction, {
                'Tags': [{ name: 'No Manual Merge' }]
            });
        }
    }
} else {
    console.log("Record disappeared from 'Manual Add Check' view")
}

