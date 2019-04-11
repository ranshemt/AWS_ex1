if (process.env.NODE_ENV !== 'production')
    require('dotenv').config()
//
const express = require ('express')
const cron = require ('node-cron')
const FU = require ('./funcs')
const port = process.env.PORT || 5555
//
let S3_Q = process.env.s3_all
let S3_OK = process.env.s3_ok
let S3_BAD = process.env.s3_bad
//
app = express()
//
async function mainLoop() {
    let keys = await FU.getAllKeys(S3_Q)
    console.log(`${keys.length} New files found in S3 bucket (${S3_Q})`)
    for(const objKey of keys){
        let body = await FU.fileContents(S3_Q, objKey)
        //console.log(`\n---\nbody of file: ${objKey}\n${body}`)

        let msg = await FU.verifyKeyWord(body).toString()
        console.log(`The file: ${objKey} is valid? ${msg}`)
        let uploadTo = msg == 'true' ? S3_OK : S3_BAD
        if(msg == 'false')
            await FU.slackNotification()

        let resCopy = await FU.copyToBucket(S3_Q, uploadTo, objKey)
        if(resCopy) await FU.deleteObjFromBucket(S3_Q, objKey)
        console.log('---\n---')
    }
}
//
cron.schedule('*/1 * * * *', async () => {
    console.log('*\n**\n***\nruning the loop every 1 minute')
    mainLoop()
})
//
app.listen(port, () => console.log(`express server ready on port: ${port}`))