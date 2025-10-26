import { error } from "console";
import { initializeApp } from "firebase/app";
import { getStorage, uploadBytesResumable, ref, getDownloadURL } from "firebase/storage"
const firebaseConfig = {
    apiKey: "AIzaSyAZCKn770-kfev1UfZT0tSuajiD_RgrepQ",
    authDomain: "git-genius-b7a2b.firebaseapp.com",
    projectId: "git-genius-b7a2b",
    storageBucket: "git-genius-b7a2b.firebasestorage.app",
    messagingSenderId: "184983608521",
    appId: "1:184983608521:web:747427216a0e0c9338c118"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);

export async function uploadFile(file: File, setProgress?: (progress: number) => void) {
    return new Promise((resolve, reject) => {
        try {
            const storageRef = ref(storage, file.name);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed', snapshot => {
                const progress = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
                if (setProgress) setProgress(progress)
                switch (snapshot.state) {
                    case 'paused':
                        console.log('upload is paused'); break;
                    case 'running':
                        console.log('upload is running'); break;
                }
            }, error => {
                reject(error);
            }, () => {
                getDownloadURL(uploadTask.snapshot.ref).then(downloadUrl => {
                    resolve(downloadUrl);
                })
            }
            )
        }
        catch (error) {

        }
    })
}