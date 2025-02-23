import { useState } from "react";
import { Authenticated } from "./authenticated";
import { Unauthenticated } from "./unauthenticated";
import { SignIn } from "./components/signin";
import { auth, db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [uid, setUid] = useState(null);
  const [state, setState] = useState(null);

  /**
   * Handles changes in authentication state
   */
  onAuthStateChanged(auth, async (user) => {
    try {
      if (user && (screen === "signIn")) {
        // User is signed in
        setUid(user.uid);

        // Check if user is a patient
        const patientDoc = await getDoc(doc(db, "patients", user.uid));
        if (patientDoc.exists()) {
          setState("patient");
          setScreen("home");
          return;
        }
        // Check if user is a therapist
        const therapistDoc = await getDoc(doc(db, "therapists", user.uid));
        if (therapistDoc.exists()) {
          setState("therapist");
          setScreen("home");
          return;
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }

  });

  if (uid) {
    return (<Authenticated uid={uid} setUid={setUid} state={state} screen={screen} setScreen={setScreen}></Authenticated>);
  }
  if (screen === "signIn") {
    return (<SignIn setScreen={setScreen} setState={setState}></SignIn>)
  }
  return (<Unauthenticated setScreen={setScreen}></Unauthenticated>)
}
