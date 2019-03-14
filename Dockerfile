FROM node:10.15.3-alpine
ENV EGG_SERVER_ENV prod
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm config set registry http://registry.npm.taobao.org/
RUN npm i yarn -g
RUN yarn
RUN npm run tsc
EXPOSE 7001
EXPOSE 7002
CMD npm start