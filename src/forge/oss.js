const fs = require('fs');
const { BucketsApi, ObjectsApi } = require('forge-apis');
const { FORGE_BUCKET } = require('../config.js');
const { getInternalToken } = require('./auth.js');
const { urnify } = require('./md.js');

async function ensureBucketExists(bucketKey) {
    try {
        await new BucketsApi().getBucketDetails(bucketKey, null, await getInternalToken());
    } catch (err) {
        if (err.response.status === 404) {
            await new BucketsApi().createBucket({ bucketKey, policyKey: 'temporary' }, {}, null, await getInternalToken());
        } else {
            throw err;
        }
    }
}

async function listObjects() {
    await ensureBucketExists(FORGE_BUCKET);
    let resp = await new ObjectsApi().getObjects(FORGE_BUCKET, { limit: 64 }, null, await getInternalToken());
    let objects = resp.body.items;
    while (resp.body.next) {
        const startAt = new URL(resp.body.next).searchParams.get('startAt');
        resp = await new ObjectsApi().getObjects(FORGE_BUCKET, { limit: 64, startAt }, null, await getInternalToken());
        objects = objects.concat(resp.body.items);
    }
    return objects;
}

async function uploadObject(objectName, filePath) {
    await ensureBucketExists(FORGE_BUCKET);
    const buffer = await fs.promises.readFile(filePath);
    const results = await new ObjectsApi().uploadResources(
        FORGE_BUCKET,
        [{ objectKey: objectName, data: buffer }],
        { useAcceleration: false, minutesExpiration: 15 },
        null,
        await getInternalToken()
    );
    if (results[0].error) {
        throw results[0].completed;
    } else {
        return results[0].completed;
    }
}

async function deleteObject(urn){
    let objects = await listObjects();
    let delete_name = "";
    var size = objects.length;
    var i = 0;
    while(i < size){
        if(urnify(objects[i].objectId) === urn){
            delete_name = objects[i].objectKey;
            break;
        }
        i++;
    }
    await new ObjectsApi().deleteObject(FORGE_BUCKET, delete_name, null, await getInternalToken());
}

// module.exports = {
//     listObjects,
//     uploadObject,
//     deleteObject
// };

export {
    listObjects
};