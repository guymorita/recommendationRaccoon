FROM node:12

ENV PROJECT_ROOT=/app

# RUN apt-get install git openssh

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)

COPY package*.json $PROJECT_ROOT/
COPY yarn.lock $PROJECT_ROOT/

WORKDIR $PROJECT_ROOT
RUN yarn install

COPY . $PROJECT_ROOT/

RUN yarn build

# USER node

CMD ["node", "dist/index.js"]