# Node Alpine Docker Image
FROM node:20.8.0-alpine3.17

# Variables
ARG GITHUB_SHA
ENV GITHUB_SHA=$GITHUB_SHA
ENV SSH_PORT=2222

# SSH Setup
# 1. Artifcats
COPY init.sh /bin/init.sh
COPY sshd_config /etc/ssh/
RUN chmod 755 /bin/init.sh
# 2. Install packages
RUN apk add bash openrc openssh curl \
    && echo "root:Docker!" | chpasswd \
    && rm -rf /var/cache/apk/* \
    && rc-update add sshd
#3. Expose SSH port
EXPOSE 80 ${SSH_PORT}

# NPM
RUN npm i -g npm@latest

# Node Setup
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm ci --legacy-peer-deps
RUN npm install -g typescript
RUN npm cache clean --force
COPY . .

# Execute Script
ENTRYPOINT ["/bin/init.sh"]

# Hot reloading
# CMD node src/index.ts
