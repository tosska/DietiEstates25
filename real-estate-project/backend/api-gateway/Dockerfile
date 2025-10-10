FROM kong:3.7

# Copia il plugin personalizzato
COPY ./custom-jwt-headers /usr/local/share/lua/5.1/kong/plugins/custom-jwt-headers
COPY kong.yaml /usr/local/kong/declarative/kong.yaml

# Abilita il plugin
ENV KONG_PLUGINS=bundled,custom-jwt-headers