import admin from 'firebase-admin';
import {serviceAccountData} from './serviceAccount.js';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountData)
});

export default admin;



