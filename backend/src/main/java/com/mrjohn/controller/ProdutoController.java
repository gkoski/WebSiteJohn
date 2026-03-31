package com.mrjohn.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.mrjohn.model.Produto;
import com.mrjohn.repository.CategoriaRepository;
import com.mrjohn.repository.ProdutoRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/produtos")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ProdutoController {

	@Autowired
	private ProdutoRepository produtoRepository;

	@Autowired
	private CategoriaRepository categoriaRepository; // Precisamos dele para validar a categoria

	@GetMapping
	public ResponseEntity<List<Produto>> getAll() {
		return ResponseEntity.ok(produtoRepository.findAll());
	}

	@GetMapping("/{id}")
	public ResponseEntity<Produto> getById(@PathVariable Long id) {
		return produtoRepository.findById(id)
				.map(resposta -> ResponseEntity.ok(resposta))
				.orElse(ResponseEntity.notFound().build());
	}

	@PostMapping
	public ResponseEntity<Produto> post(@Valid @RequestBody Produto produto) {
		// Regra de negócio: Só salva o produto se a categoria existir
		if (produto.getCategoria() != null && produto.getCategoria().getId() != null) {
			return categoriaRepository.findById(produto.getCategoria().getId())
					.map(resposta -> ResponseEntity.status(HttpStatus.CREATED)
							.body(produtoRepository.save(produto)))
					.orElse(ResponseEntity.status(HttpStatus.BAD_REQUEST).build());
		}
		
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
	}
	@PutMapping
    public ResponseEntity<Produto> put(@Valid @RequestBody Produto produto) {
        if (produtoRepository.existsById(produto.getId())) {
            if (produto.getCategoria() != null && produto.getCategoria().getId() != null) {
                return categoriaRepository.findById(produto.getCategoria().getId())
                        .map(resposta -> ResponseEntity.status(HttpStatus.OK)
                                .body(produtoRepository.save(produto)))
                        .orElse(ResponseEntity.status(HttpStatus.BAD_REQUEST).build());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        java.util.Optional<Produto> produto = produtoRepository.findById(id);

        if (produto.isEmpty())
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.NOT_FOUND);

        produtoRepository.deleteById(id);
    }
}