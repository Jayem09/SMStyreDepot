import admin from 'firebase-admin';

let firebaseApp = null;


function initializeFirebase() {
    if (firebaseApp) {
        return firebaseApp;
    }

    try {
        
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

        if (!projectId || !privateKey || !clientEmail) {
            console.warn('⚠️  Firebase credentials not found. Push notifications will be disabled.');
            console.warn('   Set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL in .env');
            return null;
        }

        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                privateKey,
                clientEmail,
            }),
        });

        console.log('✅ Firebase Admin SDK initialized successfully');
        return firebaseApp;
    } catch (error) {
        console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
        return null;
    }
}


function getMessaging() {
    const app = initializeFirebase();
    if (!app) {
        return null;
    }
    return admin.messaging();
}


function isFirebaseConfigured() {
    return firebaseApp !== null || (
        process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_PRIVATE_KEY &&
        process.env.FIREBASE_CLIENT_EMAIL
    );
}

export {
    initializeFirebase,
    getMessaging,
    isFirebaseConfigured,
};
