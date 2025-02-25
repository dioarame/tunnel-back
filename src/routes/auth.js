// const express = require("express");
// let router = express.Router();
const { getPublicToken } = require("../forge/auth.js");
const { Router } = require('@tsndr/cloudflare-worker-router');

const router = new Router();

router.get("/token", async function (req, res, next) {
  console.log("/api/auth/token 응답");
  try {
    res.json(await getPublicToken());
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