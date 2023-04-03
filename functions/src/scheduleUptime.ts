import * as functions from "firebase-functions";
import * as firebaseAdmin from "firebase-admin";

import DB from "./utils/db";
import { requestUrl } from "./utils/helpers";
import { URL } from "./utils/constants";

const db = new DB();

const scheduleUptime = functions.pubsub
  .schedule("every 5 minutes")
  .onRun(async (context) => {
    try {
      const latest = await db.getLatest();

      if (!latest || latest.responseOk) {
        const check = await requestUrl(URL);

        if (!check.ok) {
          // send notification
        }

        const created = await db.create({
          url: check.url,
          initialResponseOk: check.ok,
          responseOk: check.ok,
          created: firebaseAdmin.firestore.Timestamp.now(),
          latestCheck: firebaseAdmin.firestore.Timestamp.now(),
          downtimeMillis: 0,
          requests: [check],
        });

        functions.logger.log(created);
        return;
      }
      return;
    } catch (e) {
      functions.logger.error(e);
      return e;
    }
  });

export default scheduleUptime;
