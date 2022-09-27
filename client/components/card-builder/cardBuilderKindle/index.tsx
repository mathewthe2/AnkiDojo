import { useEffect, useState } from "react";
import {
  Group,
  Modal,
  Text,
  NavLink,
  List,
  Card,
  createStyles,
  SimpleGrid,
  Paper,
  UnstyledButton,
} from "@mantine/core";
import { Dropzone, DropzoneProps, FileWithPath } from "@mantine/dropzone";
import CardBuilderPreview from "../cardBuilderPreview";
import { IconUpload, IconX, IconBookUpload } from "@tabler/icons";
import KindleService from "@/lib/card-builder/kindle/kindleService";
import KindleBook, { KindleVocab } from "@/interfaces/card_builder/kindle/kindleBook";
import ExpressionTerm from "@/interfaces/card_builder/ExpressionTerm";
import { Definition } from "@/lib/japanese";

const useStyles = createStyles((theme) => ({
  book: {
    display: "block",
    width: "107px",
    height: "160px",
    margin: "1em",
    border: "2px solid",
    borderColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
    borderRadius: "4px",
    overflow: "hidden",
    "& div": {
      width: "100%",
      height: "100%",
      backgroundSize: "cover",
      position: "relative",
    },
    "& p": {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 2,
      textDecoration: "none",
      padding: "1em 0 0.5em",
      textAlign: "center",
      margin: 0,
      whiteSpace: "nowrap",
    },
    "& h5": {
      margin: 0,
      padding: "1em",
      fontWeight: "normal",
    },
  },
  textWithCover: {
    color: '#fff',
    background: "linear-gradient(to top, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0));"
  }
}));

function CardBuilderKindle(props: Partial<DropzoneProps>) {
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [dropModalOpened, setDropModalOpened] = useState(false);
  const [expressionList, setExpressionList] = useState<ExpressionTerm[]>([]);
  const [bookSelectionOpened, setBookSelectionOpened] = useState(false);
  const [previewOpened, setPreviewOpened] = useState(false);
  const [books, setBooks] = useState<KindleBook[]>([]);
  const { classes, theme } = useStyles();

  useEffect(() => {
    if (files.length > 0) {
      console.log(files[0]);
      const reader = new FileReader();
      reader.onload = () =>
        handleData(new Uint8Array(reader.result as ArrayBufferLike));
      reader.onerror = (err) => console.warn(err);
      reader.readAsArrayBuffer(files[0]);
    }
  }, [files]);

  const handleData = (data: Uint8Array) => {
    const kindle = new KindleService();
    kindle.init().then(() => {
      kindle.loadDb(data);
      const books: KindleBook[] = kindle.queryBooks();
      if (books?.length <= 0) {
        // do nothing
      } else {
        let vocabCount = 0;
        books.forEach((book: any) => {
          setTimeout(() => {
            book.vocabs = kindle.queryVocabs(book.id);
            vocabCount += 1;
            if (vocabCount === books.length) {
              // redirect to book selection
              allowBookSelection(books);
            }
          }, 300);
        });
      }
    });
  };

  const allowBookSelection = (books: KindleBook[]) => {
    console.log('allowed')
    setBooks(books);
    setDropModalOpened(false);
    setBookSelectionOpened(true);
    // setPreviewOpened(true);
  };

  const previewVocabulary = (vocabularyItems: KindleVocab[]) => {
    const expressionList:ExpressionTerm[] = vocabularyItems.map((vocabulary:KindleVocab)=>{
        const definition:Definition = {
            sentences: [vocabulary.context]
        }
        return {
            userExpression: vocabulary.selection,
            definition: definition
        }
    })
    setExpressionList(expressionList);
    setBookSelectionOpened(false);
    setPreviewOpened(true);
  };

  const bookSelection = (books: KindleBook[]) => (
    <SimpleGrid cols={5}>
      {books.map((book) => (
        <UnstyledButton key={book.id} className={classes.book} onClick={()=>previewVocabulary(book.vocabs)}>
            {book.cover ?
          <div style={{backgroundImage: `url(${ book.cover}`}}>
            <p className={classes.textWithCover}>{book.count} words</p>
          </div>
          :
          <div>
             <h5>{book.title}</h5>
            <p>{book.count} words</p>
          </div>
            }
        </UnstyledButton>
      ))}
    </SimpleGrid>
  );

  return (
    <div>
      <NavLink
        onClick={() => setDropModalOpened(true)}
        icon={<IconBookUpload size={16} stroke={1.5} />}
        label="Kindle"
      ></NavLink>
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
          {...props}
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
              <IconBookUpload size={50} stroke={1.5} />
            </Dropzone.Idle>

            <div>
              <Text size="xl" inline>
                Drag and drop from Kindle.
              </Text>
              {/* <Text size="sm" color="dimmed" inline mt={7}> */}
              <List type="ordered" size="sm">
                <Text size="sm" color="dimmed" inline mt={7}>
                  <List.Item>
                    Connect your Kindle to the computer via a USB cable.
                  </List.Item>
                  <List.Item>
                    Locate the{" "}
                    <span style={{ fontStyle: "italic" }}>vocab.db</span> file
                    on the Kindle disk.
                  </List.Item>
                  <List.Item>Drag and drop the file here.</List.Item>
                </Text>
              </List>
              {/* </Text> */}
            </div>
          </Group>
        </Dropzone>
      </Modal>
      <Modal
        centered
        withCloseButton={false}
        opened={bookSelectionOpened}
        size="xl"
        onClose={() => setBookSelectionOpened(false)}
      >
        {bookSelection(books)}
      </Modal>
      <Modal
        centered
        opened={previewOpened}
        onClose={() => setPreviewOpened(false)}
        withCloseButton={false}
        size="70%"
      >
        <CardBuilderPreview expressionList={expressionList} onSuccessCallback={()=>setPreviewOpened(false)} />
      </Modal>
    </div>
  );
}

export default CardBuilderKindle;
