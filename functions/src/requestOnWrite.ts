import * as functions from "firebase-functions";
import Firestore, { UptimeRequest } from "./utils/Firestore";
import { createRequest, formatSeconds } from "./utils/helpers";
import { sendMessage } from "./utils/message";

const db = new Firestore();

const requestOnWrite = functions.firestore
  .document("uptime/{uptimeId}/requests/{requestId}")
  .onCreate(async (requestSnapshot, context) => {
    try {
      if (!process.env.URL) {
        throw new Error("URL not set");
      }
      const uptimeEntry = await db.getEntry(context.params.uptimeId);
      const request = requestSnapshot.data() as UptimeRequest;
      if (request.ok && uptimeEntry.initialResponseOk) {
        functions.logger.log("is first request of a successful uptime check");
        return;
      } else if (request.ok) {
        functions.logger.log("request successfull after retry");
        uptimeEntry.latestCheck = request.started;

        if (request.ok) {
          const downtimeMillis =
            request.started.toMillis() - uptimeEntry.created.toMillis();
          uptimeEntry.responseOk = true;
          uptimeEntry.downtimeMillis = downtimeMillis;
          await db.update(context.params.uptimeId, uptimeEntry);
          functions.logger.log(
            `Uptime Monitor is UP: ${
              request.url
            }. It was down for ${formatSeconds(
              Math.round(downtimeMillis / 1000)
            )}.`
          );
          await sendMessage(
            `Uptime Monitor is UP: ${
              request.url
            }. It was down for ${formatSeconds(
              Math.round(downtimeMillis / 1000)
            )}.`
          );
        }
        return;
      } else {
        functions.logger.log("request failed, create new request after 2 sec");
        setTimeout(async () => {
          const check = await createRequest();
          await db.addRequest(uptimeEntry.id, check);
        }, 2000);
      }

      return;
    } catch (e) {
      functions.logger.error(e);
      return e;
    }
  });

export default requestOnWrite;
