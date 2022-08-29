import UserAppInterface from "@/interfaces/apps/UserAppInterface";

const requestHeaders: HeadersInit = new Headers();
requestHeaders.set("xc-auth", process.env.ANKI_HOST as string);

const getUserApps = async () => {
  const response = await fetch(`${process.env.ANKI_HOST}/api/apps`, {
    method: "GET",
    headers: requestHeaders,
  });
  const content: UserAppInterface[] = await response.json();
  return content;
};

const getAppIconUrl = (userApp:UserAppInterface) => `${process.env.ANKI_HOST}/apps/${userApp.id}/${userApp.icon}`

export { getUserApps, getAppIconUrl };
