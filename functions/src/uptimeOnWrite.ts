import * as functions from "firebase-functions";
import DB from "./utils/db";
import { requestUrl } from "./utils/helpers";
import { URL } from "./utils/constants";

const db = new DB();

const uptimeOnWrite = functions.firestore
  .document("uptime/{uptimeId}")
  .onWrite(async (change, context) => {
    try {
      if (!change.after.exists) {
        // delete trigger
        return;
      }
      const uptime = change.after.data();
      functions.logger.log(uptime);

      if (uptime.responseOk) {
        return;
      }

      window.setTimeout(async () => {
        const check = await requestUrl(URL);
        const entry = await db.get(context.params.uptimeId);
        functions.logger.log("addCheck", check);

        entry.latestCheck = check.started;
        entry.requests = [...entry.requests, check];
        if (check.ok) {
          const downtimeMillis =
            check.started.toMillis() - entry.created.toMillis();
          entry.responseOk = true;
          entry.downtimeMillis = downtimeMillis;
          // send notification
        }
        await db.update(context.params.uptimeId, entry);
      }, 2000);

      return;
    } catch (e) {
      functions.logger.error(e);
      return e;
    }
  });

export default uptimeOnWrite;
