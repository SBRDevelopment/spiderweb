FROM node:0.10.35-onbuild
RUN mkdir log
RUN npm install -g zookeeper forever nodemon
EXPOSE 8081