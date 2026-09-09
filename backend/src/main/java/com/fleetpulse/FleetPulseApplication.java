package com.fleetpulse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.fleetpulse.repository")
@EnableRedisRepositories(basePackages = "com.fleetpulse.repository.redis")
public class FleetPulseApplication {

    public static void main(String[] args) {
        SpringApplication.run(FleetPulseApplication.class, args);
    }
}