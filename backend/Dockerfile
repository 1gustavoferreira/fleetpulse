# Estágio 1: Build da aplicação
FROM maven:3.9.8-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copia dependências primeiro para aproveitar o cache de camadas do Docker
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copia o código fonte e compila o executável
COPY src ./src
RUN mvn clean package -DskipTests

# Estágio 2: Imagem final de execução
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Criação de usuário não-root para segurança do container
RUN addgroup -S fleetpulse && adduser -S fleetpulse -G fleetpulse
USER fleetpulse

COPY --from=build /app/target/fleetpulse-api-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]