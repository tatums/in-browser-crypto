import 'skeleton-css/css/normalize.css'
import 'skeleton-css/css/skeleton.css'
import './css/style.css'

import DataStore from './lib/data_store'
import Crypto from './lib/crypto'

const crypt = new Crypto
const dataStore = new DataStore

export {dataStore, crypt}
