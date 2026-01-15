// Firebase imports commented out - install firebase-admin if needed
// import { initializeApp, cert, getApps } from 'firebase-admin/app';
// import { getFirestore } from 'firebase-admin/firestore';
// import { getAuth } from 'firebase-admin/auth';
// import { getStorage } from 'firebase-admin/storage';

class FirebaseService {
  private app: any;
  private db: any;
  private auth: any;
  private storage: any;

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      console.log('Firebase service initialized (Firebase Admin SDK not installed)');
      return;
      // Check if Firebase is already initialized
      /* if (getApps().length === 0) {
        // Initialize Firebase with service account
        const serviceAccount = {
          type: "service_account",
          project_id: "genz-a2921",
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
          client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
        };

        this.app = initializeApp({
          credential: cert(serviceAccount as any),
          databaseURL: "https://genz-a2921-default-rtdb.firebaseio.com",
          storageBucket: "genz-a2921.appspot.com"
        });
      } else {
        this.app = getApps()[0];
      }

      this.db = null; // getFirestore(this.app);
      this.auth = null; // getAuth(this.app);
      this.storage = null; // getStorage(this.app); */
      
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
    }
  }

  async createUser(userData: any) {
    try {
      const userRecord = await this.auth.createUser({
        email: userData.email,
        displayName: `${userData.firstName} ${userData.lastName}`,
        phoneNumber: userData.phone,
        disabled: false,
      });

      // Store additional user data in Firestore
      await this.db.collection('users').doc(userRecord.uid).set({
        ...userData,
        uid: userRecord.uid,
        createdAt: new Date(),
      });

      return userRecord;
    } catch (error) {
      console.error('Error creating Firebase user:', error);
      throw error;
    }
  }

  async updateUser(userId: string, updateData: any) {
    try {
      await this.db.collection('users').doc(userId).update({
        ...updateData,
        updatedAt: new Date(),
      });
      return true;
    } catch (error) {
      console.error('Error updating Firebase user:', error);
      throw error;
    }
  }

  async getUser(userId: string) {
    try {
      const doc = await this.db.collection('users').doc(userId).get();
      return doc.exists ? doc.data() : null;
    } catch (error) {
      console.error('Error getting Firebase user:', error);
      throw error;
    }
  }

  async sendNotification(userId: string, notification: any) {
    try {
      await this.db.collection('notifications').add({
        userId,
        ...notification,
        createdAt: new Date(),
        read: false,
      });
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  async uploadFile(buffer: Buffer, filename: string, folder: string = 'uploads') {
    try {
      const bucket = this.storage.bucket();
      const file = bucket.file(`${folder}/${filename}`);
      
      await file.save(buffer, {
        metadata: {
          contentType: 'application/octet-stream',
        },
      });

      // Make file publicly readable
      await file.makePublic();
      
      return `https://storage.googleapis.com/${bucket.name}/${folder}/${filename}`;
    } catch (error) {
      console.error('Error uploading file to Firebase Storage:', error);
      throw error;
    }
  }

  async logActivity(userId: string, activity: string, metadata?: any) {
    try {
      await this.db.collection('activity_logs').add({
        userId,
        activity,
        metadata: metadata || {},
        timestamp: new Date(),
      });
      return true;
    } catch (error) {
      console.error('Error logging activity:', error);
      return false;
    }
  }
}

export const firebaseService = new FirebaseService();
