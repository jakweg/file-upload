import Vue from 'vue';
import VueRouter from 'vue-router';
import HomeLayout from '../layouts/HomeLayout';
import NotFoundLayout from '../layouts/NotFoundLayout';
import LoginWelcomeView from '../layouts/LoginWelcomeLayout';
import UploadLayout from '../layouts/UploadLayout';
import FilesListLayout from '../layouts/FilesListLayout';
import FileDetailsLayout from '../layouts/FileDetailsLayout';
import ShowUploadTokenLayout from '../layouts/ShowUploadTokenLayout';
import UploadViaTokenLayout from '../layouts/UploadViaTokenLayout';

Vue.use(VueRouter);

const routes = [
    {path: '/', component: HomeLayout},
    {path: '/login', component: LoginWelcomeView, meta: {title: 'Login'}},
    {path: '/upload', component: UploadLayout, meta: {title: 'Upload new file'}},
    {path: '/token', component: ShowUploadTokenLayout, meta: {title: 'Your upload token'}},
    {path: '/token-upload', component: UploadViaTokenLayout, meta: {title: 'Upload file using token'}},
    {path: '/files', component: FilesListLayout, meta: {title: 'Files list'}},
    {path: '/files/:fileId', component: FileDetailsLayout, meta: {title: 'File details'}},
    {path: '*', component: NotFoundLayout, meta: {title: 'Error 404'}},
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
});

export default router;
