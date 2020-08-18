import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './other/routing';
import * as firebase from 'firebase/app';
import 'firebase/performance';
import {onFirebaseInitialized} from './other/page-global';

firebase.initializeApp({
    apiKey: 'AIzaSyAURHF-oopdFClghA05lFblDs1DUWgGMOk',
    authDomain: 'up-box.firebaseapp.com',
    databaseURL: 'https://up-box.firebaseio.com',
    projectId: 'up-box',
    storageBucket: 'up-box.appspot.com',
    messagingSenderId: '514497859204',
    appId: '1:514497859204:web:324392bba2ece1acc5bcd1'
});

onFirebaseInitialized();

Vue.config.productionTip = false;

new Vue({
    router,
    render: h => h(App)
}).$mount('#app');
