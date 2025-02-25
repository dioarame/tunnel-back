import { Router } from '@tsndr/cloudflare-worker-router';

let FORGE_CLIENT_ID="pK9BkuAM7B1g69CyWNJT96PlBfVmIxpjGbl2az5swz11n6Jr";
let FORGE_CLIENT_SECRET="zTGoMpo8ClxupGMkiTS9uQRgBLAeFXd3tr8AGmotZopqkiB6FOjWGuKI190TGlUV";
let FORGE_BUCKET = "pk9bkuam7b1g69cywnjt96plbfvmixpjgbl2az5swz11n6jr-tunnel";
let OBJECT_KEY = "";

let forgetoken = null;


export async function getForgeToken() {
  const response = await fetch('https://developer.api.autodesk.com/authentication/v2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: FORGE_CLIENT_ID,
      client_secret: FORGE_CLIENT_SECRET,
      grant_type: 'client_credentials',
      // grant_type: 'authorization_code',
      // scope: 'bucket:read data:read'
      scope: 'bucket:read bucket:create data:read data:write data:create'
    })
  });
  if (!response.ok) {
      throw new Error(`Failed to get token: ${response.statusText}`);
  }
  const data = response.json(); // access_token
  return data;
}

export async function listObjects(token) {
  const response = await fetch(`https://developer.api.autodesk.com/oss/v2/buckets/${FORGE_BUCKET}/objects`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) {
      throw new Error(`Failed to list objects: ${response.statusText}`);
  }
  const data = response.json(); // items
  return data;
}

export async function getManifest(urn, token){
  const response = await fetch(`https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/manifest`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch manifest');
  }
  const manifest = response.json();
  return manifest;
}

export function urnify(id) {
  return Buffer.from(id).toString('base64').replace(/=/g, '');
}
