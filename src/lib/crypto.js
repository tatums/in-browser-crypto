import DataStore from './data_store'

class Crypto {

  constructor() {
    this.key = null
    this.iv = null
  }

  generateKeys () {
    this.iv = window.crypto.getRandomValues(new Uint8Array(12))
    document.querySelector('#iv').innerHTML = JSON.stringify(this.iv)

    return window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256, },
      true,
      ["encrypt", "decrypt"]
    )
    .then(key => {
      this.key = key
      return window.crypto.subtle.exportKey("jwk", key)
    })
    .then(exportKey => {
      document.querySelector('#key').innerHTML = JSON.stringify(exportKey)
    })
  }

  upload () {
    let file = window.document.getElementById("file-upload").files[0]
    let reader = new window.FileReader()
    let ds = new DataStore
    reader.readAsArrayBuffer(file)

    reader.onload = (resp) => {
      let data = resp.target.result
      this.encrypt(data, this.key)
        .then(ds.upload)
        .then(resp => {
          console.log('RESP', resp);
        })
        .catch(err => {
          console.log('ERR', err);
        })
    }
  }

  download () {
    let ds = new DataStore
    ds.download()
      .then(this.decryptFile.bind(this))
      .then(this.appendFileToPage.bind(this))
      .then (resp => {
        console.log('RESP', resp)
      }).catch(err => {
        console.log('ERR', err);
      })
  }

  //PRIVATE/////////////////////////////////////////////////////

  encrypt(data, key) {

    return window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: this.iv, tagLength: 128 },
      key,
      data
    )
      .then(encrypted => {
        // build a new blob packaged as [IV + enctrypted_data]
        let encBuffer = new Uint8Array(encrypted)
        let tmp = new Uint8Array(this.iv.byteLength + encBuffer.byteLength);
        tmp.set(new Uint8Array(this.iv), 0);
        tmp.set(new Uint8Array(encBuffer), this.iv.byteLength);
        return tmp.buffer;
      })
  }

  decryptFile(s3Obj) {
    let iv          = s3Obj.Body.slice(0, 12) // first 12 is the IV
    let ciphertext  = s3Obj.Body.slice(12); // Remainder is ciphertext
    let key = this.key
    return window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv, tagLength: 128 },
      key,
      ciphertext
    )
  }

  appendFileToPage(buffer){
    let blob = new Blob([buffer], {type: "application/octet-stream"});
    let url = URL.createObjectURL(blob);
    window.document.getElementById("download-links").insertAdjacentHTML(
      'beforeEnd',
      `<li>
        <a href="${url}">download</a>
       </li>`)
  }

}

export default Crypto
