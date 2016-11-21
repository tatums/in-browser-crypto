import AWS from 'aws-sdk'

const s3 = new AWS.S3({
})

export default class DataStore {
  constructor() {
    this._AWS = AWS
  }

  upload () {
    console.log('UPLOAD');

    var file = document.getElementById("source-file").files[0]

    readFile(file)
      .then(encryptFile)
      .then(uploadFile)
      .then(function(resp) {
        console.log('enc resp', resp);
      })
      .catch(function(err){
        console.log(err);
      })
  }
}
