package com.skywings.airline;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.util.Base64;

@SpringBootApplication
public class AirlineManagementApplication {

    public static void main(String[] args) {
        configureCloudDatasource();
        SpringApplication.run(AirlineManagementApplication.class, args);
        System.out.println("=================================================");
        System.out.println("✈️ SkyWings Airline Backend Server Started!");
        System.out.println("=================================================");
    }

    private static void configureCloudDatasource() {
        String port = System.getenv("PORT");
        String renderEnv = System.getenv("RENDER");
        String profile = System.getenv("SPRING_PROFILES_ACTIVE");
        boolean isCloud = port != null || renderEnv != null || "mysql".equalsIgnoreCase(profile);

        if (isCloud) {
            String url = System.getenv("SPRING_DATASOURCE_URL");
            if (url == null || url.trim().isEmpty() || url.contains("localhost")) {
                url = "jdbc:mysql://mysql-2794995a-anurag-b3c5.l.aivencloud.com:18355/defaultdb?sslMode=REQUIRED&allowPublicKeyRetrieval=true&serverTimezone=UTC";
            } else {
                url = url.trim().replaceAll("^[\"']+|[\"']+$", "");
            }
            System.setProperty("spring.datasource.url", url);

            String user = System.getenv("SPRING_DATASOURCE_USERNAME");
            if (user == null || user.trim().isEmpty() || "root".equals(user)) {
                user = "avnadmin";
            } else {
                user = user.trim().replaceAll("^[\"']+|[\"']+$", "");
            }
            System.setProperty("spring.datasource.username", user);

            String pwd = System.getenv("SPRING_DATASOURCE_PASSWORD");
            if (pwd != null) {
                pwd = pwd.trim().replaceAll("^[\"']+|[\"']+$", "");
                if (pwd.endsWith("V10") || pwd.endsWith("V1O") || pwd.endsWith("VlO")) {
                    pwd = pwd.substring(0, pwd.length() - 2) + "l0";
                }
            }
            if (pwd == null || pwd.trim().isEmpty() || "root".equals(pwd)) {
                pwd = new String(Base64.getDecoder().decode("QVZOU190LUFpS2NUTEtBUnhCWEFNVmww"));
            }
            System.setProperty("spring.datasource.password", pwd);
            System.setProperty("spring.datasource.driverClassName", "com.mysql.cj.jdbc.Driver");
            System.setProperty("spring.jpa.database-platform", "org.hibernate.dialect.MySQLDialect");
            System.setProperty("spring.jpa.hibernate.ddl-auto", "update");
            System.out.println("☁️ Configured cloud MySQL datasource for Aiven (" + user + "@" + url + ")");
        }
    }
}
