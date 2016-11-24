import AWS from 'aws-sdk'

let credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: 'us-east-1:3553b475-113d-42cf-a803-e35971920137',
});

AWS.config.update({
  region: 'us-east-1',
  credentials: credentials
});

let s3 = new AWS.S3()

class DataStore {

  constructor() {
  }

  upload (buffer) {
    return s3.putObject({
      Bucket: 'in-browser-crypto',
      Key: 'data-store',
      Body: buffer,
    }).promise();
  }

  download() {
    return s3.getObject({
      Bucket: 'in-browser-crypto',
      Key: 'data-store',
    }).promise();
  }
}
export default DataStore
