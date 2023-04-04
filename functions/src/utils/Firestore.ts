import * as firebaseAdmin from "firebase-admin";
firebaseAdmin.initializeApp();

const firestore = firebaseAdmin.firestore();

export interface UptimeRequest {
  url: string;
  ok: boolean;
  statusCode: number;
  duration: number;
  started: firebaseAdmin.firestore.Timestamp;
  ended: firebaseAdmin.firestore.Timestamp;
}

export interface UptimeEntry {
  id?: string;
  url: string;
  initialResponseOk: boolean;
  responseOk: boolean;
  downtimeMillis: number;
  created: firebaseAdmin.firestore.Timestamp;
  latestCheck: firebaseAdmin.firestore.Timestamp;
}

class Firestore {
  collectionEntries = () =>
    firestore.collection("uptime").withConverter<UptimeEntry>({
      toFirestore: (data: UptimeEntry) => data,
      fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) => {
        const data = snap.data() as UptimeEntry;
        return {
          ...data,
          id: snap.id,
        };
      },
    });

  collectionRequests = (entryId: string) =>
    firestore
      .collection("uptime")
      .doc(entryId)
      .collection("requests")
      .withConverter<UptimeRequest>({
        toFirestore: (data: UptimeRequest) => data,
        fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) => {
          const data = snap.data() as UptimeRequest;
          return {
            ...data,
            id: snap.id,
          };
        },
      });

  createEntry = async (data: UptimeEntry): Promise<string> => {
    const added = await this.collectionEntries().add(data);
    return added.id;
  };

  getAllEntries = async (): Promise<Array<UptimeEntry>> => {
    const entries = await this.collectionEntries()
      .orderBy("created", "desc")
      .get();
    return entries.docs.map((e) => e.data());
  };

  getEntry = async (id: string): Promise<UptimeEntry> => {
    const doc = await this.collectionEntries().doc(id).get();
    return doc.data() || null;
  };

  update = async (entryId: string, entry: Partial<UptimeEntry>) => {
    if ("id" in entry) {
      delete entry.id;
    }
    await this.collectionEntries().doc(entryId).update(entry);
    return await this.getEntry(entryId);
  };

  getLatestEntry = async (): Promise<UptimeEntry> => {
    const entries = await this.getAllEntries();
    return entries.length >= 1 ? entries[0] : null;
  };

  addRequest = async (
    entryId: string,
    request: UptimeRequest
  ): Promise<string> => {
    const added = await this.collectionRequests(entryId).add(request);
    return added.id;
  };
}

export default Firestore;
