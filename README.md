# AnkiDojo
Anki card builder tailor-made for Japanese.

<img width="1284" alt="image" src="https://user-images.githubusercontent.com/13146030/191484921-875790e7-3369-40cf-b6d5-38bb2e68bc24.png">



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
