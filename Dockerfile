FROM node:11-stretch-slim

RUN \
  PANDOC_RELEASE_URL="https://github.com/jgm/pandoc/releases/latest" && \
  PARTIAL_URL="$(echo $(wget $PANDOC_RELEASE_URL -q -O -) | grep -oP '"([^"]+.deb)"')" && \
  PARTIAL_URL="$(echo $PARTIAL_URL | cut -d '"' -f 2 )" && \
  PANDOC_DEB_URL="http://github.com/$PARTIAL_URL" && \
  wget -q "$PANDOC_DEB_URL" && \
  dpkg -i pandoc-*-amd64.deb && \
  rm pandoc-*-amd64.deb

RUN \
  apt-get update -qq && apt-get install -qq \
  chromium gconf-service libasound2 libatk1.0-0 libatk-bridge2.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget

RUN npm install gulp-cli -g

USER node

COPY app/package.json      /home/node/
COPY app/package-lock.json /home/node/
COPY app/babel.config.js   /home/node

WORKDIR /home/node

RUN npm install

ENTRYPOINT ["gulp", "--gulpfile", "app/gulpfile.babel.js"]
