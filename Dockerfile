FROM node:11-stretch-slim

RUN \
  PANDOC_RELEASE_URL="https://github.com/jgm/pandoc/releases/latest" && \
  PARTIAL_URL="$(echo $(wget $PANDOC_RELEASE_URL -q -O -) | grep -oP '"([^"]+.deb)"')" && \
  PARTIAL_URL="$(echo $PARTIAL_URL | cut -d '"' -f 2 )" && \
  PANDOC_DEB_URL="http://github.com/$PARTIAL_URL" && \
  wget -q "$PANDOC_DEB_URL" && \
  dpkg -i pandoc-*-amd64.deb && \
  rm pandoc-*-amd64.deb

RUN npm install gulp-cli -g

USER node

COPY app/package.json      /home/node/
COPY app/package-lock.json /home/node/

WORKDIR /home/node

RUN npm install

COPY app/babel.config.js   /home/node/
COPY app/gulpfile.babel.js /home/node/

ENTRYPOINT ["gulp", "--gulpfile", "app/gulpfile.babel.js"]
