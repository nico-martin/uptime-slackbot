import { UptimeRequest } from "./db";
import * as firebaseAdmin from "firebase-admin";

const fetch = require("node-fetch");

const doRequest = (url: string): Promise<{ ok: boolean; statusCode: number }> =>
  new Promise((resolve) =>
    fetch(url, { method: "GET", DNT: 1 })
      .then((resp) =>
        resolve({ ok: resp.status < 300, statusCode: resp.status })
      )
      .catch(() => resolve({ ok: false, statusCode: null }))
  );

export const requestUrl = async (url: string): Promise<UptimeRequest> => {
  const started = firebaseAdmin.firestore.Timestamp.now();
  const request = await doRequest(url);
  const ended = firebaseAdmin.firestore.Timestamp.now();

  return {
    url,
    ok: request.ok,
    statusCode: request.statusCode,
    duration: ended.toMillis() - started.toMillis(),
    started,
    ended,
  };
};
