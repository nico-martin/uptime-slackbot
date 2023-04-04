import * as functions from "firebase-functions";
import * as firebaseAdmin from "firebase-admin";

import Firestore from "./utils/Firestore";
import { createRequest } from "./utils/helpers";
import { sendMessage } from "./utils/message";

const db = new Firestore();

const scheduleUptime = functions.pubsub
  .schedule("every 5 minutes")
  .onRun(async () => {
    try {
      if (!process.env.URL) {
        throw new Error("URL not set");
      }
      const latest = await db.getLatestEntry();
      functions.logger.log(latest);

      if (!latest || latest.responseOk) {
        const check = await createRequest();

        if (!check.ok) {
          await sendMessage(
            `Uptime Monitor is DOWN: ${check.url} - StatusCode: ${check.statusCode}`
          );
        }

        const created = await db.createEntry({
          url: check.url,
          initialResponseOk: check.ok,
          responseOk: check.ok,
          created: firebaseAdmin.firestore.Timestamp.now(),
          latestCheck: firebaseAdmin.firestore.Timestamp.now(),
          downtimeMillis: 0,
        });

        const request = await db.addRequest(created, check);

        functions.logger.log(`uptimeEntry created ${created}`);
        functions.logger.log(`request created ${request}`);
        return;
      }
      return;
    } catch (e) {
      functions.logger.error(e);
      return e;
    }
  });

export default scheduleUptime;
