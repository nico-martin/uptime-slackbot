import { UptimeRequest } from "./Firestore";
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

export const createRequest = async (): Promise<UptimeRequest> => {
  const url = process.env.URL;
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

export const formatSeconds = (secNumbers: number): string => {
  const hours = Math.floor(secNumbers / 3600);
  secNumbers %= 3600;
  const minutes = Math.floor(secNumbers / 60);
  const seconds = secNumbers % 60;

  const returnArray = [
    hours !== 0 ? hours : null,
    minutes !== 0 ? minutes : hours !== 0 ? 0 : null,
    seconds,
  ];

  return returnArray
    .map((e, i) =>
      e === null ? null : `${e}${i === 0 ? "h" : i === 1 ? "m" : "s"}`
    )
    .filter((e) => e !== null)
    .join(" ");
};
