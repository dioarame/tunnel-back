import { Router } from '@tsndr/cloudflare-worker-router';

let FORGE_CLIENT_ID, FORGE_CLIENT_SECRET, FORGE_BUCKET, PORT, API_KEY_ID, API_SECRET_KEY = undefined;

const router = new Router();
router.cors();

router.get('/', ({ env, req, res}) => {
    API_KEY_ID = env.API_KEY_ID;
    FORGE_CLIENT_ID = env.FORGE_CLIENT_ID;
    FORGE_CLIENT_SECRET = env.FORGE_CLIENT_SECRET;
    FORGE_BUCKET = env.FORGE_BUCKET;
    PORT = env.PORT;
    API_KEY_ID = env.API_KEY_ID;
    API_SECRET_KEY = env.API_SECRET_KEY;
   return new Response('values are okay');
});

export {
    FORGE_CLIENT_ID,
    FORGE_CLIENT_SECRET,
    FORGE_BUCKET,
    PORT,
    API_KEY_ID,
    API_SECRET_KEY
};
