# ============ ESTÁGIO DE DESENVOLVIMENTO ============
FROM node:20-alpine AS development

# Instalar dependências necessárias para build
RUN apk add --no-cache python3 make g++ wget

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY --chown=nestjs:nodejs package*.json ./

# Instalar dependências (incluindo devDependencies)
RUN npm ci

# Copiar código fonte
COPY --chown=nestjs:nodejs . .

# Criar diretório de uploads
RUN mkdir -p uploads && chown -R nestjs:nodejs uploads

# Usar usuário não-root
USER nestjs

# Expor porta
EXPOSE 3000

# Comando para desenvolvimento com hot reload
CMD ["npm", "run", "start:dev"]


# ============ ESTÁGIO DE BUILD ============
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Remover devDependencies
RUN npm prune --production


# ============ ESTÁGIO DE PRODUÇÃO ============
FROM node:20-alpine AS production

# Instalar apenas dependências runtime
RUN apk add --no-cache tini curl

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copiar dependências de produção do estágio de build
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/package*.json ./

# Criar diretório de uploads
RUN mkdir -p uploads && chown -R nestjs:nodejs uploads

# Usar usuário não-root
USER nestjs

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api || exit 1

# Iniciar com tini para gerenciamento de processos
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main"]
