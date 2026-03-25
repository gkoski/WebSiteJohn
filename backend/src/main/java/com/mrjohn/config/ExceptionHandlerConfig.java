package com.mrjohn.config;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.List;

import java.util.stream.Collectors;

@RestControllerAdvice
public class ExceptionHandlerConfig {

    // Este método captura os erros do @Valid (e-mail mal formado, nome vazio, etc.)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<List<String>> tratarErro400(MethodArgumentNotValidException ex) {
        var erros = ex.getFieldErrors().stream()
                .map(erro -> "Campo " + erro.getField() + ": " + erro.getDefaultMessage())
                .collect(Collectors.toList());
        
        return ResponseEntity.badRequest().body(erros);
    }
}