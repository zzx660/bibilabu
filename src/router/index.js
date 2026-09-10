import { createRouter, createWebHistory } from 'vue-router';
const routes = [
    { path: '/', redirect: '/read' },
    { path: '/read/:book?/:chapter?', name: 'read', component: () => import('@/views/Reader.vue') },
    { path: '/search', name: 'search', component: () => import('@/views/Search.vue') },
    { path: '/bookmarks', name: 'bookmarks', component: () => import('@/views/Bookmarks.vue') },
    { path: '/person/:id', name: 'person', component: () => import('@/views/PersonDetail.vue') },
    { path: '/ai', name: 'ai', component: () => import('@/views/AiChat.vue') },
    { path: '/chat', name: 'chat', component: () => import('@/views/Chat.vue') },
    { path: '/group/:id', name: 'group', component: () => import('@/views/GroupDetail.vue') },
    { path: '/friend/:id', name: 'friend', component: () => import('@/views/FriendProfile.vue') },
    { path: '/me', name: 'me', component: () => import('@/views/Profile.vue') },
    { path: '/login', name: 'login', component: () => import('@/views/Login.vue') },
    { path: '/feedback', name: 'feedback', component: () => import('@/views/Feedback.vue') },
    { path: '/admin', name: 'admin', component: () => import('@/views/admin/Index.vue') },
    { path: '/admin/bible', name: 'admin-bible', component: () => import('@/views/admin/BibleEdit.vue') },
    { path: '/admin/persons', name: 'admin-persons', component: () => import('@/views/admin/PersonEdit.vue') },
    { path: '/admin/kb', name: 'admin-kb', component: () => import('@/views/admin/KbUpload.vue') },
    { path: '/admin/users', name: 'admin-users', component: () => import('@/views/admin/UserMgmt.vue') },
    { path: '/admin/feedback', name: 'admin-feedback', component: () => import('@/views/admin/FeedbackMgmt.vue') }
];
export default createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        return { top: 0 };
    }
});
