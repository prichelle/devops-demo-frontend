FROM node:8.1.0-alpine
LABEL maintainer="Albert Haliulov <albert.haliulov@gmail.com>" github="https://github.com/albert-haliulov/devops-demo-app"
# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY app/package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY app/ /usr/src/app

CMD [ "npm", "start" ]