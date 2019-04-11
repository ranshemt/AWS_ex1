const AWS = require ('aws-sdk')
//
//configuring the AWS S3 bucket
let s3 = new AWS.S3({
    region: 'eu-west-1',
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey
})
module.exports = {
    s3
}