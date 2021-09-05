const inputConfig = input.config();

const table = base.getTable("Artists")

await main()

console.log(inputConfig);

async function main() {
    const queryResult = await table.selectRecordsAsync()
    const updateRecord = queryResult.getRecord(inputConfig.recordId)
    // const updatePhotos = updateRecord.getCellValue("Photo");

    const originalRecordId = updateRecord.getCellValue("Previous Record ID")


    const fieldMap = {
        "Name": updateRecord.getCellValue("Name"),
        "Email": updateRecord.getCellValue("Email"),
        "Chosen Name": updateRecord.getCellValue("Chosen Name"),
        "Artist Name": updateRecord.getCellValue("Artist Name"),
        "Pronouns": updateRecord.getCellValue("Pronouns"),
        // "Phone": updateRecord.getCellValue("Phone"),
        "T-Shirt Size": updateRecord.getCellValue("T-Shirt Size"),
        // "Emergency Contact": updateRecord.getCellValue("Emergency Contact"),
        "Arrival Time": updateRecord.getCellValue("Arrival Time"),
        "Departure Time": updateRecord.getCellValue("Departure Time"),
        "Transport Method": updateRecord.getCellValue("Transport Method"),
        "Flight Details": updateRecord.getCellValue("Flight Details"),
        "Flight Assist to Camp": updateRecord.getCellValue("Flight Assist to Camp"),
        "Accomodation Choice": updateRecord.getCellValue("Accomodation Choice"),
        "Accommodation Glamping 2nd Choice": updateRecord.getCellValue("Accommodation Glamping 2nd Choice"),
        "Accomodation Bunk 2nd Choice": updateRecord.getCellValue("Accomodation Bunk 2nd Choice"),
        "Bunk With Partner?": updateRecord.getCellValue("Bunk With Partner?"),
        "Bunk Partner Name": updateRecord.getCellValue("Bunk Partner Name"),
        "Bunk Bedding": updateRecord.getCellValue("Bunk Bedding"),
        "Plus 1 Name": updateRecord.getCellValue("Plus 1 Name"),
        "Plus 1 Email": updateRecord.getCellValue("Plus 1 Email"),
        "+1 Meal Plan": updateRecord.getCellValue("+1 Meal Plan"),
        "+1 Dietary Restrictions": updateRecord.getCellValue("+1 Dietary Restrictions"),
        "Dietary Restrictions": updateRecord.getCellValue("Dietary Restrictions"),
        "Other Health Needs": updateRecord.getCellValue("Other Health Needs"),
        "Questions": updateRecord.getCellValue("Questions"),
        "Music Formats": updateRecord.getCellValue("Music Formats"),
        "Controller Model": updateRecord.getCellValue("Controller Model"),
        "Mixer Preference": updateRecord.getCellValue("Mixer Preference"),
        "Other Equipment": updateRecord.getCellValue("Other Equipment"),
        "Technical Questions": updateRecord.getCellValue("Technical Questions"),
        // "Payment Preference": updateRecord.getCellValue("Payment Preference"),
        // "Payment Email": updateRecord.getCellValue("Payment Email"),
        // "Payment Phone": updateRecord.getCellValue("Payment Phone"),
        "Facebook": updateRecord.getCellValue("Facebook"),
        "Instagram": updateRecord.getCellValue("Instagram"),
        "Soundcloud Etc...": updateRecord.getCellValue("Soundcloud Etc..."),
    }

    // if (updatePhotos != null) {
    //     console.log(`New photos exist`);
    //     fieldMap["Photo"] = updatePhotos;
    // }

    console.log(`Updating original record`)
    await table.updateRecordAsync(originalRecordId, fieldMap)
    console.log(`Deleting update record`)
    await table.deleteRecordAsync(updateRecord)
}