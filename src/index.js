import { Router } from '@tsndr/cloudflare-worker-router';
import { handleRequest } from './router';

// let FORGE_CLIENT_ID, FORGE_CLIENT_SECRET, FORGE_BUCKET, PORT, API_KEY_ID, API_SECRET_KEY = undefined;
// const FORGE_CLIENT_ID="pK9BkuAM7B1g69CyWNJT96PlBfVmIxpjGbl2az5swz11n6Jr";
// const FORGE_CLIENT_SECRET="zTGoMpo8ClxupGMkiTS9uQRgBLAeFXd3tr8AGmotZopqkiB6FOjWGuKI190TGlUV";
// const API_ID = "DOlds4ACD0bb";
// const API_Key = "0HSonBRmHTKed4mrH9QDl1pOIEEoGJTt";
// let FORGE_BUCKET = "pk9bkuam7b1g69cywnjt96plbfvmixpjgbl2az5swz11n6jr-tunnel";
// let forgetoken = null;

const router = new Router();
router.cors();

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
