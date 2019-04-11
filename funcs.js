const S3 = require('./awsConfig').s3
const SWH = require('slack-webhook')
//
var getAllKeys = async (bucketName) => {
    let res = []
    try {
        const response = await S3.listObjectsV2({Bucket: bucketName}).promise()
        //console.log(`bukcet name: ${response.Name} with total objects: ${response.KeyCount}`)
        res = response.Contents.map(item => {
            //console.log(JSON.stringify(item, null, 2))
            return item.Key
        })
    } catch (err) {
        console.log(`error in getAllKeys for bucket: ${bucketName}\n${err}`)
    }
    return res
}
//
var fileContents = async (bucketName, objKey) => {
    let contents = ''
    try {
        const response  = await S3.getObject({Bucket: bucketName, Key: objKey}).promise()
        contents = response.Body.toString()
    } catch (err) {
        console.log(`error in fileContents for file: ${objKey} in bucket: ${bucketName}\n${err}`)
    }
    return contents
}
//
var verifyKeyWord = (bodyStr) => {
    if(bodyStr.indexOf(process.env.KEYWORD) === -1)
        return false
    return true
}
//
var uploadToBucket = async (bucketName, objKey, bodyStr) => {
    let params = {
        Bucket: bucketName,
        Body: bodyStr,
        Key: Date.now() + '__' + objKey
    }
    try {
        const response = await S3.upload(params).promise()
        console.log(`the file ${objKey} uploaded to ${response.Location}`)
    } catch (err) {
        console.log(`error uploading file ${objKey}\n${err}`)
        return false
    }
    return true
}
//
var copyToBucket = async (srcBucket, dstBucket, objKey) => {
    console.log(`Copying FROM ${srcBucket} TO ${dstBucket} KEY: ${objKey}`)
    let params = {
        Bucket: dstBucket,
        CopySource: srcBucket + '/' + objKey,
        Key: objKey
    }
    try {
        const response = await S3.copyObject(params).promise()
        console.log(`The file ${objKey} was successfully copied`)
    } catch (err) {
        console.log(`error copying file ${objKey}\n${err}`)
        return false
    }
    return true
}
var slackNotification = async () => {
    let slack = new SWH(process.env.slackURL)
    slack.send({
        text: 'unauthorized file detected!',
        channel: '#cloud-2019-group-114'
    })
}
//
var deleteObjFromBucket = async (bucketName, objKey) => {
    console.log(`Deleting ${objKey} from ${bucketName}`)
    try {
        const response = await S3.deleteObject({Bucket: bucketName, Key: objKey}).promise()
        console.log(`The file: ${objKey} was successfully deleted from bucket: ${bucketName}`)
    } catch (err) {
        console.log(`error deleting file: ${objKey} from bucket: ${bucketName}\n${err}`)
        return false
    }
    return true
}
module.exports = {
    getAllKeys,
    fileContents,
    verifyKeyWord,
    uploadToBucket,
    copyToBucket,
    deleteObjFromBucket,
    slackNotification
}