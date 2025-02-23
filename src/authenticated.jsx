import { AppShell, Burger, Text, Title, Group, Button, useMantineColorScheme, useComputedColorScheme, Stack, ActionIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState, useEffect } from "react";
import { Home } from "./components/home";
import { Profile } from "./components/profile"
import { Chat } from "./components/chat";
import { auth } from "../config/firebase";
import { signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";

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

export const Authenticated = (props) => {
  const { screen, setScreen, uid, setUid, state } = props;
  const [opened, { toggle }] = useDisclosure();
  const [chat, setChat] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    /**
     * Connects to user document
     */
    const userRef = doc(db, state === "patient" ? "patients" : "therapists", uid);
    const unsubscribeUserData = onSnapshot(userRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          setUserData(snapshot.data());
        }
        else {
        }
      } catch (error) {
        console.error("Error connecting to user document: ", error);
      }
    });

    // Severs connections after the webpage is closed (clean-up function)
    return () => {
      unsubscribeUserData();
    }
  }, [uid, state]);


  const handleSignOut = async () => {
    await signOut(auth);
    setUid(null);
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
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
        <Group p="xl"
          style={{
            display: "flex",        // Explicitly set Group to use flexbox
            width: "100%",          // Ensure Group spans the full width
            justifyContent: "space-between", // Space out the children components
          }}>
          <>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title fz="xl">Mindful Evolutions</Title> {/* Styled Title */}
          </>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Text mr="sm">{userData ? "Hello " + userData.name + "!" : "Loading..." }</Text>
            <Button variant="outline" onClick={() => handleSignOut()} mr="sm">Sign Out</Button>
            <Theme></Theme>
          </div>
        </Group>

      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack
          bg="var(--mantine-color-body)"
          align="stretch"
          justify="center"
          gap="md"
          m="md"
        >
          <Button variant="default" onClick={() => setScreen("home")}>Home</Button>
          <Button variant="default" onClick={() => setScreen("chat")}>Chats</Button>
          <Button variant="default" onClick={() => setScreen("profile")}>Profile</Button>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main m="lg">
        {screen === "home" && <Home setScreen={setScreen} userData={userData} uid={uid} setChat={setChat} state={state}></Home>}
        {screen === "chat" && <Chat userData={userData} chat={chat} state={state} uid={uid}></Chat>}
        {screen === "profile" && <Profile uid={uid} userData={userData} state={state}></Profile>}
      </AppShell.Main>

    </AppShell>
    );
}