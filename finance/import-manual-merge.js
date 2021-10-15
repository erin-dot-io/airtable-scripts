let config = input.config();
let importId = config.id;
let importMerchant = config.merchant_name;
let importAmount = config.amount;

let transactions = base.getTable('Transactions');
let transactionsFiltered = await transactions.getView('Check: Manual Merge').selectRecordsAsync({
    fields: ['Merchant', 'Transaction Date', '**USD', 'Attachments', 'Personal Note', 'Tags', '💰✏️Expense']
});

// Check to make sure the record is still visibile in the 'Manual Add Check' view.
// The record can appear in the view (triggering the automation) and then immediately dissapear if
// the transaction quickly has a merchant added, and then is marked as approved in quick succession.
if (transactionsFiltered.records.length > 0) {
    console.log("Record is still visibile in 'Manual Add Check' view")

    let thisTransaction = transactionsFiltered.getRecord(importId);

    let manualAdds = await base.getTable('Transactions').getView('Manual Add').selectRecordsAsync({
        fields: ['Merchant', 'Date Created', '**USD', 'Attachments', 'Personal Note', '💰✏️Expense']
    });

    for (let manualAdd of manualAdds.records) {
        let manualAddMerchant = manualAdd.getCellValue('Merchant');
        let manualAddAmount = manualAdd.getCellValue('**USD');
        let manualAddDate = manualAdd.getCellValue('Date Created');
        let manualAddNote = manualAdd.getCellValue('Personal Note');
        let manualAddAttachments = manualAdd.getCellValue('Attachments');
        let manualAddExpense = manualAdd.getCellValue('💰✏️Expense');

        if (importMerchant.includes(manualAddMerchant[0].name) && (importAmount == manualAddAmount)) {
            console.log('Match!');

            if (thisTransaction.getCellValue('Tags')) {
                let update = await transactions.updateRecordAsync(thisTransaction, {
                    'Transaction Date': manualAddDate,
                    'Personal Note': manualAddNote,
                    'Attachments': manualAddAttachments,
                    '💰✏️Expense': manualAddExpense,
                    'Tags': [ ...thisTransaction.getCellValue('Tags'), { name: 'Manual Merged' }]
                });
            } else {
                let update = await transactions.updateRecordAsync(thisTransaction, {
                    'Transaction Date': manualAddDate,
                    'Personal Note': manualAddNote,
                    'Attachments': manualAddAttachments,
                    '💰✏️Expense': manualAddExpense,
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

