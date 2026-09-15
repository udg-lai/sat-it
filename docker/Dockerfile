# ----------------------------------------
# Build arguments
# ----------------------------------------
ARG GIT_REPO=https://github.com/udg-lai/sat-it.git
ARG GIT_REF=main


# ----------------------------------------
# Stage 1: Build the application
# ----------------------------------------
FROM node:22-bookworm AS builder

ARG GIT_REPO
ARG GIT_REF

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends git \
    && rm -rf /var/lib/apt/lists/*

RUN git clone "${GIT_REPO}" . \
    && git fetch --all --tags \
    && git checkout "${GIT_REF}"

RUN npm install

RUN npm test

RUN npm run build


# ----------------------------------------
# Stage 2: Serve the application
# ----------------------------------------
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
