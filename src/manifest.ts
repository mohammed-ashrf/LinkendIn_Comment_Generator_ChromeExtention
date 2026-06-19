import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
    manifest_version: 3,
    name: 'LinkedIn AI Assistant',
    version: '1.0.0',

    permissions: [
        "sidePanel",
        "activeTab",
        "storage"
    ],

    host_permissions: [
        "https://www.linkedin.com/*"
    ],

    background: {
        service_worker: 'src/background/background.ts',
        type: 'module'
    },

    action: {
        default_title: 'LinkedIn AI Assistant'
    },

    side_panel: {
        default_path: "index.html"
    }
});