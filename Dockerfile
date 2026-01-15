FROM node:22-slim  
LABEL "language"="nodejs"  
LABEL "framework"="express"  
WORKDIR /src  
RUN npm install -g npm@latest  
COPY . .  
RUN npm install  
RUN npm run build  
EXPOSE 8080  
CMD ["npm", "start"]  
