# ======================================================
# Spring Boot Backend Dockerfile
# IntelliSpend — REST API Backend
# Multi-stage build for minimal image size
# ======================================================

# ---- Build Stage ----
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /build

# Copy pom.xml first for dependency caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# ---- Runtime Stage ----
FROM eclipse-temurin:21-jre-jammy

LABEL maintainer="IntelliSpend Team"
LABEL description="IntelliSpend Spring Boot REST Backend"

WORKDIR /app

# Create non-root user
RUN addgroup --system spring && adduser --system --ingroup spring spring

# Copy the built JAR
COPY --from=builder /build/target/expense-management-springboot-*.jar app.jar

# Create uploads directory
RUN mkdir -p /app/uploads && chown -R spring:spring /app

USER spring

EXPOSE 8080

# JVM tuning for containers
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseContainerSupport -XX:MaxRAMPercentage=75"

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
