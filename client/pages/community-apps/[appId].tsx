import { useRouter } from "next/router";
import { getCommunityApps } from "@/lib/apps";
import { useQuery } from "react-query";

function CommunityApp() {
    const router = useRouter();
    const { appId } = router.query;

    const { data: communityApps, isLoading } = useQuery(
      "community-apps",
      getCommunityApps
    );
    
    const appUrl = communityApps?.find(communityApp=>communityApp.id===appId)?.url;

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
       src={appUrl}
      ></iframe>
    );
  }
  export default CommunityApp;
