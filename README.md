# AnkiDojo
Anki card builder tailor-made for Japanese.

<img width="1068" alt="image" src="https://user-images.githubusercontent.com/13146030/192142010-b8a9a082-94ec-42d1-ab3d-12c8d116e96b.png">

### Development

```bash
cd client
yarn install
```

Run in development mode.

```bash
yarn dev
```


### Build

```bash
cd client
yarn build
next export -o ../server/app
```

### Distribute for Anki

```bash
sh build.sh
```
