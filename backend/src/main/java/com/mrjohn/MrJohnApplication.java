package com.mrjohn;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Classe principal que inicia o Spring Boot.
 * O @SpringBootApplication ativa a configuração automática e a varredura de componentes.
 */
@SpringBootApplication
public class MrJohnApplication {

    public static void main(String[] args) {
        // Esta linha inicia o servidor embutido (Tomcat) e carrega o contexto do Spring
        SpringApplication.run(MrJohnApplication.class, args);
    }
}