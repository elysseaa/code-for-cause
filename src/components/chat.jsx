import { ActionIcon, Burger, Text, Title, Button, Grid, Box, Group, Container, ScrollArea, Textarea, Stack, Paper, Avatar, Flex, Tabs } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { auth, db } from "../../config/firebase";
import { doc, setDoc, getDoc, writeBatch, deleteField, collection, onSnapshot, addDoc, query, orderBy, Timestamp } from "firebase/firestore";
import { topics } from "../data.jsx";
import { useState, useEffect, useRef } from "react";

const PersonalChat = (props) => {
  const { patientId, therapistId, chatId, chatData, uid, userName, otherName } = props;
  const textRef = useRef();

  const handleLeaveChat = async () => {
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, "therapists", therapistId), {
        chats: deleteField(patientId)
      })
      batch.update(doc(db, "patients", patientId), {
        chats: deleteField(therapistId)
      })
      batch.delete(doc(db, "chats", chatId));
      await batch.commit();
    } catch (e) {
      console.error("Error leaving chat:", e);
    }
  }

  const handleSend = async () => {
    try {
      await addDoc(collection(db, "chats", chatId, "messages"), { senderId: uid, senderName: userName, text: textRef.current.value, time: Timestamp.fromDate(new Date()) });
      textRef.current.value = null;
    } catch (e) {
      console.error("Error sending message:", e);
    }
  }


  const Messages = () => {
    try {
      if (!chatData || Object.keys(chatData).length === 0) {
        return (
          <Text ta="center">There are no messages yet, be the first to respond.</Text>
        )
      }
      const data = [];
      chatData.forEach((messageDoc) => {
        const message = messageDoc.data();
        if (message.senderId === uid) {
          // Align right
          data.push(
            <Flex align="center" justify="flex-end" m="md" mr="lg" key={message.time.toDate()}>
              <Text fz="sm">{message.time.toDate().toLocaleTimeString()}</Text>
              <Text mx="sm"> {message.text} </Text>
              <Avatar radius="sm" size="md" name={message.senderName} color="initials" ></Avatar>
            </Flex>
          )
        }
        else {
          // Align left
          data.push(
            <Flex align="center" m="md" justify="flex-start" key={message.time.toDate()}>
              <Avatar radius="sm" size="md" name={message.senderName} color="initials" ></Avatar>
              <Text mx="sm"> {message.text} </Text>
              <Text fz="sm">{message.time.toDate().toLocaleTimeString()}</Text>
            </Flex>

          )
        }
      })
      return data;
    } catch (e) {
      console.error("Error loading messages:", e);
    }
  }

  try {
    return (
      <Grid gutter="md">
        {/* Messages Area - Takes full space */}
        <Grid.Col span={12} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Paper shadow="xs" p="md" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Group justify="space-between">
              <Title order={3}>{otherName}</Title>
              <Flex>
                <Button variant="light" onClick={() => handleLeaveChat()}>Leave Chat</Button>
              </Flex>
            </Group>
            <ScrollArea h={250} p="xl">
              <Messages></Messages>
            </ScrollArea>
          </Paper>
        </Grid.Col>

        <Grid.Col span={12} style={{ height: "auto" }}>
          <Paper shadow="xs" p="md">
            <Textarea placeholder="Send a message..." autosize minRows={2} maxRows={4} ref={textRef} />
            <Button mt="md" onClick={() => handleSend()}>Send</Button>
          </Paper>
        </Grid.Col>
      </Grid>
    )
  } catch (e) {
    console.error("Error loading personal chat:", e);
  }
}

const Menu = ({ topics, defaultValue, state, uid, userName }) => {
  const [activeTab, setActiveTab] = useState(defaultValue || Object.keys(topics)[0]);
  const [chatData, setChatData] = useState({});

  useEffect(() => {
    if (!topics) return;

    const chatIds = Object.values(topics).map(topic => topic.chatId);
    if (chatIds.length === 0) return;

    // Listen to multiple chats at once
    const unsubscribes = chatIds.map(chatId => {
      const q = query(collection(db, "chats", chatId, "messages"), orderBy("time", "asc"));
      return onSnapshot(q, (messagesSnap) => {
        setChatData(prev => ({ ...prev, [chatId]: messagesSnap }));
      })
    });

    // Cleanup function to unsubscribe all listeners
    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [topics]);

  try {
    if (!topics || Object.keys(topics).length === 0) {
      return (
        <Tabs defaultValue={"none"} variant="pills" orientation="vertical">
          <Tabs.List mr="lg">
            <Tabs.Tab value={"none"}>Suggestion</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value={"none"}>
            <Paper>
              Go to the home page to find therapists to connect with!
            </Paper>
          </Tabs.Panel>
        </Tabs>
      );

    }

    const names = [];
    const conversations = [];
    for (const otherId in topics) {
      names.push(<Tabs.Tab value={otherId} key={otherId}>{topics[otherId].otherName}</Tabs.Tab>);
      conversations.push(
        <Tabs.Panel value={otherId} key={otherId}>
          <PersonalChat uid={uid} userName={userName} otherName={topics[otherId].otherName} chatData={chatData[topics[otherId].chatId] || {}} chatId={topics[otherId].chatId} patientId={state === "patient" ? uid : otherId} therapistId={state === "therapist" ? uid : otherId}></PersonalChat>
        </Tabs.Panel>)
    }

    return (
      <Tabs defaultValue={defaultValue || Object.keys(topics)[0]} variant="pills" orientation="vertical" value={activeTab} onChange={setActiveTab}>
        <Tabs.List mr="lg">
          {names}
        </Tabs.List>
        {conversations}
      </Tabs>
    );
  } catch (e) {
    console.error("Error loading chats:", e);
  }
}

export const Chat = (props) => {
  const { userData, chat, state, uid } = props;

  return (
    <Container m="lg">
      <Title order={2} mb="md">Chats</Title>
      <Menu topics={userData.chats} defaultValue={chat} state={state} uid={uid} userName={userData.name}></Menu>
    </Container>
  );

}