FROM node:0.10.35-onbuild
RUN mkdir log
RUN npm install zookeeper
EXPOSE 8081