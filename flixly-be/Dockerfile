# Temel imaj
FROM eclipse-temurin:17-jdk-alpine

# Çalışma dizini oluştur
WORKDIR /app

# Maven ile derlenmiş jar dosyasını kopyala (örneğin: target/app.jar)
COPY target/*.jar app.jar

# Port tanımla (Spring Boot default 8080)
EXPOSE 8080

# Uygulamayı başlat
ENTRYPOINT ["java", "-jar", "app.jar"]
