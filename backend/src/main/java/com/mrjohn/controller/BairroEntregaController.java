package com.mrjohn.controller;

import com.mrjohn.repository.BairroEntregaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/entrega")
@CrossOrigin(origins = "*")
public class BairroEntregaController {

    @Autowired
    private BairroEntregaRepository repository;

    @GetMapping("/{bairro}")
    public ResponseEntity<?> getValorEntrega(@PathVariable String bairro) {
        return repository.findByBairroIgnoreCase(bairro)
                .map(b -> ResponseEntity.ok(Map.of(
                        "bairro", b.getBairro(),
                        "valorEntrega", b.getValorEntrega()
                )))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
}