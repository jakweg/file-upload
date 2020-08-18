import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

let fadeOutListener;
export const setFadeOutListener = (newListener) => {
    fadeOutListener = newListener;
};


export const fadeOutPage = () => new Promise((resolve) => {
    if (fadeOutListener)
        fadeOutListener(true);
    setTimeout(() => {
        if (fadeOutListener)
            fadeOutListener(false);

        resolve();
    }, 300);
});

const sizePrefixes = ['', 'K', 'M', 'G'];
export const formatSize = (bytes) => {
    let i = 0;
    while (bytes > 1024) {
        i++;
        bytes /= 1024;
    }
    return `${Math.round(bytes * 10) / 10}${sizePrefixes[i]}B`;
};


const waitingPromises = [];
let wasInitialized;
let auth;
let user;
let onAuthReadyListener;
export const setOnAuthReadyListener = (l) => {
    onAuthReadyListener = l;
};
export const onFirebaseInitialized = () => {
    firebase.firestore().enablePersistence().catch(e => console.error(e.message));
    auth = firebase.auth();
    user = auth.currentUser;
    auth.onAuthStateChanged(newUser => {
        if (!wasInitialized) {
            if (onAuthReadyListener)
                onAuthReadyListener();
            wasInitialized = true;
            if (newUser)
                waitingPromises.forEach(e => e[0](newUser));
            else
                waitingPromises.forEach(e => e[1](undefined));
            waitingPromises.length = 0;
        }
        user = newUser;
    });
};

export const delay = (millis) => new Promise(((resolve) => setTimeout(resolve, millis)));

export const requireUser = (vue) => new Promise((resolve, reject) => {
    awaitUser()
        .then(resolve,
            (e) => vue.$router
                      .push({path: '/login',})
                      .finally(() => reject(e)));
});

export const awaitUser = () => new Promise((resolve, reject) => {
    if (wasInitialized) {
        if (user) resolve(user);
        else reject();
    } else {
        waitingPromises.push([resolve, reject]);
    }
});
