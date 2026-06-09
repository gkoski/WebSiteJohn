package com.mrjohn.config;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class ExceptionHandlerConfig {

    // Captura os erros do @Valid (e-mail mal formado, nome vazio, etc.)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<List<String>> tratarErro400(MethodArgumentNotValidException ex) {
        var erros = ex.getFieldErrors().stream()
                .map(erro -> "Campo " + erro.getField() + ": " + erro.getDefaultMessage())
                .collect(Collectors.toList());

        return ResponseEntity.badRequest().body(erros);
    }

    // Captura os ResponseStatusException (ex.: "Não entregamos no bairro", "Produto não encontrado")
    // Garante que o status e a mensagem corretos cheguem ao cliente, em vez de virar 403.
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> tratarResponseStatus(ResponseStatusException ex) {
        return ResponseEntity
                .status(ex.getStatusCode())
                .body(Map.of(
                        "status", ex.getStatusCode().value(),
                        "erro", ex.getReason() != null ? ex.getReason() : "Erro na requisição"
                ));
    }
}