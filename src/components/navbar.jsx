import { AppShell, Burger, Text, Title, Group, Button, Container, Stack } from "@mantine/core";

export const Navbar = (props) => {
  const { uid, setScreen } = props;

  if (uid) {
    return (
      <AppShell.Navbar p="md">
        <Stack
          bg="var(--mantine-color-body)"
          align="stretch"
          justify="center"
          gap="md"
          m="md"
        >
          <Button variant="default" onClick={() => setScreen("home")}>Home</Button>
          <Button variant="default">Search</Button>
          <Button variant="default" onClick={() => setScreen("profile")}>Profile</Button>
        </Stack>
      </AppShell.Navbar>
    );
  }
  return (
    <AppShell.Navbar p="md">
      <Stack
        bg="var(--mantine-color-body)"
        align="stretch"
        justify="center"
        gap="md"
        m="md"
      >
        <Button variant="default" onClick={() => setScreen("home")}>Home</Button>
        <Button variant="default" onClick={() => setScreen("signIn")}>Search</Button>
        <Button variant="default" onClick={() => setScreen("signIn")}>Profile</Button>
      </Stack>
    </AppShell.Navbar>
  );
}