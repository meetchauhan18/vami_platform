# create a dockerfile
FROM node:25-alpine3.22

# create a working directory
WORKDIR /app

# copy package.json and package-lock.json
COPY package*.json .

# install dependencies
RUN npm install

# copy the rest of the application
COPY . .

# expose the port
EXPOSE 3000

# run the application
CMD ["npm", "run", "dev"]