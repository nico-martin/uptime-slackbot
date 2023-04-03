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
  requests: Array<UptimeRequest>;
}

class DB {
  private ref: FirebaseFirestore.CollectionReference<UptimeEntry>;

  constructor() {
    this.ref = firestore.collection("uptime").withConverter<UptimeEntry>({
      toFirestore: (data: UptimeEntry) => data,
      fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) => {
        const data = snap.data() as UptimeEntry;
        return {
          ...data,
          id: snap.id,
        };
      },
    });
  }

  create = async (data: UptimeEntry): Promise<string> => {
    const added = await this.ref.add(data);
    return added.id;
  };

  getAll = async (): Promise<Array<UptimeEntry>> => {
    const entries = await this.ref.orderBy("created", "desc").get();
    return entries.docs.map((e) => e.data());
  };

  get = async (id: string): Promise<UptimeEntry> => {
    const doc = await this.ref.doc(id).get();
    return doc.data() || null;
  };

  update = async (entryId: string, entry: Partial<UptimeEntry>) => {
    await this.ref.doc(entryId).update(entry);
    return await this.get(entryId);
  };

  getLatest = async (): Promise<UptimeEntry> => {
    const entries = await this.getAll();
    return entries.length >= 1 ? entries[0] : null;
  };
}

export default DB;
