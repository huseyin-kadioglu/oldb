# Multi-stage build for Railway / any container host
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /workspace
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -q -B dependency:go-offline
COPY src ./src
RUN ./mvnw -q -B -DskipTests package \
 && cp target/*.jar /workspace/app.jar

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S oldb && adduser -S oldb -G oldb \
 && mkdir -p /data/uploads && chown -R oldb:oldb /data
COPY --from=build /workspace/app.jar /app/app.jar
USER oldb
ENV APP_UPLOAD_DIR=/data/uploads
EXPOSE 8080
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]
