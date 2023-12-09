import {
    Modal,
    Box,
    Tabs,
    Button,
    Group,
    Text,
    useMantineTheme
} from "@mantine/core";
import {
    Dropzone,
    MIME_TYPES,
    FileWithPath,
} from "@mantine/dropzone";
import { IconPlus } from "@tabler/icons";
import { useState, useEffect } from "react"
// import { useQuery } from "react-query"
import { IconUpload, IconX, IconFile } from "@tabler/icons";
import DictionaryItem from "./dictionaryItem";
import { getDictionaries, addDictionary } from "@/lib/dictionaries";
import Dictionary from "@/interfaces/dictionary/Dictionary";


function DictionariesSettings() {
    const [files, setFiles] = useState<FileWithPath[]>([]);
    const theme = useMantineTheme();
    const [dropModalOpened, setDropModalOpened] = useState(false);
    const [dictionaries, setDictionaries] = useState<Dictionary[]>([]);

    useEffect(() => {
        getDictionaries().then((dictionaries) => setDictionaries(dictionaries));
    }, []);

    useEffect(() => {
        if (files.length > 0) {
            // console.log(files[0]);
            handleFile(files[0]);
        }
    }, [files]);

    const handleFile = async (file: FileWithPath) => {
        setDropModalOpened(false);
        const newDictionary: Dictionary = await addDictionary(file);
        // TODO: show loading modal here
        setDictionaries([...dictionaries, newDictionary]);
    };

    const resetDictionaries = async () => {
        // show confirm dialog yes / no

        // if confirm reset dictionaries
        // download dictionary db file from github
        // https://raw.githubusercontent.com/mathewthe2/AnkiDojo/main/user_files/dictionaries.db
        // show progress dialog, warn user not to close 
        // finish and refresh dictioanries
    }

    return (
        <>
            <Group mt={10} position="apart">
                <Button onClick={() => setDropModalOpened(true)}>
                    <Group>
                        <IconPlus />
                        Add Dictionary
                    </Group>
                </Button>
                <Button disabled variant="outline" onClick={() => resetDictionaries()}>
                    Reset
                </Button>
            </Group>
            <Modal
                centered
                withCloseButton={false}
                opened={dropModalOpened}
                size="xl"
                onClose={() => setDropModalOpened(false)}
            >
                <Dropzone
                    onDrop={setFiles}
                    onReject={(files) => console.log("rejected files", files)}
                    multiple={false}
                    accept={[MIME_TYPES.zip,]}
                >
                    <Group
                        position="center"
                        spacing="xl"
                        style={{ minHeight: 220, pointerEvents: "none" }}
                    >
                        <Dropzone.Accept>
                            <IconUpload
                                size={50}
                                stroke={1.5}
                                color={
                                    theme.colors[theme.primaryColor][
                                    theme.colorScheme === "dark" ? 4 : 6
                                    ]
                                }
                            />
                        </Dropzone.Accept>
                        <Dropzone.Reject>
                            <IconX
                                size={50}
                                stroke={1.5}
                                color={theme.colors.red[theme.colorScheme === "dark" ? 4 : 6]}
                            />
                        </Dropzone.Reject>
                        <Dropzone.Idle>
                            <IconFile size={50} stroke={1.5} />
                        </Dropzone.Idle>

                        <div>
                            <Text size="xl" inline>
                                Drag file here or click to select file
                            </Text>
                            <Text size="sm" color="dimmed" inline mt={7}>
                                *zip
                            </Text>
                        </div>
                    </Group>
                </Dropzone>
            </Modal>
            <Box pt={10}></Box>
            {dictionaries.map((dictionary: Dictionary) => (
                <Box key={dictionary.id}>
                    <DictionaryItem dictionary={dictionary} />
                </Box>
            ))}

        </>
    )
}

export default DictionariesSettings