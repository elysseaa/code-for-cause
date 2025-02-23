import { AppShell, Title, SimpleGrid, Button, Paper, Text, Stack, Group, Burger, useMantineColorScheme, Image, useComputedColorScheme, ActionIcon, Tabs } from "@mantine/core";
import { auth, googleAuth, db } from "../../config/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { signInWithPopup, setPersistence, browserLocalPersistence } from "firebase/auth";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";

const Theme = () => {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });

  return (
    <ActionIcon
      onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
      variant="default"
      size="xl"
      aria-label="Toggle color scheme"
      display="flex"
    >
      &#9788;
    </ActionIcon>
  );
}

export const SignIn = (props) => {
  const { setScreen, setState } = props;
  const [opened, { toggle }] = useDisclosure();
  const [activeTab, setActiveTab] = useState('first');

  const signInGoogle = async (type) => {
    try {
      const result = await signInWithPopup(auth, googleAuth);
      // Set auth-token cookie so browser remembers upon refresh
      // cookies.set("auth-token", result.user.refreshToken);
      setPersistence(auth, browserLocalPersistence);

        

      if (type === "patient") {
        const userDoc = doc(db, "patients", result.user.uid);
        const userSnap = await getDoc(userDoc);

        if (!userSnap.exists()) {
          await setDoc(doc(db, "patients", result.user.uid), { email: result.user.email, name: result.user.displayName, chats: {}, topics: [], bio: "" });
          setState("patient");
          setScreen("profile");
          return;
        }
        setState("patient");
        setScreen("home");
        return;
      }

      const userDoc = doc(db, "therapists", result.user.uid);
      const userSnap = await getDoc(userDoc);

      if (!userSnap.exists()) {
        await setDoc(doc(db, "therapists", result.user.uid), { email: result.user.email, name: result.user.displayName, chats: {}, topics: [], bio: "" });
        setState("therapist");
        setScreen("profile");
        return;
      }
      setState("therapist");
      setScreen("home");
    }
    catch (e) {
      console.error("Error signing in with Google:", e);
    }
  };

  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          boxShadow: "0px 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <Group justify="space-between" p="xl"
          style={{
            display: "flex",        // Explicitly set Group to use flexbox
            width: "100%",          // Ensure Group spans the full width
            justifyContent: "space-between", // Space out the children components
          }}>
          <>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title fz="xl">Mindful Evolutions</Title>
          </>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Button variant="outline" onClick={() => setScreen("signIn")} mr="sm">Sign In</Button>
            <Theme></Theme>
          </div>
        </Group>

      </AppShell.Header>

      <AppShell.Main style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "auto", // Prevents full-page height
        padding: "20px",
      }}>
        <SimpleGrid cols={2} m="xl">
          <Paper shadow="xs" p="xl" m="lg" style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "auto", // Prevents full-page height
          }}>
            <Stack>
              <Title order={2} >Welcome to Mindful Evolutions!</Title>
              <Text>We are glad to have you here.</Text>
              <Image
                src="https://media.cntraveler.com/photos/5eb18e42fc043ed5d9779733/16:9/w_1920%2Cc_limit/BlackForest-Germany-GettyImages-147180370.jpg"
                height={160}
                alt="Norway"
              />
            </Stack>

          </Paper>
          <Paper shadow="xs" p="xl" m="lg" >
            <Title order={2} mb="md">Sign In/Sign Up</Title>
            <Button onClick={() => setScreen("home")} variant="default" mb="md" mr="sm">Return Home</Button>
            <Tabs value={activeTab} onChange={setActiveTab}>
              <Tabs.List mb="md">
                <Tabs.Tab value="first">Patient</Tabs.Tab>
                <Tabs.Tab value="second">Therapist</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="first"><Button mb="md" onClick={() => signInGoogle("patient")} >Sign In With Google</Button></Tabs.Panel>
              <Tabs.Panel value="second"><Button mb="md" onClick={() => signInGoogle("therapist")} >Sign In With Google</Button></Tabs.Panel>
            </Tabs>
          </Paper>
        </SimpleGrid>

      </AppShell.Main>
    </AppShell>
  );
}