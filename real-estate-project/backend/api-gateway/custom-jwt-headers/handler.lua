-- File: kong/plugins/custom-jwt-headers/handler.lua
local cjson = require "cjson.safe"

local CustomJwtHeaders = {
  PRIORITY = 900,
  VERSION = "1.0.0",
}

function CustomJwtHeaders:access(conf)
  local auth_header = kong.request.get_header("authorization")
  if not auth_header then
    kong.log.warn("Authorization header mancante")
    return
  end

  local token = auth_header:match("Bearer%s+(.+)")
  if not token then
    kong.log.warn("Formato Authorization non valido")
    return
  end

  local header_b64, payload_b64, signature = token:match("([^%.]+)%.([^%.]+)%.([^%.]+)")
  if not payload_b64 then
    kong.log.warn("Token JWT non valido")
    return
  end

  local payload_json = ngx.decode_base64(payload_b64)
  if not payload_json then
    kong.log.warn("Errore nella decodifica base64 del payload")
    return
  end

  local payload = cjson.decode(payload_json)
  if not payload then
    kong.log.warn("Errore nel parse JSON del payload")
    return
  end

  -- Aggiunge gli header
  kong.service.request.set_header("X-User-authId", tostring(payload.authId or "unknown"))
  kong.service.request.set_header("X-User-userId", tostring(payload.userId or "unknown"))
  kong.service.request.set_header("X-User-role", tostring(payload.role or "unknown"))

  kong.log.debug("Header X-User impostati con successo")
end

return CustomJwtHeaders
