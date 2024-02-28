ARG BUILD_FROM
# hadolint ignore=DL3006
FROM ${BUILD_FROM}

WORKDIR /app

# hadolint ignore=DL3018
RUN apk add --no-cache \
    chromium \
    --repository=https://mirror.fsmg.org.nz/alpine/v3.9/community \
    --repository=https://mirror.fsmg.org.nz/alpine/v3.9/main

RUN apk add font-noto-emoji

RUN apk add --no-cache \
    nss\
    freetype\
    freetype-dev\
    harfbuzz\
    ca-certificates\
    ttf-freefont\
    imagemagick\
    nodejs\
    npm

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    USE_IMAGE_MAGICK=true

# Copy root filesystem
COPY rootfs /

RUN npm ci

# Build arugments
ARG BUILD_ARCH
ARG BUILD_DATE
ARG BUILD_REF
ARG BUILD_VERSION

# Labels
LABEL \
    io.hass.name="Lovelace Inkplate Screenshotter" \
    io.hass.description="Display a lovelace page on an InkplateColor (Inkplate 6 Color)" \
    io.hass.arch="${BUILD_ARCH}" \
    io.hass.type="addon" \
    io.hass.version=${BUILD_VERSION} \
    maintainer="Marcin Kocon <mkocon@gmail.com>" \
    org.opencontainers.image.title="Lovelace Inkplate Screenshotter" \
    org.opencontainers.image.description="Display a lovelace page on a InkplateColor" \
    org.opencontainers.image.vendor="Brody Kenrick" \
    org.opencontainers.image.authors="Brody Kenrick <BrodyKenrick@gmail.com>" \
    org.opencontainers.image.source="https://github.com/brodykenrick/hass-lovelace-screenshotter" \
    org.opencontainers.image.documentation="https://github.com/brodykenrick/hass-lovelace-screenshotter/blob/master/README.md" \
    org.opencontainers.image.created=${BUILD_DATE} \
    org.opencontainers.image.revision=${BUILD_REF} \
    org.opencontainers.image.version=${BUILD_VERSION}
