import {
  createStyles,
  Card,
  Text,
  SimpleGrid,
  UnstyledButton,
  Anchor,
  Group,
} from "@mantine/core";
import {
  IconCreditCard,
  IconBuildingBank,
  IconRepeat,
  IconReceiptRefund,
  IconReceipt,
  IconReceiptTax,
  IconReport,
  IconCashBanknote,
  IconCoin,
  IconNotebook,
  IconSearch,
  IconBook,
} from "@tabler/icons";
import Link from "next/link";

const mockdata = [
  { title: "Drills", icon: IconNotebook, color: "pink", href:"/drills" },
  { title: "Search", icon: IconSearch, color: "indigo", href:"" },
  { title: "Reader", icon: IconBook, color: "teal", href:"" },
  //   { title: 'Refunds', icon: IconReceiptRefund, color: 'green' },
  //   { title: 'Receipts', icon: IconReceipt, color: 'teal' },
  //   { title: 'Taxes', icon: IconReceiptTax, color: 'cyan' },
  //   { title: 'Reports', icon: IconReport, color: 'pink' },
  //   { title: 'Payments', icon: IconCoin, color: 'red' },
  //   { title: 'Cashback', icon: IconCashBanknote, color: 'orange' },
];

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    fontWeight: 700,
  },

  item: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    borderRadius: theme.radius.md,
    height: 90,
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    transition: "box-shadow 150ms ease, transform 100ms ease",

    "&:hover": {
      boxShadow: `${theme.shadows.md} !important`,
      transform: "scale(1.05)",
    },
  },
}));

export default function ActionsGrid() {
  const { classes, theme } = useStyles();

  const items = mockdata.map((item) => (
    <Link href={item.href} passHref>
    <UnstyledButton key={item.title} className={classes.item}>
      <item.icon color={theme.colors[item.color][6]} size={32} />
      <Text size="xs" mt={7}>
        {item.title}
      </Text>
    </UnstyledButton>
    </Link>
  ));

  return (
    <Card withBorder radius="md" className={classes.card}>
      <Group position="apart">
        <Text className={classes.title}>Anki Dojo</Text>
      </Group>
      <SimpleGrid cols={3} mt="md">
        {items}
      </SimpleGrid>
    </Card>
  );
}
