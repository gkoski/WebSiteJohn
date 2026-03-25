package com.mrjohn;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MrJohnApplication {

    public static void main(String[] args) {
        // Esta linha liga o servidor Tomcat e o Spring
        SpringApplication.run(MrJohnApplication.class, args);
    }
}