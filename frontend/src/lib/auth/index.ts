import { firebaseAdapter } from "./firebaseAdapter";
import type { AuthAdapter } from "./types";
// そのうち laravelAdapter 追加予定
export const authAdapter: AuthAdapter = firebaseAdapter;