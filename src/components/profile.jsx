import { Title, Group, Button,  Card, Image, Grid, Avatar, Divider, Textarea, MultiSelect, Text, Flex } from "@mantine/core";
import { db } from "../../config/firebase";
import { doc,  updateDoc } from "firebase/firestore";
import { useState, useRef } from "react";
import { topics } from "../data.jsx";

export const Profile = (props) => {
  const { uid, userData, state } = props;
  const [value, setValue] = useState(userData ? userData.topics : []);
  const textBoxRef = useRef();

  const saveSettings = async () => {
    try {
      if (state === "patient") {
        await updateDoc(doc(db, "patients", uid), { bio: textBoxRef.current.value, topics: value });
        return;
      }
      await updateDoc(doc(db, "therapists", uid), { bio: textBoxRef.current.value, topics: value });
    }
    catch (e) {
      console.error("Error saving data:", e);
    }
  }

  if (userData) {
    return (
      <>
        <Card shadow="sm" padding="lg" radius="md" withBorder mx="xl">
          <Card.Section>
            <Image
              src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png"
              height={160}
              alt="Norway"
            />
          </Card.Section>


          <Grid justify="space-between" m="lg">
            <Grid.Col span={2}> <Avatar radius="xl" size="xl" name={userData.name} color="initials" ></Avatar></Grid.Col>
            <Grid.Col span={10}>
              <Group justify="space-between">
                <Flex align="center" gap="md">
                  <Title order={2} my="lg">{userData.name}</Title>
                  <Text fz="lg" my="lg">{state === "patient" ? "Patient" : "Therapist"}</Text>
                </Flex>
                
                <Button variant="filled" onClick={saveSettings}>Save Changes</Button>
              </Group>
              
              <Divider></Divider>
              <Grid>
                <Grid.Col span={6}>
                  <Title order={3} mt="lg" mb="md" mr="md">About Me</Title>
                  <Textarea
                    placeholder="Input placeholder"
                    defaultValue={userData.bio === "" ? "Share some qualities about yourself here!" : userData.bio}
                    my="md"
                    mr="md"
                    ref={textBoxRef}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Title order={3} mt="lg" mb="md" ml="md">My Topics</Title>
                  <MultiSelect
                    placeholder="Pick value"
                    data={topics}
                    value={value}
                    ml="md"
                    onChange={setValue}
                  />
                </Grid.Col>
              </Grid>

            </Grid.Col>
          </Grid>
        </Card>
      </>
    );
  }
  return (
    <>
      <Card shadow="sm" padding="lg" radius="md" withBorder mx="xl">
        <Card.Section>
          <Image
            src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png"
            height={160}
            alt="Norway"
          />
        </Card.Section>

        <Grid justify="space-between" mt="md" mb="xs">
          <Grid.Col span={2}> <Avatar radius="xl" size="xl" name={"Loading"} color="initials" ></Avatar></Grid.Col>
          <Grid.Col span={10}><Title order={2}>Loading...</Title></Grid.Col>
        </Grid>
      </Card>
    </>
  );
}