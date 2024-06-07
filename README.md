# AnkiDojo

Generate Japanese vocabulary cards from word lists, Kindle, or text files.

<img width="1060" alt="image" src="https://user-images.githubusercontent.com/13146030/201525174-52944abd-1178-4107-a3a7-dc2b03bdb09d.png">

<img width="1060" alt="image" src="https://user-images.githubusercontent.com/13146030/201525344-014e5384-ae95-46b9-a014-18d41972945b.png">

### Development


```bash
cd client
yarn install
```

Run in development mode.

```bash
pnpm dev
```


### Build

```bash
cd client
pnpm build
next export -o ../server/app
```

Build might fail if `next-font-manifest.json` is missing.

```bash
echo {} > .next/server/next-font-manifest.json
```

### Distribute for Anki

```bash
sh build.sh
```
### Acknowledgements
- JMDict
- Yomichan
- ianki
- Yomichan Forvo server 
