# Use a Java 17 runtime
FROM eclipse-temurin:17-jdk-jammy
# Copy the built JAR from the Maven build
COPY target/*.jar app.jar
# Expose the port
EXPOSE 8080
# Run the application
ENTRYPOINT ["java", "-jar", "/app.jar"]