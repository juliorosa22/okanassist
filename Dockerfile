FROM node:20-bullseye

WORKDIR /app

# Install expo-cli globally
RUN npm install -g expo-cli

# Install watchman (optional but recommended)
RUN apt-get update && apt-get install -y watchman && apt-get clean

COPY app/package*.json ./
RUN npm install

COPY app .

EXPOSE 19000 19001 19002 8080

CMD ["npx", "expo", "start", "--tunnel"]
