import { ActionIcon, Text, Title, SimpleGrid, Group, Container, Stack, Paper, Avatar, Badge, Flex } from "@mantine/core";
import { auth, db } from "../../config/firebase";
import { doc, setDoc, getDocs, updateDoc, query, where, collection, arrayUnion, addDoc, writeBatch } from "firebase/firestore";
import { useEffect, useState } from "react";

export const Home = (props) => {
  const { setScreen, userData, uid, setChat, state } = props;
  const [therapists, setTherapists] = useState([]);


  const handleChat = async (id, otherName) => {
    try {
      if (!userData.chats || !userData.chats[id]) {
        // this user is initiating a new chat
        let batch = writeBatch(db);
        const docRef = doc(collection(db, "chats"));
        batch.set(docRef, { therapist: { id: id, name: otherName }, patient: { id: uid, name: userData.name } });
        batch.update(doc(db, "patients", uid), { [`chats.${id}`]: { otherName: otherName, chatId: docRef.id } });
        batch.update(doc(db, "therapists", id), { [`chats.${uid}`]: { otherName: userData.name, chatId: docRef.id } });
        await batch.commit();
      }
      // this user is joining an old chat
      setChat(id);
      setScreen("chat");
    } catch (e) {
      console.error("Error loading chat:", e);
    }
  }

  const Chats = ({ chats }) => {
    try {
      const cards = [];
      if (!chats || Object.keys(chats).length === 0) {
        cards.push(
          <Paper key={"funny"} shadow="sm" padding="lg" radius="md" p="lg" withBorder>
            <Group justify="space-between" mb="sm">
              <Flex align="center" gap="sm">
                <Avatar radius="xl" size="md" name="Loading" color="initials" ></Avatar>
                <Title order={4}>No chats found</Title>
              </Flex>
            </Group>
            Find therapists to have chats with below!
          </Paper>);
      }
      for (const otherId in chats) {
        cards.push(
          <Paper key={otherId} shadow="sm" padding="lg" radius="md" p="lg" withBorder>
            <Group justify="space-between" mb="sm">
              <Flex align="center" gap="sm">
                <Avatar radius="xl" size="md" name={chats[otherId].otherName} color="initials" ></Avatar>
                <Title order={4}>{chats[otherId].otherName}</Title>
              </Flex>
              <ActionIcon
                variant="light"
                size="xl"
                aria-label="Toggle color scheme"
                display="flex"
                onClick={() => handleChat(otherId, chats[otherId].otherName)}
              >
                &#8594;
              </ActionIcon>
            </Group>
          </Paper>);
      }
      return (
        <SimpleGrid cols={3}>
          {cards}
        </SimpleGrid>
      );
    } catch (e) {
      console.error("Error loading chats:", e);
    }
  }

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
              {state === "patient" && <ActionIcon
                variant="light"
                size="xl"
                aria-label="Toggle color scheme"
                display="flex"
                onClick={() => handleChat(therapist.id, therapist.name)}
              >
                &#x2b;
              </ActionIcon>}
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
        if (userData) {
          const q = query(collection(db, "therapists"), where("__name__", "!=", uid));
          const therapistsSnap = await getDocs(q);
          // const q = query(collection(db, "therapists"));
          // const therapistsSnap = await getDocs(q);
          let therapists = [];

          // Step 3: Process and rank therapists based on topic match count
          therapistsSnap.forEach((doc) => {
            const therapistData = doc.data();
            const therapistTopics = therapistData.topics;

            // Count the number of matching topics
            const matchCount = therapistTopics.filter(topic => userData.topics.includes(topic)).length;

            therapists.push({
              id: doc.id,
              ...therapistData,
              matchCount, 
            });
          });

          therapists.sort((a, b) => b.matchCount - a.matchCount);

          setTherapists(therapists);
        }

      } catch (e) {
        console.error("Error returning suggested therapists:", e);
      }
    }
    findTherapists();
  }, [userData]);

  return (
    <Container m="lg">
      <Title order={2} mb="lg">Welcome to Mindful Evolutions!</Title>
      <Stack>
        <Title order={3}>Your Chats</Title>
        <Chats chats={!userData ? {} : userData.chats}></Chats>
        <Title order={3}>{state === "patient" ? "Suggested Therapists" : "Other Therapists"}</Title>
        <Therapists therapists={therapists}></Therapists>

      </Stack>
    </Container>
  );
}