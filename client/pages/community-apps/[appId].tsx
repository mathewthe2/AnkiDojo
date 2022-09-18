import { useRouter } from "next/router";

function CommunityApp() {
    const router = useRouter();
    const { appId } = router.query;

    return (
      <iframe
        width="100%"
        height="100%"
        frameBorder="0"
        allowTransparency
        style={{background: '#FFFFFF'}}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      //   src="http://localhost:5008/apps/conjugation_drill/drill.html"
       src={`https://mathewthe2.github.io/AnkiDojo-Apps/apps/${appId}/index.html`}
      ></iframe>
    );
  }
  export default CommunityApp;
