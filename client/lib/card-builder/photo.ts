export const getGoogleLensUrl = async(image:any) => {
    const data = new FormData();
    data.append('file', image)
    const response = await fetch(`${process.env.ANKI_HOST}/api/google_lens_url`, {
        method: 'POST',
        body: data
      });
      try {
        const content = await response.json();
        return content;
      } catch (e) {
        console.warn(e);
      }
}