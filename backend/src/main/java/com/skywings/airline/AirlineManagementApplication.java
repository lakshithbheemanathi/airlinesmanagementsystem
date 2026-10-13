package com.skywings.airline;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AirlineManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(AirlineManagementApplication.class, args);
        System.out.println("=================================================");
        System.out.println("✈️ SkyWings Airline Backend Server Started on Port 8081!");
        System.out.println("API Health Check: http://localhost:8081/api/health");
        System.out.println("=================================================");
    }
}
