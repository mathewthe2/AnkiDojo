import { Image } from "@mantine/core";
import { useMantineTheme } from "@mantine/core";

function CardBuilderPitchSvg({ pitch_string, height, width }: { pitch_string: string, height:number|string, width:number|string }) {
  const theme = useMantineTheme();

  const pitchGraphStrokeColor =
    theme.colorScheme === "dark" ? theme.colors.gray[0] : theme.colors.dark[6];
  const pitchGraphContrastColor =
    theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0];

  const getPitchSvgUrl = (escapedSvg: string) => {
    if (escapedSvg?.length <= 0) {
      return "";
    }
    const unEscapedSvg = escapedSvg
      .replace(/\\"/g, '"')
      .replace('<svg class="pitch"', '<svg xmlns="http://www.w3.org/2000/svg"')
      .replace(/#000/g, pitchGraphStrokeColor)
      .replace(/#fff/g, pitchGraphContrastColor);
    // const dataUri = `data:image/svg+xml;base64,${btoa(
    //   unescape(encodeURIComponent(unEscapedSvg))
    const dataUri = `data:image/svg+xml;base64,${Buffer.from(
      decodeURIComponent(unEscapedSvg)
    ).toString("base64")}`;
    return dataUri;
  };

  return (
    <Image
      // height={50}
      // width={200}
      height={height}
      width={width}
      fit="contain"
      style={{
        marginLeft: "auto",
        marginRight: "auto",
      }}
      src={getPitchSvgUrl(pitch_string)}
    />
  );
}

export default CardBuilderPitchSvg;
