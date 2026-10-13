# ==========================================
# Stage 1: Build Stage (Java 21 + Maven)
# ==========================================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy pom.xml and cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy application source code and build production JAR
COPY src ./src
RUN mvn clean package -DskipTests

# ==========================================
# Stage 2: Production Runtime (Java 21 JRE)
# ==========================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create a non-root application user for container security
RUN addgroup -S skywings && adduser -S skywings -G skywings
USER skywings:skywings

# Copy the packaged executable jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Render automatically supplies the PORT environment variable
ENV PORT=8080
EXPOSE 8080

# Launch Spring Boot with dynamic port mapping
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-mysql} -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
