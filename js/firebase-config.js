// ============================================================
// 312 CUP 2026 — FIREBASE YAPILANDIRMASI
// ============================================================
// 
// ADIM 1: https://console.firebase.google.com adresine gidin
// ADIM 2: "Proje Oluştur" → Proje adı: cup312-2026
// ADIM 3: Realtime Database → Veritabanı oluştur → Test modunda başlat
// ADIM 4: Proje Ayarları → Genel → Uygulama ekle (Web </>)
// ADIM 5: Aşağıdaki bilgileri Firebase'den aldığınız bilgilerle değiştirin
// ============================================================

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCYg2JHnYtgu7t8aeC6tvPBjV93wc2L7BI",
    authDomain: "cup312-2026.firebaseapp.com",
    databaseURL: "https://cup312-2026-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "cup312-2026",
    storageBucket: "cup312-2026.firebasestorage.app",
    messagingSenderId: "711501028189",
    appId: "1:711501028189:web:c163282467ed6aad17e6b4",
    measurementId: "G-T26F2MW6G9"
};

// Firebase durumu
let firebaseReady = false;
let firebaseDB = null;

function initFirebase() {
    try {
        if (typeof firebase === 'undefined') {
            console.warn('Firebase SDK yüklenmedi, localStorage modunda devam ediliyor...');
            return false;
        }

        // Check if already initialized
        if (firebase.apps.length === 0) {
            firebase.initializeApp(FIREBASE_CONFIG);
        }

        firebaseDB = firebase.database();
        firebaseReady = true;
        console.log('✅ Firebase bağlantısı başarılı!');
        return true;
    } catch (e) {
        console.warn('❌ Firebase bağlantı hatası:', e.message);
        console.warn('localStorage modunda devam ediliyor...');
        return false;
    }
}

// ── Firebase'den veri oku ──
function firebaseReadData(callback) {
    if (!firebaseReady || !firebaseDB) {
        callback(null);
        return;
    }

    firebaseDB.ref('tournament').once('value')
        .then(snapshot => {
            const data = snapshot.val();
            callback(data);
        })
        .catch(err => {
            console.warn('Firebase okuma hatası:', err);
            callback(null);
        });
}

// ── Firebase'den anlık dinle ──
function firebaseListen(callback) {
    if (!firebaseReady || !firebaseDB) return;

    firebaseDB.ref('tournament').on('value', snapshot => {
        const data = snapshot.val();
        callback(data);
    });
}

// ── Firebase'e veri yaz ──
function firebaseSaveData(results, goals) {
    if (!firebaseReady || !firebaseDB) {
        console.warn('Firebase bağlantısı yok, sadece localStorage\'a kaydedildi.');
        return Promise.resolve(false);
    }

    return firebaseDB.ref('tournament').set({
        results: results || {},
        goals: goals || [],
        lastUpdated: new Date().toISOString()
    })
    .then(() => {
        console.log('✅ Firebase\'e kaydedildi!');
        return true;
    })
    .catch(err => {
        console.warn('Firebase yazma hatası:', err);
        return false;
    });
}
