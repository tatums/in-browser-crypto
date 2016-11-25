import DataStore from './data_store'

class Crypto {

  constructor() {
    this.key = null
    this.iv = null
    this.fileMeta = null
    this.meta = null
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
    this.fileMeta = JSON.stringify({name: file.name, type: file.type})

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
        // build a new blob packaged as [ map + FileMeta + IV + enctrypted_data]
        let fileMetaBuffer = new TextEncoder('utf-8').encode(this.fileMeta);
        let encBuffer = new Uint8Array(encrypted)
        let tmp = new Uint8Array(this.iv.byteLength + encBuffer.byteLength + fileMetaBuffer.byteLength + 2);

        let map = new Uint8Array(2)
        map[0] = fileMetaBuffer.byteLength + 2
        map[1] = fileMetaBuffer.byteLength + this.iv.byteLength + 2

        tmp.set(map, 0)
        tmp.set(fileMetaBuffer, 2)
        tmp.set(this.iv, (fileMetaBuffer.byteLength + 2));
        tmp.set(encBuffer, (this.iv.byteLength + fileMetaBuffer.byteLength + 2));

        return tmp.buffer;
      })
  }

  decryptFile(s3Obj) {
    let map = s3Obj.Body.slice(0, 2)
    let fileMeta    = s3Obj.Body.slice(2, map[0]) // first x is the Filemeta
    let iv          = s3Obj.Body.slice(map[0], map[1]) // then the IV
    let ciphertext  = s3Obj.Body.slice(map[1]); // Remainder is ciphertext
    let string = new TextDecoder('utf-8').decode(fileMeta);
    this.meta = JSON.parse(string)
    return window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv, tagLength: 128 },
      this.key,
      ciphertext
    )
  }

  appendFileToPage(buffer){
    let blob = new Blob([buffer], {type: this.meta.type});
    let url = URL.createObjectURL(blob);
    window.document.getElementById("download-links").insertAdjacentHTML(
      'beforeEnd',
      `<li>
        <a download="${this.meta.name}" href="${url}">${this.meta.name}</a>
       </li>`)
  }

}

export default Crypto
