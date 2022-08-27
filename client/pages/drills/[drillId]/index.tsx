import {
  SegmentedControl,
  Stack,
  Title,
  Text,
  Group,
  Center,
  Button,
  Container,
  Paper,
} from '@mantine/core';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDrillData } from '@/hooks/drill/useDrillData';
// import {
//   Ear,
//   Keyboard,
//   LanguageHiragana,
//   MessageLanguage,
// } from 'tabler-icons-react';
import { IconEar, IconKeyboard, IconLanguageHiragana, IconMessageLanguage } from '@tabler/icons';
import { DrillType } from '@/interfaces/drill/DrillType';
import Link from 'next/link';

const Drill = () => {
  const router = useRouter();
  const { drillId } = router.query;
  const { drill, isLoading, hasError } = useDrillData(drillId as string);
  const [drillType, setDrillType] = useState('');

  useEffect(() => {
    if (drill) setDrillType(drill.defaultType);
  }, [drill]);

  if (isLoading) {
    return <Container></Container>;
  } else if (hasError) {
    return (
      <Container>
        <h1>Page not found.</h1>
      </Container>
    );
  } else {
    return (
      <Container>
        <Center>
          <Stack style={{ minWidth: '70%' }}>
            <Title align="center" mt={100} mb={50}>
              <Text
                inherit
                variant="gradient"
                gradient={{ from: 'pink', to: 'grape', deg: 45 }}
                component="span"
              >
                {drill?.name}
              </Text>
            </Title>
            <Paper shadow="lg" p="md">
              <Text size="md" mb={20}>
                {drill?.description}
              </Text>
              <SegmentedControl
                value={drillType}
                onChange={setDrillType}
                color="pink"
                style={{ width: '100%' }}
                orientation="vertical"
                data={[
                  {
                    value: DrillType.ReadingAndMeaning,
                    disabled: drill?.disabledTypes.includes(DrillType.ReadingAndMeaning),
                    label: (
                      <Group position="center">
                        <IconLanguageHiragana size={30} />
                        <Text ml={10} size="sm">
                          Reading & Meaning
                        </Text>
                      </Group>
                    ),
                  },
                  {
                    value: DrillType.Meaning,
                    disabled: drill?.disabledTypes.includes(DrillType.Meaning),
                    label: (
                      <Group position="center">
                        <IconMessageLanguage size={30} />
                        <Text ml={10} size="sm">
                          Meaning
                        </Text>
                      </Group>
                    ),
                  },
                  {
                    value: DrillType.Reading,
                    disabled: drill?.disabledTypes.includes(DrillType.Reading),
                    label: (
                      <Group position="center">
                        <IconKeyboard size={30} />
                        <Text ml={10} size="sm">
                          Reading
                        </Text>
                      </Group>
                    ),
                  },
                  {
                    value: DrillType.Audio,
                    disabled: drill?.disabledTypes.includes(DrillType.Audio),
                    label: (
                      <Group position="center">
                        <IconEar size={30} />
                        <Text ml={10} size="sm">
                          Audio
                        </Text>
                      </Group>
                    ),
                  },
                ]}
              />
              <Link href={`/drills/${drillId}/session?type=${drillType}`} passHref>
                <Button component="a" mt={5} radius="md" variant="light" fullWidth color="pink">
                  Start
                </Button>
              </Link>
            </Paper>
          </Stack>
        </Center>
      </Container>
    );
  }
};

export default Drill;
