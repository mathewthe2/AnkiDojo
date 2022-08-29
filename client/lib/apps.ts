import UserAppInterface from "@/interfaces/apps/UserAppInterface";

const requestHeaders: HeadersInit = new Headers();
requestHeaders.set("xc-auth", process.env.ANKI_HOST as string);

const getUserApps = async () => {
  const response = await fetch(`${process.env.ANKI_HOST}/api/apps`, {
    method: "GET",
    headers: requestHeaders,
  });
  const userApps: UserAppInterface[] = await response.json();
  userApps.sort((a, b) => a.title.localeCompare(b.title));
  return userApps;
};

const getAppIconUrl = (userApp:UserAppInterface) => `${process.env.ANKI_HOST}/apps/${userApp.id}/${userApp.icon}`

export { getUserApps, getAppIconUrl };
