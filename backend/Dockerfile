# Dockerfile de produção/entrega — vai em ./backend/Dockerfile
# Só é usado quando você troca `image:` por `build:` no serviço `api`.

# ---------- build ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

# Camada de dependências: só invalida quando o pom muda
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# ---------- runtime ----------
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# Não rodar como root
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=build /build/target/*.jar app.jar

ENV TZ=America/Sao_Paulo \
    JAVA_OPTS="-XX:MaxRAMPercentage=75"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]