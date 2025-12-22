FROM node:18

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Render uses dynamic PORT
EXPOSE 5000

CMD ["npm", "start"]
