import { useState } from "react";
import { createStyles, Navbar } from "@mantine/core";
import { IconQuestionMark } from "@tabler/icons";
import Link from "next/link";
import HeaderItem from "./headerItem";
import { navigationData } from "@/lib/layout/navigation";

const useStyles = createStyles((theme, _params, getRef) => {
  const icon = getRef("icon");
  return {
    header: {
      paddingBottom: theme.spacing.md,
      marginBottom: theme.spacing.md * 1.5,
      borderBottom: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[2]
      }`,
    },

    footer: {
      paddingTop: theme.spacing.md,
      marginTop: theme.spacing.md,
      borderTop: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[2]
      }`,
    },

    link: {
      ...theme.fn.focusStyles(),
      display: "flex",
      alignItems: "center",
      textDecoration: "none",
      fontSize: theme.fontSizes.sm,
      color:
        theme.colorScheme === "dark"
          ? theme.colors.dark[1]
          : theme.colors.gray[7],
      padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
      borderRadius: theme.radius.sm,
      fontWeight: 500,

      "&:hover": {
        backgroundColor:
          theme.colorScheme === "dark"
            ? theme.colors.dark[6]
            : theme.colors.gray[0],
        color: theme.colorScheme === "dark" ? theme.white : theme.black,

        [`& .${icon}`]: {
          color: theme.colorScheme === "dark" ? theme.white : theme.black,
        },
      },
    },

    linkIcon: {
      ref: icon,
      color:
        theme.colorScheme === "dark"
          ? theme.colors.dark[2]
          : theme.colors.gray[6],
      marginRight: theme.spacing.sm,
    },

    linkActive: {
      "&, &:hover": {
        backgroundColor: theme.fn.variant({
          variant: "light",
          color: theme.primaryColor,
        }).background,
        color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
          .color,
        [`& .${icon}`]: {
          color: theme.fn.variant({
            variant: "light",
            color: theme.primaryColor,
          }).color,
        },
      },
    },
  };
});

function Navigation() {
  const { classes, cx } = useStyles();
  const [active, setActive] = useState("Billing");

  const links = navigationData.map((item) => (
    <Link passHref href={item.link} key={item.link}>
      <a
        className={cx(classes.link, {
          [classes.linkActive]: item.label === active,
        })}
        // href={item.link}
        key={item.label}
        onClick={(event) => {
          // event.preventDefault();
          setActive(item.label);
        }}
      >
        <item.icon className={classes.linkIcon} stroke={1.5} />
        <span>{item.label}</span>
      </a>
    </Link>
  ));

  return (
    <Navbar width={{ sm: 300 }} p="md">
      <Navbar.Section mt="xs">
        <HeaderItem />
      </Navbar.Section>
      <Navbar.Section grow mt="md">
        {/* <Group className={classes.header} position="apart">
          <Text size="xl">Anki Dojo</Text>
          <Code sx={{ fontWeight: 700 }}>v0.0.1</Code>
        </Group> */}
        {links}
      </Navbar.Section>

      <Navbar.Section className={classes.footer}>
        <a
          href="https://mathewthe2.github.io/AnkiDojo/"
          target="_blank"
          className={classes.link}
        >
          <IconQuestionMark className={classes.linkIcon} stroke={1.5} />
          <span>Help</span>
        </a>
      </Navbar.Section>
    </Navbar>
  );
}

export default Navigation;
