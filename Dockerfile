# ==========================================
# Root Dockerfile for Render Web Service
# ==========================================

# Stage 1: Build the backend with Maven and Java 21
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy backend pom.xml and cache dependencies
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B

# Copy backend source code and build production JAR
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimal Java 21 JRE runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Non-root user for security
RUN addgroup -S skywings && adduser -S skywings -G skywings
USER skywings:skywings

# Copy built jar
COPY --from=build /app/target/*.jar app.jar

# Dynamic port handling for Render
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
