package com.mrjohn.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/upload")
@CrossOrigin(origins = "*")
public class UploadController {

    @Value("${upload.dir}")
    private String uploadDir;

    @PostMapping("/foto")
    public ResponseEntity<?> uploadFoto(@RequestParam("file") MultipartFile file) {
        try {
            String nomeArquivo = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path caminho = Paths.get(uploadDir + nomeArquivo);
            Files.createDirectories(caminho.getParent());
            Files.write(caminho, file.getBytes());

            return ResponseEntity.ok(Map.of("url", "/uploads/" + nomeArquivo));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao salvar arquivo.");
        }
    }
}