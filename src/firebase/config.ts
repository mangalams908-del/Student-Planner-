import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey.length > 5 &&
  firebaseConfig.projectId !== 'remixed-project-id'
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

let isCloudVerified = false;
let cloudVerificationPromise: Promise<boolean> | null = null;

export const verifyCloudConnection = async (): Promise<boolean> => {
  if (!isFirebaseConfigured || !db) return false;
  if (isCloudVerified) return true;
  if (cloudVerificationPromise) return cloudVerificationPromise;

  cloudVerificationPromise = (async () => {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
      isCloudVerified = true;
      return true;
    } catch (error: any) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.warn('Firebase connection: client appears offline.');
        return false;
      }
      // Reaching Firestore server (even with permission-denied on the dummy test doc) confirms live cloud connectivity
      isCloudVerified = true;
      return true;
    }
  })();
  return cloudVerificationPromise;
};

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
    verifyCloudConnection();
  } catch (err) {
    console.error('Failed to initialize Firebase SDK:', err);
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentAuth = auth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuth?.uid,
      email: currentAuth?.email,
      emailVerified: currentAuth?.emailVerified,
      isAnonymous: currentAuth?.isAnonymous,
      tenantId: currentAuth?.tenantId,
      providerInfo: currentAuth?.providerData?.map((p) => ({
        providerId: p.providerId,
        email: p.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export { app, auth, db };
