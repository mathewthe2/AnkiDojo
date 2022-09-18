import { useEffect, useState } from "react";
import { useMantineTheme, Button,Group, Modal, Text, Image, SimpleGrid, NavLink } from "@mantine/core";
import {
  Dropzone,
  DropzoneProps,
  IMAGE_MIME_TYPE,
  FileWithPath,
} from "@mantine/dropzone";
import { IconUpload, IconX, IconPhoto } from "@tabler/icons";
import { getGoogleLensUrl } from "@/lib/card-builder/photo";

function CardBuilderPhoto(props: Partial<DropzoneProps>) {
  const theme = useMantineTheme();
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [opened, setOpened] = useState(false);

  useEffect(()=>{
    if (files.length > 0) {
      getGoogleLensUrl(files[0]).then(response=>{
        if ('url' in response) {
          setOpened(false);
          window.open(response['url'], 'Google Lens', "height=640,width=960,toolbar=no,menubar=no,scrollbars=no,location=no,status=no")
        }
      })
    }
  }, [files])

  return (
    <div>
        <NavLink onClick={() => setOpened(true)} icon={<IconPhoto size={16} stroke={1.5} />} label="Photo"></NavLink>
        <Modal
        centered
        withCloseButton={false}
        opened={opened}
        size="xl"
        onClose={() => setOpened(false)}
      >
      <Dropzone
        onDrop={setFiles}
        onReject={(files) => console.log("rejected files", files)}
        multiple={false}
        maxSize={3 * 1024 ** 2}
        accept={IMAGE_MIME_TYPE}
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
            <IconPhoto size={50} stroke={1.5} />
          </Dropzone.Idle>

          <div>
            <Text size="xl" inline>
              Drag image here or click to select file
            </Text>
            <Text size="sm" color="dimmed" inline mt={7}>
              File should not exceed 5mb
            </Text>
          </div>
        </Group>
      </Dropzone>
</Modal>
    </div>
  );
}

export default CardBuilderPhoto;
