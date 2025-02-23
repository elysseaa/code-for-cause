import { ActionIcon, useMantineColorScheme, useComputedColorScheme, AppShell, Burger, Title, Group, Button, Stack, Badge, Paper, SimpleGrid, Text, Flex, Avatar } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState, useEffect } from "react";
import { db } from "../config/firebase";
import { getDocs, collection } from "firebase/firestore";

const Section = (props) => {
  const { title } = props;
  return (
    <Title order={3}>{title}</Title>

  );
}

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

export const Unauthenticated = (props) => {
  const { setScreen } = props;
  const [opened, { toggle }] = useDisclosure();
  const [therapists, setTherapists] = useState([]);

  const Therapists = ({ therapists }) => {
    try {
      const cards = [];
      if (therapists.length === 0) {
        cards.push(
          <Paper key={"funny"} shadow="sm" padding="lg" radius="md" p="lg" withBorder>
            <Group justify="space-between" mb="sm">
              <Flex align="center" gap="sm">
                <Avatar radius="xl" size="md" name="Loading" color="initials" ></Avatar>
                <Title order={4}>No therapists found</Title>
              </Flex>
            </Group>
            No Therapists Found
          </Paper>);
      }
      therapists.forEach((therapist) => {
        cards.push(
          <Paper key={therapist.id} shadow="sm" padding="lg" radius="md" p="lg" withBorder>
            <Group justify="space-between" mb="sm">
              <Flex align="center" gap="sm">
                <Avatar radius="xl" size="md" name={therapist.name} color="initials" ></Avatar>
                <Title order={4}>{therapist.name}</Title>
              </Flex>
              <ActionIcon
                variant="light"
                size="xl"
                aria-label="Toggle color scheme"
                display="flex"
                onClick={() => setScreen("signIn")}
              >
                &#x2b;
              </ActionIcon>
            </Group>

            <Text mb="md">{therapist.bio !== "" ? therapist.bio : "No bio entered"}</Text>

            {therapist.topics.map((topic) => (
              <Badge key={topic} mr="sm">{topic}</Badge>
            ))}

          </Paper>);
      });
      return (
        <SimpleGrid cols={3}>
          {cards}
        </SimpleGrid>
      );
    } catch (e) {
      console.error("Error loading therapists:", e);
    }
  }

  useEffect(() => {
    const findTherapists = async () => {
      try {
        const therapistsSnap = await getDocs(collection(db, "therapists"));
        // const q = query(collection(db, "therapists"));
        // const therapistsSnap = await getDocs(q);
        let therapists = [];

        // Step 3: Process and rank therapists based on topic match count
        therapistsSnap.forEach((doc) => {
          const therapistData = doc.data();

          therapists.push({
            id: doc.id,
            ...therapistData,
          });
        });

        setTherapists(therapists);

      } catch (e) {
        console.error("Error returning suggested therapists:", e);
      }
    }
    findTherapists();
  }, []);

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
            <Button variant="outline" onClick={() => setScreen("signIn")} mr="sm">Sign In</Button>
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
          <Button variant="default" onClick={() => setScreen("signIn")}>Chats</Button>
          <Button variant="default" onClick={() => setScreen("signIn")}>Profile</Button>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main m="lg">
        <Stack>
          <Paper shadow="xs" p="xl" mb="md">
            <Title order={2} mb="md">Welcome to Mindful Evolutions Therapy!</Title>
            <Text fz="xl">Prioritizing Your Mental Health</Text>
          </Paper>
          <Section title="Available Therapists"></Section>
          <Therapists therapists={therapists}></Therapists>
        </Stack>
      </AppShell.Main>

    </AppShell>
  );
}
