FROM node:16

WORKDIR /app

ARG VERDACCIO_REGISTRY
ARG VERDACCIO_TOKEN


# Configure npm registry and authentication token using the environment variables
RUN echo "registry="$VERDACCIO_REGISTRY"" >> ~/.npmrc \
    && echo "//82.208.22.64:4873/:_authToken=\"$VERDACCIO_TOKEN\"" >> ~/.npmrc
    
COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE $PORT

CMD ["node", "build/src/index.js"]
