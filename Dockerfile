FROM node:10-stretch-slim

ENV NODE_ENV="production"

# Install puppeteer dependencies
RUN apt-get update -qq && apt-get install --no-install-recommends -yqq libatk-bridge2.0-0 libgtk-3-0 libnss3 libnspr4 libasound2 libxss1 libxtst6 \
    && rm -rf /var/lib/apt/lists/*

# Install latest pandoc
RUN PANDOC_RELEASE_URL="https://github.com/jgm/pandoc/releases/latest" \
    && PARTIAL_URL="$(echo $(wget $PANDOC_RELEASE_URL -q -O -) | grep -oE '"([^"]+.tar.gz)"')" \
    && PARTIAL_URL="$(echo $PARTIAL_URL | cut -d '"' -f 2 )" \
    && PANDOC_TAR_URL="http://github.com/$PARTIAL_URL" \
    && wget -q "$PANDOC_TAR_URL" \
    && tar xvzf pandoc-*-linux.tar.gz --strip-components 1 -C /usr/local \
    && rm pandoc-*-linux.tar.gz

RUN npm install gulp-cli -g

USER node

COPY app/package.json      /home/node/
COPY app/babel.config.js   /home/node/

WORKDIR /home/node

RUN npm install

ENTRYPOINT ["gulp", "--gulpfile", "app/gulpfile.babel.js"]
