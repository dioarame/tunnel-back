// const express = require('express');
// let router = express.Router();
const formidable = require('express-formidable');
const { listObjects, uploadObject, deleteObject } = require('../forge/oss.js');
const { translateObject, deleteManifest, getManifest, urnify } = require('../forge/md.js');

const { Router } = require('@tsndr/cloudflare-worker-router');
const router = new Router();

router.get('/', async function (req, res, next) {
    console.log("GET /api/models 응답");
    try {
        const objects = await listObjects();
        res.json(objects.map(o => ({
            name: o.objectKey,
            urn: urnify(o.objectId)
        })));
    } catch (err) {
        next(err);
    }
});

router.delete('/:urn/status', async function(req, res, next) { // manifest 삭제
    console.log("DELETE /api/models/URN/status 응답");
    try {
        await deleteObject(req.params.urn); // object 삭제
        const manifest = await deleteManifest(req.params.urn); // manifest 삭제
        if (manifest) {
            console.log(manifest);
            res.json({ result: manifest.result });
        } else {
            res.json({ result: "n/a" });
        }
    } catch (err) {
        next(err);
    }
});

router.get('/:urn/status', async function (req, res, next) {
    console.log("GET /api/models/URN/status 응답");
    try {
        const manifest = await getManifest(req.params.urn);
        if (manifest) {
            let messages = [];
            if (manifest.derivatives) {
                for (const derivative of manifest.derivatives) {
                    messages = messages.concat(derivative.messages || []);
                    if (derivative.children) {
                        for (const child of derivative.children) {
                            messages.concat(child.messages || []);
                        }
                    }
                }
            }
            res.json({ status: manifest.status, progress: manifest.progress, messages });
        } else {
            res.json({ status: 'n/a' });
        }
    } catch (err) {
        next(err);
    }
});

router.post('/', formidable(), async function (req, res, next) {
    console.log("POST /api/models 응답");
    const file = req.files['model-file'];
    if (!file) {
        res.status(400).send('The required field ("model-file") is missing.');
        return;
    }
    try {
        const obj = await uploadObject(file.name, file.path);
        await translateObject(urnify(obj.objectId), req.fields['model-zip-entrypoint']);
        res.json({
            name: obj.objectKey,
            urn: urnify(obj.objectId)
        });
    } catch (err) {
        next(err);
    }
});

// module.exports = router;

export default {
    async fetch(request, env, ctx) {
        return router.handle(request, env, ctx);
    }
};



